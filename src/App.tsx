import { useState, useMemo } from 'react'
import type { TableModel } from './lib/table/types'
import { parseInput } from './lib/table/parser'
import { PreviewPanel } from './components/PreviewPanel'
import { latexGenerator } from './lib/table/generators/latexGenerator'
import { FormattingBar } from './components/FormattingBar'
import { type FormattingOptions, DEFAULT_OPTIONS } from './lib/table/formatters/options'
import { EXAMPLES } from './lib/example/examples'

function makeId(): string {
  return crypto.randomUUID()
}

const DUMMY_MODEL: TableModel = {
  title: 'Classification Results on Test Set',
  label: 'tab:results',
  environment: 'table*',
  columns: ['Method', 'Accuracy', 'Precision', 'F1'],
  rows: [
    {
      id: makeId(),
      rowType: 'header',
      separatorBottom: true,
      cells: [
        { id: makeId(), value: 'Method', bold: true, align: 'center' },
        { id: makeId(), value: 'Accuracy', bold: true, align: 'center' },
        { id: makeId(), value: 'Precision', bold: true, align: 'center' },
        { id: makeId(), value: 'F1', bold: true, align: 'center' },
      ],
    },
    {
      id: makeId(),
      rowType: 'normal',
      cells: [
        { id: makeId(), value: 'Ours', align: 'left' },
        { id: makeId(), value: '0.924', align: 'right' },
        { id: makeId(), value: '0.918', align: 'right' },
        { id: makeId(), value: '0.911', align: 'right' },
      ],
    },
    {
      id: makeId(),
      rowType: 'normal',
      cells: [
        { id: makeId(), value: 'BERT', align: 'left' },
        { id: makeId(), value: '0.901', align: 'right' },
        { id: makeId(), value: '0.895', align: 'right' },
        { id: makeId(), value: '0.887', align: 'right' },
      ],
    },
    {
      id: makeId(),
      rowType: 'summary',
      separatorTop: true,
      cells: [
        { id: makeId(), value: 'Baseline', italic: true, align: 'left' },
        { id: makeId(), value: '0.872', align: 'right' },
        { id: makeId(), value: '0.864', align: 'right' },
        { id: makeId(), value: '0.859', align: 'right' },
      ],
    },
  ],
}

