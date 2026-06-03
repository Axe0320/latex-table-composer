const HEADER = ['Class', 'Precision', 'Recall', 'F1-Score', 'Support']

export function parseClassificationReport(text: string): string[][] {
  const lines = text.split('\n')

  // Find the header line (contains "precision" and "recall")
  const headerIdx = lines.findIndex(
    (l) => /precision/i.test(l) && /recall/i.test(l)
  )
  if (headerIdx === -1) return []

  const rows: string[][] = [HEADER]

  for (const line of lines.slice(headerIdx + 1)) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const parsed = extractRow(trimmed)
    if (!parsed) continue

    rows.push(parsed)
  }

  return rows.length > 1 ? rows : []
}

// Extract label + numeric values from a single report line.
// Normal row:  "cat  0.50  0.50  0.50  2"   → ['cat','0.50','0.50','0.50','2']
// Accuracy:    "accuracy  0.57  7"           → ['accuracy','','','0.57','7']
// Avg row:     "macro avg  0.50  0.39  0.43  7" → ['macro avg','0.50','0.39','0.43','7']
function extractRow(line: string): string[] | null {
  const firstNumIdx = line.search(/\d/)
  if (firstNumIdx === -1) return null

  const label = line.slice(0, firstNumIdx).trim()
  if (!label) return null

  const numbers = (line.slice(firstNumIdx).match(/\d+\.?\d*/g) ?? [])

  // Normal row: 4 values (precision, recall, f1, support)
  if (numbers.length === 4) {
    return [label, ...numbers]
  }

  // Accuracy row: only f1-score and support
  if (numbers.length === 2) {
    return [label, '', '', numbers[0]!, numbers[1]!]
  }

  // Unexpected number count — skip
  return null
}
