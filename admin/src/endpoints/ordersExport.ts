import type { Endpoint } from 'payload'

import { checkRole } from '@/access/utilities'

const csvCell = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`

export const ordersExportEndpoint: Endpoint = {
  method: 'get',
  path: '/orders-export.csv',
  handler: async (req) => {
    if (!checkRole(['admin'], req.user)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const where = status ? { status: { equals: status } } : undefined
    const result = await req.payload.find({
      collection: 'orders',
      where,
      depth: 0,
      limit: 10000,
      pagination: false,
      sort: '-createdAt',
      overrideAccess: true,
    })

    const rows = [
      ['Mã đơn', 'Ngày đặt', 'Email', 'Số điện thoại', 'Địa chỉ', 'Sản phẩm', 'SKU', 'Số lượng', 'Tổng tiền', 'Trạng thái'],
      ...result.docs.flatMap((order) => {
        const address = order.shippingAddress
        const lines = order.lines ?? []
        return lines.length > 0
          ? lines.map((line) => [
              order.orderNumber,
              order.createdAt,
              order.customerEmail,
              address?.phone,
              [address?.addressLine1, address?.addressLine2, address?.city, address?.country].filter(Boolean).join(', '),
              line.name,
              line.skuCode,
              line.quantity,
              order.amount,
              order.status,
            ])
          : [[order.orderNumber, order.createdAt, order.customerEmail, address?.phone, '', '', '', '', order.amount, order.status]]
      }),
    ]

    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
    const date = new Date().toISOString().slice(0, 10)
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}
