import type { TableModel, TableRow } from '../lib/table/types'

type Props = {
  model: TableModel
  onCellChange: (rowId: string, cellId: string, value: string) => void
}

export function PreviewPanel({ model, onCellChange }: Props) {
  const visibleRows = model.rows.filter(
    (r) => !r.cells.every((c) => c.hidden)
  )

  return (
    <div className="card">
      <PanelHeader />

      {visibleRows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          {model.title && (
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: 'var(--text-sub)' }}
            >
              {model.title}
            </p>
          )}

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            <tbody>
              {visibleRows.map((row, rowIdx) => (
                <TableRowEl
                  key={row.id}
                  row={row}
                  isFirst={rowIdx === 0}
                  isLast={rowIdx === visibleRows.length - 1}
                  onCellChange={onCellChange}
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
  onCellChange: (rowId: string, cellId: string, value: string) => void
}

function TableRowEl({ row, isFirst, isLast, onCellChange }: RowProps) {
  const visibleCells = row.cells.filter((c) => !c.hidden)

  const borderTop = (() => {
    if (isFirst) return '2px solid var(--text)'
    if (row.separatorTop) return '1px solid var(--text)'
    return undefined
  })()

  const borderBottom = (() => {
    if (isLast) return '2px solid var(--text)'
    if (row.separatorBottom) return '1px solid var(--text)'
    return undefined
  })()

  return (
    <tr>
      {visibleCells.map((cell) => {
        const Tag = row.rowType === 'header' ? 'th' : 'td'
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
            {cell.value}
          </Tag>
        )
      })}
    </tr>
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
      <span
        className="text-xs ml-auto"
        style={{ color: 'var(--text-light)' }}
      >
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
