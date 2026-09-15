import type { CookieHubStatus } from 'cookiehub-js'

/** Module options after defaults have been applied, as stored in public runtime config. */
export interface ResolvedModuleOptions {
  domainId: string
  enabled: boolean
  debug: boolean
  linker?: string[]
  options: Record<string, unknown>
}

/** Reactive consent state shared between the client plugin and `useCookieHub()`. */
export interface CookieHubState {
  /** True once CookieHub has loaded and called its `onInitialise` callback. */
  initialised: boolean
  /** A snapshot of the consent status reported by CookieHub, or undefined before initialisation. */
  status?: CookieHubStatus
  /**
   * Incremented on every CookieHub event (initialise, status change, allow,
   * revoke). Read it to re-evaluate anything that depends on consent.
   */
  changes: number
}

export const COOKIEHUB_STATE_KEY = 'nuxt-cookiehub'

export const initialCookieHubState = (): CookieHubState => ({
  initialised: false,
  status: undefined,
  changes: 0,
})