function App() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'input' | 'preview' | 'latex'>('input')
  const [model, setModel] = useState<TableModel>(DUMMY_MODEL)
  const [options, setOptions] = useState<FormattingOptions>(DEFAULT_OPTIONS)
  const [exampleIdx, setExampleIdx] = useState(0)
  const latex = useMemo(() => latexGenerator(model, options), [model, options])

  function handleLoadExample() {
    const example = EXAMPLES[exampleIdx % EXAMPLES.length]!
    const parsed = parseInput(example.input)
    if (parsed) {
      parsed.title = example.description
      setModel(parsed)
    }
    setExampleIdx((i) => i + 1)
  }

  function updateCell(rowId: string, cellId: string, value: string) {
    setModel((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id !== rowId
          ? row
          : {
              ...row,
              cells: row.cells.map((cell) =>
                cell.id !== cellId ? cell : { ...cell, value }
              ),
            }
      ),
    }))
  }

  function handleCopyLatex() {
    navigator.clipboard.writeText(latex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="mx-auto flex items-center justify-between px-5 py-4" style={{ maxWidth: '960px' }}>
          <div>
            <h1
              className="text-xl font-extrabold leading-tight"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              LaTeX <span style={{ color: 'var(--accent)' }}>Table Composer</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
              表データを論文向け LaTeX に変換・整形するツール
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-sm" onClick={handleLoadExample}>
              Load Example
            </button>
            <button className="btn-primary text-sm" onClick={handleCopyLatex}>
              {copied ? 'Copied!' : 'Copy LaTeX'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto px-5 py-8" style={{ maxWidth: '960px' }}>
        {/* Mobile tab switcher */}
        <div
          className="flex gap-1 mb-4 md:hidden"
          style={{ background: 'var(--border)', borderRadius: 'var(--rs)', padding: '3px' }}
        >
          {(['input', 'preview', 'latex'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 text-sm font-semibold capitalize transition-all"
              style={{
                borderRadius: 'calc(var(--rs) - 2px)',
                background: activeTab === tab ? 'var(--card)' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-sub)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {tab === 'input' ? 'Input' : tab === 'preview' ? 'Preview' : 'LaTeX'}
            </button>
          ))}
        </div>

        {/* Formatting controls — above panels on desktop */}
        <FormattingBar options={options} onChange={setOptions} />

        {/* Desktop layout: Input+Preview top row, LaTeX full width bottom */}
        <div className="hidden md:flex md:flex-col gap-5 mt-5">
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <InputPanel onParse={setModel} />
            <PreviewPanel model={model} options={options} onCellChange={updateCell} />
          </div>
          <LaTeXPanel latex={latex} onCopy={handleCopyLatex} copied={copied} />
        </div>

        {/* Mobile: single panel by tab */}
        <div className="md:hidden mt-4">
          {activeTab === 'input' && <InputPanel onParse={setModel} />}
          {activeTab === 'preview' && <PreviewPanel model={model} options={options} onCellChange={updateCell} />}
          {activeTab === 'latex' && <LaTeXPanel latex={latex} onCopy={handleCopyLatex} copied={copied} />}
        </div>
      </main>

      {/* Toast */}
      {copied && (
        <div
          className="fixed bottom-8 right-8 px-4 py-2.5 text-sm font-medium text-white rounded-md"
          style={{ background: '#111827', boxShadow: 'var(--shadow-lg)' }}
        >
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}

function PanelHeader({ num, title }: { num: string; title: string }) {
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
        {num}
      </span>
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}
      >
        {title}
      </span>
    </div>
  )
}

function InputPanel({ onParse }: { onParse: (model: TableModel) => void }) {
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
    <div className="card">
      <PanelHeader num="1" title="Input" />
      <div
        className="flex gap-1 mb-3"
        style={{ background: 'var(--bg)', borderRadius: 'var(--rx)', padding: '3px' }}
      >
        {['Paste', 'CSV', 'Manual'].map((mode, i) => (
          <button
            key={mode}
            className="flex-1 py-1 text-xs font-semibold transition-all"
            style={{
              borderRadius: 'calc(var(--rx) - 1px)',
              background: i === 0 ? 'var(--card)' : 'transparent',
              color: i === 0 ? 'var(--accent)' : 'var(--text-sub)',
              boxShadow: i === 0 ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <textarea
        className="w-full font-mono text-sm resize-none"
        wrap="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"Paste table here (TSV / CSV)...\n\nExample:\nMethod\tAcc\tF1\nOurs\t0.92\t0.91\nBaseline\t0.88\t0.87"}
        style={{
          height: '320px',
          overflowX: 'auto',
          overflowY: 'auto',
          background: '#FAFAFA',
          border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
          borderRadius: 'var(--rs)',
          padding: '.75rem 1rem',
          outline: 'none',
          lineHeight: 1.75,
          color: 'var(--text)',
          transition: 'border-color .18s, box-shadow .18s',
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

      {error && (
        <p className="text-xs mt-1" style={{ color: '#EF4444' }}>
          {error}
        </p>
      )}

      <button className="btn-primary w-full mt-1" onClick={handleParse}>
        Parse Table
      </button>
    </div>
  )
}

function LaTeXPanel({
  latex,
  onCopy,
  copied,
}: {
  latex: string
  onCopy: () => void
  copied: boolean
}) {
  return (
    <div className="card">
      <PanelHeader num="3" title="LaTeX" />
      <textarea
        readOnly
        className="w-full font-mono text-sm resize-none"
        rows={8}
        value={latex}
        style={{
          background: '#F9F9FF',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--rs)',
          padding: '.75rem 1rem',
          outline: 'none',
          lineHeight: 1.75,
          color: '#3730A3',
          cursor: 'default',
        }}
      />
      <button className="btn-primary w-full mt-1 text-sm" onClick={onCopy}>
        {copied ? 'Copied!' : 'Copy LaTeX'}
      </button>
    </div>
  )
}

export default App
