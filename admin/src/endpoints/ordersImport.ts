import { commitTransaction, initTransaction, killTransaction } from 'payload'
import type { Endpoint, PayloadRequest } from 'payload'
import { ObjectId } from 'mongodb'

import { checkRole } from '@/access/utilities'

const required = ['orderNumber', 'customerEmail', 'customerName', 'phone', 'address', 'city', 'skuCode', 'quantity'] as const
type Row = Record<(typeof required)[number], string> & { shippingFee: string; status: string }

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1 } else quoted = !quoted
    } else if (char === ',' && !quoted) { row.push(cell); cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(cell); if (row.some((value) => value.trim())) rows.push(row); row = []; cell = ''
    } else cell += char
  }
  if (cell || row.length) { row.push(cell); if (row.some((value) => value.trim())) rows.push(row) }
  return rows
}

const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
const fail = (errors: string[]) => Response.json({ ok: false, errors }, { status: 400 })

export const ordersImportEndpoint: Endpoint = {
  method: 'post',
  path: '/orders-import.csv',
  handler: async (req: PayloadRequest) => {
    if (!checkRole(['admin'], req.user)) return Response.json({ error: 'Forbidden' }, { status: 403 })
    const form = await req.formData?.().catch(() => null)
    const file = form?.get('file')
    if (!(file instanceof File)) return fail(['Chọn file CSV để import.'])
    if (file.size > 5 * 1024 * 1024) return fail(['File tối đa 5 MB.'])

    const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''))
    if (rows.length < 2) return fail(['File phải có dòng tiêu đề và ít nhất một dòng dữ liệu.'])
    const headers = rows[0].map((header) => header.trim())
    const missing = required.filter((header) => !headers.includes(header))
    if (missing.length) return fail([`Thiếu cột: ${missing.join(', ')}`])
    const data: Row[] = rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? '').trim()])) as Row)
    const errors: string[] = []
    const grouped = new Map<string, Row[]>()
    data.forEach((row, index) => {
      const line = index + 2
      if (!row.orderNumber) errors.push(`Dòng ${line}: thiếu orderNumber`)
      if (!row.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.customerEmail)) errors.push(`Dòng ${line}: email không hợp lệ`)
      const quantity = Number(row.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) errors.push(`Dòng ${line}: quantity phải là số nguyên 1-99`)
      const list = grouped.get(row.orderNumber) ?? []; list.push(row); grouped.set(row.orderNumber, list)
    })
    if (errors.length) return fail(errors)

    const { payload } = req
    const skuCodes = [...new Set(data.map((row) => row.skuCode))]
    const skuDocs = await payload.find({ collection: 'skus', where: { code: { in: skuCodes } }, limit: skuCodes.length, depth: 0, overrideAccess: true })
    const skuByCode = new Map(skuDocs.docs.map((sku) => [sku.code, sku]))
    for (const [index, row] of data.entries()) if (!skuByCode.has(row.skuCode)) errors.push(`Dòng ${index + 2}: không tìm thấy SKU ${row.skuCode}`)
    if (errors.length) return fail(errors)

    let started = false
    try {
      started = await initTransaction(req)
      if (!started) return Response.json({ ok: false, errors: ['Database chưa bật transaction.'] }, { status: 503 })
      for (const [orderNumber, orderRows] of grouped) {
        const first = orderRows[0]
        const items: { product: string; quantity: number }[] = []
        const lines = []
        let amount = Number(first.shippingFee || 0)
        for (const row of orderRows) {
          const sku = skuByCode.get(row.skuCode)!
          const quantity = Number(row.quantity)
          const collection = req.payload.db.collections.skus?.collection
          const transactionID = await req.transactionID
          const reserved = await collection?.findOneAndUpdate({ _id: new ObjectId(String(sku.id)), inventory: { $gte: quantity } }, { $inc: { inventory: -quantity } }, { returnDocument: 'after', session: transactionID ? req.payload.db.sessions[transactionID] : undefined })
          if (!reserved) throw new Error(`SKU hết tồn kho: ${row.skuCode}`)
          const product = await payload.find({ collection: 'products', where: { skus: { contains: sku.id } }, limit: 1, depth: 0, overrideAccess: true })
          if (!product.docs[0]) throw new Error(`SKU chưa gắn sản phẩm: ${row.skuCode}`)
          items.push({ product: String(product.docs[0].id), quantity })
          lines.push({ name: product.docs[0].title, skuCode: row.skuCode, quantity, unitPrice: sku.priceInVND })
          amount += sku.priceInVND * quantity
        }
        const status = ['processing', 'completed', 'cancelled', 'refunded'].includes(first.status) ? first.status as 'processing' | 'completed' | 'cancelled' | 'refunded' : 'processing'
        await payload.create({ collection: 'orders', data: { orderNumber, checkoutKey: `import-${orderNumber}`, items, lines, customerEmail: first.customerEmail, shippingAddress: { firstName: first.customerName, lastName: '', addressLine1: first.address, city: first.city, country: 'Vietnam', phone: first.phone }, shippingMethod: 'Tiêu chuẩn', shippingFee: Number(first.shippingFee || 0), amount, currency: 'VND', status, fulfillmentStatus: 'processing' }, req })
      }
      await commitTransaction(req); started = false
      return Response.json({ ok: true, imported: grouped.size, rows: data.length })
    } catch (error) {
      if (started) await killTransaction(req)
      return fail([error instanceof Error ? error.message : 'Import thất bại.'])
    }
  },
}

export const ordersImportTemplate = () => {
  const header = [...required, 'shippingFee', 'status']
  return `${header.map(csvCell).join(',')}\r\n`
}

export const ordersImportTemplateEndpoint: Endpoint = {
  method: 'get',
  path: '/orders-import-template.csv',
  handler: async (req) => {
    if (!checkRole(['admin'], req.user)) return Response.json({ error: 'Forbidden' }, { status: 403 })
    return new Response(`\uFEFF${ordersImportTemplate()}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="orders-import-template.csv"',
        'Cache-Control': 'no-store',
      },
    })
  },
}
