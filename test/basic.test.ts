import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

const scriptTags = (html: string) =>
  [...html.matchAll(/<script\b[^>]*>/g)].map(m => m[0])

describe('server rendering', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the page with the composable safe on the server', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('initialised: false')
    expect(html).toContain('status: none')
    expect(html).toContain('allowed: false')
    expect(html).toContain('consented: undefined')
  })

  it('does not inject the CookieHub loader during SSR', async () => {
    const html = await $fetch<string>('/')
    expect(html).not.toContain('id="CookieHub"')
    expect(html).not.toContain('cdn.cookiehub.eu')
  })

  it('exposes the module options to the client through public runtime config', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('TEST-DOMAIN-ID')
    expect(html).toContain('a.example')
    expect(html).toContain('customOption')
  })

  it('renders consent-blocked scripts into <head> with the CookieHub contract', async () => {
    const html = await $fetch<string>('/')
    const blocked = scriptTags(html).filter(tag => tag.includes('type="text/plain"'))

    // GA loader + GA bootstrap + Pixel + custom external + custom inline
    expect(blocked).toHaveLength(5)
    for (const tag of blocked) {
      expect(tag).toMatch(/data-consent="(analytics|marketing|preferences|necessary)"/)
      // A blocked external script must never carry a real src attribute.
      expect(tag).not.toMatch(/\ssrc=/)
    }

    const gaLoader = blocked.find(tag => tag.includes('googletagmanager.com/gtag/js?id=G-TEST123'))
    expect(gaLoader).toBeDefined()
    expect(gaLoader).toContain('data-consent="analytics"')
    expect(gaLoader).toContain('data-src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"')

    const custom = blocked.find(tag => tag.includes('id="custom-script"'))
    expect(custom).toBeDefined()
    expect(custom).toContain('data-consent="preferences"')
    expect(custom).toContain('data-src="https://example.com/custom.js"')

    expect(html).toContain('gtag(\'config\', \'G-TEST123\')')
    expect(html).toContain('fbq(\'init\', \'987654321\')')
    expect(html).toContain('console.log(\'inline preferences script\')')

    // Everything blocked lives in <head>, before <body>.
    const head = html.slice(0, html.indexOf('<body'))
    expect(scriptTags(head).filter(tag => tag.includes('type="text/plain"'))).toHaveLength(5)
  })

  it('renders the YouTube embed through youtube-nocookie.com', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"')
    expect(html).toContain('width="560"')
    expect(html).toContain('height="315"')
    expect(html).not.toContain('www.youtube.com/embed')
  })
})
