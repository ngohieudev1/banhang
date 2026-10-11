import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'
import { groups, l } from '@/i18n/labels'

export const Skus: CollectionConfig = {
  slug: 'skus',
  labels: { singular: l('SKU', 'SKU'), plural: l('SKUs', 'Quản lý SKU') },
  access: {
    create: adminOnly,
    delete: adminOnly,
    update: adminOnly,
    // Khách chỉ đọc được SKU đang bật; admin thấy tất cả.
    read: ({ req: { user } }) =>
      user && checkRole(['admin'], user) ? true : { active: { equals: true } },
  },
  admin: {
    group: groups.ecommerce,
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'priceInVND', 'color.name', 'inventory', 'active'],
    listSearchableFields: ['name', 'code'],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: l('Name', 'Tên SKU') },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: l('SKU code', 'Mã SKU'),
    },
    {
      name: 'images',
      type: 'array',
      label: l('Images', 'Ảnh'),
      minRows: 1,
      admin: {
        description: l(
          'The first image is the thumbnail customers click on the product page',
          'Ảnh đầu tiên là ảnh đại diện khách bấm chọn ở trang chi tiết',
        ),
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: l('Image', 'Ảnh'),
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priceInVND',
          type: 'number',
          required: true,
          min: 0,
          label: l('Price (VND)', 'Giá bán (VNĐ)'),
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
          label: l('Compare-at price (VND)', 'Giá niêm yết (VNĐ)'),
        },
        {
          name: 'inventory',
          type: 'number',
          min: 0,
          defaultValue: 50,
          label: l('Inventory', 'Tồn kho'),
        },
      ],
    },
    {
      name: 'color',
      type: 'group',
      label: l('Color', 'Màu sắc'),
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', label: l('Color name', 'Tên màu') },
            { name: 'hex', type: 'text', label: l('Hex code', 'Mã màu (hex)') },
          ],
        },
      ],
    },
    { name: 'shortDescription', type: 'textarea', label: l('Short description', 'Mô tả ngắn') },
    {
      name: 'highlights',
      type: 'array',
      label: l('Highlights', 'Điểm nổi bật'),
      fields: [{ name: 'text', type: 'text', required: true, label: l('Text', 'Nội dung') }],
    },
    {
      name: 'specs',
      type: 'array',
      label: l('Specifications (Details)', 'Thông số (Details)'),
      admin: {
        description: l(
          'Leave empty to use the product specifications',
          'Để trống sẽ dùng thông số của sản phẩm',
        ),
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: l('Label', 'Nhãn') },
        { name: 'value', type: 'text', required: true, label: l('Value', 'Giá trị') },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: l('Active', 'Đang bán'),
      admin: { position: 'sidebar' },
    },
  ],
}
