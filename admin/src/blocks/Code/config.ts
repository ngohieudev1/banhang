import type { Block } from 'payload'

import { l } from '@/i18n/labels'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: { singular: l('Code', 'Mã nguồn'), plural: l('Code', 'Mã nguồn') },
  fields: [
    {
      name: 'language',
      type: 'select',
      label: l('Language', 'Ngôn ngữ'),
      defaultValue: 'typescript',
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
