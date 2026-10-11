import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { groups, l } from '@/i18n/labels'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: l('Site settings', 'Cài đặt website'),
  access: { read: () => true, update: adminOnly },
  admin: { group: groups.settings },
  fields: [
    { name: 'brandName', type: 'text', defaultValue: 'CHAUTFIFTH', label: l('Brand name', 'Tên thương hiệu') },
    { name: 'hotline', type: 'text', defaultValue: '096 990 4039', label: l('Hotline', 'Hotline') },
    { name: 'email', type: 'email', label: l('Email', 'Email') },
    { name: 'address', type: 'text', label: l('Address', 'Địa chỉ') },
    {
      name: 'workingHours',
      type: 'text',
      defaultValue: '8:00 - 17:30 (Thứ 2 - Thứ 7)',
      label: l('Working hours', 'Giờ làm việc'),
    },
    {
      name: 'freeShipThreshold',
      type: 'number',
      defaultValue: 300000,
      label: l('Free shipping from (VND)', 'Miễn phí ship từ (VNĐ)'),
    },
    {
      name: 'shippingFee',
      type: 'number',
      min: 0,
      defaultValue: 30000,
      label: l('Flat shipping fee (VND)', 'Phí ship đồng giá (VNĐ)'),
    },
    {
      name: 'announcements',
      type: 'array',
      label: l('Announcements', 'Thông báo đầu trang'),
      fields: [{ name: 'text', type: 'text', required: true, label: l('Text', 'Nội dung') }],
    },
    {
      name: 'informationPages',
      type: 'group',
      label: l('Information pages', 'Trang thông tin'),
      fields: [
        { name: 'shipping', type: 'textarea', label: l('Shipping & delivery', 'Vận chuyển & giao hàng') },
        { name: 'returns', type: 'textarea', label: l('Returns', 'Đổi trả') },
        { name: 'sizeGuide', type: 'textarea', label: l('Size guide', 'Hướng dẫn chọn kích cỡ') },
        { name: 'about', type: 'textarea', label: l('About us', 'Về chúng tôi') },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: l('Social links', 'Mạng xã hội'),
      fields: [
        { name: 'facebook', type: 'text', label: l('Facebook', 'Facebook') },
        { name: 'instagram', type: 'text', label: l('Instagram', 'Instagram') },
        { name: 'tiktok', type: 'text', label: l('TikTok', 'TikTok') },
        { name: 'zalo', type: 'text', label: l('Zalo', 'Zalo') },
      ],
    },
    {
      name: 'legalInfo',
      type: 'array',
      label: l('Product legal information', 'Thông tin pháp lý sản phẩm'),
      admin: {
        description: l(
          'Shown in the Legal Product Information section. Leave empty to use the default.',
          'Hiển thị ở mục Legal Product Information. Để trống sẽ dùng mặc định',
        ),
      },
      fields: [
        { name: 'label', type: 'text', required: true, label: l('Label', 'Nhãn') },
        { name: 'value', type: 'text', required: true, label: l('Value', 'Giá trị') },
      ],
    },
    {
      name: 'collectionPage',
      type: 'group',
      label: l('Bag collection page', 'Trang danh sách túi'),
      fields: [
        { name: 'title', type: 'text', defaultValue: 'Bags', label: l('Title', 'Tiêu đề') },
        {
          name: 'subtitle',
          type: 'text',
          defaultValue: 'Handbags and accessories designed in Vietnam.',
          label: l('Subtitle', 'Mô tả ngắn'),
        },
        { name: 'breadcrumb', type: 'text', defaultValue: 'chautfifth.com', label: l('Breadcrumb', 'Breadcrumb') },
      ],
    },
    {
      name: 'productPerks',
      type: 'group',
      label: l('Product page perks', 'Thông tin sản phẩm'),
      fields: [
        {
          name: 'shipping',
          type: 'text',
          defaultValue: 'Free HCM shipping over 450K',
          label: l('Shipping info', 'Thông tin vận chuyển'),
        },
        {
          name: 'returns',
          type: 'text',
          defaultValue: '7-day free returns',
          label: l('Returns info', 'Thông tin đổi trả'),
        },
        {
          name: 'warranty',
          type: 'text',
          defaultValue: '12-month warranty',
          label: l('Warranty info', 'Thông tin bảo hành'),
        },
      ],
    },
    { name: 'googleAnalyticsId', type: 'text', label: l('Google Analytics ID', 'Mã Google Analytics') },
    { name: 'facebookPixelId', type: 'text', label: l('Facebook Pixel ID', 'Mã Facebook Pixel') },
  ],
}
