import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { groups, l } from '@/i18n/labels'

const publicRead = { create: adminOnly, delete: adminOnly, read: () => true, update: adminOnly }

export const Stores: CollectionConfig = {
  slug: 'stores',
  labels: { singular: l('Store', 'Cửa hàng'), plural: l('Stores', 'Cửa hàng') },
  access: publicRead,
  admin: { group: groups.content, useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true, label: l('Name', 'Tên') },
    { name: 'address', type: 'text', required: true, label: l('Address', 'Địa chỉ') },
    { name: 'phone', type: 'text', label: l('Phone', 'Điện thoại') },
    { name: 'hours', type: 'text', label: l('Opening hours', 'Giờ mở cửa') },
    { name: 'mapUrl', type: 'text', label: l('Google Maps link', 'Link Google Maps') },
  ],
}

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: l('FAQ', 'Câu hỏi thường gặp'), plural: l('FAQs', 'Câu hỏi thường gặp') },
  access: publicRead,
  admin: { group: groups.content, useAsTitle: 'question', defaultColumns: ['question', 'order'] },
  fields: [
    { name: 'question', type: 'text', required: true, label: l('Question', 'Câu hỏi') },
    { name: 'answer', type: 'textarea', required: true, label: l('Answer', 'Câu trả lời') },
    { name: 'order', type: 'number', defaultValue: 0, label: l('Order', 'Thứ tự') },
  ],
}

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: l('Banner', 'Banner'), plural: l('Banners', 'Banner') },
  access: publicRead,
  admin: { group: groups.content, useAsTitle: 'title', defaultColumns: ['title', 'order', 'active'] },
  fields: [
    { name: 'title', type: 'text', required: true, label: l('Title', 'Tiêu đề') },
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: l('Image', 'Ảnh') },
    { name: 'link', type: 'text', label: l('Link', 'Đường dẫn') },
    { name: 'order', type: 'number', defaultValue: 0, label: l('Order', 'Thứ tự') },
    { name: 'active', type: 'checkbox', defaultValue: true, label: l('Active', 'Đang hiển thị') },
  ],
}

export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: { singular: l('Contact message', 'Liên hệ'), plural: l('Contact messages', 'Liên hệ') },
  access: { create: () => true, delete: adminOnly, read: adminOnly, update: adminOnly },
  admin: { group: groups.marketing, useAsTitle: 'name', defaultColumns: ['name', 'email', 'phone', 'createdAt'] },
  fields: [
    { name: 'name', type: 'text', required: true, maxLength: 100, label: l('Name', 'Họ tên') },
    { name: 'email', type: 'email', required: true, label: l('Email', 'Email') },
    { name: 'phone', type: 'text', maxLength: 30, label: l('Phone', 'Điện thoại') },
    { name: 'message', type: 'textarea', required: true, maxLength: 3000, label: l('Message', 'Nội dung') },
    { name: 'handled', type: 'checkbox', defaultValue: false, label: l('Handled', 'Đã xử lý') },
  ],
}

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: l('Subscriber', 'Người đăng ký'), plural: l('Subscribers', 'Người đăng ký') },
  access: { create: () => true, delete: adminOnly, read: adminOnly, update: adminOnly },
  admin: { group: groups.marketing, useAsTitle: 'email' },
  fields: [{ name: 'email', type: 'email', required: true, unique: true, label: l('Email', 'Email') }],
}
