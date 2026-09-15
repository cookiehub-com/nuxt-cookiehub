import NuxtCookieHub from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtCookieHub,
  ],
  cookiehub: {
    domainId: 'TEST-DOMAIN-ID',
    debug: true,
    linker: ['a.example', 'b.example'],
    options: {
      customOption: 42,
    },
  },
})
