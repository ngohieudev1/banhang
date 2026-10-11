import 'dotenv/config'
import path from 'node:path'
import { getPayload } from 'payload'

import config from '../src/payload.config'

type MediaDocument = {
  id: string
  alt?: string
  filename?: string
  url?: string
  mimeType?: string
  migrationSourceUrl?: string
}

type GalleryItem = {
  image?: string | MediaDocument | null
  [key: string]: unknown
}

type ProductDocument = {
  id: string
  title?: string
  slug?: string
  hoverImageUrl?: string | null
  gallery?: GalleryItem[] | null
  meta?: {
    image?: string | MediaDocument | null
    [key: string]: unknown
  } | null
}

type DownloadedFile = {
  data: Buffer
  mimetype: string
  name: string
  size: number
}

const sourceBaseUrl = process.env.SOURCE_MEDIA_BASE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
const dryRun = process.env.DRY_RUN === 'true'
const keepOldMedia = process.env.KEEP_OLD_MEDIA !== 'false'
const sourceUrlCache = new Map<string, string>()

const absoluteUrl = (value: string) => {
  try {
    return new URL(value, sourceBaseUrl).toString()
  } catch {
    throw new Error(`URL ảnh không hợp lệ: ${value}`)
  }
}

const filenameFromUrl = (url: string, fallback: string) => {
  const pathname = new URL(url).pathname
  const basename = path.basename(pathname).split('?')[0]
  const safeName = basename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')
  return safeName || `${fallback}.jpg`
}

const download = async (url: string, fallbackName: string): Promise<DownloadedFile> => {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`Tải ảnh lỗi HTTP ${response.status}: ${url}`)

  const data = Buffer.from(await response.arrayBuffer())
  if (data.length === 0) throw new Error(`Ảnh rỗng: ${url}`)

  const contentType = response.headers.get('content-type')?.split(';')[0]
  return {
    data,
    mimetype: contentType?.startsWith('image/') ? contentType : 'image/jpeg',
    name: filenameFromUrl(url, fallbackName),
    size: data.length,
  }
}

const getMedia = async (payload: Awaited<ReturnType<typeof getPayload>>, value: string | MediaDocument) => {
  if (typeof value !== 'string') return value
  return (await payload.findByID({ collection: 'media', id: value, depth: 0 })) as MediaDocument
}

const migrateMedia = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  value: string | MediaDocument,
  product: ProductDocument,
  index: number,
) => {
  const oldMedia = await getMedia(payload, value)
  if (!oldMedia.url) throw new Error(`Media ${oldMedia.id} không có URL`)

  return migrateImageUrl(payload, oldMedia.url, oldMedia.alt || product.title || product.slug || 'Product image', product, index)
}

const migrateImageUrl = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  oldUrl: string,
  alt: string,
  product: ProductDocument,
  index: number,
) => {
  const sourceUrl = absoluteUrl(oldUrl)
  const cachedMediaId = sourceUrlCache.get(sourceUrl)
  if (cachedMediaId) return (await payload.findByID({ collection: 'media', id: cachedMediaId, depth: 0 })) as MediaDocument

  const existing = await payload.find({
    collection: 'media',
    where: { migrationSourceUrl: { equals: sourceUrl } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) {
    const existingMedia = existing.docs[0] as MediaDocument
    sourceUrlCache.set(sourceUrl, existingMedia.id)
    return existingMedia
  }

  const file = await download(sourceUrl, `${product.slug || product.id}-${index + 1}`)
  if (dryRun) {
    console.log(`[DRY_RUN] ${product.slug || product.id}: ${sourceUrl}`)
    return { id: `dry-run-${sourceUrl}`, url: oldUrl }
  }

  const media = (await payload.create({
    collection: 'media',
    data: {
      alt,
      migrationSourceUrl: sourceUrl,
    },
    file,
    overrideAccess: true,
  })) as MediaDocument

  sourceUrlCache.set(sourceUrl, media.id)
  return media
}

const run = async () => {
  const payload = await getPayload({ config })
  let page = 1
  let updatedProducts = 0
  let migratedImages = 0
  let failedProducts = 0

  console.log(`Nguồn ảnh: ${sourceBaseUrl}`)
  console.log(`Chế độ: ${dryRun ? 'DRY_RUN' : 'IMPORT'}; giữ media cũ: ${keepOldMedia}`)

  while (true) {
    const result = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 100,
      page,
      overrideAccess: true,
    })

    for (const product of result.docs as ProductDocument[]) {
      try {
        const gallery = Array.isArray(product.gallery) ? product.gallery : []
        const nextGallery: GalleryItem[] = []
        let changed = false

        for (const [index, item] of gallery.entries()) {
          if (!item.image) {
            nextGallery.push(item)
            continue
          }

          const oldImageId = typeof item.image === 'string' ? item.image : item.image.id
          const newMedia = await migrateMedia(payload, item.image, product, index)
          nextGallery.push({ ...item, image: newMedia.id })
          if (newMedia.id !== oldImageId) {
            changed = true
            migratedImages += 1
          }
        }

        const nextMeta = product.meta ? { ...product.meta } : undefined
        if (nextMeta?.image) {
          const oldImageId = typeof nextMeta.image === 'string' ? nextMeta.image : nextMeta.image.id
          const newMedia = await migrateMedia(payload, nextMeta.image, product, gallery.length)
          nextMeta.image = newMedia.id
          if (newMedia.id !== oldImageId) {
            changed = true
            migratedImages += 1
          }
        }

        let nextHoverImageUrl = product.hoverImageUrl
        if (product.hoverImageUrl) {
          const newMedia = await migrateImageUrl(
            payload,
            product.hoverImageUrl,
            product.title || product.slug || 'Product image',
            product,
            gallery.length + 1,
          )
          nextHoverImageUrl = newMedia.url || product.hoverImageUrl
          if (nextHoverImageUrl !== product.hoverImageUrl) {
            changed = true
            migratedImages += 1
          }
        }

        if (changed && !dryRun) {
          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              gallery: nextGallery,
              ...(nextHoverImageUrl ? { hoverImageUrl: nextHoverImageUrl } : {}),
              ...(nextMeta ? { meta: nextMeta } : {}),
            } as never,
            depth: 0,
            overrideAccess: true,
          })
          updatedProducts += 1
          console.log(`Đã cập nhật: ${product.slug || product.id}`)
        }
      } catch (error) {
        failedProducts += 1
        console.error(`Lỗi sản phẩm ${product.slug || product.id}:`, error)
      }
    }

    if (!result.hasNextPage) break
    page += 1
  }

  if (!keepOldMedia && !dryRun) {
    console.warn('KEEP_OLD_MEDIA=false chưa tự động xóa media cũ để tránh xóa nhầm media đang được dùng ở nơi khác.')
  }

  console.log(`Hoàn tất. Products cập nhật: ${updatedProducts}; ảnh mới: ${migratedImages}; lỗi: ${failedProducts}`)
  process.exitCode = failedProducts > 0 ? 1 : 0
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
