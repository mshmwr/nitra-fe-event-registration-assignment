import { computed } from 'vue'
import { addons } from 'src/mocks/addons.js'

export const TICKET_PRICES = { general: 299, vip: 599, student: 99 }

export const TICKET_INFO = {
  general: {
    label: 'General',
    price: 299,
    perks: ['All sessions & keynotes', 'Conference lunch'],
  },
  vip: {
    label: 'VIP',
    price: 599,
    perks: ['All General perks', 'VIP lounge access', 'Speaker meet & greet', '10% off workshops'],
  },
  student: {
    label: 'Student',
    price: 99,
    perks: ['All sessions & keynotes'],
  },
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
  const addonLineItems = computed(() =>
    Object.entries(selectedAddonsRef.value).flatMap(([id, selection]) => {
      const addon = addons.find(a => a.id === id)
      if (!addon) return []
      let unitPrice = addon.price
      if (addon.category === 'workshop' && ticketTypeRef.value === 'vip') {
        unitPrice = Math.round(unitPrice * 0.9 * 100) / 100
      }
      const quantity = selection.quantity ?? 1
      return [{
        id,
        name: addon.name,
        category: addon.category,
        unitPrice,
        quantity,
        subtotal: Math.round(unitPrice * quantity * 100) / 100,
        size: selection.size ?? null,
      }]
    })
  )

  const addonsTotal = computed(() =>
    Math.round(addonLineItems.value.reduce((sum, item) => sum + item.subtotal, 0) * 100) / 100
  )

  const total = computed(() =>
    Math.round((ticketPrice.value + addonsTotal.value) * 100) / 100
  )

  return { ticketPrice, addonLineItems, addonsTotal, total }
}
