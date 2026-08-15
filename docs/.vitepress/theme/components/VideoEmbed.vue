<script setup lang="ts">
const props = withDefaults(
  defineProps<{ src?: string; type?: 'mp4' | 'bilibili' | 'youtube'; poster?: string; ratio?: string }>(),
  { type: 'mp4', ratio: '16 / 9' }
)
</script>

<template>
  <div class="video-embed" :style="{ aspectRatio: props.ratio }">
    <video v-if="type === 'mp4'" :src="src" :poster="poster" controls playsinline></video>
    <iframe
      v-else-if="type === 'bilibili'"
      :src="src"
      scrolling="no"
      border="0"
      frameborder="no"
      framespacing="0"
      allowfullscreen
    ></iframe>
    <iframe
      v-else
      :src="src"
      title="video"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
  </div>
</template>
