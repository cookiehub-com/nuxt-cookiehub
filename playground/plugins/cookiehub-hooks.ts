// Demonstrates the runtime hooks the module emits. Register listeners in any
// plugin; they fire on the client once CookieHub has loaded.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('cookiehub:initialise', (status) => {
    console.log('[playground] cookiehub:initialise', status)
  })
  nuxtApp.hook('cookiehub:statusChange', (status, previous) => {
    console.log('[playground] cookiehub:statusChange', previous, '->', status)
  })
  nuxtApp.hook('cookiehub:allow', (category) => {
    console.log('[playground] cookiehub:allow', category)
  })
  nuxtApp.hook('cookiehub:revoke', (category) => {
    console.log('[playground] cookiehub:revoke', category)
  })
})
