import type { Endpoint } from 'payload'

import { checkRole } from '@/access/utilities'

const statuses = new Set(['processing', 'confirmed', 'shipping', 'completed', 'cancelled'])

export const ordersBulkStatusEndpoint: Endpoint = {
  method: 'post',
  path: '/orders-bulk-status',
  handler: async (req) => {
    if (!checkRole(['admin'], req.user)) return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    const body = (await req.json?.().catch(() => null)) as { ids?: unknown; orderNumbers?: unknown; fulfillmentStatus?: unknown } | null
    const ids = Array.isArray(body?.ids)
      ? body.ids.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean)
      : []
    const orderNumbers = Array.isArray(body?.orderNumbers)
      ? body.orderNumbers.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean)
      : []
    const fulfillmentStatus = typeof body?.fulfillmentStatus === 'string' ? body.fulfillmentStatus : ''
    if ((!ids.length && !orderNumbers.length) || ids.length > 100 || orderNumbers.length > 100 || !statuses.has(fulfillmentStatus)) {
      return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
    }

    const result = await req.payload.find({
      collection: 'orders',
      where: ids.length ? { id: { in: ids } } : { orderNumber: { in: orderNumbers } },
      depth: 0,
      limit: orderNumbers.length,
      overrideAccess: true,
    })
    let updated = 0
    const errors: string[] = []
    for (const order of result.docs) {
      try {
        await req.payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            fulfillmentStatus: fulfillmentStatus as any,
            status: fulfillmentStatus === 'completed' ? 'completed' : fulfillmentStatus === 'cancelled' ? 'cancelled' : 'processing',
          },
          req,
          overrideAccess: true,
        })
        updated++
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'invalid_transition'
        if (order.orderNumber) errors.push(`${order.orderNumber}: ${reason}`)
      }
    }
    return Response.json({ ok: errors.length === 0, updated, errors })
  },
}
