import { computed } from 'vue'
import {
  load,
  hasAnswered,
  hasConsented,
  openDialog,
  closeDialog,
  openSettings,
  closeSettings,
  allowAll,
  denyAll,
} from 'cookiehub-js'
import { useState } from '#imports'
import { COOKIEHUB_STATE_KEY, initialCookieHubState } from '../types'
import type { CookieHubState } from '../types'

/**
 * Access CookieHub from components, composables and plugins.
 *
 * The method wrappers call straight through to the CookieHub API and are
 * safe to call at any time: before the loader has run, and during server
 * rendering, they return `undefined` and do nothing.
 *
 * `initialised`, `status` and `isAllowed()` are reactive and update when
 * CookieHub initialises or the user changes their consent.
 */
export function useCookieHub() {
  const state = useState<CookieHubState>(COOKIEHUB_STATE_KEY, initialCookieHubState)

  const initialised = computed(() => state.value.initialised)
  const status = computed(() => state.value.status)

  /**
   * Reactive check for a category. Returns `false` until CookieHub has
   * initialised, then tracks the user's choice. Use this in templates and
   * computed properties; use `hasConsented()` for a one-off imperative check.
   */
  const isAllowed = (category: string): boolean => {
    // Read the change counter so callers re-evaluate on every CookieHub event.
    if (!state.value.initialised) {
      return false
    }
    void state.value.changes
    return hasConsented(category) === true
  }

  return {
    initialised,
    status,
    isAllowed,
    load,
    hasAnswered,
    hasConsented,
    openDialog,
    closeDialog,
    openSettings,
    closeSettings,
    allowAll,
    denyAll,
  }
}
