export type TableCell = {
  id: string
  value: string
  bold?: boolean
  italic?: boolean
  hidden?: boolean
  align?: 'left' | 'center' | 'right'
}

export type BorderStyle = 'none' | 'hline' | 'midrule'

export type TableRow = {
  id: string
  cells: TableCell[]
  separatorTop?: boolean
  separatorBottom?: boolean
  rowType?: 'normal' | 'header' | 'summary'
  topBorder?: BorderStyle
  bottomBorder?: BorderStyle
}

export type TableModel = {
  id?: string
  title: string
  label: string
  environment: 'table' | 'table*'
  columns: string[]
  rows: TableRow[]
}
