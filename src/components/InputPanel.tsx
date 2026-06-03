import { useState, useRef } from 'react'
import type { TableModel } from '../lib/table/types'
import type { TableSource } from '../lib/table/merge/sourceStack'
import { parseInput } from '../lib/table/parser'
import { parseHTMLTable } from '../lib/table/clipboard/parseHTMLTable'
import { parseClipboardMarkdown } from '../lib/table/clipboard/parseClipboardMarkdown'
import { MergePanel } from './MergePanel'

type InputTab = 'paste' | 'upload' | 'create' | 'merge'

const QUICK_PRESETS = [
  { label: '2×2', rows: 2, cols: 2 },
  { label: '3×3', rows: 3, cols: 3 },
  { label: '4×4', rows: 4, cols: 4 },
  { label: '5×3', rows: 5, cols: 3 },
]

export type InputPanelProps = {
  collapsed: boolean
  onToggleCollapse: () => void
  onParse: (model: TableModel) => void
  onMainFileUpload: (file: File) => Promise<void>
  onCreateTable: (rows: number, cols: number) => void
  sources: TableSource[]
  onAddSourceFiles: (files: File[]) => Promise<void>
  onAppendRows: (source: TableSource) => void
  onAppendColumns: (source: TableSource) => void
  onReplaceWith: (source: TableSource) => void
  onRemoveSource: (id: string) => void
}

export function InputPanel(props: InputPanelProps) {
  const { collapsed, onToggleCollapse } = props
  const [activeTab, setActiveTab] = useState<InputTab>('paste')

  // Collapsed: show only an expand button
  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        title="Input を開く"
        style={{
          width: '2rem',
          padding: '0.5rem 0',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rs)',
          background: 'var(--card)',
          color: 'var(--text-sub)',
          cursor: 'pointer',
          fontSize: '0.8rem',
          writingMode: 'vertical-rl',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all .15s',
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
        »  INPUT
      </button>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Panel header */}
      <div className="flex items-center gap-2 mb-4" style={{ flexWrap: 'wrap', rowGap: '0.5rem' }}>
        {/* Collapse button */}
        <button
          onClick={onToggleCollapse}
          title="Input を折りたたむ"
          style={{
            width: '1.5rem', height: '1.5rem', flexShrink: 0,
            border: '1px solid var(--border)', borderRadius: '4px',
            background: 'transparent', color: 'var(--text-sub)',
            cursor: 'pointer', fontSize: '0.7rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-sub)' }}
        >
          «
        </button>

        {/* Number badge */}
        <span className="flex items-center justify-center text-xs font-extrabold" style={{
          width: '1.375rem', height: '1.375rem', borderRadius: '50%', flexShrink: 0,
          background: 'var(--accent-light)', color: 'var(--accent)',
        }}>1</span>

        <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}>
          Input
        </span>

        {/* Tab switcher */}
        <div style={{
          marginLeft: '0.25rem', display: 'flex', flexWrap: 'wrap',
          background: 'var(--bg)', borderRadius: 'var(--rx)', padding: '2px', gap: '1px',
        }}>
          {(['paste', 'upload', 'create', 'merge'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '2px 8px', fontSize: '0.7rem', fontWeight: 600,
                borderRadius: 'calc(var(--rx) - 1px)', border: 'none', cursor: 'pointer',
                background: activeTab === tab ? 'var(--card)' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-sub)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                transition: 'all .15s', whiteSpace: 'nowrap',
              }}
            >
              {tab === 'paste' ? 'Paste' : tab === 'upload' ? 'Upload' : tab === 'create' ? 'Create' : 'Merge'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1 }}>
        {activeTab === 'paste' && <PasteTab onParse={props.onParse} />}
        {activeTab === 'upload' && <UploadTab onUpload={props.onMainFileUpload} />}
        {activeTab === 'create' && <CreateTab onCreateTable={props.onCreateTable} />}
        {activeTab === 'merge' && (
          <MergePanel
            variant="inline"
            sources={props.sources}
            onAddSourceFiles={props.onAddSourceFiles}
            onAppendRows={props.onAppendRows}
            onAppendColumns={props.onAppendColumns}
            onReplaceWith={props.onReplaceWith}
            onRemoveSource={props.onRemoveSource}
          />
        )}
      </div>
    </div>
  )
}

