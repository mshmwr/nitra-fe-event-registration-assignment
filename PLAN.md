# PLAN.md — Event Registration Wizard

## How I Planned and Broke Down the Task

After reading both the spec doc and the repo README, I identified four concrete layers of work and sequenced them dependency-first:

1. **State & logic layer** (composables) — the foundation everything else reads from
2. **Shared UI components** — reusable building blocks each step needs
3. **Step views** — the four wizard screens
4. **Wizard shell** — stepper nav, transitions, success screen, and the validation orchestration layer

The spec's four evaluation dimensions (Vue Patterns, Design Fidelity, Code Quality, JS Logic) were mapped to concrete deliverables:

| Criterion | Implementation |
|-----------|----------------|
| Vue Patterns | `provide/inject` for cross-step state; `computed` for all derived values; `defineModel()` macro (Vue 3.4+) for all two-way input bindings (`FormField`, `QuantityPicker`, `TabSwitcher`) |
| Design Fidelity | Semantic CSS tokens throughout; zero hardcoded hex in `.vue` files — verified by grep; interactive states (hover/active) on CTA button use corresponding token tiers (`--bg-accent-emphasis-hover/active`) |
| Code Quality | JSDoc on all non-obvious functions; one composable per concern; `src/components/steps/` separate from shared components |
| JS Logic | Proper half-open interval overlap check for conflicts; floating-point-safe pricing with `Math.round(...*100)/100` |

---

## Key Decisions

### Cross-step state: `provide/inject` composable

Rather than Pinia or Vuex, I used a single `provideRegistration()` called at the wizard root, exposing a `reactive()` object via `provide`. Steps call `useRegistration()` to inject it. This keeps the state local to the wizard (not global store), is idiomatic Vue 3, and matches the evaluation rubric's preference for composables over centralized store plugins.

### Validation: deferred + unified

All field validation runs only after the first submit attempt (`validationTriggered` flag). Before that, no red borders appear — this avoids "screaming at the user before they've had a chance to fill anything." On submit, `useValidation` computes per-step error maps; the `stepHasErrors` computed shows error indicators on the stepper nav. Users can click directly on a flagged step to jump back and fix it.

### Time conflict detection: `hasTimeOverlap(s1, e1, s2, e2)`

Half-open interval overlap: `start1 < end2 && start2 < end1`. This correctly handles:
- Exactly touching intervals (e.g. 10:00–11:00 and 11:00–12:00) → not a conflict
- Partial overlaps in both directions
- One session fully inside another

Sessions are allowed to be selected even when conflicting; the error only blocks submission, matching the spec's "users may freely select, conflicts flagged at Step 4" requirement.

### Workshop conflict vs. session conflict

Two separate concepts:
- **Session–session conflicts**: shown with a warning badge on SessionCard; blocks submission
- **Workshop–session conflicts**: shown on AddonItem; the workshop is marked unavailable (disabled) since there's no recovery path for a paid workshop that overlaps a free session you've already chosen

### Pricing: computed, not watched

`usePricing` is a pure composable that derives the order total from the current state via `computed`. No `watch` calls, no manual sync — the total is always correct and updates reactively. VIP discount is applied per-line-item inside the computed, not as a post-processing step.

### VIP discount display: single source of truth

`workshopUnitPrice(addon, isVip)` is a named export from `usePricing.js` that returns the effective unit price for an addon. `AddonItem` imports this function directly so the price shown on the card is always computed by the same logic as the order total — no risk of the card showing `$149` while the pricing summary calculates `$134.10`. When `isVip` is true and the addon is a workshop, `AddonItem` also renders the original price struck through alongside a "VIP -10%" badge.

### Step navigation UX: scroll to top

A single `watch` on `state.currentStep` calls `window.scrollTo({ top: 0, behavior: 'smooth' })` on every step change. This covers all navigation paths (Next, Back, StepperNav click, Edit link from Review) without duplicating scroll logic in each handler.

---

## Additional Dependencies

**`vue-i18n` (^11.4.5)** — added for the i18n "nice to have". Rationale: it is the official, framework-standard internationalization library for Vue 3, integrates via a Quasar boot file, and supports the two features this wizard needs (named-argument interpolation for messages like `{count} spots left`, and ICU-style pluralization). Writing a hand-rolled message lookup would have re-implemented a subset of it with worse pluralization handling. Configured in Composition API mode (`legacy: false`) so `useI18n()` works inside `<script setup>` and composables; the chosen locale persists to `localStorage`.

