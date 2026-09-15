# nuxt-cookiehub

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt module for the [CookieHub](https://www.cookiehub.com) consent platform.

- Loads the CookieHub consent dialog from `nuxt.config.ts`. No code to remember, nothing to get wrong.
- `useCookieHub()` composable with reactive consent state and the full CookieHub API.
- `<CookieHubScript>`, `<CookieHubGA>`, `<CookieHubPixel>` and `<CookieHubYoutube>` components that hold scripts and embeds back until the user consents.
- Nuxt runtime hooks for consent events.
- Safe under server-side rendering and static generation. The loader only ever runs in the browser.

Built on [`cookiehub-js`](https://github.com/cookiehub-com/cookiehub-js), the shared loader used by CookieHub's framework packages.

## Quick setup

```bash
npx nuxt module add nuxt-cookiehub
```

Then add your domain code from the CookieHub dashboard:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-cookiehub'],
  cookiehub: {
    domainId: 'YOUR-DOMAIN-CODE',
  },
})
```

That is the whole integration. The consent dialog loads on every page.

## Configuration

All options live under the `cookiehub` key in `nuxt.config.ts`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `domainId` | `string` | `''` | Your domain code from the CookieHub dashboard. Required. |
| `enabled` | `boolean` | `true` | Set to `false` to skip loading CookieHub, for example in development. |
| `debug` | `boolean` | `false` | Log the loader's diagnostics to the browser console. |
| `linker` | `string[]` | | Domains that share consent state with this one. |
| `options` | `object` | `{}` | Any other serialisable option accepted by `cookiehub.load()`, forwarded as-is. |

Options are exposed through public runtime config, so every one of them can be overridden at runtime with an environment variable, without a rebuild:

```bash
NUXT_PUBLIC_COOKIEHUB_DOMAIN_ID=YOUR-DOMAIN-CODE
NUXT_PUBLIC_COOKIEHUB_ENABLED=false
```

If `domainId` is missing, the module warns at build time and the dialog is not loaded.

Callbacks cannot be set in `nuxt.config.ts` because it has to be serialisable. Use the [hooks](#hooks) instead.

## `useCookieHub()`

Available everywhere in your app without an import.

```vue
<script setup lang="ts">
const { initialised, status, isAllowed, openSettings } = useCookieHub()
</script>

<template>
  <button @click="openSettings()">Cookie settings</button>
  <AnalyticsWidget v-if="isAllowed('analytics')" />
</template>
```

### Reactive state

| Property | Type | Description |
| --- | --- | --- |
| `initialised` | `ComputedRef<boolean>` | `true` once CookieHub has loaded and initialised in the browser. |
| `status` | `ComputedRef<CookieHubStatus \| undefined>` | A snapshot of CookieHub's consent status: `answered`, `allAllowed`, `categories` (allowed category ids), `revision`, `timestamp` and more. Updated on every status change. |
| `isAllowed(category)` | `(category: string) => boolean` | Reactive check for a category. `false` until initialised, then re-evaluates on every allow, revoke and status change. Use it in templates and computed properties. |

### API wrappers

These call the method of the same name on CookieHub. Before the loader has run, and during server rendering, they return `undefined` and do nothing, so they are safe to call anywhere.

| Method | Description |
| --- | --- |
| `hasAnswered()` | Whether the user has allowed all or saved settings. |
| `hasConsented(category)` | One-off, non-reactive check for a category name or id. Prefer `isAllowed()` in templates. |
| `openDialog()` | Opens the consent dialog shown on first visit. |
| `closeDialog()` | Closes it. |
| `openSettings()` | Opens the settings dialog. Use this for a custom "Cookie settings" link. |
| `closeSettings()` | Closes it. |
| `allowAll()` | Allows every category. |
| `denyAll()` | Denies every category. |
| `load(options)` | Calls `cookiehub.load()` again with new options. |

## Hooks

The module emits Nuxt runtime hooks on the client. Listen from any plugin:

```ts
// plugins/consent.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('cookiehub:allow', (category) => {
    if (category === 'analytics') startAnalytics()
  })
})
```

| Hook | Arguments | When |
| --- | --- | --- |
| `cookiehub:initialise` | `(status: CookieHubStatus)` | CookieHub has loaded and initialised. |
| `cookiehub:statusChange` | `(status: CookieHubStatus, previousStatus: CookieHubStatus)` | The user's consent status changed. Both arguments are snapshots, safe to compare. |
| `cookiehub:allow` | `(category)` | The user allowed a category. |
| `cookiehub:revoke` | `(category)` | The user revoked a category. |

## Components

All components are auto-imported. The script components render nothing where they are placed. They add a consent-blocked `<script>` to `<head>` through Nuxt's head manager, so they work under server rendering and static generation.

CookieHub holds a script back when it is written as `<script type="text/plain" data-consent="category">`, with an external URL moved to `data-src` or the code left inline. When the user consents to that category, CookieHub activates it.

Categories are `analytics`, `marketing`, `preferences` and `necessary`.

### `<CookieHubScript>`

Any script, external or inline. Give it `src` or `inner-html`, not both.

```vue
<CookieHubScript src="https://example.com/chat-widget.js" category="preferences" />

