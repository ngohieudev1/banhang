import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { l } from '@/i18n/labels'

import { linkGroup } from './linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: l('Type', 'Kiểu hiển thị'),
      options: [
        {
          label: l('None', 'Không có'),
          value: 'none',
        },
        {
          label: l('High Impact', 'Nổi bật cao'),
          value: 'highImpact',
        },
        {
          label: l('Medium Impact', 'Nổi bật vừa'),
          value: 'mediumImpact',
        },
        {
          label: l('Low Impact', 'Nổi bật thấp'),
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
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
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      label: l('Media', 'Hình ảnh'),
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
