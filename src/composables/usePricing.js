import { computed, provide, inject } from 'vue'
import { addons } from 'src/mocks/addons.js'

export const PRICING_KEY = Symbol('pricing')

// Numeric prices only. Display label/perks live in i18n message files (tickets.*).
export const TICKET_PRICES = { general: 299, vip: 599, student: 99 }

// Ticket tier order for rendering the selection cards.
export const TICKET_TYPES = ['general', 'vip', 'student']

/**
 * Effective unit price for an addon: applies VIP 10% discount to workshops.
 * Single source of truth — used by both AddonItem display and usePricing calculations.
 * @param {Object} addon
 * @param {boolean} isVip
 * @returns {number}
 */
export function workshopUnitPrice(addon, isVip) {
  if (addon.category === 'workshop' && isVip) {
    return Math.round(addon.price * 0.9 * 100) / 100
  }
  return addon.price
}

/**
 * Format a number as $X,XXX.XX currency string.
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Compute live pricing from ticket type and selected addons.
 * @param {import('vue').Ref<string>} ticketTypeRef
 * @param {import('vue').Ref<Record<string, { quantity: number, size: string|null }>>} selectedAddonsRef
 */
export function usePricing(ticketTypeRef, selectedAddonsRef) {
  const ticketPrice = computed(() => TICKET_PRICES[ticketTypeRef.value] ?? 0)

  /**
   * Line items for all selected addons with VIP discount applied to workshops.
   * @type {import('vue').ComputedRef<Array<{ id: string, name: string, category: string, unitPrice: number, quantity: number, subtotal: number, size: string|null }>>}
   */
  const addonLineItems = computed(() => {
    const isVip = ticketTypeRef.value === 'vip'
    return Object.entries(selectedAddonsRef.value).flatMap(([id, selection]) => {
      const addon = addons.find(a => a.id === id)
      if (!addon) return []
      const quantity = selection.quantity ?? 1
      const unitPrice = workshopUnitPrice(addon, isVip)
      return [{
        id,
        name: addon.name,
        category: addon.category,
        unitPrice,
        quantity,
        subtotal: Math.round(addon.price * quantity * 100) / 100,
        size: selection.size ?? null,
      }]
    })
  })

  const vipWorkshopDiscount = computed(() => {
    const isVip = ticketTypeRef.value === 'vip'
    return Math.round(
      Object.entries(selectedAddonsRef.value).reduce((sum, [id, sel]) => {
        const addon = addons.find(a => a.id === id)
        if (!addon || addon.category !== 'workshop') return sum
        return sum + (addon.price - workshopUnitPrice(addon, isVip)) * (sel.quantity ?? 1)
      }, 0) * 100
    ) / 100
  })

  const addonsTotal = computed(() =>
    Math.round((addonLineItems.value.reduce((sum, item) => sum + item.subtotal, 0) - vipWorkshopDiscount.value) * 100) / 100
  )

  const total = computed(() =>
    Math.round((ticketPrice.value + addonsTotal.value) * 100) / 100
  )

  return { ticketPrice, addonLineItems, vipWorkshopDiscount, addonsTotal, total }
}

/**
 * Call once in the wizard root to compute pricing and share it downward via provide/inject.
 * @param {import('vue').Ref<string>} ticketTypeRef
 * @param {import('vue').Ref<Record<string, { quantity: number, size: string|null }>>} selectedAddonsRef
 */
export function providePricing(ticketTypeRef, selectedAddonsRef) {
  const pricing = usePricing(ticketTypeRef, selectedAddonsRef)
  provide(PRICING_KEY, pricing)
  return pricing
}

/**
 * Inject the pricing computed refs provided by the wizard root.
 * Must be used inside a component descended from RegistrationWizard.
 */
export function usePricingInjected() {
  const pricing = inject(PRICING_KEY)
  if (!pricing) throw new Error('usePricingInjected must be used within a component that calls providePricing()')
  return pricing
}
