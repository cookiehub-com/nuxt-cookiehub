import { initialize } from 'cookiehub-js'
import type { CookieHubStatus } from 'cookiehub-js'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#app'
import { COOKIEHUB_STATE_KEY, initialCookieHubState } from './types'
import type { CookieHubState, ResolvedModuleOptions } from './types'

// CookieHub reuses and mutates one status object across callbacks. Storing
// the same reference again would not trigger Vue, so keep a copy instead.
const snapshot = (status: CookieHubStatus): CookieHubStatus =>
  JSON.parse(JSON.stringify(status))

export default defineNuxtPlugin({
  name: 'nuxt-cookiehub',
  setup(nuxtApp) {
    const config = useRuntimeConfig().public.cookiehub as ResolvedModuleOptions
    const state = useState<CookieHubState>(COOKIEHUB_STATE_KEY, initialCookieHubState)

    if (!config.enabled) {
      return
    }

    if (!config.domainId) {
      if (config.debug) {
        console.warn('[nuxt-cookiehub] `cookiehub.domainId` is not set. The consent dialog will not be loaded.')
      }
      return
    }

    const changed = () => {
      state.value.changes++
    }

    initialize(config.domainId, {
      ...config.options,
      debug: config.debug,
      ...(config.linker ? { linker: config.linker } : {}),
      onInitialise: (status) => {
        const current = snapshot(status)
        state.value.initialised = true
        state.value.status = current
        changed()
        nuxtApp.callHook('cookiehub:initialise', current)
      },
      onStatusChange: (status, previousStatus) => {
        const current = snapshot(status)
        const previous = snapshot(previousStatus)
        state.value.status = current
        changed()
        nuxtApp.callHook('cookiehub:statusChange', current, previous)
      },
      onAllow: (category) => {
        changed()
        nuxtApp.callHook('cookiehub:allow', category)
      },
      onRevoke: (category) => {
        changed()
        nuxtApp.callHook('cookiehub:revoke', category)
      },
    })
  },
})
