import type { TableCell } from '../lib/table/types'
import type { StylePatch } from '../lib/table/editor/updateCellStyle'

export type EditMode = 'formatted' | 'raw'

const BG_OPTIONS: { title: string; value: string | undefined; css: string }[] = [
  { title: 'なし', value: undefined, css: 'transparent' },
  { title: 'Gray', value: 'gray!20', css: 'rgba(120,120,120,0.25)' },
  { title: 'Green', value: 'green!20', css: 'rgba(0,160,0,0.25)' },
  { title: 'Blue', value: 'blue!15', css: 'rgba(30,100,255,0.2)' },
  { title: 'Yellow', value: 'yellow!20', css: 'rgba(220,180,0,0.3)' },
  { title: 'Red', value: 'red!15', css: 'rgba(220,50,50,0.22)' },
]

type Props = {
  onAddRow: () => void
  onDeleteLastRow: () => void
  onAddColumn: () => void
  onDeleteLastColumn: () => void
  selectedCells: TableCell[]
  selectedColIndices: number[]
  hiddenColumnIndices: number[]
  hiddenColumnNames: string[]
  onStyleChange: (patch: StylePatch) => void
  onClearFormatting: () => void
  onHideColumns: () => void
  onShowColumn: (colIdx: number) => void
  onShowAllColumns: () => void
  editMode: EditMode
  onEditModeChange: (mode: EditMode) => void
}

