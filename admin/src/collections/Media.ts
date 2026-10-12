import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { adminOnly } from '@/access/adminOnly'
import { groups, l } from '@/i18n/labels'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const renameFolderUpload = ({ req }: { req: { file?: { name?: string } } }) => {
  const uploadedFile = req.file
  const originalName = uploadedFile?.name

  if (!originalName) return

  const normalizedName = originalName.replaceAll('\\', '/')
  const pathParts = normalizedName.split('/').filter(Boolean)

  if (pathParts.length < 2 || !uploadedFile) return

  const extension = path.extname(pathParts.at(-1) ?? '')
  const imageName = path.basename(pathParts.at(-1) ?? '', extension)
  const folderName = pathParts.at(-2) ?? ''
  const safeName = `${folderName}-${imageName}${extension}`.replace(/[^a-zA-Z0-9._-]/g, '-')

  uploadedFile.name = safeName
}

export const Media: CollectionConfig = {
  admin: {
    group: groups.content,
  },
  slug: 'media',
  labels: { singular: l('Media', 'Tệp media'), plural: l('Media', 'Tệp media') },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: l('Alt text', 'Văn bản thay thế (alt)'),
      required: true,
    },
    {
      name: 'migrationSourceUrl',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'caption',
      type: 'richText',
      label: l('Caption', 'Chú thích'),
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    beforeOperation: [renameFolderUpload],
  },
  upload: {
    admin: {
      components: {
        controls: ['@/components/Media/FolderUploadControls#default'],
      },
    },
    staticDir: path.resolve(dirname, '../../public/media'),
  },
}
