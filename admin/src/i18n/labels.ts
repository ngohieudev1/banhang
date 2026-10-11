// Nhãn song ngữ cho admin: khóa là mã ngôn ngữ trong payload.config (i18n.supportedLanguages).
export const l = (en: string, vi: string) => ({ en, vi })

export const groups = {
  content: l('Content', 'Nội dung'),
  marketing: l('Marketing', 'Tiếp thị'),
  users: l('Users', 'Người dùng'),
  settings: l('Settings', 'Cài đặt'),
  ecommerce: l('Ecommerce', 'Thương mại'),
}
