import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { groups, l } from '@/i18n/labels'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: l('Category', 'Danh mục'), plural: l('Categories', 'Danh mục') },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: groups.content,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: l('Title', 'Tiêu đề'),
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
