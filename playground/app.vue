<script setup lang="ts">
const { initialised, status, isAllowed, openSettings, openDialog, allowAll, denyAll } = useCookieHub()
</script>

<template>
  <main style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;">
    <h1>nuxt-cookiehub playground</h1>

    <dl>
      <dt>initialised</dt>
      <dd id="initialised">
        {{ initialised }}
      </dd>
      <dt>answered</dt>
      <dd id="answered">
        {{ status?.answered ?? 'none' }}
      </dd>
      <dt>all allowed</dt>
      <dd id="all-allowed">
        {{ status?.allAllowed ?? 'none' }}
      </dd>
      <dt>analytics allowed</dt>
      <dd id="analytics">
        {{ isAllowed('analytics') }}
      </dd>
      <dt>marketing allowed</dt>
      <dd id="marketing">
        {{ isAllowed('marketing') }}
      </dd>
    </dl>

    <p>
      <button @click="openDialog()">
        Open dialog
      </button>
      <button @click="openSettings()">
        Open settings
      </button>
      <button @click="allowAll()">
        Allow all
      </button>
      <button @click="denyAll()">
        Deny all
      </button>
    </p>

    <CookieHubGA tracking-id="G-PLAYGROUND" />
    <CookieHubPixel pixel-id="000000000" />
    <CookieHubScript
      src="https://example.com/preferences.js"
      category="preferences"
    />

    <h2>Blocked YouTube embed</h2>
    <CookieHubYoutube url="https://youtu.be/dQw4w9WgXcQ" />
  </main>
</template>
