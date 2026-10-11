import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { l } from '@/i18n/labels'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: l('Intro Content', 'Nội dung giới thiệu'),
    },
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
  ],
  labels: {
    plural: l('Archives', 'Danh sách'),
    singular: l('Archive', 'Danh sách'),
  },
}
