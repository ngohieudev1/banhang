import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { Plugin } from 'payload'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'

import { codAdapter } from '@/payments/cod'
import { groups, l } from '@/i18n/labels'

import { Page, Product } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { ProductsCollection } from '@/collections/Products'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | CHAUTFIFTH` : 'CHAUTFIFTH'
}

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: groups.content,
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: groups.content,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: groups.ecommerce,
          components: {
            ...defaultCollection.admin?.components,
            beforeListTable: ['@/components/OrdersExport#OrdersExport'],
          },
        },
        fields: [
          ...defaultCollection.fields,
          {
            name: 'orderNumber',
            type: 'text',
            label: l('Order number', 'Mã đơn hàng'),
            unique: true,
            index: true,
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'checkoutKey',
            type: 'text',
            label: l('Checkout key', 'Mã checkout'),
            unique: true,
            index: true,
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'inventoryReservedAt',
            type: 'date',
            label: l('Inventory reserved at', 'Thời điểm giữ kho'),
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'inventoryExpiresAt',
            type: 'date',
            label: l('Inventory expires at', 'Thời điểm hết hạn giữ kho'),
            index: true,
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'inventoryReleaseStartedAt',
            type: 'date',
            admin: { hidden: true, readOnly: true },
          },
          {
            name: 'inventoryReleasedAt',
            type: 'date',
            label: l('Inventory released at', 'Thời điểm trả kho'),
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'shippingMethod',
            type: 'text',
            label: l('Shipping method', 'Hình thức giao hàng'),
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'shippingFee',
            type: 'number',
            label: l('Shipping fee', 'Phí vận chuyển'),
            admin: { position: 'sidebar', readOnly: true },
          },
          {
            name: 'fulfillmentStatus',
            type: 'select',
            label: l('Fulfillment status', 'Trạng thái giao hàng'),
            defaultValue: 'processing',
            options: [
              { label: l('Processing', 'Đang xử lý'), value: 'processing' },
              { label: l('Confirmed', 'Đã xác nhận'), value: 'confirmed' },
              { label: l('Shipping', 'Đang giao'), value: 'shipping' },
              { label: l('Completed', 'Đã giao'), value: 'completed' },
              { label: l('Cancelled', 'Đã hủy'), value: 'cancelled' },
            ],
            admin: { position: 'sidebar' },
            hooks: {
              beforeChange: [
                ({ value, originalDoc, siblingData, req }) => {
                  const next = value || 'processing'
                  const previous = originalDoc?.fulfillmentStatus || 'processing'
                  const allowed: Record<string, string[]> = {
                    processing: ['confirmed', 'cancelled'],
                    confirmed: ['shipping', 'cancelled'],
                    shipping: ['completed', 'cancelled'],
                    completed: [],
                    cancelled: [],
                  }
                  if (originalDoc && next !== previous && !allowed[previous]?.includes(next)) {
                    throw new Error(`Invalid fulfillment transition: ${previous} -> ${next}`)
                  }
                  if (next !== previous) {
                    siblingData.orderEvents = [
                      ...(Array.isArray(originalDoc?.orderEvents) ? originalDoc.orderEvents : []),
                      {
                        event: 'status_changed',
                        fromStatus: previous,
                        toStatus: next,
                        note: '',
                        changedBy: req.user && typeof req.user === 'object' ? String(req.user.id) : 'system',
                        changedAt: new Date().toISOString(),
                      },
                    ]
                  }
                  return next
                },
              ],
            },
          },
          {
            name: 'carrier',
            type: 'text',
            label: l('Carrier', 'Đơn vị vận chuyển'),
            admin: { position: 'sidebar' },
          },
          {
            name: 'trackingNumber',
            type: 'text',
            label: l('Tracking number', 'Mã vận đơn'),
            admin: { position: 'sidebar' },
          },
          {
            type: 'row',
            fields: [
              { name: 'shippedAt', type: 'date', label: l('Shipped at', 'Ngày gửi') },
              { name: 'deliveredAt', type: 'date', label: l('Delivered at', 'Ngày giao') },
            ],
          },
          {
            name: 'adminNote',
            type: 'textarea',
            label: l('Admin note', 'Ghi chú admin'),
          },
          {
            name: 'orderEvents',
            type: 'array',
            label: l('Order history', 'Lịch sử đơn hàng'),
            admin: { readOnly: true },
            fields: [
              { name: 'event', type: 'text', required: true },
              { name: 'fromStatus', type: 'text' },
              { name: 'toStatus', type: 'text' },
              { name: 'note', type: 'text' },
              { name: 'changedBy', type: 'text' },
              { name: 'changedAt', type: 'date', required: true },
            ],
          },
          {
            name: 'lines',
            type: 'array',
            label: l('Ordered items (price at checkout)', 'Sản phẩm đã đặt (giá lúc đặt)'),
            admin: { readOnly: true },
            fields: [
              { name: 'name', type: 'text', required: true, label: l('Product', 'Sản phẩm') },
              { name: 'skuCode', type: 'text', label: l('SKU code', 'Mã SKU') },
              { name: 'color', type: 'text', label: l('Color', 'Màu') },
              { name: 'quantity', type: 'number', required: true, label: l('Quantity', 'Số lượng') },
              { name: 'unitPrice', type: 'number', required: true, label: l('Unit price', 'Đơn giá') },
            ],
          },
          {
            name: 'accessToken',
            type: 'text',
            label: l('Access token', 'Mã truy cập'),
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
        ],
      }),
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: { ...defaultCollection.admin, group: groups.ecommerce },
      }),
    },
    addresses: {
      addressesCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: { ...defaultCollection.admin, group: groups.ecommerce },
      }),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: { ...defaultCollection.admin, group: groups.ecommerce },
      }),
    },
    currencies: {
      defaultCurrency: 'VND',
      supportedCurrencies: [{ code: 'VND', decimals: 0, label: 'Vietnamese Dong', symbol: '₫', symbolDisplay: 'symbol' }],
    },
    payments: {
      paymentMethods: [codAdapter()],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantOptionsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          admin: { ...defaultCollection.admin, group: groups.ecommerce },
        }),
        variantsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          admin: { ...defaultCollection.admin, group: groups.ecommerce },
        }),
        variantTypesCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          admin: { ...defaultCollection.admin, group: groups.ecommerce },
        }),
      },
    },
  }),
]
