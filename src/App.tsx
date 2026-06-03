import { useState, useMemo } from 'react'
import type { TableModel, BorderStyle } from './lib/table/types'
import { parseInput } from './lib/table/parser'
import { PreviewPanel } from './components/PreviewPanel'
import { latexGenerator } from './lib/table/generators/latexGenerator'
import { FormattingBar } from './components/FormattingBar'
import { type FormattingOptions, DEFAULT_OPTIONS } from './lib/table/formatters/options'
import { EXAMPLES } from './lib/example/examples'
import { InputPanel, type InputMode } from './components/InputPanel'
import {
  addRowAbove,
  addRowBelow,
  deleteRow,
  addColumnLeft,
  addColumnRight,
  deleteColumn,
  createEmptyTable,
  updateCellStyle,
  getCellsInRect,
  hideColumns,
  showColumn,
  showAllColumns,
  getHiddenColumnIndices,
  getColIndicesFromCellIds,
} from './lib/table/editor'
import type { StylePatch, CellAnchor } from './lib/table/editor'
import type { EditMode } from './components/TableEditorToolbar'
import { appendRows, appendColumns, replaceWith } from './lib/table/merge/mergeTables'
import type { TableSource } from './lib/table/merge/sourceStack'
import { detect } from './lib/table/parser/detect'
import { parseExcel } from './lib/table/parser/parseExcel'
import { normalizeTable } from './lib/table/normalize'

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
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview')
  const [selectedCellIds, setSelectedCellIds] = useState<Set<string>>(new Set())
  const [anchorCell, setAnchorCell] = useState<CellAnchor | null>(null)
  const [editMode, setEditMode] = useState<EditMode>('output')
  const [sources, setSources] = useState<TableSource[]>([])
  const [inputMode, setInputMode] = useState<InputMode>('paste')
  const latex = useMemo(() => latexGenerator(model, options), [model, options])


  const selectedCells = useMemo(
    () => model.rows.flatMap((row) => row.cells.filter((c) => selectedCellIds.has(c.id))),
    [model, selectedCellIds]
  )

  const hiddenColumnIndices = useMemo(() => getHiddenColumnIndices(model), [model])

  const hiddenColumnNames = useMemo(() => {
    const headerRow = model.rows.find((r) => r.rowType === 'header')
    return hiddenColumnIndices.map((colIdx) =>
      headerRow?.cells[colIdx]?.value || `列${colIdx + 1}`
    )
  }, [model, hiddenColumnIndices])

  const selectedColIndices = useMemo(
    () => getColIndicesFromCellIds(model, selectedCellIds),
    [model, selectedCellIds]
  )

  function handleHideColumns() {
    if (selectedColIndices.length === 0) return
    setModel((prev) => hideColumns(prev, selectedColIndices))
    clearSelection()
  }
  function handleShowColumn(colIdx: number) {
    setModel((prev) => showColumn(prev, colIdx))
  }
  function handleShowAllColumns() {
    setModel((prev) => showAllColumns(prev))
  }

  // Shared props objects (defined after all handlers)
  const previewProps = {
    model, options, viewMode, onViewModeChange: setViewMode,
    editMode, onEditModeChange: setEditMode,
    onCellChange: updateCell, onCellSelect: handleCellSelect,
    onStyleChange: handleStyleChange, onClearFormatting: handleClearFormatting,
    selectedCellIds, selectedCells, selectedColIndices,
    hiddenColumnIndices, hiddenColumnNames,
    onHideColumns: handleHideColumns, onShowColumn: handleShowColumn,
    onShowAllColumns: handleShowAllColumns,
    onAddRowAbove: handleAddRowAbove, onAddRowBelow: handleAddRowBelow,
    onDeleteRow: handleDeleteRow, onAddColumnLeft: handleAddColumnLeft,
    onAddColumnRight: handleAddColumnRight, onDeleteColumn: handleDeleteColumn,
    onRowBorderChange: handleRowBorderChange,
  } as const

  const inputPanelProps = {
    onParse: handleParse, onMainFileUpload: handleMainFileUpload,
    onCreateTable: handleCreateTable, sources,
    onAddSourceFiles: handleAddSourceFiles, onAppendRows: handleAppendRows,
    onAppendColumns: handleAppendColumns, onReplaceWith: handleReplaceWith,
    onRemoveSource: handleRemoveSource,
  } as const

  function handleCellSelect(cellId: string, rowIdx: number, colIdx: number, isShift: boolean) {
    if (!isShift || !anchorCell) {
      setAnchorCell({ cellId, rowIdx, colIdx })
      setSelectedCellIds(new Set([cellId]))
    } else {
      const ids = getCellsInRect(model, anchorCell, rowIdx, colIdx)
      setSelectedCellIds(new Set(ids))
    }
  }

  function handleStyleChange(patch: StylePatch) {
    if (selectedCellIds.size === 0) return
    setModel((prev) => updateCellStyle(prev, selectedCellIds, patch))
  }

  function handleClearFormatting() {
    if (selectedCellIds.size === 0) return
    setModel((prev) => updateCellStyle(prev, selectedCellIds, {
      bold: undefined,
      italic: undefined,
      underline: undefined,
      backgroundColor: undefined,
      // align is intentionally NOT cleared
    }))
  }

  function clearSelection() {
    setSelectedCellIds(new Set())
    setAnchorCell(null)
  }

  function handleParse(model: TableModel) {
    setModel(model)
    clearSelection()
  }

  // ── File upload helpers ──────────────────────────────
  async function parseFileToModel(file: File) {
    const isExcel = /\.(xlsx|xls)$/i.test(file.name)
    if (isExcel) {
      const buffer = await file.arrayBuffer()
      const rows = await parseExcel(buffer)
      return rows.length > 0 ? normalizeTable(rows) : null
    }
    const text = await file.text()
    return parseInput(text)
  }

  // Load single file into main table (called from InputPanel Upload tab)
  async function handleMainFileUpload(file: File): Promise<void> {
    const model = await parseFileToModel(file)
    if (model) { setModel(model); clearSelection() }
  }

  // ── Merge handlers ─────────────────────────────────
  async function handleAddSourceFiles(files: File[]): Promise<void> {
    for (const file of files) {
      const model = await parseFileToModel(file)
      if (!model) continue
      const detectedType = /\.(xlsx|xls)$/i.test(file.name) ? 'csv' as const : detect(await file.text().catch(() => ''))
      const source: TableSource = {
        id: crypto.randomUUID(),
        name: file.name,
        sourceType: detectedType === 'unknown' ? 'manual' : detectedType,
        model,
      }
      setSources((prev) => [...prev, source])
    }
  }

  function handleAppendRows(source: TableSource) {
    setModel((prev) => appendRows(prev, source.model))
    clearSelection()  // Requirement 4: clear stale selection
  }

  function handleAppendColumns(source: TableSource) {
    setModel((prev) => appendColumns(prev, source.model))
    clearSelection()  // Requirement 4
  }

  function handleReplaceWith(source: TableSource) {
    // Requirement 1: confirm before replace
    if (window.confirm('現在のテーブルを置き換えますか？')) {
      setModel(replaceWith(source.model))
      clearSelection()  // Requirement 4
    }
  }

  function handleRemoveSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id))
  }

  function handleLoadExample() {
    const example = EXAMPLES[exampleIdx % EXAMPLES.length]!
    const parsed = parseInput(example.input)
    if (parsed) {
      parsed.title = example.description
      setModel(parsed)
    }
    setExampleIdx((i) => i + 1)
    clearSelection()
  }

  function updateCell(rowId: string, cellId: string, value: string) {
    setModel((prev) => {
      const updatedRows = prev.rows.map((row) =>
        row.id !== rowId
          ? row
          : { ...row, cells: row.cells.map((cell) => cell.id !== cellId ? cell : { ...cell, value }) }
      )
      // Keep columns in sync with header row values
      const headerRow = updatedRows.find((r) => r.rowType === 'header')
      const columns = headerRow ? headerRow.cells.map((c) => c.value) : prev.columns
      return { ...prev, rows: updatedRows, columns }
    })
  }

  function handleAddRowAbove(rowId: string) { setModel((prev) => addRowAbove(prev, rowId)) }
  function handleAddRowBelow(rowId: string) { setModel((prev) => addRowBelow(prev, rowId)) }
  function handleDeleteRow(rowId: string) { setModel((prev) => deleteRow(prev, rowId)) }
  function handleAddColumnLeft(colIdx: number) { setModel((prev) => addColumnLeft(prev, colIdx)) }
  function handleAddColumnRight(colIdx: number) { setModel((prev) => addColumnRight(prev, colIdx)) }
  function handleDeleteColumn(colIdx: number) { setModel((prev) => deleteColumn(prev, colIdx)) }
  function handleRowBorderChange(rowId: string, border: BorderStyle) {
    setModel((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => r.id !== rowId ? r : { ...r, bottomBorder: border }),
    }))
  }
  function handleCreateTable(rows: number, cols: number) {
    setModel(createEmptyTable(rows, cols))
    setViewMode('edit')
    clearSelection()
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

        {/* Mode selector — Citation⇄BibTeX style */}
        <ModeSelector active={inputMode} onChange={setInputMode} />

        {/* Formatting controls — below mode selector */}
        <FormattingBar options={options} onChange={setOptions} />

        {/* Desktop layout: changes based on inputMode */}
        <div className="hidden md:flex md:flex-col gap-5">
          {inputMode === 'paste' ? (
            /* Paste: side-by-side Input + Preview */
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <InputPanel mode="paste" {...inputPanelProps} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <PreviewPanel {...previewProps} />
              </div>

            </div>
          ) : (
            /* Upload / Create / Merge: full-width mode panel + Preview below */
            <>
              <InputPanel mode={inputMode} {...inputPanelProps} />
              <PreviewPanel {...previewProps} />
            </>
          )}
          <LaTeXPanel latex={latex} onCopy={handleCopyLatex} copied={copied} />
        </div>

        {/* Mobile: single panel by tab */}
        <div className="md:hidden mt-4">
          {activeTab === 'input' && (
            <div>
              <ModeSelector active={inputMode} onChange={setInputMode} />
              <div className="mt-4">
                <InputPanel mode={inputMode} {...inputPanelProps} />
              </div>
            </div>
          )}
          {activeTab === 'preview' && <PreviewPanel {...previewProps} />}
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


const MODE_OPTIONS: { value: InputMode; icon: string; label: string; desc: string }[] = [
  { value: 'paste', icon: '✏️', label: 'Paste', desc: 'テキスト貼り付け' },
  { value: 'upload', icon: '📂', label: 'Upload', desc: 'ファイル読み込み' },
  { value: 'create', icon: '🆕', label: 'Create', desc: '空テーブル作成' },
  { value: 'merge', icon: '🔗', label: 'Merge', desc: 'ソース統合' },
]

function ModeSelector({ active, onChange }: { active: InputMode; onChange: (m: InputMode) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.25rem',
      }}
    >
      {MODE_OPTIONS.map(({ value, icon, label, desc }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          style={{
            flex: 1,
            padding: '0.5rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            border: 'none',
            borderRadius: 'var(--rs)',
            cursor: 'pointer',
            transition: 'all .18s',
            background: active === value ? 'var(--card)' : 'transparent',
            color: active === value ? 'var(--accent)' : 'var(--text-sub)',
            boxShadow: active === value ? 'var(--shadow-sm)' : 'none',
          }}
          onMouseEnter={(e) => { if (active !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          onMouseLeave={(e) => { if (active !== value) e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.2 }}>{label}</span>
          <span style={{ fontSize: '0.65rem', color: active === value ? 'var(--accent)' : 'var(--text-light)', lineHeight: 1.2 }}>
            {desc}
          </span>
        </button>
      ))}
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
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center justify-center text-xs font-extrabold"
          style={{ width: '1.375rem', height: '1.375rem', borderRadius: '50%',
            background: 'var(--accent-light)', color: 'var(--accent)' }}>3</span>
        <span className="text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-light)', letterSpacing: '0.1em' }}>LaTeX</span>
      </div>
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
