import { useEffect, useRef } from 'react'
import type { TableModel, TableRow, BorderStyle } from '../lib/table/types'
import type { FormattingOptions } from '../lib/table/formatters/options'
import { formatValue } from '../lib/table/formatters/shared/formatValue'
import { TableEditorToolbar } from './TableEditorToolbar'

type EditHandlers = {
  onCellChange: (rowId: string, cellId: string, value: string) => void
  onAddRowAbove: (rowId: string) => void
  onAddRowBelow: (rowId: string) => void
  onDeleteRow: (rowId: string) => void
  onAddColumnLeft: (colIdx: number) => void
  onAddColumnRight: (colIdx: number) => void
  onDeleteColumn: (colIdx: number) => void
  onRowBorderChange: (rowId: string, border: BorderStyle) => void
}

type Props = EditHandlers & {
  model: TableModel
  options: FormattingOptions
  viewMode: 'preview' | 'edit'
  onViewModeChange: (mode: 'preview' | 'edit') => void
}

export function PreviewPanel({
  model,
  options,
  viewMode,
  onViewModeChange,
  onCellChange,
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteColumn,
  onRowBorderChange,
}: Props) {
  const visibleRows = model.rows.filter((r) => !r.cells.every((c) => c.hidden))
  const visibleColCount = visibleRows[0]?.cells.filter((c) => !c.hidden).length ?? 0

  const lastRowId = visibleRows[visibleRows.length - 1]?.id ?? ''

  // Scroll add-row button into view when rows increase in Edit mode
  const addRowBtnRef = useRef<HTMLButtonElement>(null)
  const prevRowCountRef = useRef(model.rows.length)
  useEffect(() => {
    if (viewMode === 'edit' && model.rows.length > prevRowCountRef.current) {
      addRowBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    prevRowCountRef.current = model.rows.length
  }, [model.rows.length, viewMode])

  // Scroll overflow container to right end when columns increase in Edit mode
  const overflowRef = useRef<HTMLDivElement>(null)
  const prevColCountRef = useRef(visibleColCount)
  useEffect(() => {
    if (viewMode === 'edit' && visibleColCount > prevColCountRef.current) {
      const el = overflowRef.current
      if (el) el.scrollLeft = el.scrollWidth
    }
    prevColCountRef.current = visibleColCount
  }, [visibleColCount, viewMode])

  // Check whether a column has any non-empty content
  function colHasContent(colIdx: number): boolean {
    return model.rows.some((row) => (row.cells[colIdx]?.value ?? '').trim() !== '')
  }

  function handleDeleteLastRow() {
    const last = [...visibleRows].reverse().find((r) => r.rowType !== 'header')
    if (!last) return
    const hasContent = last.cells.some((c) => c.value.trim() !== '')
    if (!hasContent || window.confirm('入力内容のある行を削除しますか？')) {
      onDeleteRow(last.id)
    }
  }

  function handleDeleteLastColumn() {
    const lastIdx = visibleColCount - 1
    const hasContent = colHasContent(lastIdx)
    if (!hasContent || window.confirm('入力内容のある列を削除しますか？')) {
      onDeleteColumn(lastIdx)
    }
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      {/* Sticky header — stays visible while scrolling table */}
      <div
        style={{
          position: 'sticky',
          top: '70px',
          zIndex: 5,
          background: 'var(--card)',
          borderRadius: 'var(--r) var(--r) 0 0',
          padding: '1.25rem 1.5rem 0',
          borderBottom: viewMode === 'edit' ? '1px solid var(--border)' : 'none',
          paddingBottom: viewMode === 'edit' ? '0.75rem' : '0',
        }}
      >
        <PanelHeader viewMode={viewMode} onViewModeChange={onViewModeChange} />
        {viewMode === 'edit' && (
          <TableEditorToolbar
            onAddRow={() => onAddRowBelow(lastRowId)}
            onDeleteLastRow={handleDeleteLastRow}
            onAddColumn={() => onAddColumnRight(visibleColCount - 1)}
            onDeleteLastColumn={handleDeleteLastColumn}
          />
        )}
      </div>

      {visibleRows.length === 0 ? (
        <div style={{ padding: '1.25rem 1.5rem' }}><EmptyState /></div>
      ) : (
        <div style={{ padding: '0.75rem 1.5rem 1.25rem' }}>
          {model.title && (
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
              {model.title}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'stretch' }}>
            <div ref={overflowRef} style={{ flex: 1, overflowX: 'auto', minWidth: 0 }}>
            <table
              style={{
                borderCollapse: 'collapse',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                minWidth: '100%',
                width: 'auto',
              }}
            >
              <tbody>
                {/* Column controls row — Edit mode only */}
                {viewMode === 'edit' && (
                  <tr>
                    {/* Spacer for row controls column */}
                    <td style={{ width: '3.5rem' }} />
                    {Array.from({ length: visibleColCount }, (_, colIdx) => (
                      <td key={colIdx} style={{ textAlign: 'center', padding: '2px 4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                          <EBtn
                            title="左に列を追加"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onAddColumnLeft(colIdx)}
                          >
                            ←＋
                          </EBtn>
                          <EBtn
                            title="列を削除"
                            danger
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const hasContent = colHasContent(colIdx)
                              if (!hasContent || window.confirm('入力内容のある列を削除しますか？')) {
                                onDeleteColumn(colIdx)
                              }
                            }}
                          >
                            ✕
                          </EBtn>
                          <EBtn
                            title="右に列を追加"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onAddColumnRight(colIdx)}
                          >
                            ＋→
                          </EBtn>
                        </div>
                      </td>
                    ))}
                    {/* Spacer — right-side add-column button handles end-of-table insertion */}
                    <td style={{ width: '2px' }} />
                  </tr>
                )}

                {/* Data rows */}
                {visibleRows.map((row, rowIdx) => (
                  <DataRow
                    key={row.id}
                    row={row}
                    isFirst={rowIdx === 0}
                    isLast={rowIdx === visibleRows.length - 1}
                    viewMode={viewMode}
                    options={options}
                    onCellChange={onCellChange}
                    onAddRowAbove={() => onAddRowAbove(row.id)}
                    onAddRowBelow={() => onAddRowBelow(row.id)}
                    onDeleteRow={() => onDeleteRow(row.id)}
                    onRowBorderChange={(border) => onRowBorderChange(row.id, border)}
                  />
                ))}
              </tbody>
            </table>
            </div>{/* /overflowX */}

            {/* Right-side add-column button — Edit mode only */}
            {viewMode === 'edit' && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onAddColumnRight(visibleColCount - 1)}
                title="列を追加"
                style={{
                  width: '28px',
                  flexShrink: 0,
                  border: '1.5px dashed var(--border)',
                  borderRadius: 'var(--rs)',
                  background: 'transparent',
                  color: 'var(--text-light)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.color = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-light)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-light)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                ＋
              </button>
            )}
          </div>{/* /flex row */}

          {/* Persistent add-row button — Edit mode only */}
          {viewMode === 'edit' && (
            <button
              ref={addRowBtnRef}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onAddRowBelow(lastRowId)}
              style={{
                width: '100%',
                marginTop: '0.375rem',
                height: '28px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                border: '1.5px dashed var(--border)',
                borderRadius: 'var(--rs)',
                background: 'transparent',
                color: 'var(--text-light)',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.background = 'var(--accent-light)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-light)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              ＋ 行を追加
            </button>
          )}

          {model.label && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-light)' }}>
              \label{'{' + model.label + '}'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}


type DataRowProps = {
  row: TableRow
  isFirst: boolean
  isLast: boolean
  viewMode: 'preview' | 'edit'
  options: FormattingOptions
  onCellChange: (rowId: string, cellId: string, value: string) => void
  onAddRowAbove: () => void
  onAddRowBelow: () => void
  onDeleteRow: () => void
  onRowBorderChange: (border: BorderStyle) => void
}

function DataRow({
  row,
  isFirst,
  isLast,
  viewMode,
  options,
  onCellChange,
  onAddRowAbove,
  onAddRowBelow,
  onDeleteRow,
  onRowBorderChange,
}: DataRowProps) {
  const visibleCells = row.cells.filter((c) => !c.hidden)
  const rowHasContent = row.cells.some((c) => c.value.trim() !== '')

  const borderTop = (() => {
    if (isFirst) return '2px solid var(--text)'
    if (row.topBorder && row.topBorder !== 'none') return '1px solid var(--text)'
    if (row.separatorTop) return '1px solid var(--text)'
    return undefined
  })()

  const borderBottom = (() => {
    if (isLast) return '2px solid var(--text)'
    if (row.bottomBorder && row.bottomBorder !== 'none') return '1px solid var(--text)'
    if (row.separatorBottom) return '1px solid var(--text)'
    return undefined
  })()

  return (
    <tr>
      {/* Row controls — Edit mode only */}
      {viewMode === 'edit' && (
        <td
          style={{
            width: '3.5rem',
            padding: '2px',
            verticalAlign: 'middle',
            borderTop,
            borderBottom,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <EBtn
              title="上に行を追加"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onAddRowAbove}
            >
              ＋↑
            </EBtn>
            {row.rowType !== 'header' && (
              <EBtn
                title="行を削除"
                danger
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!rowHasContent || window.confirm('入力内容のある行を削除しますか？')) {
                    onDeleteRow()
                  }
                }}
              >
                ✕
              </EBtn>
            )}
            <EBtn
              title="下に行を追加"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onAddRowBelow}
            >
              ＋↓
            </EBtn>
            {/* Border select */}
            <select
              title="下罫線"
              value={row.bottomBorder ?? 'none'}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => onRowBorderChange(e.target.value as BorderStyle)}
              style={{
                marginTop: '4px',
                fontSize: '0.7rem',
                padding: '2px 4px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                background: 'var(--card)',
                color: 'var(--text)',
                cursor: 'pointer',
                maxWidth: '3.5rem',
              }}
            >
              <option value="none">–</option>
              <option value="hline">\hline</option>
              <option value="midrule">\midrule</option>
            </select>
          </div>
        </td>
      )}

      {/* Data cells */}
      {visibleCells.map((cell) => {
        const Tag = row.rowType === 'header' ? 'th' : 'td'
        const displayValue =
          row.rowType === 'header' ? cell.value : formatValue(cell.value, options)
        const isEditable = viewMode === 'edit'

        return (
          <Tag
            key={cell.id}
            contentEditable={isEditable ? 'plaintext-only' : undefined}
            suppressContentEditableWarning
            onBlur={
              isEditable
                ? (e) => {
                    const newValue = e.currentTarget.textContent ?? ''
                    if (newValue !== cell.value) {
                      onCellChange(row.id, cell.id, newValue)
                    }
                  }
                : undefined
            }
            style={{
              padding: '0.35rem 0.75rem',
              textAlign: cell.align ?? 'left',
              fontWeight: cell.bold ? 700 : row.rowType === 'header' ? 600 : 400,
              fontStyle: cell.italic ? 'italic' : 'normal',
              borderTop,
              borderBottom,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
              outline: 'none',
              cursor: isEditable ? 'text' : 'default',
              transition: 'background .1s',
            }}
            onFocus={
              isEditable
                ? (e) => { e.currentTarget.style.background = 'var(--accent-light)' }
                : undefined
            }
            onBlurCapture={
              isEditable
                ? (e) => { e.currentTarget.style.background = 'transparent' }
                : undefined
            }
          >
            {displayValue}
          </Tag>
        )
      })}
    </tr>
  )
}

