import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { products } from '../../src/mocks/products'
import { productDetails, detailRows, legalRows } from '../../src/mocks/productDetails'

const specs = detailRows.map(([label, value]) => ({ label, value }))

const download = async (url: string, name: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Tải ảnh lỗi ${res.status}: ${name}`)
  const data = Buffer.from(await res.arrayBuffer())
  const mimetype = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg'
  return { data, mimetype, name, size: data.length }
}

const run = async () => {
  const payload = await getPayload({ config })

  for (const item of products) {
    const slug = item.id
    const exists = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (exists.totalDocs > 0) {
      const current = exists.docs[0] as { id: string; specs?: unknown[] | null }
      if (!current.specs?.length) {
        await payload.update({
          collection: 'products',
          id: current.id,
          data: { specs } as never,
        })
        payload.logger.info(`Bổ sung thông số: ${slug}`)
      } else {
        payload.logger.info(`Bỏ qua (đã có): ${slug}`)
      }
      continue
    }

    const detail = productDetails[item.id]
    const ext = 'jpg'
    const media = await payload.create({
      collection: 'media',
      data: { alt: item.name },
      file: await download(item.image, `${slug}.${ext}`),
    })

    await payload.create({
      collection: 'products',
      data: {
        title: item.name,
        slug,
        _status: 'published',
        priceInVNDEnabled: true,
        priceInVND: item.price,
        compareAtPrice: item.compareAtPrice,
        tag: item.tag,
        hoverImageUrl: item.hoverImage,
        colors: item.colors,
        specs,
        highlights: (detail?.highlights ?? []).map((text) => ({ text })),
        gallery: [{ image: media.id }],
      } as never,
    })
    payload.logger.info(`Đã tạo: ${slug}`)
  }

  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as {
    announcements?: unknown[] | null
    legalInfo?: unknown[] | null
  }
  const patch: Record<string, unknown> = {}
  if (!settings.announcements?.length) {
    patch.announcements = [
      { text: 'Miễn phí vận chuyển cho đơn từ 300.000₫' },
      { text: 'Hotline: 096 990 4039' },
      { text: 'Bộ sưu tập Y2K mùa mới đã ra mắt' },
    ]
  }
  if (!settings.legalInfo?.length) {
    patch.legalInfo = legalRows.map(([label, value]) => ({ label, value }))
  }
  if (Object.keys(patch).length > 0) {
    await payload.updateGlobal({ slug: 'site-settings', data: patch as never })
  }

  payload.logger.info('Seed xong.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
