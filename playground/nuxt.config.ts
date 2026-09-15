export default defineNuxtConfig({
  modules: ['nuxt-cookiehub'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  cookiehub: {
    // Set COOKIEHUB_DOMAIN_ID to a real domain code to see the live dialog.
    // The placeholder produces a visible, actionable CDN error instead.
    domainId: process.env.COOKIEHUB_DOMAIN_ID || 'TEST-DOMAIN-ID',
    debug: true,
  },
})
