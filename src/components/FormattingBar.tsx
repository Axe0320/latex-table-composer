import type { FormattingOptions } from '../lib/table/formatters/options'

type Props = {
  options: FormattingOptions
  onChange: (next: FormattingOptions) => void
}

export function FormattingBar({ options, onChange }: Props) {
  function update<K extends keyof FormattingOptions>(key: K, value: FormattingOptions[K]) {
    onChange({ ...options, [key]: value })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 mt-5"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <BarLabel>Formatting</BarLabel>

      <BarField label="Environment">
        <select
          value={options.environment}
          onChange={(e) => update('environment', e.target.value as FormattingOptions['environment'])}
          style={selectStyle}
        >
          <option value="table*">table*</option>
          <option value="table">table</option>
        </select>
      </BarField>

      <BarField label="Decimal">
        <select
          value={String(options.decimalPrecision)}
          onChange={(e) => {
            const v = e.target.value
            update('decimalPrecision', v === 'auto' ? 'auto' : Number(v))
          }}
          style={selectStyle}
        >
          <option value="auto">Auto</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </BarField>

      <BarField label="Missing">
        <select
          value={options.missingValue}
          onChange={(e) => update('missingValue', e.target.value as FormattingOptions['missingValue'])}
          style={selectStyle}
        >
          <option value="---">---</option>
          <option value="N/A">N/A</option>
          <option value="-">-</option>
          <option value="blank">blank</option>
        </select>
      </BarField>

      <BarField label="Border">
        <select
          value={options.borderTemplate}
          onChange={(e) => update('borderTemplate', e.target.value as FormattingOptions['borderTemplate'])}
          style={selectStyle}
        >
          <option value="academic">Academic</option>
          <option value="full">Full Grid</option>
          <option value="minimal">Minimal</option>
        </select>
      </BarField>
    </div>
  )
}

function BarLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-xs font-bold uppercase"
      style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}
    >
      {children}
    </span>
  )
}

function BarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  padding: '0.25rem 0.5rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--rx)',
  background: 'var(--card)',
  color: 'var(--text)',
  outline: 'none',
  cursor: 'pointer',
}