export function TableEditorToolbar({
  onAddRow,
  onDeleteLastRow,
  onAddColumn,
  onDeleteLastColumn,
  selectedCells,
  selectedColIndices,
  hiddenColumnIndices,
  hiddenColumnNames,
  onStyleChange,
  onClearFormatting,
  onHideColumns,
  onShowColumn,
  onShowAllColumns,
  editMode,
  onEditModeChange,
}: Props) {
  const hasSelection = selectedCells.length > 0
  const hasHiddenCols = hiddenColumnIndices.length > 0

  const allBold = hasSelection && selectedCells.every((c) => c.bold)
  const allItalic = hasSelection && selectedCells.every((c) => c.italic)
  const allUnderline = hasSelection && selectedCells.every((c) => c.underline)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        padding: '0.4rem 0.75rem',
        marginBottom: '0.75rem',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rx)',
      }}
    >
      {/* Main controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <ToolbarGroup label="行">
          <TBtn onClick={onAddRow} title="末尾に行を追加">＋行</TBtn>
          <TBtn onClick={onDeleteLastRow} title="末尾行を削除" danger>－行</TBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup label="列">
          <TBtn onClick={onAddColumn} title="末尾に列を追加">＋列</TBtn>
          <TBtn onClick={onDeleteLastColumn} title="末尾列を削除（確認あり）" danger>－列</TBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup label="スタイル">
          <SBtn title="太字" active={allBold} disabled={!hasSelection}
            onClick={() => onStyleChange({ bold: allBold ? undefined : true })}
            style={{ fontWeight: 700 }}>B</SBtn>
          <SBtn title="斜体" active={allItalic} disabled={!hasSelection}
            onClick={() => onStyleChange({ italic: allItalic ? undefined : true })}
            style={{ fontStyle: 'italic' }}>I</SBtn>
          <SBtn title="下線" active={allUnderline} disabled={!hasSelection}
            onClick={() => onStyleChange({ underline: allUnderline ? undefined : true })}
            style={{ textDecoration: 'underline' }}>U</SBtn>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup label="揃え">
          {(['left', 'center', 'right'] as const).map((a) => (
            <SBtn key={a}
              title={a === 'left' ? '左揃え' : a === 'center' ? '中央揃え' : '右揃え'}
              active={hasSelection && selectedCells.every((c) => c.align === a)}
              disabled={!hasSelection}
              onClick={() => onStyleChange({ align: a })}>
              {a === 'left' ? 'L' : a === 'center' ? 'C' : 'R'}
            </SBtn>
          ))}
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup label="背景">
          {BG_OPTIONS.map((opt) => {
            const isActive = hasSelection &&
              selectedCells.every((c) => (c.backgroundColor ?? undefined) === opt.value)
            return (
              <button key={opt.title} title={opt.title} disabled={!hasSelection}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onStyleChange({ backgroundColor: opt.value })}
                style={{
                  width: '18px', height: '18px', borderRadius: '3px', padding: 0, flexShrink: 0,
                  border: isActive ? '2px solid var(--accent)'
                    : opt.value === undefined ? '1.5px solid var(--border)'
                    : '1.5px solid transparent',
                  background: opt.css,
                  cursor: hasSelection ? 'pointer' : 'default',
                  opacity: hasSelection ? 1 : 0.4,
                  transition: 'border-color .12s',
                }} />
            )
          })}
        </ToolbarGroup>

        <Divider />

        {/* Column visibility: Hide / Show */}
        <ToolbarGroup label="列表示">
          <TBtn
            title="選択列を非表示"
            onClick={onHideColumns}
            disabled={!hasSelection || selectedColIndices.length === 0}
          >
            Hide
          </TBtn>
          <TBtn
            title="非表示列を全て表示"
            onClick={onShowAllColumns}
            disabled={!hasHiddenCols}
          >
            Show
          </TBtn>
        </ToolbarGroup>

        <Divider />

        <TBtn
          title="書式をリセット（bold / italic / underline / 背景色）"
          onClick={onClearFormatting}
          disabled={!hasSelection}
        >
          Reset
        </TBtn>

        {/* Formatted / Raw segmented control — pushed to right */}
        <div style={{ marginLeft: 'auto' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rx)',
              padding: '2px',
              gap: '2px',
            }}
          >
            {(['formatted', 'raw'] as const).map((mode) => (
              <button
                key={mode}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onEditModeChange(mode)}
                style={{
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: 'calc(var(--rx) - 1px)',
                  border: 'none',
                  cursor: 'pointer',
                  background: editMode === mode ? 'var(--accent-light)' : 'transparent',
                  color: editMode === mode ? 'var(--accent)' : 'var(--text-sub)',
                  boxShadow: editMode === mode ? 'var(--shadow-sm)' : 'none',
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {mode === 'formatted' ? 'Formatted' : 'Raw'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden columns row — only when hidden columns exist */}
      {hasHiddenCols && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-light)',
            textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            非表示列
          </span>
          {hiddenColumnIndices.map((colIdx, i) => (
            <button
              key={colIdx}
              title={`列「${hiddenColumnNames[i] ?? `列${colIdx + 1}`}」を表示`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onShowColumn(colIdx)}
              style={{
                height: '22px',
                padding: '0 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--rx)',
                background: 'var(--card)',
                color: 'var(--text-sub)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .12s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.background = 'var(--accent-light)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-sub)'
                e.currentTarget.style.background = 'var(--card)'
              }}
            >
              ▶ {hiddenColumnNames[i] || `列${colIdx + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────── */

function Divider() {
  return <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />
}

function ToolbarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <span
        style={{
          fontSize: '0.6rem',
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
  disabled?: boolean
  children: React.ReactNode
  onClick: () => void
  style?: React.CSSProperties
}

function TBtn({ title, danger = false, disabled = false, children, onClick, style }: TBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
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
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all .15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.borderColor = danger ? '#EF4444' : 'var(--accent)'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--accent)'
        e.currentTarget.style.background = danger ? '#FEE2E2' : 'var(--accent-light)'
      }}
      onMouseLeave={(e) => {
        if (disabled) return
        e.currentTarget.style.borderColor = danger ? '#FECACA' : 'var(--border)'
        e.currentTarget.style.color = danger ? '#EF4444' : 'var(--text-sub)'
        e.currentTarget.style.background = danger ? '#FEF2F2' : 'var(--card)'
      }}
    >
      {children}
    </button>
  )
}

type SBtnProps = {
  title?: string
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick: () => void
  style?: React.CSSProperties
}

function SBtn({ title, active = false, disabled = false, children, onClick, style }: SBtnProps) {
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      style={{
        width: '28px',
        height: '28px',
        padding: 0,
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
        borderRadius: 'var(--rx)',
        background: active ? 'var(--accent-light)' : 'var(--card)',
        color: active ? 'var(--accent)' : 'var(--text-sub)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all .12s',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled || active) return
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.color = 'var(--accent)'
        e.currentTarget.style.background = 'var(--accent-light)'
      }}
      onMouseLeave={(e) => {
        if (disabled || active) return
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-sub)'
        e.currentTarget.style.background = 'var(--card)'
      }}
    >
      {children}
    </button>
  )
}
