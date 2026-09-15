<script setup lang="ts">
import { blockedScriptAttributes } from 'cookiehub-js'
import type { BlockedScript, ConsentCategory } from 'cookiehub-js'
import { useHead } from '#imports'

/**
 * Renders a script into <head> that CookieHub holds back until the user has
 * consented to `category`. Give it either `src` or `inner-html`, not both.
 */
const props = defineProps<{
  /** Optional id attribute for the script element. */
  id?: string
  /** URL of an external script. */
  src?: string
  /** Inline script body. */
  innerHtml?: string
  /** The consent category that unlocks this script. */
  category: ConsentCategory
}>()

useHead(() => {
  const attrs = blockedScriptAttributes({
    id: props.id,
    src: props.src,
    innerHTML: props.innerHtml,
    category: props.category,
  } as BlockedScript)

  if (!attrs) {
    return {}
  }

  const entry: Record<string, string> = {
    'type': attrs.type,
    'data-consent': attrs['data-consent'],
  }
  if (attrs.id) {
    entry.key = attrs.id
    entry.id = attrs.id
  }
  if (attrs.innerHTML) {
    entry.innerHTML = attrs.innerHTML
  }
  else if (attrs['data-src']) {
    entry['data-src'] = attrs['data-src']
  }

  // unhead's typings only allow `application/json` on inline scripts. The
  // CookieHub contract needs `text/plain`, which unhead renders without
  // complaint, so the entry is cast past that restriction.
  return { script: [entry as never] }
})
</script>

<template>
  <slot />
</template>
