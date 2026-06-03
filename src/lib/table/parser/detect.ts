export type InputFormat = 'tsv' | 'csv' | 'unknown'

export function detect(text: string): InputFormat {
  if (!text.trim()) return 'unknown'

  // TSV priority: any tab character present
  if (text.includes('\t')) return 'tsv'

  // CSV: comma-separated with consistent column count across lines
  const lines = text.trim().split('\n').filter((l) => l.trim())
  if (lines.length >= 1 && lines[0].includes(',')) {
    const colCounts = lines.map((l) => l.split(',').length)
    const allSame = colCounts.every((c) => c === colCounts[0])
    if (allSame && colCounts[0]! > 1) return 'csv'
  }

  return 'unknown'
}
