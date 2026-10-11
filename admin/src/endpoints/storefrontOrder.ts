import type { Endpoint } from 'payload'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LINES = 50
const MAX_QTY = 99

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const fail = (status: number, error: string) => Response.json({ ok: false, error }, { status })

type RawLine = { productSlug?: unknown; skuId?: unknown; color?: unknown; quantity?: unknown }

// Public by design (guest COD checkout): prices and stock come from the database, never from the client.
export const storefrontOrderEndpoint: Endpoint = {
  path: '/storefront-orders',
  method: 'post',
  handler: async (req) => {
    const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null
    if (!body) return fail(400, 'invalid')

    const email = text(body.email, 254)
    const lastName = text(body.lastName, 80)
    const addressLine1 = text(body.address, 200)
    const city = text(body.city, 80)
    const phone = text(body.phone, 30)
    const rawLines = Array.isArray(body.items) ? (body.items as RawLine[]) : []
    const shipping = (body.shipping ?? {}) as { method?: unknown }

    const valid =
      EMAIL_RE.test(email) &&
      lastName.length > 0 &&
      addressLine1.length > 0 &&
      city.length > 0 &&
      phone.length >= 6 &&
      rawLines.length > 0 &&
      rawLines.length <= MAX_LINES
    if (!valid) return fail(400, 'invalid')

    const { payload } = req
    const items: { product: string; quantity: number }[] = []
    const lines: {
      name: string
      skuCode?: string
      color?: string
      quantity: number
      unitPrice: number
    }[] = []
    let subtotal = 0
    let hasFreeShipping = false

    try {
      const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
      const baseFee = settings.shippingFee ?? 30000
      if (!Number.isFinite(baseFee) || baseFee < 0) return fail(500, 'server')
      for (const raw of rawLines) {
        const slug = text(raw.productSlug, 200)
        const quantity = raw.quantity
        if (!slug || typeof quantity !== 'number' || !Number.isInteger(quantity)) {
          return fail(400, 'invalid')
        }
        if (quantity < 1 || quantity > MAX_QTY) return fail(400, 'invalid')

        const found = await payload.find({
          collection: 'products',
          where: { slug: { equals: slug }, _status: { equals: 'published' } },
          depth: 0,
          limit: 1,
        })
        const product = found.docs[0]
        if (!product) return fail(400, 'unknown_product')
        hasFreeShipping ||= product.freeShipping === true

        const skuIds = (product.skus ?? []).map((sku) => (typeof sku === 'object' ? sku.id : sku))
        let unitPrice: number | null | undefined
        let skuCode: string | undefined

        if (skuIds.length > 0) {
          const activeSkus = await payload.find({
            collection: 'skus',
            where: { and: [{ id: { in: skuIds } }, { active: { equals: true } }] },
            depth: 0,
            limit: skuIds.length,
            pagination: false,
          })
          const bySku = new Map(activeSkus.docs.map((sku) => [sku.id, sku]))
          const requested = text(raw.skuId, 100)
          const sku = requested
            ? skuIds.includes(requested)
              ? bySku.get(requested)
              : undefined
            : skuIds.map((id) => bySku.get(id)).find(Boolean)
          if (!sku) return fail(400, 'unknown_sku')
          if ((sku.inventory ?? 0) < quantity) return fail(409, 'out_of_stock')
          unitPrice = sku.priceInVND
          skuCode = sku.code
        } else {
          unitPrice = (product as { priceInVND?: number | null }).priceInVND
        }

        if (typeof unitPrice !== 'number' || unitPrice <= 0) return fail(400, 'no_price')

        subtotal += unitPrice * quantity
        items.push({ product: product.id, quantity })
        lines.push({
          name: product.title,
          skuCode,
          color: text(raw.color, 80) || undefined,
          quantity,
          unitPrice,
        })
      }

      const shippingFee = hasFreeShipping ? 0 : baseFee

      let orderNumber = ''
      for (let attempt = 0; attempt < 5 && !orderNumber; attempt++) {
        const candidate = `CF${Math.floor(100000 + Math.random() * 900000)}`
        const taken = await payload.count({
          collection: 'orders',
          where: { orderNumber: { equals: candidate } },
        })
        if (taken.totalDocs === 0) orderNumber = candidate
      }
      if (!orderNumber) return fail(500, 'server')

      await payload.create({
        collection: 'orders',
        data: {
          orderNumber,
          items,
          lines,
          customerEmail: email,
          shippingAddress: {
            firstName: text(body.firstName, 80),
            lastName,
            addressLine1,
            addressLine2: text(body.apartment, 200),
            city,
            postalCode: text(body.postalCode, 20),
            country: text(body.country, 60),
            phone,
          },
          shippingMethod: text(shipping.method, 80),
          shippingFee,
          amount: subtotal + shippingFee,
          currency: 'VND',
          status: 'processing',
        },
      })

      return Response.json({ ok: true, orderNumber })
    } catch (error) {
      payload.logger.error({ err: error, msg: 'storefront order failed' })
      return fail(500, 'server')
    }
  },
}
