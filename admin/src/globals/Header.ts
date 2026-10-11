import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'
import { groups, l } from '@/i18n/labels'

export const Header: GlobalConfig = {
  slug: 'header',
  label: l('Header', 'Đầu trang'),
  admin: { group: groups.settings },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: l('Navigation items', 'Mục điều hướng'),
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
}
