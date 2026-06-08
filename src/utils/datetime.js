const DATE_OPTS = { month: 'short', day: 'numeric', timeZone: 'UTC' }
const TIME_OPTS = { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }

/** @param {string} iso @param {string} locale */
export function formatDate(iso, locale) {
  return new Date(iso).toLocaleDateString(locale, DATE_OPTS)
}

/** @param {string} iso @param {string} locale */
export function formatTime(iso, locale) {
  return new Date(iso).toLocaleTimeString(locale, TIME_OPTS)
}

/** @param {string} iso @param {string} locale */
export function formatDateTime(iso, locale) {
  const d = new Date(iso)
  return `${d.toLocaleDateString(locale, DATE_OPTS)}, ${d.toLocaleTimeString(locale, TIME_OPTS)}`
}

/** @param {string} start @param {string} end @param {string} locale */
export function formatTimeRange(start, end, locale) {
  const s = new Date(start)
  return `${s.toLocaleDateString(locale, DATE_OPTS)}, ${s.toLocaleTimeString(locale, TIME_OPTS)} – ${new Date(end).toLocaleTimeString(locale, TIME_OPTS)}`
}
