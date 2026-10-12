'use client'

import JSZip from 'jszip'
import { useRef, useState } from 'react'

type UploadFile = File & {
  uploadFilename?: string
  webkitRelativePath?: string
}

const safeFilename = (file: UploadFile) => {
  if (file.uploadFilename) {
    return file.uploadFilename.replace(/[^a-zA-Z0-9._-]/g, '-')
  }

  const relativePath = file.webkitRelativePath?.replaceAll('\\', '/') ?? file.name
  const parts = relativePath.split('/').filter(Boolean)
  const folder = parts.length > 1 ? parts.at(-2) : undefined
  const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
  const basename = extension ? file.name.slice(0, -extension.length) : file.name
  const filename = folder ? `${folder}-${basename}${extension}` : file.name

  return filename.replace(/[^a-zA-Z0-9._-]/g, '-')
}

const readEntry = async (entry: FileSystemEntry): Promise<UploadFile[]> => {
  if (entry.isFile) {
    return new Promise((resolve, reject) => {
      ;(entry as FileSystemFileEntry).file((file) => {
        const uploadedFile = file as UploadFile
        uploadedFile.webkitRelativePath = entry.fullPath.replace(/^\/+/, '')
        resolve([uploadedFile])
      }, reject)
    })
  }

  const reader = (entry as FileSystemDirectoryEntry).createReader()
  const entries: FileSystemEntry[] = []

  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject))
    if (!batch.length) break
    entries.push(...batch)
  }

  const files = await Promise.all(entries.map(readEntry))
  return files.flat()
}

const isZipFile = (file: File) => file.name.toLowerCase().endsWith('.zip')

const getBaseName = (filename: string) => filename.replace(/\.[^.]+$/, '')

const getImageMimeType = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    avif: 'image/avif',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }

  return mimeTypes[extension ?? ''] ?? 'application/octet-stream'
}

const extractZipImages = async (zipFile: UploadFile): Promise<UploadFile[]> => {
  const zip = await JSZip.loadAsync(zipFile)
  const zipBaseName = getBaseName(zipFile.name)
  const images: UploadFile[] = []

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || path.startsWith('__MACOSX/')) continue

    const imageName = path.split('/').filter(Boolean).at(-1)
    if (!imageName || !/\.(avif|gif|jpe?g|png|webp)$/i.test(imageName)) continue

    const imageBlob = await entry.async('blob')
    const imageFile = new File([imageBlob], imageName, {
      type: imageBlob.type || getImageMimeType(imageName),
    }) as UploadFile

    imageFile.uploadFilename = `${zipBaseName}-${imageName}`
    images.push(imageFile)
  }

  return images
}

const expandZipFiles = async (files: UploadFile[]) => {
  const expandedFiles: UploadFile[] = []

  for (const file of files) {
    if (isZipFile(file)) {
      expandedFiles.push(...(await extractZipImages(file)))
    } else {
      expandedFiles.push(file)
    }
  }

  return expandedFiles
}

const uploadFiles = async (files: UploadFile[]) => {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue

    const body = new FormData()
    body.append('file', new File([file], safeFilename(file), { type: file.type }))
    body.append('alt', file.name)

    const response = await fetch('/api/media', {
      body,
      credentials: 'include',
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Không thể tải ${file.name} lên (${response.status})`)
    }
  }
}

export default function FolderUploadControls() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFiles = async (files: UploadFile[]) => {
    if (!files.length || isUploading) return

    setIsUploading(true)
    setMessage('Đang đọc file ZIP...')

    try {
      const expandedFiles = await expandZipFiles(files)
      setMessage(`Đang tải ${expandedFiles.length} tệp...`)
      await uploadFiles(expandedFiles)
      setMessage(`Đã tải ${expandedFiles.length} tệp.`)
      window.location.reload()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Tải folder thất bại.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const entries = Array.from(event.dataTransfer.items)
      .map((item) => item.webkitGetAsEntry?.())
      .filter((entry): entry is FileSystemEntry => Boolean(entry))

    const files = entries.length
      ? (await Promise.all(entries.map(readEntry))).flat()
      : Array.from(event.dataTransfer.files) as UploadFile[]

    await handleFiles(files)
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      style={{ border: '1px dashed var(--theme-elevation-400)', marginBlock: '1rem', padding: '1rem' }}
    >
      <button disabled={isUploading} onClick={() => inputRef.current?.click()} type="button">
        {isUploading ? 'Đang tải...' : 'Chọn hoặc kéo-thả cả folder'}
      </button>
      <input
        ref={inputRef}
        hidden
        onChange={(event) => handleFiles(Array.from(event.target.files ?? []) as UploadFile[])}
        type="file"
        multiple
        accept="image/*,.zip"
        // @ts-expect-error webkitdirectory is supported by Chromium-based browsers
        webkitdirectory="true"
      />
      {message ? <span style={{ marginInlineStart: '0.75rem' }}>{message}</span> : null}
    </div>
  )
}