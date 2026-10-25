import { commitTransaction, initTransaction, killTransaction } from 'payload'
import type { Endpoint, PayloadRequest } from 'payload'

const HOLD_MS = 30 * 60 * 1000

export const releaseExpiredInventoryEndpoint: Endpoint = {
  path: '/release-expired-inventory',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const now = new Date()
    const result = await req.payload.find({
      collection: 'orders',
      where: {
        and: [
          { inventoryExpiresAt: { less_than_equal: now.toISOString() } },
          { inventoryReleasedAt: { exists: false } },
          { inventoryReleaseStartedAt: { exists: false } },
          { fulfillmentStatus: { in: ['processing', 'confirmed'] } },
        ],
      },
      depth: 0,
      limit: 100,
    })

    let released = 0
    for (const order of result.docs as any[]) {
      const ordersCollection = req.payload.db.collections.orders?.collection
      if (!ordersCollection) continue
      const claimed = await ordersCollection.findOneAndUpdate(
        { _id: order.id, inventoryReleasedAt: { $exists: false }, inventoryReleaseStartedAt: { $exists: false } },
        { $set: { inventoryReleaseStartedAt: now } },
        { returnDocument: 'after' },
      )
      if (!claimed) continue

      let started = false
      let committed = false
      try {
        started = await initTransaction(req)
        if (!started) throw new Error('transaction_unavailable')
        const skus = req.payload.db.collections.skus?.collection
        if (!skus) throw new Error('SKU collection is unavailable')
        const transactionID = await req.transactionID
        for (const line of order.lines ?? []) {
          if (!line.skuCode || !line.quantity) continue
          await skus.updateOne(
            { code: line.skuCode },
            { $inc: { inventory: line.quantity } },
            { session: transactionID ? req.payload.db.sessions[transactionID] : undefined },
          )
        }
        await req.payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            fulfillmentStatus: 'cancelled',
            status: 'cancelled',
            inventoryReleasedAt: now.toISOString(),
            inventoryReleaseStartedAt: null,
          },
          req,
        })
        await commitTransaction(req)
        committed = true
        released++
      } catch (error) {
        if (started && !committed) {
          await killTransaction(req)
          started = false
        }
        await ordersCollection.updateOne({ _id: order.id }, { $unset: { inventoryReleaseStartedAt: '' } })
        req.payload.logger.error({ err: error, orderId: order.id, msg: 'expired inventory release failed' })
      } finally {
        if (started && !committed) await killTransaction(req)
      }
    }

    return Response.json({ ok: true, released, scanned: result.docs.length, holdMs: HOLD_MS })
  },
}
