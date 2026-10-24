'use client'

import { useState } from 'react'

const statuses = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
]

export function OrdersExport() {
  const [status, setStatus] = useState('')
  const href = status ? `/api/orders-export.csv?status=${encodeURIComponent(status)}` : '/api/orders-export.csv'

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
    </div>
  )
}
