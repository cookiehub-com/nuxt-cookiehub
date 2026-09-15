<script setup lang="ts">
import { computed } from 'vue'
import { googleAnalyticsScripts } from 'cookiehub-js'
import CookieHubScript from './CookieHubScript.vue'

/**
 * Google Analytics (gtag.js), blocked until the user allows the `analytics`
 * category.
 */
const props = defineProps<{
  /** Your Google Analytics measurement id, for example `G-XXXXXXXXXX`. */
  trackingId: string
}>()

const scripts = computed(() => googleAnalyticsScripts(props.trackingId))
</script>

<template>
  <CookieHubScript
    v-for="(script, index) in scripts"
    :key="index"
    :src="script.src"
    :inner-html="script.innerHTML"
    :category="script.category"
  />
</template>
