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
        admin: { ...defaultCollection.admin, group: groups.ecommerce },
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
