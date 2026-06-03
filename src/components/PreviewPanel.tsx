import type { TableModel, TableRow, BorderStyle } from '../lib/table/types'
import type { FormattingOptions } from '../lib/table/formatters/options'
import { formatValue } from '../lib/table/formatters/shared/formatValue'
import { RowControls } from './RowControls'

type Props = {
  model: TableModel
  options: FormattingOptions
  onCellChange: (rowId: string, cellId: string, value: string) => void
  onAddRowAbove: (rowId: string) => void
  onAddRowBelow: (rowId: string) => void
  onDeleteRow: (rowId: string) => void
  onAddColumnLeft: (colIdx: number) => void
  onAddColumnRight: (colIdx: number) => void
  onDeleteColumn: (colIdx: number) => void
  onRowBorderChange: (rowId: string, border: BorderStyle) => void
}

export function PreviewPanel({
  model,
  options,
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

  return (
    <div className="card">
      <PanelHeader />

      {visibleRows.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {model.title && (
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
              {model.title}
            </p>
          )}

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
              {/* Column controls row */}
              <tr>
                {/* Spacer for row controls column */}
                <td style={{ width: '2.5rem' }} />
                {Array.from({ length: visibleColCount }, (_, colIdx) => (
                  <td key={colIdx} className="group/col" style={{ textAlign: 'center', padding: '0 0.25rem' }}>
                    <ColControls
                      colIdx={colIdx}
                      onAddLeft={() => onAddColumnLeft(colIdx)}
                      onAddRight={() => onAddColumnRight(colIdx)}
                      onDelete={() => {
                        if (window.confirm('この列を削除しますか？')) {
                          onDeleteColumn(colIdx)
                        }
                      }}
                    />
                  </td>
                ))}
              </tr>

              {/* Data rows */}
              {visibleRows.map((row, rowIdx) => (
                <TableRowEl
                  key={row.id}
                  row={row}
                  isFirst={rowIdx === 0}
                  isLast={rowIdx === visibleRows.length - 1}
                  options={options}
                  onCellChange={onCellChange}
                  onAddAbove={() => onAddRowAbove(row.id)}
                  onAddBelow={() => onAddRowBelow(row.id)}
                  onDelete={() => onDeleteRow(row.id)}
                  onBorderChange={(border) => onRowBorderChange(row.id, border)}
                />
              ))}
            </tbody>
          </table>

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

type RowProps = {
  row: TableRow
  isFirst: boolean
  isLast: boolean
  options: FormattingOptions
  onCellChange: (rowId: string, cellId: string, value: string) => void
  onAddAbove: () => void
  onAddBelow: () => void
  onDelete: () => void
  onBorderChange: (border: BorderStyle) => void
}

function TableRowEl({
  row,
  isFirst,
  isLast,
  options,
  onCellChange,
  onAddAbove,
  onAddBelow,
  onDelete,
  onBorderChange,
}: RowProps) {
  const visibleCells = row.cells.filter((c) => !c.hidden)

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
    <tr className="group/row">
      {/* Row controls cell */}
      <td
        style={{
          width: '2.5rem',
          padding: 0,
          verticalAlign: 'middle',
          borderTop,
          borderBottom,
        }}
      >
        <RowControls
          isHeader={row.rowType === 'header'}
          bottomBorder={row.bottomBorder}
          onAddAbove={onAddAbove}
          onAddBelow={onAddBelow}
          onDelete={onDelete}
          onBorderChange={onBorderChange}
        />
      </td>

      {/* Data cells */}
      {visibleCells.map((cell) => {
        const Tag = row.rowType === 'header' ? 'th' : 'td'
        const displayValue =
          row.rowType === 'header' ? cell.value : formatValue(cell.value, options)

        return (
          <Tag
            key={cell.id}
            contentEditable="plaintext-only"
            suppressContentEditableWarning
            onBlur={(e) => {
              const newValue = e.currentTarget.textContent ?? ''
              if (newValue !== cell.value) {
                onCellChange(row.id, cell.id, newValue)
              }
            }}
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
              cursor: 'text',
              transition: 'background .1s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'var(--accent-light)'
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {displayValue}
          </Tag>
        )
      })}
    </tr>
  )
}

function ColControls({
  colIdx,
  onAddLeft,
  onAddRight,
  onDelete,
}: {
  colIdx: number
  onAddLeft: () => void
  onAddRight: () => void
  onDelete: () => void
}) {
  // colIdx is passed as a prop but only used via the callbacks
  void colIdx
  return (
    <div
      className="opacity-0 group-hover/col:opacity-100 transition-opacity"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', height: '18px' }}
    >
      <ColBtn title="左に列を追加" onMouseDown={(e) => e.preventDefault()} onClick={onAddLeft}>
        ←＋
      </ColBtn>
      <ColBtn title="列を削除" onMouseDown={(e) => e.preventDefault()} onClick={onDelete} danger>
        ✕
      </ColBtn>
      <ColBtn title="右に列を追加" onMouseDown={(e) => e.preventDefault()} onClick={onAddRight}>
        ＋→
      </ColBtn>
    </div>
  )
}

type ColBtnProps = {
  title?: string
  danger?: boolean
  children: React.ReactNode
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function ColBtn({ title, danger = false, children, onClick, onMouseDown }: ColBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        height: '16px',
        padding: '0 3px',
        fontSize: '0.55rem',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        borderRadius: '3px',
        background: 'transparent',
        color: danger ? '#EF4444' : 'var(--text-light)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? '#FEF2F2' : 'var(--accent-light)'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-light)'
      }}
    >
      {children}
    </button>
  )
}

function PanelHeader() {
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
        Preview
      </span>
      <span className="text-xs ml-auto" style={{ color: 'var(--text-light)' }}>
        Click cell to edit
      </span>
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
