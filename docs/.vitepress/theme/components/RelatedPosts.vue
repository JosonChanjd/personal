<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { data as posts } from '../data/posts.data'

const route = useRoute()
const { page } = useData()

const currentTags = computed<string[]>(() => {
  const t = (page.value.frontmatter as any)?.tags
  if (!t) return []
  return Array.isArray(t) ? t : [t]
})

const currentUrl = computed(() => route.path.replace(/\/+$/, '') || '/')

const related = computed(() => {
  if (!currentTags.value.length) return []
  return posts
    .filter((p) => p.url !== currentUrl.value)
    .map((p) => {
      const tags = p.tags || []
      const overlap = tags.filter((t) => currentTags.value.includes(t)).length
      return { ...p, overlap }
    })
    .filter((p) => p.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6)
})
</script>

<template>
  <section v-if="related.length" class="related-posts">
    <h3 class="related-heading">🔗 相关文章 · 自动关联</h3>
    <div class="related-grid">
      <a v-for="p in related" :key="p.url" :href="withBase(p.url)" class="related-card">
        <div class="related-top">
          <span class="cat-badge" :class="p.category">{{ p.category === 'knowledge' ? '知识' : '随笔' }}</span>
          <time v-if="p.date" class="related-date">{{ p.date }}</time>
        </div>
        <div class="related-name">{{ p.title }}</div>
        <div class="tag-row">
          <span v-for="t in p.tags" :key="t" class="tag-chip">#{{ t }}</span>
        </div>
      </a>
    </div>
  </section>
</template>
