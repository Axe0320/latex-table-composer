import { useState, useRef } from 'react'
import type { TableSource } from '../lib/table/merge/sourceStack'

const ACCEPTED = '.csv,.tsv,.txt,.xlsx,.xls'

function isAcceptedFile(file: File): boolean {
  return /\.(csv|tsv|txt|xlsx|xls)$/i.test(file.name)
}

type Props = {
  sources: TableSource[]
  onAddSourceFiles: (files: File[]) => Promise<void>
  onAppendRows: (source: TableSource) => void
  onAppendColumns: (source: TableSource) => void
  onReplaceWith: (source: TableSource) => void
  onRemoveSource: (id: string) => void
}

export function MergePanel({
  sources,
  onAddSourceFiles,
  onAppendRows,
  onAppendColumns,
  onReplaceWith,
  onRemoveSource,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: File[]) {
    const valid = files.filter(isAcceptedFile)
    if (valid.length === 0) return
    setIsLoading(true)
    await onAddSourceFiles(valid)
    setIsLoading(false)
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    await handleFiles(Array.from(e.dataTransfer.files))
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await handleFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        boxShadow: 'var(--shadow-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="flex items-center justify-center text-xs font-extrabold"
          style={{ width: '1.375rem', height: '1.375rem', borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          M
        </span>
        <span className="text-xs font-bold uppercase"
          style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}>
          Merge Sources
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--rs)',
          background: isDragging ? 'var(--accent-light)' : 'var(--bg)',
          padding: '1.25rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all .15s',
          marginBottom: sources.length > 0 ? '1rem' : 0,
        }}
      >
        <p className="text-sm font-semibold mb-1"
          style={{ color: isDragging ? 'var(--accent)' : 'var(--text-sub)' }}>
          {isLoading ? '読み込み中...' : isDragging ? 'ここにドロップ' : 'ここにドロップ、または'}
        </p>
        {!isLoading && !isDragging && (
          <button
            className="btn-secondary text-sm"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
          >
            📂 Upload Source File
          </button>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--text-light)' }}>
          CSV / TSV / XLSX / TXT（複数ファイル対応）
        </p>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept={ACCEPTED}
          onChange={onFileChange}
        />
      </div>

      {/* Source stack */}
      {sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sources.map((source) => {
            const colCount = source.model.rows[0]?.cells.length ?? 0
            const rowCount = source.model.rows.filter(r => r.rowType !== 'header').length
            return (
              <SourceCard
                key={source.id}
                source={source}
                colCount={colCount}
                rowCount={rowCount}
                onAppendRows={() => onAppendRows(source)}
                onAppendColumns={() => onAppendColumns(source)}
                onReplaceWith={() => onReplaceWith(source)}
                onRemove={() => onRemoveSource(source.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

type CardProps = {
  source: TableSource
  colCount: number
  rowCount: number
  onAppendRows: () => void
  onAppendColumns: () => void
  onReplaceWith: () => void
  onRemove: () => void
}

function SourceCard({ source, colCount, rowCount, onAppendRows, onAppendColumns, onReplaceWith, onRemove }: CardProps) {
  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 'var(--rs)',
      padding: '0.625rem 0.875rem', display: 'flex', alignItems: 'center',
      gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)', margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          📄 {source.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-light)', margin: 0 }}>
          {colCount} 列 × {rowCount} 行 · {source.sourceType}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <ABtn title="行を末尾に追加" onClick={onAppendRows}>↓ 行追加</ABtn>
        <ABtn title="列を右端に追加" onClick={onAppendColumns}>→ 列追加</ABtn>
        <ABtn title="主テーブルを置き換え" onClick={onReplaceWith} warn>Replace</ABtn>
        <ABtn title="スタックから削除" onClick={onRemove} danger>✕</ABtn>
      </div>
    </div>
  )
}

function ABtn({ title, warn = false, danger = false, children, onClick }: {
  title?: string; warn?: boolean; danger?: boolean
  children: React.ReactNode; onClick: () => void
}) {
  const border = danger ? '#FECACA' : warn ? '#FDE68A' : 'var(--border)'
  const bg = danger ? '#FEF2F2' : warn ? '#FFFBEB' : 'var(--card)'
  const text = danger ? '#EF4444' : warn ? '#D97706' : 'var(--text-sub)'
  const hBorder = danger ? '#EF4444' : warn ? '#D97706' : 'var(--accent)'
  const hBg = danger ? '#FEE2E2' : warn ? '#FEF3C7' : 'var(--accent-light)'
  const hText = danger ? '#EF4444' : warn ? '#D97706' : 'var(--accent)'

  return (
    <button title={title} onClick={onClick}
      style={{ height: '26px', padding: '0 0.5rem', fontSize: '0.75rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', border: `1.5px solid ${border}`,
        borderRadius: 'var(--rx)', background: bg, color: text, cursor: 'pointer',
        whiteSpace: 'nowrap', transition: 'all .12s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = hBorder; e.currentTarget.style.color = hText; e.currentTarget.style.background = hBg }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text; e.currentTarget.style.background = bg }}
    >
      {children}
    </button>
  )
}
