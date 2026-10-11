'use client'

import React from 'react'

type Props = {
  isVietnamese: boolean
}

export const DatabaseBackup: React.FC<Props> = ({ isVietnamese }) => {
  const [file, setFile] = React.useState<File | null>(null)
  const [status, setStatus] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const importBackup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file || busy) return

    const confirmed = window.confirm(
      isVietnamese
        ? 'Import sẽ xóa toàn bộ dữ liệu hiện tại rồi khôi phục từ file. Bạn có chắc chắn muốn tiếp tục?'
        : 'Import will delete all current data before restoring the file. Are you sure you want to continue?',
    )
    if (!confirmed) return

    setBusy(true)
    setStatus(isVietnamese ? 'Đang khôi phục...' : 'Restoring...')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/database-backup', { method: 'POST', body: formData })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Import failed')
      setStatus(isVietnamese ? 'Khôi phục thành công. Hãy tải lại trang.' : 'Restore complete. Reload the page.')
      setFile(null)
    } catch (error) {
      setStatus(`${isVietnamese ? 'Import thất bại' : 'Import failed'}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ margin: '1.5rem 0', padding: '1rem', border: '1px solid var(--theme-elevation-200)' }}>
      <h3 style={{ margin: '0 0 0.5rem' }}>{isVietnamese ? 'Sao lưu dữ liệu' : 'Database backup'}</h3>
      <p style={{ margin: '0 0 1rem' }}>
        {isVietnamese
          ? 'Tải dữ liệu database dạng JSON nén. File chứa thông tin khách hàng và đơn hàng, hãy lưu trữ an toàn. File ảnh tải lên cần sao lưu riêng.'
          : 'Download a compressed JSON database backup. It contains customer and order data; store it securely. Uploaded media files must be backed up separately.'}
      </p>
      <a
        href="/api/database-backup"
        download
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', background: 'var(--theme-elevation-100)', border: '1px solid var(--theme-elevation-300)', borderRadius: 4, fontWeight: 600 }}
      >
        {isVietnamese ? 'Tải bản backup' : 'Download backup'}
      </a>
      <form onSubmit={importBackup} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--theme-elevation-200)' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>{isVietnamese ? 'Khôi phục database' : 'Restore database'}</h3>
        <p style={{ margin: '0 0 1rem' }}>
          {isVietnamese
            ? 'Chọn file .json hoặc .json.gz đã tải từ hệ thống. Dữ liệu hiện tại sẽ bị thay thế hoàn toàn.'
            : 'Choose a .json or .json.gz backup file. Current database data will be replaced completely.'}
        </p>
        <input type="file" accept=".json,.gz,application/json,application/gzip" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button
          type="submit"
          disabled={!file || busy}
          style={{ display: 'block', marginTop: '1rem', padding: '0.7rem 1rem', background: 'var(--theme-elevation-100)', border: '1px solid var(--theme-elevation-300)', borderRadius: 4, fontWeight: 600, opacity: !file || busy ? 0.5 : 1 }}
        >
          {busy ? (isVietnamese ? 'Đang khôi phục...' : 'Restoring...') : 'Import database'}
        </button>
        {status && <p role="status" style={{ marginTop: '0.75rem' }}>{status}</p>}
      </form>
    </section>
  )
}
