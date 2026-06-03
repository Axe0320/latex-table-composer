import { useState } from 'react'

type Props = {
  onClose: () => void
  onCreate: (rows: number, cols: number) => void
}

export function CreateTableDialog({ onClose, onCreate }: Props) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(4)

  function handleCreate() {
    const r = Math.max(1, Math.min(50, rows))
    const c = Math.max(1, Math.min(20, cols))
    onCreate(r, c)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.5rem',
          width: '280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-center gap-2">
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
            ✦
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
            Create Table
          </span>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <NumberField
            label="行数"
            value={rows}
            onChange={setRows}
            min={1}
            max={50}
          />
          <NumberField
            label="列数"
            value={cols}
            onChange={setCols}
            min={1}
            max={20}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary text-sm" onClick={onClose}>
            キャンセル
          </button>
          <button className="btn-primary text-sm" onClick={handleCreate}>
            作成
          </button>
        </div>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="text-sm" style={{ color: 'var(--text-sub)' }}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '70px',
          padding: '0.3rem 0.5rem',
          fontSize: '0.875rem',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rx)',
          background: '#FAFAFA',
          color: 'var(--text)',
          outline: 'none',
          textAlign: 'center',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--border-focus)'
          e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  )
}
