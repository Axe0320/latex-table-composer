import type { TableModel, TableRow } from '../types'
import { latexEscape } from '../formatters/shared/latexEscape'
import { formatValue } from '../formatters/shared/formatValue'
import { type FormattingOptions, DEFAULT_OPTIONS } from '../formatters/options'

export function latexGenerator(
  model: TableModel,
  opts: FormattingOptions = DEFAULT_OPTIONS
): string {
  const env = opts.environment ?? model.environment ?? 'table*'
  const colSpec = buildColSpec(model)
  const lines: string[] = []

  lines.push(`\\begin{${env}}[tb]`)
  lines.push(`\\caption{${latexEscape(model.title)}}`)
  lines.push(`\\label{${latexEscape(model.label)}}`)
  lines.push('\\begin{center}')
  lines.push(`\\begin{tabular}{${colSpec}}`)
  lines.push('\\hline')

  const visibleRows = model.rows.filter(
    (r) => !r.cells.every((c) => c.hidden)
  )

  visibleRows.forEach((row, idx) => {
    const isLast = idx === visibleRows.length - 1

    if (shouldHlineBefore(idx, row, opts.borderTemplate)) {
      lines.push('\\hline')
    }

    lines.push(buildRow(row, opts))

    if (shouldHlineAfter(isLast, row, opts.borderTemplate)) {
      lines.push('\\hline')
    }
  })

  lines.push(`\\end{tabular}`)
  lines.push('\\end{center}')
  lines.push(`\\end{${env}}`)

  return lines.join('\n')
}

function shouldHlineBefore(
  rowIdx: number,
  row: TableRow,
  template: FormattingOptions['borderTemplate']
): boolean {
  if (rowIdx === 0) return false

  // Row-level border override takes precedence over template
  if (row.topBorder === 'none') return false
  if (row.topBorder === 'hline' || row.topBorder === 'midrule') return true

  if (template === 'full') return true
  if (template === 'minimal') return false
  return row.separatorTop ?? false
}

function shouldHlineAfter(
  isLast: boolean,
  row: TableRow,
  template: FormattingOptions['borderTemplate']
): boolean {
  if (isLast) return true

  // Row-level border override takes precedence over template
  if (row.bottomBorder === 'none') return false
  if (row.bottomBorder === 'hline' || row.bottomBorder === 'midrule') return true

  if (template === 'full') return true
  if (template === 'minimal') return false
  return row.separatorBottom ?? false
}

function buildColSpec(model: TableModel): string {
  const dataRow = model.rows.find((r) => r.rowType !== 'header')
  const headerRow = model.rows.find((r) => r.rowType === 'header')
  const refRow = dataRow ?? headerRow
  if (!refRow) return 'l'

  return refRow.cells
    .filter((c) => !c.hidden)
    .map((c) => alignToSpec(c.align))
    .join('')
}

function alignToSpec(align: 'left' | 'center' | 'right' | undefined): string {
  if (align === 'right') return 'r'
  if (align === 'center') return 'c'
  return 'l'
}

function buildRow(row: TableRow, opts: FormattingOptions): string {
  const visibleCells = row.cells.filter((c) => !c.hidden)
  const cells = visibleCells.map((cell) => {
    const raw = row.rowType === 'header' ? cell.value : formatValue(cell.value, opts)
    let value = latexEscape(raw)
    if (cell.bold) value = `\\textbf{${value}}`
    if (cell.italic) value = `\\textit{${value}}`
    return value
  })
  return cells.join(' & ') + ' \\\\'
}
