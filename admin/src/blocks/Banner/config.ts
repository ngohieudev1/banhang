import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { l } from '@/i18n/labels'

export const Banner: Block = {
  slug: 'banner',
  labels: { singular: l('Banner', 'Banner'), plural: l('Banners', 'Banner') },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: l('Style', 'Kiểu'),
      defaultValue: 'info',
      options: [
        { label: l('Info', 'Thông tin'), value: 'info' },
        { label: l('Warning', 'Cảnh báo'), value: 'warning' },
        { label: l('Error', 'Lỗi'), value: 'error' },
        { label: l('Success', 'Thành công'), value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}
