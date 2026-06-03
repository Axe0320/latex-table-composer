type Props = {
  onAddRow: () => void
  onDeleteLastRow: () => void
  onAddColumn: () => void
  onDeleteLastColumn: () => void
}

export function TableEditorToolbar({
  onAddRow,
  onDeleteLastRow,
  onAddColumn,
  onDeleteLastColumn,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        marginBottom: '0.75rem',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rx)',
        flexWrap: 'wrap',
      }}
    >
      <ToolbarGroup label="行">
        <TBtn onClick={onAddRow} title="末尾に行を追加">
          ＋行
        </TBtn>
        <TBtn onClick={onDeleteLastRow} title="末尾行を削除" danger>
          －行
        </TBtn>
      </ToolbarGroup>

      <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />

      <ToolbarGroup label="列">
        <TBtn onClick={onAddColumn} title="末尾に列を追加">
          ＋列
        </TBtn>
        <TBtn onClick={onDeleteLastColumn} title="末尾列を削除（確認あり）" danger>
          －列
        </TBtn>
      </ToolbarGroup>
    </div>
  )
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-light)',
          marginRight: '2px',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  )
}

type TBtnProps = {
  title?: string
  danger?: boolean
  children: React.ReactNode
  onClick: () => void
}

function TBtn({ title, danger = false, children, onClick }: TBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        height: '28px',
        padding: '0 0.625rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        border: `1.5px solid ${danger ? '#FECACA' : 'var(--border)'}`,
        borderRadius: 'var(--rx)',
        background: danger ? '#FEF2F2' : 'var(--card)',
        color: danger ? '#EF4444' : 'var(--text-sub)',
        cursor: 'pointer',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
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
