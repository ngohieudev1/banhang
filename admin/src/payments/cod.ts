import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { l } from '@/i18n/labels'

export const codAdapter = (): PaymentAdapter => ({
  name: 'cod',
  label: 'Thanh toán khi nhận hàng (COD)',
  group: {
    name: 'cod',
    type: 'group',
    admin: { condition: (data) => data?.paymentMethod === 'cod' },
    fields: [{ name: 'note', type: 'text', label: l('Cash collection note', 'Ghi chú thu tiền') }],
  },
  initiatePayment: async ({ data, req, transactionsSlug }) => {
    const { cart, currency, customerEmail, billingAddress, shippingAddress } = data

    if (!cart?.items?.length) throw new Error('Giỏ hàng trống.')
    if (!customerEmail || typeof customerEmail !== 'string') throw new Error('Cần email khách hàng.')
    if (typeof cart.subtotal !== 'number' || cart.subtotal <= 0) throw new Error('Tổng tiền không hợp lệ.')

    const items = cart.items.map((item) => ({
      product: typeof item.product === 'object' ? item.product.id : item.product,
      quantity: item.quantity,
      ...(item.variant
        ? { variant: typeof item.variant === 'object' ? item.variant.id : item.variant }
        : {}),
    }))

    const transaction = await req.payload.create({
      collection: transactionsSlug as 'transactions',
      data: {
        ...(req.user ? { customer: req.user.id } : { customerEmail }),
        amount: cart.subtotal,
        billingAddress,
        cart: cart.id,
        currency: (currency || 'VND').toUpperCase(),
        items,
        paymentMethod: 'cod',
        status: 'pending',
      } as never,
      req,
    })

    return {
      message: 'Đã tạo giao dịch COD.',
      transactionID: transaction.id,
      shippingAddress,
    }
  },
  confirmOrder: async ({ data, finalizeOrder, req, transactionsSlug = 'transactions' }) => {
    const transactionID = data.transactionID
    if (!transactionID) throw new Error('Thiếu mã giao dịch.')

    const transaction = (await req.payload.findByID({
      collection: transactionsSlug as 'transactions',
      id: transactionID,
      depth: 0,
      req,
    })) as unknown as Record<string, any>

    if (transaction.status !== 'pending' || transaction.paymentMethod !== 'cod') {
      throw new Error('Giao dịch không hợp lệ.')
    }

    // Chặn xác nhận giao dịch của người khác
    if (req.user) {
      const ownerID = typeof transaction.customer === 'object' ? transaction.customer?.id : transaction.customer
      if (ownerID && String(ownerID) !== String(req.user.id)) throw new Error('Giao dịch không hợp lệ.')
    } else if (
      !transaction.customerEmail ||
      String(transaction.customerEmail).toLowerCase() !== String(data.customerEmail ?? '').toLowerCase()
    ) {
      throw new Error('Giao dịch không hợp lệ.')
    }

    const order = await finalizeOrder({
      orderData: {
        amount: transaction.amount,
        currency: transaction.currency,
        ...(req.user ? { customer: req.user.id } : { customerEmail: transaction.customerEmail }),
        items: transaction.items,
        shippingAddress: data.shippingAddress ?? transaction.billingAddress,
        status: 'processing',
      },
      transactionID,
    })

    return {
      message: 'Đặt hàng thành công.',
      orderID: order.id as string,
      transactionID,
    }
  },
})
