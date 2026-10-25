'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

const statuses = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
]

export function OrdersExport() {
  const [status, setStatus] = useState('')
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const href = status ? `/api/orders-export.csv?status=${encodeURIComponent(status)}` : '/api/orders-export.csv'

  async function importOrders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Đang kiểm tra và import...')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const response = await fetch('/api/orders-import.csv', { method: 'POST', body: form })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? `Đã import ${result.imported} đơn.` : (result.errors ?? ['Import thất bại.']).join(' '))
    if (response.ok) { formElement.reset(); setFileName('') }
  }

  return (
    <div className="orders-export-controls">
      <select aria-label="Lọc trạng thái đơn hàng" value={status} onChange={(event) => setStatus(event.target.value)}>
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <a className="btn btn--style-secondary" href={href} download>
        Xuất Excel (CSV)
      </a>
      <a className="btn btn--style-secondary" href="/api/orders-import-template.csv" download>
        Tải file mẫu
      </a>
      <form onSubmit={importOrders} className="orders-import-form">
        <label>
          <span>File CSV đơn hàng</span>
          <input name="file" type="file" accept=".csv,text/csv" required aria-label="File CSV đơn hàng" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} />
        </label>
        <button className="btn btn--style-secondary" type="submit">Import đơn</button>
      </form>
      <small>Nhóm theo orderNumber · SKU phải tồn tại · Tối đa 5 MB</small>
      {fileName && <small>Đã chọn: {fileName}</small>}
      {message && <span role="status">{message}</span>}
    </div>
  )
}
