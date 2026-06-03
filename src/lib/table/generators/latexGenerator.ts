import type { TableModel, TableRow } from '../types'
import { latexEscape } from '../formatters/shared/latexEscape'

export function latexGenerator(model: TableModel): string {
  const env = model.environment ?? 'table*'
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

  for (const row of visibleRows) {
    if (row.separatorTop) lines.push('\\hline')

    lines.push(buildRow(row))

    if (row.separatorBottom) lines.push('\\hline')
  }

  lines.push('\\hline')
  lines.push(`\\end{tabular}`)
  lines.push('\\end{center}')
  lines.push(`\\end{${env}}`)

  return lines.join('\n')
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

function buildRow(row: TableRow): string {
  const visibleCells = row.cells.filter((c) => !c.hidden)
  const cells = visibleCells.map((cell) => {
    let value = latexEscape(cell.value)
    if (cell.bold) value = `\\textbf{${value}}`
    if (cell.italic) value = `\\textit{${value}}`
    return value
  })
  return cells.join(' & ') + ' \\\\'
}
