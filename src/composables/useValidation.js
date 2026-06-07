import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { addons } from 'src/mocks/addons.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Lookahead requires at least one digit — prevents "  -  - " (no digits) from passing
const PHONE_RE = /^\+?(?=.*\d)[\d\s\-().]{7,20}$/

/**
 * Unified cross-step validation. All rules run on every submit attempt.
 * @param {import('vue').Reactive} state - registration state from provideRegistration
 * @param {import('vue').ComputedRef<Set<string>>} conflictingSessionIds
 * @param {import('vue').ComputedRef<Set<string>>} [conflictingWorkshopIds] - selected workshops overlapping a session
 */
export function useValidation(state, conflictingSessionIds, conflictingWorkshopIds = null) {
  const { t } = useI18n()

  /** @type {import('vue').ComputedRef<boolean>} */
  const hasMerchandise = computed(() =>
    Object.keys(state.selectedAddons).some(id => {
      const addon = addons.find(a => a.id === id)
      return addon?.category === 'merchandise'
    })
  )

  /** @type {import('vue').ComputedRef<Record<string, string>>} */
  const step1Errors = computed(() => {
    const errs = {}
    if (!state.attendee.name.trim()) errs.name = t('validation.nameRequired')
    if (!state.attendee.email.trim()) errs.email = t('validation.emailRequired')
    else if (!EMAIL_RE.test(state.attendee.email)) errs.email = t('validation.emailInvalid')
    if (!state.attendee.phone.trim()) errs.phone = t('validation.phoneRequired')
    else if (!PHONE_RE.test(state.attendee.phone)) errs.phone = t('validation.phoneInvalid')
    if (!state.attendee.company.trim()) errs.company = t('validation.companyRequired')
    if (!state.attendee.jobTitle.trim()) errs.jobTitle = t('validation.jobTitleRequired')
    if (hasMerchandise.value && !state.attendee.shippingAddress.trim()) {
      errs.shippingAddress = t('validation.shippingRequiredStep1')
    }
    return errs
  })

  /** @type {import('vue').ComputedRef<Record<string, string>>} */
  const step2Errors = computed(() => {
    const errs = {}
    if (conflictingSessionIds.value.size > 0) {
      errs.conflicts = t('validation.sessionConflicts')
    }
    return errs
  })

  /** @type {import('vue').ComputedRef<Record<string, string>>} */
  const step3Errors = computed(() => {
    const errs = {}
    if (conflictingWorkshopIds && conflictingWorkshopIds.value.size > 0) {
      errs.workshopConflicts = t('validation.workshopConflicts')
    }
    return errs
  })

  const hasStep1Errors = computed(() => Object.keys(step1Errors.value).length > 0)
  const hasStep2Errors = computed(() => Object.keys(step2Errors.value).length > 0)
  const hasStep3Errors = computed(() => Object.keys(step3Errors.value).length > 0)

  /** @type {import('vue').ComputedRef<Record<number, boolean>>} */
  const stepHasErrors = computed(() => ({
    1: hasStep1Errors.value,
    2: hasStep2Errors.value,
    3: hasStep3Errors.value,
    4: false,
  }))

  /** @type {import('vue').ComputedRef<boolean>} */
  const isValid = computed(() =>
    !hasStep1Errors.value && !hasStep2Errors.value && !hasStep3Errors.value
  )

  return { step1Errors, step2Errors, step3Errors, stepHasErrors, isValid, hasMerchandise }
}
