<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

interface FileItem {
  name: string
  path: string
  size: number
  mtime: string
  ext: string
  description?: string
  tags?: string[]
}

const files = ref<FileItem[]>([])
const query = ref('')
const typeFilter = ref('all')
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(withBase('/files-manifest.json'))
    if (res.ok) files.value = await res.json()
  } catch (e) {
    console.warn('[nas] 加载清单失败', e)
  }
  loading.value = false
})

const types = computed(() => Array.from(new Set(files.value.map((f) => f.ext || 'other'))).sort())

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return files.value.filter((f) => {
    if (typeFilter.value !== 'all' && f.ext !== typeFilter.value) return false
    if (!q) return true
    return [f.name, f.description || '', (f.tags || []).join(' ')].join(' ').toLowerCase().includes(q)
  })
})

const totalSize = computed(() => files.value.reduce((s, f) => s + f.size, 0))

function fmtSize(n: number) {
  if (n < 1024) return n + ' B'
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1024 / 1024).toFixed(2) + ' MB'
}

const TYPE_LABEL: Record<string, string> = {
  pdf: 'PDF',
  md: 'Markdown',
  txt: '文本',
  svg: 'SVG',
  png: '图片',
  jpg: '图片',
  zip: '压缩包',
  docx: 'Word',
  xlsx: 'Excel'
}
function typeLabel(ext: string) {
  return TYPE_LABEL[ext] || ext.toUpperCase()
}
function isPreviewable(ext: string) {
  return ['pdf', 'png', 'jpg', 'svg', 'txt', 'md'].includes(ext)
}
</script>

<template>
  <div class="file-browser">
    <div class="file-toolbar">
      <input v-model="query" class="post-search" type="search" placeholder="🔍 搜索文件名 / 描述 / 标签…" />
      <div class="tag-filter">
        <button class="tag-chip tag-all" :class="{ active: typeFilter === 'all' }" @click="typeFilter = 'all'">全部</button>
        <button
          v-for="t in types"
          :key="t"
          class="tag-chip"
          :class="{ active: typeFilter === t }"
          @click="typeFilter = typeFilter === t ? 'all' : t"
        >
          {{ typeLabel(t) }}
        </button>
      </div>
    </div>
    <p class="post-count">{{ files.length }} 个文件 · 共 {{ fmtSize(totalSize) }}</p>

    <table v-if="filtered.length" class="file-table">
      <thead>
        <tr>
          <th>文件名</th>
          <th>类型</th>
          <th>大小</th>
          <th>更新</th>
          <th>说明</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in filtered" :key="f.path">
          <td class="file-name">{{ f.name }}</td>
          <td><span class="cat-badge">{{ typeLabel(f.ext) }}</span></td>
          <td>{{ fmtSize(f.size) }}</td>
          <td>{{ f.mtime }}</td>
          <td class="file-desc">
            {{ f.description || '—' }}
            <span v-for="t in f.tags" :key="t" class="tag-chip">#{{ t }}</span>
          </td>
          <td class="file-actions">
            <a :href="withBase(f.path)" target="_blank">{{ isPreviewable(f.ext) ? '预览' : '下载' }}</a>
            <a :href="withBase(f.path)" :download="f.name">下载</a>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="loading" class="post-empty">加载中…</p>
    <p v-else class="post-empty">没有匹配的文件 🗂️</p>
  </div>
</template>
