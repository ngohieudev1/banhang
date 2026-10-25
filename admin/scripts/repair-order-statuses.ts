import { MongoClient } from 'mongodb'

const uri = process.env.DATABASE_URI || process.env.DATABASE_URL || ''
if (process.env.REPAIR_LOCAL !== 'true' || !/localhost:27018|127\.0\.0\.1:27018/.test(uri)) {
  throw new Error('Refusing order status repair. Set REPAIR_LOCAL=true and use the local MongoDB URI.')
}

const client = new MongoClient(uri)
await client.connect()
try {
  const orders = client.db().collection('orders')
  const docs = await orders.find({ fulfillmentStatus: { $in: ['processing', 'confirmed', 'shipping', 'completed', 'cancelled'] } }).toArray()
  const updates = docs.flatMap((order) => {
    const nextStatus = order.fulfillmentStatus === 'completed'
      ? 'completed'
      : order.fulfillmentStatus === 'cancelled'
        ? 'cancelled'
        : 'processing'
    return order.status === nextStatus ? [] : [{ id: order._id, orderNumber: order.orderNumber, from: order.status, to: nextStatus }]
  })

  for (const update of updates) {
    await orders.updateOne({ _id: update.id }, { $set: { status: update.to } })
  }
  console.log(JSON.stringify({ scanned: docs.length, repaired: updates }, null, 2))
} finally {
  await client.close()
}
