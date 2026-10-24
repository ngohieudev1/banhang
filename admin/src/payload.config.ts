import { mongooseAdapter } from '@payloadcms/db-mongodb'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { SiteSettings } from '@/globals/SiteSettings'
import { Coupons } from '@/collections/Shop/Coupons'
import { Skus } from '@/collections/Shop/Skus'
import { Reviews, Questions } from '@/collections/Shop/Reviews'
import { Stores, Faqs, Banners, ContactMessages, Subscribers } from '@/collections/Shop/Content'
import { storefrontOrderEndpoint } from '@/endpoints/storefrontOrder'
import { databaseBackupDownloadEndpoint, databaseBackupRestoreEndpoint } from '@/endpoints/databaseBackup'
import { ordersExportEndpoint } from '@/endpoints/ordersExport'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const storefrontURL = process.env.STOREFRONT_URL || 'http://localhost:3000'
// Payload drops the auth cookie when the request Origin is not in `csrf`, which breaks POST /api/users/logout from the admin's own origin.
const adminURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
const databaseURL = process.env.DATABASE_URI || process.env.DATABASE_URL

if (!databaseURL) {
  throw new Error('Missing DATABASE_URI or DATABASE_URL. Configure a MongoDB connection string before starting the admin app.')
}

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
    },
    user: Users.slug,
  },
  collections: [
    Users,
    Pages,
    Categories,
    Media,
    Skus,
    Coupons,
    Reviews,
    Questions,
    Stores,
    Faqs,
    Banners,
    ContactMessages,
    Subscribers,
  ],
  db: mongooseAdapter({
    allowIDOnCreate: true,
    url: databaseURL,
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  i18n: {
    supportedLanguages: { en, vi },
    fallbackLanguage: 'vi',
    translations: {
      en: {
        custom: {
          loginWelcome: 'Welcome to your dashboard!',
          loginIntro:
            ' This is where site admins log in to manage the store. Customers should ',
          loginLink: 'log in on the website instead',
          loginOutro: ' to access their account, order history and more.',
          dashboardWelcome: 'Welcome to your dashboard!',
          nextSteps: 'What to do next:',
          seedSuffix: ' with sample products and pages, then ',
          visitWebsite: 'visit your website',
          seeResults: ' to see the results.',
          manageContent:
            'Use the sidebar to manage products, categories, orders, banners and site settings.',
          seedButton: 'Seed your database',
          seeding: ' (seeding...)',
          seedDone: ' (done!)',
          seedErrorSuffix: ' (error: {{error}})',
          seedAlready: 'Database already seeded.',
          seedInProgress: 'Seeding already in progress.',
          seedRefresh: 'An error occurred, please refresh and try again.',
          seedLoading: 'Seeding with data....',
          seedFailed: 'An error occurred while seeding.',
          seedSuccess: 'Database seeded! You can now ',
        },
      },
      vi: {
        custom: {
          loginWelcome: 'Chào mừng đến trang quản trị!',
          loginIntro:
            ' Đây là nơi quản trị viên đăng nhập để quản lý cửa hàng. Khách hàng vui lòng ',
          loginLink: 'đăng nhập tại website',
          loginOutro: ' để xem tài khoản, lịch sử đơn hàng và nhiều hơn nữa.',
          dashboardWelcome: 'Chào mừng đến trang quản trị!',
          nextSteps: 'Các bước tiếp theo:',
          seedSuffix: ' với một số sản phẩm và trang mẫu, sau đó ',
          visitWebsite: 'truy cập website',
          seeResults: ' để xem kết quả.',
          manageContent:
            'Dùng thanh bên để quản lý sản phẩm, danh mục, đơn hàng, banner và cài đặt website.',
          seedButton: 'Tạo dữ liệu mẫu',
          seeding: ' (đang tạo...)',
          seedDone: ' (hoàn tất!)',
          seedErrorSuffix: ' (lỗi: {{error}})',
          seedAlready: 'Dữ liệu mẫu đã được tạo.',
          seedInProgress: 'Đang tạo dữ liệu mẫu.',
          seedRefresh: 'Đã xảy ra lỗi, vui lòng tải lại trang và thử lại.',
          seedLoading: 'Đang tạo dữ liệu mẫu....',
          seedFailed: 'Đã xảy ra lỗi khi tạo dữ liệu mẫu.',
          seedSuccess: 'Đã tạo dữ liệu mẫu! Bạn có thể ',
        },
      },
    },
  },
  //email: nodemailerAdapter(),
  cors: [storefrontURL],
  csrf: [storefrontURL, adminURL],
  endpoints: [storefrontOrderEndpoint, ordersExportEndpoint, databaseBackupDownloadEndpoint, databaseBackupRestoreEndpoint],
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // sharp,
})
