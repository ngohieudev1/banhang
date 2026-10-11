import type { Block } from 'payload'

import { l } from '@/i18n/labels'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: { singular: l('Media Block', 'Khối hình ảnh'), plural: l('Media Blocks', 'Khối hình ảnh') },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: l('Media', 'Hình ảnh'),
      relationTo: 'media',
      required: true,
    },
  ],
}
