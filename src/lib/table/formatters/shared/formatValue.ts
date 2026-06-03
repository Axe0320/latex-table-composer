import type { FormattingOptions } from '../options'

export function formatValue(raw: string, opts: FormattingOptions): string {
  const trimmed = raw.trim()

  if (trimmed === '') {
    return opts.missingValue === 'blank' ? '' : opts.missingValue
  }

  if (opts.decimalPrecision !== 'auto') {
    const num = Number(trimmed)
    if (isFinite(num)) {
      return num.toFixed(opts.decimalPrecision)
    }
  }

  return trimmed
}
