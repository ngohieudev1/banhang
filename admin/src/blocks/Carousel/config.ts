import type { Block } from 'payload'

import { l } from '@/i18n/labels'

export const Carousel: Block = {
  slug: 'carousel',
  labels: { singular: l('Carousel', 'Băng chuyền'), plural: l('Carousels', 'Băng chuyền') },
  fields: [
    {
      name: 'populateBy',
      type: 'select',
      label: l('Populate by', 'Nguồn dữ liệu'),
      defaultValue: 'collection',
      options: [
        {
          label: l('Collection', 'Theo bộ sưu tập'),
          value: 'collection',
        },
        {
          label: l('Individual Selection', 'Chọn thủ công'),
          value: 'selection',
        },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      defaultValue: 'products',
      label: l('Collections To Show', 'Bộ sưu tập hiển thị'),
      options: [
        {
          label: l('Products', 'Sản phẩm'),
          value: 'products',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
      },
      hasMany: true,
      label: l('Categories To Show', 'Danh mục hiển thị'),
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        step: 1,
      },
      defaultValue: 10,
      label: l('Limit', 'Giới hạn'),
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'selection',
      },
      hasMany: true,
      label: l('Selection', 'Lựa chọn'),
      relationTo: ['products'],
    },
    {
      name: 'populatedDocs',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: l(
          'This field is auto-populated after-read',
          'Trường này được tự động điền sau khi đọc dữ liệu',
        ),
        disabled: true,
      },
      hasMany: true,
      label: l('Populated Docs', 'Tài liệu đã điền'),
      relationTo: ['products'],
    },
    {
      name: 'populatedDocsTotal',
      type: 'number',
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === 'collection',
        description: l(
          'This field is auto-populated after-read',
          'Trường này được tự động điền sau khi đọc dữ liệu',
        ),
        disabled: true,
        step: 1,
      },
      label: l('Populated Docs Total', 'Tổng tài liệu đã điền'),
    },
  ],
  interfaceName: 'CarouselBlock',
}
