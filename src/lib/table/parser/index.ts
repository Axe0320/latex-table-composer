import type { TableModel } from '../types'
import { detect } from './detect'
import { parseTSV } from './parseTSV'
import { parseCSV } from './parseCSV'
import { normalizeTable } from '../normalize'

export function parseInput(text: string): TableModel | null {
  const format = detect(text)
  if (format === 'unknown') return null

  const raw = format === 'tsv' ? parseTSV(text) : parseCSV(text)
  if (raw.length === 0) return null

  return normalizeTable(raw)
}
