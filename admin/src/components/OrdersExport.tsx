'use client'

import { useEffect, useState } from 'react'
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
  const [bulkStatus, setBulkStatus] = useState('confirmed')
  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    const refresh = () => setSelectedCount(document.querySelectorAll('tbody input[type="checkbox"]:checked').length)
    const timer = window.setInterval(refresh, 300)
    refresh()
    return () => window.clearInterval(timer)
  }, [])
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

  async function updateOrders(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const ids = getSelectedOrderIds()
    if (!ids.length) {
      setMessage('Hãy chọn ít nhất một đơn hàng trong bảng.')
      return
    }
    setMessage('Đang cập nhật trạng thái...')
    const response = await fetch('/api/orders-bulk-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, fulfillmentStatus: bulkStatus }),
    })
    const result = await response.json().catch(() => ({}))
    setMessage(response.ok ? `Đã cập nhật ${result.updated ?? 0} đơn.${result.errors?.length ? ` Lỗi: ${result.errors.join(', ')}` : ''}` : 'Cập nhật thất bại.')
  }

  function getSelectedOrderIds() {
    return Array.from(document.querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"]:checked'))
      .map((input) => input.closest('tr')?.querySelector<HTMLAnchorElement>('a[href*="/admin/collections/orders/"]')?.href.split('/').pop())
      .filter((value): value is string => Boolean(value))
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
      <form onSubmit={updateOrders} className="orders-import-form">
        <button className="btn btn--style-secondary" type="button" onClick={() => setSelectedCount(getSelectedOrderIds().length)}>Làm mới lựa chọn ({selectedCount})</button>
        <select aria-label="Trạng thái mới" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <button className="btn btn--style-secondary" type="submit">Cập nhật trạng thái</button>
      </form>
      {message && <span role="status">{message}</span>}
    </div>
  )
}
