<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../data/posts.data'

const props = defineProps<{ category?: 'knowledge' | 'essay' }>()

const query = ref('')
const activeTag = ref('')

const list = computed(() => posts.filter((p) => !props.category || p.category === props.category))

const tags = computed(() => {
  const s = new Set<string>()
  list.value.forEach((p) => (p.tags || []).forEach((t) => s.add(t)))
  return Array.from(s).sort()
})

const filtered = computed(() => {
  let r = list.value
  if (activeTag.value) r = r.filter((p) => (p.tags || []).includes(activeTag.value))
  if (query.value) {
    const q = query.value.trim().toLowerCase()
    r = r.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q))
    )
  }
  return [...r].sort(
    (a, b) => Number(Boolean(b.pin)) - Number(Boolean(a.pin)) || (b.date || '').localeCompare(a.date || '')
  )
})

const total = computed(() => list.value.length)
</script>

<template>
  <div class="post-list">
    <div class="post-toolbar">
      <input v-model="query" class="post-search" type="search" placeholder="🔍 在当前栏目内筛选标题 / 摘要 / 标签…" />
      <div class="tag-filter">
        <button class="tag-chip tag-all" :class="{ active: !activeTag }" @click="activeTag = ''">全部</button>
        <button
          v-for="t in tags"
          :key="t"
          class="tag-chip"
          :class="{ active: activeTag === t }"
          @click="activeTag = activeTag === t ? '' : t"
        >
          #{{ t }}
        </button>
      </div>
    </div>
    <p class="post-count">共 {{ total }} 篇 · 当前显示 {{ filtered.length }} 篇</p>

    <div v-if="filtered.length" class="post-grid">
      <a v-for="p in filtered" :key="p.url" :href="withBase(p.url)" class="post-card">
        <div class="post-head">
          <span v-if="p.pin" class="pin-badge">置顶</span>
          <span class="post-title">{{ p.title }}</span>
        </div>
        <p v-if="p.excerpt" class="post-excerpt">{{ p.excerpt }}</p>
        <div class="post-meta">
          <time v-if="p.date">{{ p.date }}</time>
          <span class="tag-row">
            <span v-for="t in p.tags" :key="t" class="tag-chip">#{{ t }}</span>
          </span>
        </div>
      </a>
    </div>
    <p v-else class="post-empty">没有匹配的文章 🛰️</p>
  </div>
</template>
