import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type ProductDoc = {
  id: string
  title: string
  slug?: string | null
  sku?: string | null
  priceInVND?: number | null
  compareAtPrice?: number | null
  inventory?: number | null
  colors?: { name: string; hex: string }[] | null
  gallery?: { image: string | { id: string } }[] | null
  shortDescription?: string | null
  highlights?: { text: string }[] | null
  specs?: { label: string; value: string }[] | null
  skus?: (string | { id: string })[] | null
}

const mediaId = (value: string | { id: string }) => (typeof value === 'string' ? value : value.id)

// Mỗi sản phẩm chưa có SKU sẽ được tạo 1 SKU từ dữ liệu hiện tại; chạy lại không tạo trùng.
const run = async () => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    pagination: false,
  })

  for (const product of docs as unknown as ProductDoc[]) {
    if (product.skus?.length) {
      payload.logger.info(`Bỏ qua (đã có SKU): ${product.slug}`)
      continue
    }

    const code = (product.sku || product.slug || product.id).toUpperCase()
    const existing = await payload.find({
      collection: 'skus',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
    })
    const color = product.colors?.[0]
    const images = (product.gallery ?? []).map((item) => ({ image: mediaId(item.image) }))

    const sku =
      (existing.docs[0] as { id: string } | undefined) ??
      (await payload.create({
        collection: 'skus',
        data: {
          name: product.title,
          code,
          images,
          priceInVND: product.priceInVND ?? 0,
          compareAtPrice: product.compareAtPrice ?? undefined,
          inventory: product.inventory ?? 50,
          color: color ? { name: color.name, hex: color.hex } : undefined,
          shortDescription: product.shortDescription ?? undefined,
          highlights: product.highlights?.map(({ text }) => ({ text })),
          specs: product.specs?.map(({ label, value }) => ({ label, value })),
          active: true,
        } as never,
      }))

    await payload.update({
      collection: 'products',
      id: product.id,
      data: { skus: [sku.id] } as never,
    })
    payload.logger.info(`Đã tạo SKU ${code} cho: ${product.slug}`)
  }

  payload.logger.info('Chuyển SKU xong.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
