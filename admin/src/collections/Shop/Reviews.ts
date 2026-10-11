import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { checkRole } from '@/access/utilities'
import { groups, l } from '@/i18n/labels'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: l('Review', 'Đánh giá'), plural: l('Reviews', 'Đánh giá') },
  access: {
    create: () => true,
    delete: adminOnly,
    read: ({ req: { user } }) => (user && checkRole(['admin'], user) ? true : { status: { equals: 'approved' } }),
    update: adminOnly,
  },
  admin: {
    group: groups.content,
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'product', 'rating', 'status'],
  },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, label: l('Product', 'Sản phẩm') },
    { name: 'authorName', type: 'text', required: true, maxLength: 80, label: l('Author name', 'Tên người đánh giá') },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5, label: l('Rating', 'Số sao') },
    { name: 'comment', type: 'textarea', required: true, maxLength: 2000, label: l('Comment', 'Nội dung') },
    {
      name: 'status',
      type: 'select',
      label: l('Status', 'Trạng thái'),
      defaultValue: 'pending',
      options: [
        { label: l('Pending', 'Chờ duyệt'), value: 'pending' },
        { label: l('Approved', 'Đã duyệt'), value: 'approved' },
        { label: l('Rejected', 'Từ chối'), value: 'rejected' },
      ],
      access: { create: () => false, update: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)) },
    },
  ],
}

export const Questions: CollectionConfig = {
  slug: 'questions',
  labels: { singular: l('Question', 'Câu hỏi'), plural: l('Questions', 'Câu hỏi') },
  access: {
    create: () => true,
    delete: adminOnly,
    read: ({ req: { user } }) => (user && checkRole(['admin'], user) ? true : { status: { equals: 'approved' } }),
    update: adminOnly,
  },
  admin: { group: groups.content, useAsTitle: 'question', defaultColumns: ['question', 'product', 'status'] },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true, label: l('Product', 'Sản phẩm') },
    { name: 'authorName', type: 'text', required: true, maxLength: 80, label: l('Author name', 'Tên người hỏi') },
    { name: 'question', type: 'textarea', required: true, maxLength: 1000, label: l('Question', 'Câu hỏi') },
    { name: 'answer', type: 'textarea', label: l('Answer', 'Câu trả lời') },
    {
      name: 'status',
      type: 'select',
      label: l('Status', 'Trạng thái'),
      defaultValue: 'pending',
      options: [
        { label: l('Pending', 'Chờ duyệt'), value: 'pending' },
        { label: l('Approved', 'Đã duyệt'), value: 'approved' },
      ],
      access: { create: () => false, update: ({ req: { user } }) => Boolean(user && checkRole(['admin'], user)) },
    },
  ],
}
