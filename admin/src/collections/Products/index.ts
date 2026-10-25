import { slugField } from 'payload'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { groups, l } from '@/i18n/labels'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { DefaultDocumentIDType, Where } from 'payload'

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  labels: { singular: l('Product', 'Sản phẩm'), plural: l('Products', 'Sản phẩm') },
  admin: {
    ...defaultCollection?.admin,
    group: groups.ecommerce,
    defaultColumns: ['title', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'products',
        req,
      }),
    useAsTitle: 'title',
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    skus: true,
    gallery: true,
    priceInVND: true,
    meta: true,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: l('Title', 'Tên sản phẩm') },
    { name: 'priceInVNDEnabled', type: 'checkbox', defaultValue: true, label: l('VND pricing enabled', 'Bật giá VNĐ') },
    { name: 'priceInVND', type: 'number', min: 0, label: l('Price (VND)', 'Giá (VNĐ)') },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'gallery',
              type: 'array',
              label: l('Gallery', 'Thư viện ảnh'),
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  label: l('Image', 'Ảnh'),
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'variantOption',
                  type: 'relationship',
                  label: l('Variant option', 'Tùy chọn biến thể'),
                  relationTo: 'variantOptions',
                  admin: {
                    condition: (data) => {
                      return data?.enableVariants === true && data?.variantTypes?.length > 0
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map((item: any) => {
                        if (typeof item === 'object' && item?.id) {
                          return item.id
                        }
                        return item
                      }) as DefaultDocumentIDType[]

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        }

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      }

                      return query
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    }
                  },
                },
              ],
            },

          ],
          label: l('Gallery & SKUs', 'Ảnh & SKU'),
        },
        {
          fields: [
            {
              name: 'skus',
              type: 'relationship',
              relationTo: 'skus',
              hasMany: true,
              label: l('Displayed SKUs', 'SKU hiển thị ở trang này'),
              admin: {
                description: l(
                  'Pick the SKUs shown on this product page. Order = display order; the first one is selected by default. Manage SKUs under Ecommerce > SKUs.',
                  'Chọn các SKU hiển thị ở trang chi tiết. Thứ tự chọn là thứ tự hiển thị, SKU đầu tiên được chọn mặc định. Quản lý SKU tại Thương mại > Quản lý SKU.',
                ),
              },
              filterOptions: { active: { equals: true } },
            },
            { name: 'tag', type: 'text', label: l('Tag (New, Best seller...)', 'Nhãn (New, Best seller...)') },
            {
              name: 'compareAtPrice',
              type: 'number',
              min: 0,
              label: l('Compare-at price (VND)', 'Giá niêm yết (VNĐ)'),
            },
            {
              name: 'colors',
              type: 'array',
              label: l('Colors', 'Màu sắc'),
              fields: [
                { name: 'name', type: 'text', required: true, label: l('Name', 'Tên màu') },
                { name: 'hex', type: 'text', required: true, label: l('Hex code', 'Mã màu (hex)') },
              ],
            },
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
                  'Leave empty to use the website default specifications',
                  'Để trống sẽ dùng thông số mặc định của website',
                ),
              },
              fields: [
                { name: 'label', type: 'text', required: true, label: l('Label', 'Nhãn') },
                { name: 'value', type: 'text', required: true, label: l('Value', 'Giá trị') },
              ],
            },
            { name: 'shortDescription', type: 'textarea', label: l('Short description', 'Mô tả ngắn') },
            {
              name: 'freeShipping',
              type: 'checkbox',
              defaultValue: false,
              label: l('Free shipping', 'Miễn phí ship'),
              admin: {
                description: l(
                  'Waive shipping for orders containing this product.',
                  'Miễn phí ship cho đơn hàng có sản phẩm này.',
                ),
              },
            },
            {
              name: 'perks',
              type: 'group',
              label: l('Product perks', 'Chính sách bán hàng'),
              admin: {
                description: l(
                  'Shown under the Buy now button. Leave empty to use Site settings.',
                  'Hiển thị dưới nút Mua ngay. Để trống sẽ dùng Cài đặt website',
                ),
              },
              fields: [
                { name: 'shipping', type: 'text', label: l('Shipping info', 'Thông tin vận chuyển'), admin: { placeholder: 'Free HCM shipping over 450K' } },
                { name: 'returns', type: 'text', label: l('Returns info', 'Thông tin đổi trả'), admin: { placeholder: '7-day free returns' } },
                { name: 'warranty', type: 'text', label: l('Warranty info', 'Thông tin bảo hành'), admin: { placeholder: '12-month warranty' } },
              ],
            },
            {
              name: 'legalInfo',
              type: 'array',
              label: l('Product legal information', 'Thông tin pháp lý sản phẩm'),
              admin: {
                description: l(
                  'e.g. Brand, Company, Address, Warranty. Leave empty to use Site settings.',
                  'Ví dụ: Thương hiệu, Công ty, Địa chỉ, Bảo hành. Để trống sẽ dùng Cài đặt website',
                ),
              },
              fields: [
                { name: 'label', type: 'text', required: true, label: l('Label', 'Nhãn') },
                { name: 'value', type: 'text', required: true, label: l('Value', 'Giá trị') },
              ],
            },
            {
              name: 'hoverImageUrl',
              type: 'text',
              label: l('Hover image URL', 'Ảnh hover (URL)'),
              admin: {
                description: l(
                  'Hover image URL, used when the gallery has no second image',
                  'Ảnh hover (URL) nếu không dùng gallery',
                ),
              },
            },
          ],
          label: l('Product Details', 'Chi tiết sản phẩm'),
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    slugField(),
  ],
})
