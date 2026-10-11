import type { Block } from 'payload'

import { l } from '@/i18n/labels'

export const ThreeItemGrid: Block = {
  slug: 'threeItemGrid',
  fields: [
    {
      name: 'products',
      type: 'relationship',
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: l('Products to show', 'Sản phẩm hiển thị'),
      maxRows: 3,
      minRows: 3,
      relationTo: 'products',
    },
  ],
  interfaceName: 'ThreeItemGridBlock',
  labels: {
    plural: l('Three Item Grids', 'Lưới 3 sản phẩm'),
    singular: l('Three Item Grid', 'Lưới 3 sản phẩm'),
  },
}
