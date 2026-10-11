import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'
import { l } from '@/i18n/labels'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: l('Size', 'Kích thước'),
    defaultValue: 'oneThird',
    options: [
      {
        label: l('One Third', 'Một phần ba'),
        value: 'oneThird',
      },
      {
        label: l('Half', 'Một nửa'),
        value: 'half',
      },
      {
        label: l('Two Thirds', 'Hai phần ba'),
        value: 'twoThirds',
      },
      {
        label: l('Full', 'Toàn bộ'),
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: l('Enable link', 'Bật liên kết'),
  },
  link({
    overrides: {
      admin: {
        condition: (_: unknown, { enableLink }: { enableLink?: boolean }) => Boolean(enableLink),
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { singular: l('Content', 'Nội dung'), plural: l('Content', 'Nội dung') },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: l('Columns', 'Cột'),
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
