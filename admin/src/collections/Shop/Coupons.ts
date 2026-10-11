import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { groups, l } from '@/i18n/labels'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: { singular: l('Coupon', 'Mã giảm giá'), plural: l('Coupons', 'Mã giảm giá') },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: groups.marketing,
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'usedCount', 'active'],
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true, index: true, label: l('Code', 'Mã') },
    {
      name: 'type',
      type: 'select',
      label: l('Type', 'Loại'),
      required: true,
      defaultValue: 'percent',
      options: [
        { label: l('Percent discount', 'Giảm theo %'), value: 'percent' },
        { label: l('Fixed amount', 'Giảm số tiền'), value: 'fixed' },
        { label: l('Free shipping', 'Miễn phí vận chuyển'), value: 'freeShip' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      min: 0,
      label: l('Value', 'Giá trị'),
      admin: { condition: (_, s) => s?.type !== 'freeShip' },
    },
    {
      name: 'minOrder',
      type: 'number',
      min: 0,
      defaultValue: 0,
      label: l('Minimum order (VND)', 'Đơn tối thiểu (VNĐ)'),
    },
    {
      name: 'usageLimit',
      type: 'number',
      min: 0,
      defaultValue: 0,
      label: l('Usage limit (0 = unlimited)', 'Giới hạn lượt dùng (0 = không giới hạn)'),
    },
    {
      name: 'usedCount',
      type: 'number',
      defaultValue: 0,
      label: l('Times used', 'Số lượt đã dùng'),
      admin: { readOnly: true },
    },
    { name: 'startsAt', type: 'date', label: l('Starts at', 'Bắt đầu') },
    { name: 'endsAt', type: 'date', label: l('Ends at', 'Kết thúc') },
    { name: 'active', type: 'checkbox', defaultValue: true, label: l('Active', 'Đang hoạt động') },
  ],
}
