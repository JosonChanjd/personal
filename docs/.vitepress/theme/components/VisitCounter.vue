<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const KEY = 'bytelog-visits-v1'
interface Visits {
  total: number
  days: Record<string, number>
}
const visits = ref<Visits>({ total: 0, days: {} })
const todayCount = ref(0)
const last30 = ref<{ date: string; count: number }[]>([])

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

onMounted(() => {
  let d: Visits = { total: 0, days: {} }
  try {
    d = JSON.parse(localStorage.getItem(KEY) || JSON.stringify(d))
  } catch {
    /* ignore */
  }
  d.total = (d.total || 0) + 1
  const today = dateKey(new Date())
  d.days = d.days || {}
  d.days[today] = (d.days[today] || 0) + 1
  localStorage.setItem(KEY, JSON.stringify(d))
  visits.value = d
  todayCount.value = d.days[today]

  const arr = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const k = dateKey(day)
    arr.push({ date: k, count: d.days[k] || 0 })
  }
  last30.value = arr

  // 不蒜子未加载时，占位符回退为 —
  setTimeout(() => {
    ;['busuanzi_value_site_pv', 'busuanzi_value_site_uv'].forEach((id) => {
      const el = document.getElementById(id)
      if (el && (!el.textContent || el.textContent === '…')) el.textContent = '—'
    })
  }, 3000)
})

const maxCount = computed(() => Math.max(1, ...last30.value.map((x) => x.count)))
</script>

<template>
  <div class="visit-stats">
    <div class="visit-cards">
      <div class="stat-card">
        <div class="stat-label">本站总访问量（全网）</div>
        <div class="stat-value"><span id="busuanzi_value_site_pv">…</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本站访客数（全网）</div>
        <div class="stat-value"><span id="busuanzi_value_site_uv">…</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本机累计访问</div>
        <div class="stat-value">{{ visits.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日访问（本机）</div>
        <div class="stat-value">{{ todayCount }}</div>
      </div>
    </div>

    <h4 class="visit-sub">近 30 天访问热度（本机记录）</h4>
    <div class="visit-bars">
      <div v-for="d in last30" :key="d.date" class="visit-bar-col" :title="`${d.date} · ${d.count} 次`">
        <div class="visit-bar" :style="{ height: (d.count / maxCount) * 80 + 'px' }"></div>
        <span class="visit-day">{{ d.date.slice(8) }}</span>
      </div>
    </div>
    <p class="visit-note">
      「全网」数据由
      <a href="//busuanzi.ibruce.info" target="_blank" rel="noopener">不蒜子</a>
      提供（需联网）；「本机」数据保存在浏览器 localStorage，用于个人访问记录。
    </p>
  </div>
</template>
