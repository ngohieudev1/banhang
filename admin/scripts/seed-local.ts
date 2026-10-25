import 'dotenv/config'
import { createRequire } from 'node:module'

import { getPayload } from 'payload'

import config from '../src/payload.config'

createRequire(import.meta.url)('@next/env').loadEnvConfig(process.cwd())

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@local.test'
const adminPassword = process.env.SEED_ADMIN_PASSWORD

if (process.env.SEED_LOCAL !== 'true' && process.env.SEED_DEV !== 'true') {
  throw new Error('Refusing to seed. Set SEED_LOCAL=true or SEED_DEV=true explicitly.')
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
      gallery: [{ image: demoMedia.id }],
      shortDescription: `Seed product: ${title}`,
      _status: 'published',
    },
  })
}

const admin = await upsertUser()
const customerEmail = process.env.SEED_CUSTOMER_EMAIL || 'customer@dev.local'
const existingCustomer = await payload.find({
  collection: 'users',
  where: { email: { equals: customerEmail } },
  limit: 1,
})
const customer = existingCustomer.docs[0] ?? (await payload.create({
  collection: 'users',
  data: {
    name: 'Demo Customer',
    email: customerEmail,
    password: process.env.SEED_CUSTOMER_PASSWORD || 'Customer123!',
    roles: ['customer'],
  },
}))

const existingMedia = await payload.find({ collection: 'media', where: { alt: { equals: 'Demo product image' } }, limit: 1 })
const demoMedia = existingMedia.docs[0] ?? (await payload.create({
  collection: 'media',
  data: { alt: 'Demo product image' },
  file: {
    name: 'demo-product.png',
    data: Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x04, 0x00, 0x00, 0x00, 0xb5, 0x1c, 0x0c, 0x02, 0x00, 0x00, 0x00,
      0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x64, 0x00, 0x01, 0x00,
      0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]),
    mimetype: 'image/png',
    size: 68,
  },
}))

const existingAddress = await payload.find({ collection: 'addresses', where: { customer: { equals: customer.id } }, limit: 1 })
if (!existingAddress.docs[0]) {
  await payload.create({
    collection: 'addresses',
    data: {
      customer: customer.id,
      title: 'Địa chỉ demo',
      firstName: 'Demo',
      lastName: 'Customer',
      addressLine1: '1 Nguyen Hue',
      city: 'Ho Chi Minh City',
      country: 'US',
      postalCode: '700000',
    },
  })
}

for (const category of [
  { title: 'Túi xách', slug: 'tui-xach' },
  { title: 'Túi tote', slug: 'tui-tote' },
]) {
  const existing = await payload.find({ collection: 'categories', where: { slug: { equals: category.slug } }, limit: 1 })
  if (!existing.docs[0]) await payload.create({ collection: 'categories', data: category })
}

const existingCoupon = await payload.find({ collection: 'coupons', where: { code: { equals: 'WELCOME10' } }, limit: 1 })
if (!existingCoupon.docs[0]) {
  await payload.create({
    collection: 'coupons',
    data: { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 300000, usageLimit: 100, active: true },
  })
}
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
      customer: customer.id,
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

const lifecycleOrders = [
  { orderNumber: 'CFSEED02', fulfillmentStatus: 'confirmed' as const },
  { orderNumber: 'CFSEED03', fulfillmentStatus: 'shipping' as const },
  { orderNumber: 'CFSEED04', fulfillmentStatus: 'completed' as const },
  { orderNumber: 'CFSEED05', fulfillmentStatus: 'cancelled' as const },
  { orderNumber: 'CFSEED06', fulfillmentStatus: 'processing' as const, inventoryExpiresAt: new Date(Date.now() - 60_000) },
]
for (const lifecycle of lifecycleOrders) {
  const existing = await payload.find({ collection: 'orders', where: { orderNumber: { equals: lifecycle.orderNumber } }, limit: 1 })
  if (existing.docs[0]) continue
  const created = await payload.create({
    collection: 'orders',
    data: {
      orderNumber: lifecycle.orderNumber,
      checkoutKey: `seed-lifecycle-${lifecycle.orderNumber}`,
      customer: customer.id,
      items: [{ product: classicBag.id, quantity: 1 }],
      lines: [{ name: 'Classic Bag', skuCode: skus[0].code, quantity: 1, unitPrice: skus[0].priceInVND }],
      customerEmail: customerEmail,
      shippingAddress: { firstName: 'Demo', lastName: 'Customer', addressLine1: '1 Nguyen Hue', city: 'Ho Chi Minh', country: 'Vietnam', phone: '0900000000' },
      shippingMethod: 'Tiêu chuẩn', shippingFee: 30000, amount: skus[0].priceInVND + 30000, currency: 'VND',
      status: lifecycle.fulfillmentStatus === 'cancelled' ? 'cancelled' : lifecycle.fulfillmentStatus === 'completed' ? 'completed' : 'processing',
      fulfillmentStatus: 'processing',
      ...(lifecycle.inventoryExpiresAt ? { inventoryReservedAt: new Date(Date.now() - 120_000), inventoryExpiresAt: lifecycle.inventoryExpiresAt } : {}),
    },
  })
  const transitions = lifecycle.fulfillmentStatus === 'completed'
    ? ['confirmed', 'shipping', 'completed']
    : lifecycle.fulfillmentStatus === 'shipping'
      ? ['confirmed', 'shipping']
      : lifecycle.fulfillmentStatus === 'cancelled'
        ? ['cancelled']
        : []
  for (const fulfillmentStatus of transitions) {
    await payload.update({ collection: 'orders', id: created.id, data: { fulfillmentStatus } as never })
  }
}

console.log(`Seeded dev data: admin=${admin.email}, customer=${customer.email}, products=${classicBag.slug},${dailyTote.slug}`)
await payload.destroy()
