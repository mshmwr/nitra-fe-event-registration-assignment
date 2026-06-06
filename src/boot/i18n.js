import { createI18n } from 'vue-i18n'
import { messages, DEFAULT_LOCALE } from 'src/i18n/index.js'

const STORAGE_KEY = 'webdev-summit-locale'

/** Restore the user's last choice, falling back to the default locale. */
function initialLocale() {
  const saved = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)
  return saved && messages[saved] ? saved : DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false, // Composition API mode — enables useI18n()
  locale: initialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})

/** Switch locale and persist the choice. */
export function setLocale(locale) {
  if (!messages[locale]) return
  i18n.global.locale.value = locale
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, locale)
}

export default ({ app }) => {
  app.use(i18n)
}