<CookieHubScript
  inner-html="window.hotjar = { id: 12345 }"
  category="analytics"
/>
```

| Prop | Type | Description |
| --- | --- | --- |
| `category` | `ConsentCategory` | Required. The category that unlocks the script. |
| `src` | `string` | URL of an external script. |
| `inner-html` | `string` | Inline script body. |
| `id` | `string` | Optional `id` attribute. |

### `<CookieHubGA>`

Google Analytics (gtag.js) in the `analytics` category. Renders the gtag loader and the inline bootstrap.

```vue
<CookieHubGA tracking-id="G-XXXXXXXXXX" />
```

### `<CookieHubPixel>`

Facebook (Meta) Pixel in the `marketing` category.

```vue
<CookieHubPixel pixel-id="123456789012345" />
```

### `<CookieHubYoutube>`

Embeds a YouTube video through `youtube-nocookie.com`, which sets no tracking cookies until the visitor presses play. Accepts a video id or any YouTube URL. Renders nothing if no id can be found.

```vue
<CookieHubYoutube video-id="dQw4w9WgXcQ" />
<CookieHubYoutube url="https://youtu.be/dQw4w9WgXcQ" :width="640" :height="360" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `video-id` | `string` | | The 11-character video id. |
| `url` | `string` | | A watch, share, embed or youtu.be URL to extract the id from. |
| `width` | `number \| string` | `560` | |
| `height` | `number \| string` | `315` | |

## Server rendering and static generation

Nothing in this module touches `window` or `document` on the server. The loader is a client-only plugin, the composable returns `undefined` from every API wrapper and `false` from `isAllowed()` during SSR, and the components write into `<head>` through Nuxt's head manager. `nuxt build`, `nuxt generate` and `nuxt dev` all behave the same way.

## Troubleshooting

**Nothing appears and there is no error.** Check that `cookiehub.domainId` is set. With `debug: true` the module says so in the console.

**"CookieHub: Failed to load https://cdn.cookiehub.eu/c2/....js".** The domain code is wrong, or the request is being blocked by an ad blocker or a Content Security Policy. Allow `cdn.cookiehub.eu` in your CSP.

**"CookieHub: ... loaded but did not define window.cookiehub".** The script loaded but was not CookieHub's. This usually means a proxy or service worker is rewriting the response.

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  npm install

  # Generate type stubs
  npm run dev:prepare

  # Develop with the playground
  npm run dev

  # Build the playground
  npm run dev:build

  # Run ESLint
  npm run lint

  # Run Vitest
  npm run test
  npm run test:watch

  # Release new version
  npm run release
  ```

  The playground uses a placeholder domain id that fails to load on purpose, so the actionable error path is visible. Set `COOKIEHUB_DOMAIN_ID` to a real domain code to see the live dialog.

</details>

## License

ISC

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-cookiehub/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-cookiehub

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-cookiehub.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-cookiehub

[license-src]: https://img.shields.io/npm/l/nuxt-cookiehub.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-cookiehub

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
