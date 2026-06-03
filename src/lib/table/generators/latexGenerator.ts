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

    if (shouldHlineBefore(idx, row.separatorTop ?? false, opts.borderTemplate)) {
      lines.push('\\hline')
    }

    lines.push(buildRow(row, opts))

    if (shouldHlineAfter(isLast, row.separatorBottom ?? false, opts.borderTemplate)) {
      lines.push('\\hline')
    }
  })

  // Final bottom border (minimal/academic/full all have it; emitted by shouldHlineAfter for last row)
  // Only needed when borderTemplate is 'minimal' and last row has no separatorBottom
  // — handled above already via isLast logic

  lines.push(`\\end{tabular}`)
  lines.push('\\end{center}')
  lines.push(`\\end{${env}}`)

  return lines.join('\n')
}

function shouldHlineBefore(
  rowIdx: number,
  separatorTop: boolean,
  template: FormattingOptions['borderTemplate']
): boolean {
  if (rowIdx === 0) return false // top \hline already emitted before loop
  if (template === 'full') return true
  if (template === 'minimal') return false
  // academic: respect model separatorTop
  return separatorTop
}

function shouldHlineAfter(
  isLast: boolean,
  separatorBottom: boolean,
  template: FormattingOptions['borderTemplate']
): boolean {
  if (isLast) return true // bottom border always
  if (template === 'full') return true
  if (template === 'minimal') return false
  // academic: respect model separatorBottom
  return separatorBottom
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
    // Header cells skip missing-value / decimal formatting
    const raw = row.rowType === 'header' ? cell.value : formatValue(cell.value, opts)
    let value = latexEscape(raw)
    if (cell.bold) value = `\\textbf{${value}}`
    if (cell.italic) value = `\\textit{${value}}`
    return value
  })
  return cells.join(' & ') + ' \\\\'
}
