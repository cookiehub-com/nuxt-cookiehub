import { defineNuxtModule, addPlugin, addImports, addComponentsDir, createResolver, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import type { HookResult } from '@nuxt/schema'
import type { CookieHubStatus } from 'cookiehub-js'
import type { ResolvedModuleOptions } from './runtime/types'

export interface ModuleOptions {
  /**
   * Your domain code from the CookieHub dashboard. Required for the consent
   * dialog to load. Can also be set at runtime with the
   * `NUXT_PUBLIC_COOKIEHUB_DOMAIN_ID` environment variable.
   */
  domainId?: string
  /**
   * Set to `false` to skip loading CookieHub entirely, for example in
   * development or preview environments.
   * @default true
   */
  enabled?: boolean
  /**
   * Log the loader's own diagnostics to the browser console. Not forwarded to
   * CookieHub.
   * @default false
   */
  debug?: boolean
  /**
   * Domains that share consent state with this one.
   */
  linker?: string[]
  /**
   * Any other serialisable option accepted by `cookiehub.load()`, forwarded
   * as-is. Callbacks cannot be configured here; listen to the `cookiehub:*`
   * Nuxt hooks instead.
   */
  options?: Record<string, unknown>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-cookiehub',
    configKey: 'cookiehub',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    domainId: '',
    enabled: true,
    debug: false,
    options: {},
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const logger = useLogger('nuxt-cookiehub')

    const resolved: ResolvedModuleOptions = {
      domainId: options.domainId ?? '',
      enabled: options.enabled !== false,
      debug: options.debug === true,
      // Omitted rather than undefined: Nuxt serialises undefined runtime
      // config values as empty strings.
      ...(options.linker?.length ? { linker: options.linker } : {}),
      options: options.options ?? {},
    }

    if (resolved.enabled && !resolved.domainId && !process.env.NUXT_PUBLIC_COOKIEHUB_DOMAIN_ID) {
      logger.warn('`cookiehub.domainId` is not set. The consent dialog will not be loaded.')
    }

    // Public runtime config so the client plugin can read it, and so
    // `NUXT_PUBLIC_COOKIEHUB_*` environment variables can override it at runtime.
    nuxt.options.runtimeConfig.public.cookiehub = defu(
      nuxt.options.runtimeConfig.public.cookiehub as Partial<ResolvedModuleOptions> | undefined,
      resolved,
    )

    // The loader only ever runs in the browser. Nothing is registered on the
    // server, so SSR and static generation never touch window or document.
    addPlugin({ src: resolver.resolve('./runtime/plugin.client'), mode: 'client' })

    addImports({
      name: 'useCookieHub',
      from: resolver.resolve('./runtime/composables/useCookieHub'),
    })

    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      pathPrefix: false,
    })
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    cookiehub: ResolvedModuleOptions
  }
}

declare module '#app' {
  interface RuntimeNuxtHooks {
    /** CookieHub has initialised. `status` is a snapshot of the current consent status. */
    'cookiehub:initialise': (status: CookieHubStatus) => HookResult
    /** The user's consent status changed. Both arguments are snapshots. */
    'cookiehub:statusChange': (status: CookieHubStatus, previousStatus: CookieHubStatus) => HookResult
    /** The user allowed a cookie category. */
    'cookiehub:allow': (category: string) => HookResult
    /** The user revoked a cookie category. */
    'cookiehub:revoke': (category: string) => HookResult
  }
}
