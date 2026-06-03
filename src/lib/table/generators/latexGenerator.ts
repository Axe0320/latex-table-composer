import type { TableModel, TableRow } from '../types'
import { latexEscape } from '../formatters/shared/latexEscape'
import { formatValue } from '../formatters/shared/formatValue'
import { type FormattingOptions, DEFAULT_OPTIONS } from '../formatters/options'

type BorderTemplate = FormattingOptions['borderTemplate']

export function latexGenerator(
  model: TableModel,
  opts: FormattingOptions = DEFAULT_OPTIONS
): string {
  const env = opts.environment ?? model.environment ?? 'table*'
  const colSpec = buildColSpec(model)
  const lines: string[] = []

  // Required packages comment (only when needed)
  const pkgs = detectRequiredPackages(model, opts)
  if (pkgs.length > 0) {
    lines.push('% Required Packages:')
    pkgs.forEach((p) => lines.push(`% ${p}`))
  }

  lines.push(`\\begin{${env}}[tb]`)
  lines.push(`\\caption{${latexEscape(model.title)}}`)
  lines.push(`\\label{${latexEscape(model.label)}}`)
  lines.push('\\begin{center}')
  lines.push(`\\begin{tabular}{${colSpec}}`)

  const visibleRows = model.rows.filter((r) => !r.cells.every((c) => c.hidden))

  visibleRows.forEach((row, idx) => {
    const isLast = idx === visibleRows.length - 1

    const lineBefore = getLineBefore(idx, row, opts.borderTemplate)
    if (lineBefore) lines.push(lineBefore)

    lines.push(buildRow(row, opts))

    const lineAfter = getLineAfter(isLast, row, opts.borderTemplate)
    if (lineAfter) lines.push(lineAfter)
  })

  lines.push('\\end{tabular}')
  lines.push('\\end{center}')
  lines.push(`\\end{${env}}`)

  return lines.join('\n')
}

// Returns the line to emit BEFORE a row (or null if none)
function getLineBefore(rowIdx: number, row: TableRow, template: BorderTemplate): string | null {
  // Table top border — template's responsibility
  if (rowIdx === 0) return tableTopLine(template)

  // Row-level topBorder override
  if (row.topBorder) {
    if (row.topBorder === 'none') return null
    if (row.topBorder === 'hline') return '\\hline'
    if (row.topBorder === 'midrule') return '\\midrule'
  }

  // separatorTop triggers a line
  if (row.separatorTop) {
    if (template === 'academic') return '\\midrule'
    if (template === 'classic') return '\\hline'
  }

  if (template === 'full') return '\\hline'
  return null
}

// Returns the line to emit AFTER a row (or null if none)
function getLineAfter(isLast: boolean, row: TableRow, template: BorderTemplate): string | null {
  // Table bottom border — template's responsibility (always emitted for last row)
  if (isLast) return tableBottomLine(template)

  // Row-level bottomBorder override
  if (row.bottomBorder) {
    if (row.bottomBorder === 'none') return null
    if (row.bottomBorder === 'hline') return '\\hline'
    if (row.bottomBorder === 'midrule') return '\\midrule'  // PR-10 暫定 → 正式修正
  }

  // separatorBottom triggers a line
  if (row.separatorBottom) {
    if (template === 'academic') return '\\midrule'
    if (template === 'classic') return '\\hline'
  }

  if (template === 'full') return '\\hline'
  return null
}

function tableTopLine(template: BorderTemplate): string {
  switch (template) {
    case 'academic': return '\\toprule'
    case 'minimal': return '\\toprule'
    case 'classic': return '\\hline'
    case 'full': return '\\hline'
  }
}

function tableBottomLine(template: BorderTemplate): string {
  switch (template) {
    case 'academic': return '\\bottomrule'
    case 'minimal': return '\\bottomrule'
    case 'classic': return '\\hline'
    case 'full': return '\\hline'
  }
}

// Detect which packages are required for this output
function detectRequiredPackages(model: TableModel, opts: FormattingOptions): string[] {
  const pkgs: string[] = []

  // booktabs: academic/minimal template OR any row has midrule
  const usesBooktabs =
    opts.borderTemplate === 'academic' ||
    opts.borderTemplate === 'minimal' ||
    model.rows.some(
      (r) => r.bottomBorder === 'midrule' || r.topBorder === 'midrule'
    )
  if (usesBooktabs) pkgs.push('\\usepackage{booktabs}')

  // xcolor: any cell has backgroundColor
  const usesXcolor = model.rows.some((r) => r.cells.some((c) => c.backgroundColor != null))
  if (usesXcolor) pkgs.push('\\usepackage[table]{xcolor}')

  return pkgs
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
    if (cell.underline) value = `\\underline{${value}}`
    if (cell.backgroundColor) value = `\\cellcolor{${cell.backgroundColor}}${value}`
    return value
  })
  return cells.join(' & ') + ' \\\\'
}
