/**
 * Normalize stored date formats (mm/dd/yyyy or ISO) to yyyy-mm-dd for <input type="date">
 * @param {string|Date} v - The date value to normalize
 * @returns {string} - Normalized date string in yyyy-mm-dd format
 */
export function normalizeDateForInput(v) {
  if (!v) return ''
  if (typeof v !== 'string') return ''
  // if already ISO like 2024-02-09 or has T for datetime
  if (v.includes('T')) return v.split('T')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  // handle mm/dd/yyyy
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v)) {
    const [m, d, y] = v.split('/')
    const mm = m.padStart(2, '0')
    const dd = d.padStart(2, '0')
    return `${y}-${mm}-${dd}`
  }
  return ''
}
