import { describe, expect, it, vi } from 'vitest'

import { ordersExportEndpoint } from '@/endpoints/ordersExport'

const run = (req: unknown) =>
  (ordersExportEndpoint.handler as (request: unknown) => Promise<Response>)(req)

describe('orders export endpoint', () => {
  it('rejects non-admin users', async () => {
    const response = await run({ user: { roles: ['customer'] } })

    expect(response.status).toBe(403)
  })

  it('exports one row per order line as Excel-compatible CSV', async () => {
    const payload = {
      find: vi.fn(async () => ({
        docs: [{
          orderNumber: 'CF123456',
          createdAt: '2026-10-25T00:00:00.000Z',
          customerEmail: 'a@example.com',
          shippingAddress: { phone: '0900', addressLine1: '1, Main Street', city: 'HCM' },
          lines: [{ name: 'Bag "Black"', skuCode: 'BAG-1', quantity: 2 }],
          amount: 200000,
          status: 'processing',
        }],
      })),
    }

    const response = await run({ user: { roles: ['admin'] }, query: {}, payload })
    const csv = await response.text()

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/csv')
    expect(csv).toContain('"Bag ""Black"""')
    expect(payload.find).toHaveBeenCalledOnce()
  })
})
