import 'dotenv/config'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@local.test'
const adminPassword = process.env.SEED_ADMIN_PASSWORD

if (process.env.SEED_LOCAL !== 'true') {
  throw new Error('Refusing to seed. Set SEED_LOCAL=true for the local database only.')
}

if (!adminPassword || adminPassword.length < 8) {
  throw new Error('Set SEED_ADMIN_PASSWORD with at least 8 characters.')
}

const payload = await getPayload({ config })

const upsertUser = async () => {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: adminEmail } },
    limit: 1,
  })
  if (existing.docs[0]) return existing.docs[0]

  return payload.create({
    collection: 'users',
    data: { name: 'Local Admin', email: adminEmail, password: adminPassword, roles: ['admin'] },
  })
}

const skuData = [
  { code: 'BAG-BLK', name: 'Classic Bag - Black', priceInVND: 450000, inventory: 20 },
  { code: 'BAG-BRN', name: 'Classic Bag - Brown', priceInVND: 450000, inventory: 15 },
  { code: 'TOTE-NAT', name: 'Daily Tote - Natural', priceInVND: 320000, inventory: 25 },
  { code: 'TOTE-BLK', name: 'Daily Tote - Black', priceInVND: 320000, inventory: 18 },
]

const upsertSku = async (data: (typeof skuData)[number]) => {
  const existing = await payload.find({ collection: 'skus', where: { code: { equals: data.code } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection: 'skus', data: { ...data, active: true } })
}

const upsertProduct = async (slug: string, title: string, skus: string[]) => {
  const existing = await payload.find({ collection: 'products', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({
    collection: 'products',
    data: {
      title,
      slug,
      skus,
      shortDescription: `Seed product: ${title}`,
      _status: 'published',
    },
  })
}

const admin = await upsertUser()
const skus = await Promise.all(skuData.map(upsertSku))
const classicBag = await upsertProduct('classic-bag', 'Classic Bag', [skus[0].id, skus[1].id])
const dailyTote = await upsertProduct('daily-tote', 'Daily Tote', [skus[2].id, skus[3].id])

const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
await payload.updateGlobal({
  slug: 'site-settings',
  data: { ...settings, shippingFee: settings.shippingFee ?? 30000 },
})

const orderKey = 'seed-local-order-001'
const existingOrder = await payload.find({ collection: 'orders', where: { checkoutKey: { equals: orderKey } }, limit: 1 })
if (!existingOrder.docs[0]) {
  await payload.create({
    collection: 'orders',
    data: {
      orderNumber: 'CFSEED01',
      checkoutKey: orderKey,
      items: [{ product: classicBag.id, quantity: 1 }],
      lines: [{ name: 'Classic Bag', skuCode: skus[0].code, quantity: 1, unitPrice: skus[0].priceInVND }],
      customerEmail: 'customer@local.test',
      shippingAddress: {
        firstName: 'Demo',
        lastName: 'Customer',
        addressLine1: '1 Nguyen Hue',
        city: 'Ho Chi Minh',
        country: 'Vietnam',
        phone: '0900000000',
      },
      shippingMethod: 'Tiêu chuẩn',
      shippingFee: 30000,
      amount: skus[0].priceInVND + 30000,
      currency: 'VND',
      status: 'processing',
      fulfillmentStatus: 'processing',
    },
  })
}

console.log(`Seeded local data: admin=${admin.email}, products=${classicBag.slug},${dailyTote.slug}`)
await payload.destroy()
