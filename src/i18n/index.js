import en from './en.js'
import zhTW from './zh-TW.js'

export const SUPPORTED_LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'zh-TW', label: '繁體中文' },
]

export const DEFAULT_LOCALE = 'en'

export const messages = {
  en,
  'zh-TW': zhTW,
}
