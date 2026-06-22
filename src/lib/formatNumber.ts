const enFormatter = new Intl.NumberFormat('en-US')

/** Western digits (0-9) for any numeric display */
export function enNum(value: number): string {
  return enFormatter.format(value)
}

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'

/** Replace Arabic-Indic digits with Western digits in text */
export function toEnDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)))
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('ar-KW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  })
}