/* ── Shared inline edit button ──────────────────────── */
type EBtnProps = {
  title?: string
  danger?: boolean
  children: React.ReactNode
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function EBtn({ title, danger = false, children, onClick, onMouseDown }: EBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        minWidth: '28px',
        height: '28px',
        padding: '0 6px',
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${danger ? '#FECACA' : 'var(--border)'}`,
        borderRadius: '4px',
        background: danger ? '#FEF2F2' : 'var(--card)',
        color: danger ? '#EF4444' : 'var(--text-sub)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all .12s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = danger ? '#EF4444' : 'var(--accent)'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--accent)'
        e.currentTarget.style.background = danger ? '#FEE2E2' : 'var(--accent-light)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = danger ? '#FECACA' : 'var(--border)'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-sub)'
        e.currentTarget.style.background = danger ? '#FEF2F2' : 'var(--card)'
      }}
    >
      {children}
    </button>
  )
}

/* ── Panel header with mode toggle ─────────────────── */
function PanelHeader({
  viewMode,
  onViewModeChange,
}: {
  viewMode: 'preview' | 'edit'
  onViewModeChange: (m: 'preview' | 'edit') => void
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span
        className="flex items-center justify-center text-xs font-extrabold"
        style={{
          width: '1.375rem',
          height: '1.375rem',
          borderRadius: '50%',
          background: 'var(--accent-light)',
          color: 'var(--accent)',
        }}
      >
        2
      </span>
      <span
        className="text-xs font-bold uppercase"
        style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}
      >
        {viewMode === 'edit' ? 'Edit' : 'Preview'}
      </span>

      {/* Mode toggle */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          background: 'var(--bg)',
          borderRadius: 'var(--rx)',
          padding: '2px',
          gap: '2px',
          border: '1px solid var(--border)',
        }}
      >
        {(['preview', 'edit'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            style={{
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'calc(var(--rx) - 1px)',
              border: 'none',
              cursor: 'pointer',
              background: viewMode === mode ? 'var(--card)' : 'transparent',
              color: viewMode === mode ? 'var(--accent)' : 'var(--text-sub)',
              boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
              transition: 'all .18s',
            }}
          >
            {mode === 'preview' ? 'Preview' : 'Edit'}
          </button>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="flex items-center justify-center text-sm"
      style={{
        minHeight: '240px',
        border: '1.5px dashed var(--border)',
        borderRadius: 'var(--rs)',
        color: 'var(--text-light)',
      }}
    >
      Table preview will appear here
    </div>
  )
}
