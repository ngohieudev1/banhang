'use client'

import { useState, type FormEvent } from 'react'

type Kind = 'products' | 'skus' | 'categories' | 'coupons'

export function CatalogImport() {
  const [message, setMessage] = useState('')
  const [fileNames, setFileNames] = useState<Record<Kind, string>>({ products: '', skus: '', categories: '', coupons: '' })

  async function submit(kind: Kind, event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(`Đang import ${kind === 'products' ? 'sản phẩm' : 'SKU'}...`)
    const form = event.currentTarget
    const response = await fetch(`/api/${kind}-import.csv`, { method: 'POST', body: new FormData(form) })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? `Đã import ${result.imported ?? 0} ${kind === 'products' ? 'sản phẩm' : 'SKU'}.` : (result.errors ?? ['Import thất bại.']).join(' '))
    if (response.ok) { form.reset(); setFileNames((current) => ({ ...current, [kind]: '' })) }
  }

  return (
    <section className="catalog-import-controls">
      <h4>Import catalog CSV</h4>
      {(['products', 'skus', 'categories', 'coupons'] as Kind[]).map((kind) => {
        const label = kind === 'products' ? 'sản phẩm' : kind === 'skus' ? 'SKU' : kind === 'categories' ? 'danh mục' : 'mã giảm giá'
        return (
          <form key={kind} onSubmit={(event) => submit(kind, event)}>
            <a className="btn btn--style-secondary" href={`/api/${kind}-import-template.csv`} download>
              Tải template {label}
            </a>
            <input name="file" type="file" accept=".csv,text/csv" required aria-label={`File CSV ${label}`} onChange={(event) => setFileNames((current) => ({ ...current, [kind]: event.target.files?.[0]?.name ?? '' }))} />
            <button className="btn btn--style-secondary" type="submit">Import {label}</button>
            {fileNames[kind] && <small>Đã chọn: {fileNames[kind]}</small>}
          </form>
        )
      })}
      <small>CSV tối đa 5 MB · Product dùng skuCodes phân cách bằng dấu |</small>
      {message && <span role="status">{message}</span>}
    </section>
  )
}
