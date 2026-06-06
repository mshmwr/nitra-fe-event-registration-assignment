import { computed } from 'vue'
import { addons } from 'src/mocks/addons.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Lookahead requires at least one digit — prevents "  -  - " (no digits) from passing
const PHONE_RE = /^\+?(?=.*\d)[\d\s\-().]{7,20}$/

/**
 * Unified cross-step validation. All rules run on every submit attempt.
 * @param {import('vue').Reactive} state - registration state from provideRegistration
 * @param {import('vue').ComputedRef<Set<string>>} conflictingSessionIds
 */
export function useValidation(state, conflictingSessionIds) {
  const hasMerchandise = computed(() =>
    Object.keys(state.selectedAddons).some(id => {
      const addon = addons.find(a => a.id === id)
      return addon?.category === 'merchandise'
    })
  )

  /** @type {import('vue').ComputedRef<Record<string, string>>} */
  const step1Errors = computed(() => {
    const errs = {}
    if (!state.attendee.name.trim()) errs.name = 'Full name is required'
    if (!state.attendee.email.trim()) errs.email = 'Email is required'
    else if (!EMAIL_RE.test(state.attendee.email)) errs.email = 'Invalid email format'
    if (!state.attendee.phone.trim()) errs.phone = 'Phone is required'
    else if (!PHONE_RE.test(state.attendee.phone)) errs.phone = 'Invalid phone format'
    if (!state.attendee.company.trim()) errs.company = 'Company is required'
    if (!state.attendee.jobTitle.trim()) errs.jobTitle = 'Job title is required'
    if (hasMerchandise.value && !state.attendee.shippingAddress.trim()) {
      errs.shippingAddress = 'Shipping address is required when merchandise is selected'
    }
    return errs
  })

  /** @type {import('vue').ComputedRef<Record<string, string>>} */
  const step2Errors = computed(() => {
    const errs = {}
    if (conflictingSessionIds.value.size > 0) {
      errs.conflicts = 'You have sessions with time conflicts. Please resolve them before submitting.'
    }
    return errs
  })

  /**
   * Step 3 indicator: shipping address is in Step 1 but triggered by Step 3 merchandise selection.
   * Marking Step 3 lets the user understand which step caused the Step 1 error.
   * @type {import('vue').ComputedRef<Record<string, string>>}
   */
  const step3Errors = computed(() => {
    const errs = {}
    if (hasMerchandise.value && !state.attendee.shippingAddress.trim()) {
      errs.shippingAddress = 'Shipping address is required. Please fill it in Step 1.'
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

  const isValid = computed(() => !hasStep1Errors.value && !hasStep2Errors.value)

  return { step1Errors, step2Errors, step3Errors, stepHasErrors, isValid, hasMerchandise }
}
