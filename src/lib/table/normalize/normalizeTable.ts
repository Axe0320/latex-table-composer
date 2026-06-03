import type { TableModel, TableRow, TableCell } from '../types'

export function normalizeTable(raw: string[][]): TableModel {
  const nonEmpty = raw.filter((row) => row.some((cell) => cell.trim()))
  if (nonEmpty.length === 0) {
    return emptyModel()
  }

  const maxCols = Math.max(...nonEmpty.map((r) => r.length))

  const rows: TableRow[] = nonEmpty.map((rawRow, rowIndex): TableRow => {
    const padded = [...rawRow]
    while (padded.length < maxCols) padded.push('')

    const isHeader = rowIndex === 0

    const cells: TableCell[] = padded.map((value): TableCell => ({
      id: crypto.randomUUID(),
      value: value.trim(),
      bold: isHeader ? true : undefined,
      align: isHeader ? 'center' : undefined,
    }))

    // First cell of each row is left-aligned (row label)
    if (cells[0] && !isHeader) {
      cells[0] = { ...cells[0], align: 'left' }
    }

    return {
      id: crypto.randomUUID(),
      cells,
      rowType: isHeader ? 'header' : 'normal',
      separatorBottom: isHeader ? true : undefined,
    }
  })

  const columns = rows[0]?.cells.map((c) => c.value) ?? []

  return {
    title: '',
    label: '',
    environment: 'table*',
    columns,
    rows,
  }
}

function emptyModel(): TableModel {
  return {
    title: '',
    label: '',
    environment: 'table*',
    columns: [],
    rows: [],
  }
}
