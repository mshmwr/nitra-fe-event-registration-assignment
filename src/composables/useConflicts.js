import { computed } from 'vue'
import { sessions } from 'src/mocks/sessions.js'
import { addons } from 'src/mocks/addons.js'

/**
 * Check if two half-open time ranges overlap.
 * @param {string} s1 ISO date start
 * @param {string} e1 ISO date end
 * @param {string} s2 ISO date start
 * @param {string} e2 ISO date end
 * @returns {boolean}
 */
export function hasTimeOverlap(s1, e1, s2, e2) {
  return new Date(s1) < new Date(e2) && new Date(s2) < new Date(e1)
}

/**
 * Provides conflict detection for sessions and workshop overlap checks.
 * @param {import('vue').Ref<string[]>} selectedSessionIds
 * @param {import('vue').Ref<Record<string, object>>} [selectedAddons] - optional; enables conflictingWorkshopIds
 */
export function useConflicts(selectedSessionIds, selectedAddons = null) {
  /** Cached list of selected session objects, shared across conflict checks. */
  const selectedSessions = computed(() =>
    sessions.filter(s => selectedSessionIds.value.includes(s.id))
  )

  /**
   * Set of session IDs that conflict with at least one other selected session.
   * @type {import('vue').ComputedRef<Set<string>>}
   */
  const conflictingSessionIds = computed(() => {
    const selected = selectedSessions.value
    const conflicts = new Set()
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const a = selected[i]
        const b = selected[j]
        if (hasTimeOverlap(a.date, a.endDate, b.date, b.endDate)) {
          conflicts.add(a.id)
          conflicts.add(b.id)
        }
      }
    }
    return conflicts
  })

  /**
   * Whether a workshop's time slot overlaps with any currently selected session.
   * @param {{ date: string, endDate: string }} workshop
   * @returns {boolean}
   */
  function workshopConflictsWithSessions(workshop) {
    return selectedSessions.value.some(s => hasTimeOverlap(s.date, s.endDate, workshop.date, workshop.endDate))
  }

  /**
   * Set of currently-selected workshop addon IDs that overlap a selected session.
   * A previously-selected workshop can become conflicting after the user adds a
   * session in Step 2 — this set drives both validation and the removal prompt.
   * @type {import('vue').ComputedRef<Set<string>>}
   */
  const conflictingWorkshopIds = computed(() => {
    const conflicts = new Set()
    if (!selectedAddons) return conflicts
    for (const id of Object.keys(selectedAddons.value)) {
      const addon = addons.find(a => a.id === id)
      if (addon?.category === 'workshop' && workshopConflictsWithSessions(addon)) {
        conflicts.add(id)
      }
    }
    return conflicts
  })

  return { conflictingSessionIds, workshopConflictsWithSessions, conflictingWorkshopIds }
}
