import { useState } from 'react'

function App() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'input' | 'preview' | 'latex'>('input')

  function handleCopyLatex() {
    // Placeholder — will copy LaTeX in later PR
    navigator.clipboard.writeText('% LaTeX output will appear here').then(() => {
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
            <h1 className="text-xl font-extrabold leading-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
              LaTeX{' '}
              <span style={{ color: 'var(--accent)' }}>Table Composer</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-sub)' }}>
              Academic Table Generator for Research Papers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={() => {}}
            >
              Load Example
            </button>
            <button
              className="btn-primary text-sm"
              onClick={handleCopyLatex}
            >
              {copied ? 'Copied!' : 'Copy LaTeX'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto px-5 py-8" style={{ maxWidth: '960px' }}>
        {/* Mobile tab switcher — visible only on small screens */}
        <div className="flex gap-1 mb-4 md:hidden" style={{ background: 'var(--border)', borderRadius: 'var(--rs)', padding: '3px' }}>
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

        {/* 3-panel layout */}
        <div className="hidden md:grid gap-5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <InputPanel />
          <PreviewPanel />
          <LaTeXPanel />
        </div>

        {/* Mobile: single panel by tab */}
        <div className="md:hidden">
          {activeTab === 'input' && <InputPanel />}
          {activeTab === 'preview' && <PreviewPanel />}
          {activeTab === 'latex' && <LaTeXPanel />}
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

function InputPanel() {
  return (
    <div className="card">
      <PanelHeader num="1" title="Input" />
      {/* Input mode tabs */}
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
        rows={12}
        placeholder={"Paste table here (TSV / CSV)...\n\nExample:\nMethod\tAcc\tF1\nOurs\t0.92\t0.91\nBaseline\t0.88\t0.87"}
        style={{
          background: '#FAFAFA',
          border: '1.5px solid var(--border)',
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
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />

      <button className="btn-primary w-full mt-1">
        Parse Table
      </button>
    </div>
  )
}

function PreviewPanel() {
  return (
    <div className="card">
      <PanelHeader num="2" title="Preview" />
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
      <p className="text-xs text-center mt-2" style={{ color: 'var(--text-light)' }}>
        Paste and parse input to see preview
      </p>
    </div>
  )
}

function LaTeXPanel() {
  return (
    <div className="card">
      <PanelHeader num="3" title="LaTeX" />
      <textarea
        readOnly
        className="w-full font-mono text-sm resize-none"
        rows={12}
        placeholder="% LaTeX output will appear here"
        value=""
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
      <button className="btn-secondary w-full mt-1 text-sm">
        Copy LaTeX
      </button>
    </div>
  )
}

export default App
