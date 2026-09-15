<script setup lang="ts">
import { computed } from 'vue'
import { facebookPixelScript } from 'cookiehub-js'
import CookieHubScript from './CookieHubScript.vue'

/**
 * Facebook (Meta) Pixel, blocked until the user allows the `marketing`
 * category.
 */
const props = defineProps<{
  /** Your Facebook Pixel id. */
  pixelId: string
}>()

const script = computed(() => facebookPixelScript(props.pixelId))
</script>

<template>
  <CookieHubScript
    :inner-html="script.innerHTML"
    :category="script.category"
  />
</template>
