import type { BorderStyle } from '../lib/table/types'

type Props = {
  isHeader: boolean
  bottomBorder?: BorderStyle
  onAddAbove: () => void
  onAddBelow: () => void
  onDelete: () => void
  onBorderChange: (border: BorderStyle) => void
}

export function RowControls({
  isHeader,
  bottomBorder,
  onAddAbove,
  onAddBelow,
  onDelete,
  onBorderChange,
}: Props) {
  return (
    <div
      className="opacity-0 group-hover/row:opacity-100 transition-opacity"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '2px' }}
    >
      <CtrlBtn title="上に行を追加" onMouseDown={(e) => e.preventDefault()} onClick={onAddAbove}>
        ＋↑
      </CtrlBtn>
      <CtrlBtn title="下に行を追加" onMouseDown={(e) => e.preventDefault()} onClick={onAddBelow}>
        ＋↓
      </CtrlBtn>
      {!isHeader && (
        <CtrlBtn title="行を削除" onMouseDown={(e) => e.preventDefault()} onClick={onDelete} danger>
          ✕
        </CtrlBtn>
      )}
      <select
        title="下罫線"
        value={bottomBorder ?? 'none'}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onBorderChange(e.target.value as BorderStyle)}
        style={{
          fontSize: '0.6rem',
          padding: '1px 2px',
          marginTop: '2px',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          background: 'var(--card)',
          color: 'var(--text-sub)',
          cursor: 'pointer',
          maxWidth: '2.5rem',
        }}
      >
        <option value="none">–</option>
        <option value="hline">\hline</option>
        <option value="midrule">\midrule</option>
      </select>
    </div>
  )
}

type CtrlBtnProps = {
  title?: string
  danger?: boolean
  children: React.ReactNode
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

function CtrlBtn({ title, danger = false, children, onClick, onMouseDown }: CtrlBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        width: '20px',
        height: '16px',
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
        padding: 0,
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