No other runtime dependencies added. The starter repo (`Quasar 2.18.5`, `Vue 3.5.17`, `UnoCSS`) covers the rest:

- Date/time formatting: native `Intl.DateTimeFormat`, fed the active locale so dates localize alongside text (no date-fns needed)
- Transitions: Vue `<Transition>` built-in
- Form components: Quasar's `q-input`, `q-btn`, `q-select` (language switcher)

I deliberately avoided adding lodash or similar to keep the bundle minimal and because the data transformations required (groupBy, sort) are straightforward one-liners with native JS.

### i18n architecture

- `src/i18n/{en,zh-TW}.js` — message trees (mirrored keys); `src/i18n/index.js` exports `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `messages`.
- `src/boot/i18n.js` — creates the i18n instance, restores the saved locale, exposes `setLocale()` (persists to `localStorage`).
- All user-facing strings live in the message files; **zero** hardcoded UI copy remains in components. Validation messages are produced via `t()` inside `useValidation`, so error text localizes too.
- Ticket display copy (`label`/`perks`) moved out of `usePricing` into `tickets.*`; `usePricing` now holds numeric `TICKET_PRICES` only — a single source of truth per concern.

---

## How I Used AI Tools

This project was developed with Claude Code (Claude Sonnet 4.6) as the primary AI collaborator.

**What worked well:**
- Generating the composable skeletons with correct Vue 3 reactivity patterns (avoiding stale ref pitfalls)
- Writing JSDoc annotations and consistent naming conventions
- Catching edge cases like the floating-point precision issue in VIP discount pricing (`0.9 * 149 = 134.1` but `Math.round(0.9 * 149 * 100) / 100 = 134.1` is fine; the guard matters for larger prices)

**Where I reviewed and corrected AI output:**
- Initial draft of `useConflicts` didn't handle the "touching but not overlapping" edge case correctly — I revised the overlap function to use strict `<` not `<=`
- The `AddonItem` component initially had the size selector outside the `v-if="isSelected"` guard, meaning size buttons appeared even for unselected items — caught and fixed before shipping

**Prompts that were particularly effective:**
- "Write a Vue 3 composable using provide/inject for cross-step wizard state, with a reactive object rather than individual refs" — produced clean, idiomatic code on first try
- "Implement time overlap detection as a pure function that handles touching intervals correctly" — immediately produced the correct `s1 < e2 && s2 < e1` form

---

## Challenges Encountered

**UnoCSS + Quasar in a Vite worktree:** The worktree didn't have `node_modules` (git worktrees don't copy them). Solved by symlinking the main repo's `node_modules` into the worktree.

**Headless screenshot font loading:** Material Icons font doesn't load in headless Chromium during CI screenshots, so icon ligatures render as text ("check", "arrow_back"). This is a test environment artifact — the font loads normally in a real browser.

---

## Nice-to-haves implemented

Both spec "nice to have" items were completed:

1. **i18n support** — `vue-i18n` wired in via boot file; English + Traditional Chinese, locale switcher in the header, choice persisted to `localStorage`, dates localized via the active locale. See *Additional Dependencies → i18n architecture* above.

2. **Responsive design** — all four steps always show their label in the stepper nav; pricing/summary rows guard against overflow with `min-w-0` + `whitespace-nowrap`, ticket cards stack single-column and the add-ons summary stacks below the list under the `lg` breakpoint.

## What I Would Improve Given More Time

1. **Mobile OrderSummary as a collapsible drawer** — it currently stacks below the add-ons list under `lg`; a sticky bottom-sheet would keep the running total visible while scrolling a long add-on list.

2. **Persist state to localStorage** — A `useRegistration` enhancement: watch the state and debounce-save to `localStorage` under a session key. On page reload, hydrate from it. Prevents data loss on accidental refresh.

3. **Animated step counter** — The connector lines between steps could fill in with a green animation as steps complete, giving a stronger "progress" feel.

4. **Keyboard navigation audit** — The custom ticket cards and session cards use `role="radio"` / `role="checkbox"` with `keydown.enter.space` handlers, but a full ARIA review (focus management across step transitions, focus trap review) would be needed for production.
