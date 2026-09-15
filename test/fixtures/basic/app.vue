<script setup lang="ts">
const { initialised, status, isAllowed, hasConsented, openSettings } = useCookieHub()

// Called during SSR: must not throw and must be undefined on the server.
const consentedAtRender = String(hasConsented('analytics'))
</script>

<template>
  <div id="fixture">
    <p id="initialised">
      initialised: {{ initialised }}
    </p>
    <p id="status">
      status: {{ status ? (status.answered ? 'answered' : 'unanswered') : 'none' }}
    </p>
    <p id="allowed">
      allowed: {{ isAllowed('analytics') }}
    </p>
    <p id="consented">
      consented: {{ consentedAtRender }}
    </p>
    <button
      id="open-settings"
      @click="openSettings()"
    >
      Cookie settings
    </button>

    <CookieHubGA tracking-id="G-TEST123" />
    <CookieHubPixel pixel-id="987654321" />
    <CookieHubScript
      id="custom-script"
      src="https://example.com/custom.js"
      category="preferences"
    />
    <CookieHubScript
      inner-html="console.log('inline preferences script')"
      category="preferences"
    />
    <CookieHubYoutube url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
  </div>
</template>
