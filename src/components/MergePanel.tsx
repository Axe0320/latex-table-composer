import { useState } from 'react'
import type { TableSource } from '../lib/table/merge/sourceStack'

type Props = {
  sources: TableSource[]
  onAddSource: (text: string, name: string) => string | null
  onAppendRows: (source: TableSource) => void
  onAppendColumns: (source: TableSource) => void
  onReplaceWith: (source: TableSource) => void
  onRemoveSource: (id: string) => void
}

export function MergePanel({
  sources,
  onAddSource,
  onAppendRows,
  onAppendColumns,
  onReplaceWith,
  onRemoveSource,
}: Props) {
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleAdd() {
    const errMsg = onAddSource(text, name)
    if (errMsg) {
      setError(errMsg)
      return
    }
    setError(null)
    setText('')
    setName('')
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

      {/* Add source */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <textarea
          className="w-full font-mono text-sm resize-none"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'マージしたいデータを貼り付け（TSV / CSV / ログ）...'}
          style={{
            background: '#FAFAFA',
            border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
            borderRadius: 'var(--rs)',
            padding: '.75rem 1rem',
            outline: 'none',
            lineHeight: 1.75,
            color: 'var(--text)',
            transition: 'border-color .18s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--border-focus)'
            e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ソース名（省略可）"
            style={{
              flex: 1,
              padding: '0.4rem 0.75rem',
              fontSize: '0.875rem',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--rs)',
              background: '#FAFAFA',
              color: 'var(--text)',
              outline: 'none',
            }}
          />
          <button
            className="btn-primary text-sm"
            onClick={handleAdd}
            disabled={!text.trim()}
            style={{ opacity: text.trim() ? 1 : 0.5 }}
          >
            ＋ Stack に追加
          </button>
        </div>
        {error && (
          <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>
        )}
      </div>

      {/* Source stack list */}
      {sources.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-light)', textAlign: 'center', padding: '0.75rem 0' }}>
          ソースがありません。上のエリアにデータを貼り付けて追加してください。
        </p>
      ) : (
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

function SourceCard({
  source, colCount, rowCount,
  onAppendRows, onAppendColumns, onReplaceWith, onRemove,
}: CardProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--rs)',
        padding: '0.625rem 0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        background: 'var(--bg)',
      }}
    >
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)', margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {source.name}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-light)', margin: 0 }}>
          {colCount} 列 × {rowCount} 行 · {source.sourceType}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, flexWrap: 'wrap' }}>
        <ActionBtn title="このソースの行を主テーブル末尾に追加" onClick={onAppendRows}>
          ↓ 行追加
        </ActionBtn>
        <ActionBtn title="このソースの列を主テーブル右端に追加" onClick={onAppendColumns}>
          → 列追加
        </ActionBtn>
        <ActionBtn title="主テーブルをこのソースで置き換え" onClick={onReplaceWith} warn>
          Replace
        </ActionBtn>
        <ActionBtn title="スタックから削除" onClick={onRemove} danger>
          ✕
        </ActionBtn>
      </div>
    </div>
  )
}

type ActionBtnProps = {
  title?: string
  warn?: boolean
  danger?: boolean
  children: React.ReactNode
  onClick: () => void
}

function ActionBtn({ title, warn = false, danger = false, children, onClick }: ActionBtnProps) {
  const borderColor = danger ? '#FECACA' : warn ? '#FDE68A' : 'var(--border)'
  const bgColor = danger ? '#FEF2F2' : warn ? '#FFFBEB' : 'var(--card)'
  const textColor = danger ? '#EF4444' : warn ? '#D97706' : 'var(--text-sub)'
  const hoverBorder = danger ? '#EF4444' : warn ? '#D97706' : 'var(--accent)'
  const hoverBg = danger ? '#FEE2E2' : warn ? '#FEF3C7' : 'var(--accent-light)'
  const hoverText = danger ? '#EF4444' : warn ? '#D97706' : 'var(--accent)'

  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        height: '26px',
        padding: '0 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--rx)',
        background: bgColor,
        color: textColor,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all .12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = hoverBorder
        e.currentTarget.style.color = hoverText
        e.currentTarget.style.background = hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = borderColor
        e.currentTarget.style.color = textColor
        e.currentTarget.style.background = bgColor
      }}
    >
      {children}
    </button>
  )
}
