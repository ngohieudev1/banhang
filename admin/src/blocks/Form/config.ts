import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { l } from '@/i18n/labels'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      label: l('Form', 'Biểu mẫu'),
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: l('Enable Intro Content', 'Bật nội dung giới thiệu'),
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: l('Form Blocks', 'Khối biểu mẫu'),
    singular: l('Form Block', 'Khối biểu mẫu'),
  },
}
