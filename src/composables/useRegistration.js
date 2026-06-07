import { reactive, provide, inject } from 'vue'

const REGISTRATION_KEY = Symbol('registration')

/**
 * Call once at the root (IndexPage) to create and provide registration state.
 * @returns {import('vue').Reactive} registration state
 */
export function provideRegistration() {
  const state = reactive({
    currentStep: 1,
    attendee: {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      shippingAddress: '',
    },
    ticketType: 'general',
    selectedSessionIds: [],
    /** @type {Record<string, { quantity: number, size: string|null }>} */
    selectedAddons: {},
    submitted: false,
    validationTriggered: false,
  })

  provide(REGISTRATION_KEY, state)
  return state
}

/**
 * Inject registration state. Must be called inside a component tree that has called provideRegistration().
 * @returns {import('vue').Reactive} registration state
 */
export function useRegistration() {
  const state = inject(REGISTRATION_KEY)
  if (!state) throw new Error('useRegistration must be called inside a component with provideRegistration()')
  return state
}
