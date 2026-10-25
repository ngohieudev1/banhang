import { beforeEach, describe, expect, it, vi } from 'vitest'

import { storefrontOrderEndpoint } from '@/endpoints/storefrontOrder'

const skuId = '507f1f77bcf86cd799439011'

const body = {
  checkoutKey: 'checkout-key-123456789',
  email: 'customer@example.com',
  lastName: 'Nguyen',
  address: '1 Nguyen Hue',
  city: 'Ho Chi Minh',
  phone: '0900000000',
  items: [{ productSlug: 'classic-bag', skuId, quantity: 2 }],
}

const createRequest = (inventory = 5, existingOrderNumber?: string) => {
  const sku = { id: skuId, code: 'BAG-BLK', priceInVND: 100000, inventory, active: true }
  const collection = {
    findOneAndUpdate: vi.fn(async (_query, _update, _options) =>
      inventory >= 2 ? { value: { ...sku, inventory: inventory - 2 } } : { value: null }),
  }
  const payload = {
    db: {
      collections: { skus: { collection } },
      sessions: { transaction: {} },
      beginTransaction: vi.fn(async () => 'transaction'),
      commitTransaction: vi.fn(async () => undefined),
      rollbackTransaction: vi.fn(async () => undefined),
    },
    findGlobal: vi.fn(async () => ({ shippingFee: 30000 })),
    find: vi.fn(async ({ collection: name }: { collection: string }) => {
      if (name === 'orders') return { docs: existingOrderNumber ? [{ orderNumber: existingOrderNumber }] : [] }
      if (name === 'products') return { docs: [{ id: 'product-1', title: 'Classic Bag', slug: 'classic-bag', skus: [skuId] }] }
      return { docs: [sku] }
    }),
    count: vi.fn(async () => ({ totalDocs: 0 })),
    create: vi.fn(async () => ({ id: 'order-1' })),
    logger: { error: vi.fn() },
  }

  const req = {
    payload,
    transactionID: undefined,
    json: async () => body,
  }

  return { req, payload, collection }
}

const run = (req: unknown) =>
  (storefrontOrderEndpoint.handler as (request: unknown) => Promise<Response>)(req)

describe('storefront order inventory boundary', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('reserves inventory and creates one order', async () => {
    const { req, payload, collection } = createRequest()

    const response = await run(req)

    expect(response.status).toBe(200)
    expect(payload.create).toHaveBeenCalledTimes(1)
    expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(1)
    expect(payload.db.commitTransaction).toHaveBeenCalledTimes(1)
  })

  it('rejects an order without creating it when inventory is insufficient', async () => {
    const { req, payload, collection } = createRequest(1)

    const response = await run(req)

    expect(response.status).toBe(409)
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.db.rollbackTransaction).toHaveBeenCalledTimes(1)
    expect(collection.findOneAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('rejects quantities above the checkout limit before reserving inventory', async () => {
    const { req, payload, collection } = createRequest()
    req.json = async () => ({ ...body, items: [{ ...body.items[0], quantity: 11 }] })

    const response = await run(req)

    expect(response.status).toBe(400)
    expect(payload.create).not.toHaveBeenCalled()
    expect(collection.findOneAndUpdate).not.toHaveBeenCalled()
  })

  it('returns the existing order for a repeated checkout key', async () => {
    const { req, payload, collection } = createRequest(5, 'CF123456')

    const response = await run(req)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true, orderNumber: 'CF123456' })
    expect(payload.create).not.toHaveBeenCalled()
    expect(collection.findOneAndUpdate).not.toHaveBeenCalled()
  })

  it('allows only one concurrent checkout to reserve the last unit', async () => {
    let remaining = 2
    const make = createRequest(2)
    make.collection.findOneAndUpdate.mockImplementation(async () => {
      if (remaining < 2) return { value: null }
      remaining -= 2
      return { value: { id: skuId, inventory: remaining, priceInVND: 100000, active: true } }
    })

    const second = createRequest(2)
    second.collection.findOneAndUpdate = make.collection.findOneAndUpdate

    const responses = await Promise.all([run(make.req), run(second.req)])
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409])
    expect(remaining).toBe(0)
  })
})
