import type { Endpoint, PayloadRequest } from 'payload'
import { commitTransaction, initTransaction, killTransaction } from 'payload'
import { checkRole } from '@/access/utilities'

const parseCsv = (text: string): Record<string, string>[] => {
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
  const headers = rows.shift()?.map((header) => header.trim()) ?? []
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? '').trim()])))
}

const csv = (headers: string[]) => `\uFEFF${headers.map((value) => `"${value}"`).join(',')}\r\n`
const fail = (errors: string[]) => Response.json({ ok: false, errors }, { status: 400 })
const adminOnly = (req: PayloadRequest) => checkRole(['admin'], req.user)

const importCsv = async (req: PayloadRequest, kind: 'skus' | 'products') => {
  if (!adminOnly(req)) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const form = await req.formData?.().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return fail(['Chọn file CSV để import.'])
  if (file.size > 5 * 1024 * 1024) return fail(['File tối đa 5 MB.'])
  const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''))
  const required = kind === 'skus' ? ['code', 'name', 'priceInVND', 'inventory'] : ['slug', 'title', 'skuCodes']
  const missing = required.filter((field) => !rows.every((row) => field in row))
  if (!rows.length) return fail(['File phải có dòng tiêu đề và dữ liệu.'])
  if (missing.length) return fail([`Thiếu cột: ${missing.join(', ')}`])
  const errors: string[] = []
  const seen = new Set<string>()
  rows.forEach((row, index) => {
    const line = index + 2
    const key = kind === 'skus' ? row.code : row.slug
    if (!key) errors.push(`Dòng ${line}: thiếu ${kind === 'skus' ? 'code' : 'slug'}`)
    if (seen.has(key)) errors.push(`Dòng ${line}: trùng ${key}`)
    seen.add(key)
    if (kind === 'skus' && (!Number.isFinite(Number(row.priceInVND)) || Number(row.priceInVND) < 0 || !Number.isInteger(Number(row.inventory)) || Number(row.inventory) < 0)) {
      errors.push(`Dòng ${line}: priceInVND/inventory không hợp lệ`)
    }
    if (kind === 'products' && !row.title) errors.push(`Dòng ${line}: thiếu title`)
  })
  if (errors.length) return fail(errors)

  const imported: string[] = []
  let started = false
  try {
    started = await initTransaction(req)
    if (!started) return Response.json({ ok: false, errors: ['Database chưa bật transaction.'] }, { status: 503 })
    for (const row of rows) {
    if (kind === 'skus') {
      const existing = await req.payload.find({ collection: 'skus', where: { code: { equals: row.code } }, limit: 1, depth: 0, overrideAccess: true })
      const data = { name: row.name, code: row.code, priceInVND: Number(row.priceInVND), inventory: Number(row.inventory), active: row.active !== 'false' }
      if (existing.docs[0]) await req.payload.update({ collection: 'skus', id: existing.docs[0].id, data, overrideAccess: true })
      else await req.payload.create({ collection: 'skus', data, overrideAccess: true })
      imported.push(row.code)
    } else {
      const skuCodes = row.skuCodes.split('|').map((code) => code.trim()).filter(Boolean)
      const skus = await req.payload.find({ collection: 'skus', where: { code: { in: skuCodes } }, limit: skuCodes.length, depth: 0, overrideAccess: true })
      if (skus.docs.length !== skuCodes.length) return fail([`Không tìm thấy đủ SKU cho product ${row.slug}`])
      const existing = await req.payload.find({ collection: 'products', where: { slug: { equals: row.slug } }, limit: 1, depth: 0, overrideAccess: true })
      const data = { title: row.title, slug: row.slug, skus: skus.docs.map((sku) => sku.id), shortDescription: row.shortDescription || undefined, _status: row.status === 'draft' ? 'draft' : 'published' as const }
      if (existing.docs[0]) await req.payload.update({ collection: 'products', id: existing.docs[0].id, data: data as never, overrideAccess: true })
      else await req.payload.create({ collection: 'products', data: data as never, overrideAccess: true })
      imported.push(row.slug)
    }
    }
    await commitTransaction(req)
    started = false
    return Response.json({ ok: true, imported: imported.length, keys: imported })
  } catch (error) {
    if (started) await killTransaction(req)
    return fail([error instanceof Error ? error.message : 'Import thất bại.'])
  }
}

export const skusImportEndpoint: Endpoint = { method: 'post', path: '/skus-import.csv', handler: (req) => importCsv(req, 'skus') }
export const productsImportEndpoint: Endpoint = { method: 'post', path: '/products-import.csv', handler: (req) => importCsv(req, 'products') }
export const categoriesImportEndpoint: Endpoint = { method: 'post', path: '/categories-import.csv', handler: (req) => importSimple(req, 'categories', ['slug', 'title'], 'slug') }
export const couponsImportEndpoint: Endpoint = { method: 'post', path: '/coupons-import.csv', handler: (req) => importSimple(req, 'coupons', ['code', 'type', 'value', 'minOrder', 'active'], 'code') }
export const skusImportTemplateEndpoint: Endpoint = { method: 'get', path: '/skus-import-template.csv', handler: (req) => adminOnly(req) ? new Response(csv(['code', 'name', 'priceInVND', 'inventory', 'active']), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }) : Response.json({ error: 'Forbidden' }, { status: 403 }) }
export const productsImportTemplateEndpoint: Endpoint = { method: 'get', path: '/products-import-template.csv', handler: (req) => adminOnly(req) ? new Response(csv(['slug', 'title', 'skuCodes', 'shortDescription', 'status']), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }) : Response.json({ error: 'Forbidden' }, { status: 403 }) }
const importSimple = async (req: PayloadRequest, collection: 'categories' | 'coupons', required: string[], key: string) => {
  if (!adminOnly(req)) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const form = await req.formData?.().catch(() => null); const file = form?.get('file')
  if (!(file instanceof File)) return fail(['Chọn file CSV để import.'])
  const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''))
  const missing = required.filter((field) => !rows.every((row) => field in row))
  if (!rows.length || missing.length) return fail(missing.length ? [`Thiếu cột: ${missing.join(', ')}`] : ['File không có dữ liệu.'])
  const imported: string[] = []
  for (const row of rows) {
    const data = collection === 'categories'
      ? { title: row.title, slug: row.slug }
      : { code: row.code, type: row.type || 'percent', value: Number(row.value || 0), minOrder: Number(row.minOrder || 0), active: row.active !== 'false' }
    const existing = await req.payload.find({ collection, where: { [key]: { equals: row[key] } }, limit: 1, overrideAccess: true })
    if (existing.docs[0]) await req.payload.update({ collection, id: existing.docs[0].id, data: data as never, overrideAccess: true })
    else await req.payload.create({ collection, data: data as never, overrideAccess: true })
    imported.push(row[key])
  }
  return Response.json({ ok: true, imported: imported.length, keys: imported })
}
export const categoriesImportTemplateEndpoint: Endpoint = { method: 'get', path: '/categories-import-template.csv', handler: (req) => adminOnly(req) ? new Response(csv(['slug', 'title']), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }) : Response.json({ error: 'Forbidden' }, { status: 403 }) }
export const couponsImportTemplateEndpoint: Endpoint = { method: 'get', path: '/coupons-import-template.csv', handler: (req) => adminOnly(req) ? new Response(csv(['code', 'type', 'value', 'minOrder', 'active']), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }) : Response.json({ error: 'Forbidden' }, { status: 403 }) }