/* ── Paste Tab ─────────────────────────────────────────── */

function PasteTab({ onParse }: { onParse: (model: TableModel) => void }) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleParse() {
    const result = parseInput(text)
    if (result === null) {
      setError('Could not detect format. Please paste TSV or CSV.')
      return
    }
    setError(null)
    onParse(result)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <textarea
        className="w-full font-mono text-sm resize-none"
        wrap="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste table here (TSV / CSV / Excel / Markdown)...\n\nExample:\nMethod\tAcc\tF1\nOurs\t0.92\t0.91\nBaseline\t0.88\t0.87"}
        style={{
          height: '280px', overflowX: 'auto', overflowY: 'auto',
          background: '#FAFAFA',
          border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
          borderRadius: 'var(--rs)', padding: '.75rem 1rem', outline: 'none',
          lineHeight: 1.75, color: 'var(--text)', transition: 'border-color .18s, box-shadow .18s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,.1)' }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#EF4444' : 'var(--border)'; e.target.style.boxShadow = 'none' }}
        onPaste={(e) => {
          // ① HTML table（Excel / Google Sheets / PowerPoint）
          const html = e.clipboardData?.getData('text/html') ?? ''
          if (html) {
            const rows = parseHTMLTable(html)
            if (rows && rows.length > 0) {
              e.preventDefault()
              setText(rows.map((r) => r.join('\t')).join('\n'))
              return
            }
          }
          // ② Markdown table（LLM 出力 / GitHub）
          const plain = e.clipboardData?.getData('text/plain') ?? ''
          const mdRows = parseClipboardMarkdown(plain)
          if (mdRows && mdRows.length > 0) {
            e.preventDefault()
            setText(mdRows.map((r) => r.join('\t')).join('\n'))
            return
          }
          // ③ fallthrough → native paste
        }}
      />
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      <button className="btn-primary w-full" onClick={handleParse}>
        Parse Table
      </button>
    </div>
  )
}

/* ── Upload Tab ──────────────────────────────────────────── */

function UploadTab({ onUpload }: { onUpload: (file: File) => Promise<void> }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setIsLoading(true)
    await onUpload(file)
    setIsLoading(false)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={async (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) await handleFile(file)
      }}
      onClick={() => fileInputRef.current?.click()}
      style={{
        minHeight: '200px', cursor: 'pointer', padding: '1.5rem',
        border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--rs)',
        background: isDragging ? 'var(--accent-light)' : 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '0.75rem', transition: 'all .15s',
      }}
    >
      <p className="text-sm font-semibold" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-sub)' }}>
        {isLoading ? '読み込み中...' : isDragging ? 'ここにドロップ' : 'ここにドロップ、または'}
      </p>
      {!isLoading && !isDragging && (
        <button className="btn-secondary text-sm"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
          📂 ファイルを選択
        </button>
      )}
      <p className="text-xs" style={{ color: 'var(--text-light)' }}>CSV / TSV / XLSX / TXT</p>
      <input ref={fileInputRef} type="file" hidden accept=".csv,.tsv,.txt,.xlsx,.xls"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) await handleFile(file)
        }} />
    </div>
  )
}

/* ── Create Tab ──────────────────────────────────────────── */

function CreateTab({ onCreateTable }: { onCreateTable: (rows: number, cols: number) => void }) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(4)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Quick presets */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
          Quick Create
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {QUICK_PRESETS.map((p) => (
            <button key={p.label} className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
              onClick={() => onCreateTable(p.rows, p.cols)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>
          Custom
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <NumField label="行数" value={rows} onChange={setRows} min={1} max={50} />
          <NumField label="列数" value={cols} onChange={setCols} min={1} max={20} />
        </div>
        <button className="btn-primary w-full" onClick={() => onCreateTable(rows, cols)}>
          Create Table
        </button>
      </div>
    </div>
  )
}

function NumField({ label, value, onChange, min, max }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="text-sm" style={{ color: 'var(--text-sub)' }}>{label}</span>
      <input type="number" value={value} min={min} max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '70px', padding: '0.3rem 0.5rem', fontSize: '0.875rem',
          border: '1.5px solid var(--border)', borderRadius: 'var(--rx)',
          background: '#FAFAFA', color: 'var(--text)', outline: 'none', textAlign: 'center',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,.1)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}
