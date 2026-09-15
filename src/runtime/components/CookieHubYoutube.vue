<script setup lang="ts">
import { computed } from 'vue'
import { youtubeVideoID, youtubeEmbedURL, YOUTUBE_IFRAME_ALLOW, YOUTUBE_IFRAME_DEFAULTS } from 'cookiehub-js'

/**
 * Embeds a YouTube video through the privacy-enhanced `youtube-nocookie.com`
 * host, which sets no tracking cookies until the visitor presses play.
 * Give it either `video-id` or `url`. Renders nothing if no id can be found.
 */
const props = withDefaults(defineProps<{
  /** The 11-character YouTube video id. */
  videoId?: string
  /** A YouTube URL to extract the id from (watch, share, embed and youtu.be links). */
  url?: string
  width?: number | string
  height?: number | string
}>(), {
  width: YOUTUBE_IFRAME_DEFAULTS.width,
  height: YOUTUBE_IFRAME_DEFAULTS.height,
})

const resolvedId = computed(() => {
  if (props.url) {
    const fromUrl = youtubeVideoID(props.url)
    if (fromUrl) {
      return fromUrl
    }
  }
  return props.videoId || undefined
})

const embedUrl = computed(() => (resolvedId.value ? youtubeEmbedURL(resolvedId.value) : undefined))
</script>

<template>
  <iframe
    v-if="embedUrl"
    :width="width"
    :height="height"
    :src="embedUrl"
    title="YouTube video player"
    frameborder="0"
    :allow="YOUTUBE_IFRAME_ALLOW"
    allowfullscreen
  />
</template>
