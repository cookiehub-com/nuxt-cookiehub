import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('with enabled: false', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    nuxtConfig: {
      cookiehub: {
        enabled: false,
      },
    },
  })

  it('still renders components and composable without the loader', async () => {
    const html = await $fetch<string>('/')
    // Runtime config is serialised by devalue, so keys are unquoted.
    expect(html).toMatch(/cookiehub:\{[^}]*enabled:false/)
    expect(html).toContain('allowed: false')
    expect(html).toContain('data-consent="analytics"')
    expect(html).not.toContain('cdn.cookiehub.eu')
  })
})
