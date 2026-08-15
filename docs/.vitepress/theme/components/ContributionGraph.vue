<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{ days?: number }>(), { days: 371 })

interface CommitData {
  days: Record<string, number>
  total: number
  source: string
}

const data = ref<CommitData>({ days: {}, total: 0, source: '' })
const loading = ref(true)

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

onMounted(async () => {
  try {
    const res = await fetch(withBase('/commits.json'))
    if (res.ok) data.value = await res.json()
  } catch (e) {
    console.warn('[contribution] 加载 commits.json 失败', e)
  }
  loading.value = false
})

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function level(n: number) {
  if (n <= 0) return 0
  if (n === 1) return 1
  if (n === 2) return 2
  if (n <= 5) return 3
  return 4
}

const cols = computed(() => Math.ceil(props.days / 7))

const cells = computed(() => {
  const today = new Date()
  const end = new Date(today)
  end.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7))
  const start = new Date(end)
  start.setDate(end.getDate() - (cols.value * 7 - 1))
  const weeks = []
  for (let c = 0; c < cols.value; c++) {
    const week = []
    for (let r = 0; r < 7; r++) {
      const d = new Date(start)
      d.setDate(start.getDate() + c * 7 + r)
      const count = data.value.days[dateKey(d)] || 0
      week.push({ d, count, level: level(count), future: d > today })
    }
    weeks.push(week)
  }
  return weeks
})

const monthLabels = computed(() => {
  const m: Record<number, string> = {}
  let prev = -1
  cells.value.forEach((week, c) => {
    const month = week[0].d.getMonth()
    if (c === 0 || month !== prev) m[c] = MONTHS[month]
    prev = month
  })
  return m
})

const last30 = computed(() => {
  const today = new Date()
  let sum = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    sum += data.value.days[dateKey(d)] || 0
  }
  return sum
})

const streak = computed(() => {
  let s = 0
  const d = new Date()
  while ((data.value.days[dateKey(d)] || 0) > 0) {
    s++
    d.setDate(d.getDate() - 1)
  }
  return s
})
</script>

<template>
  <div class="contribution">
    <div class="heatmap-stats">
      <div class="stat"><strong>{{ data.total }}</strong><span>总提交</span></div>
      <div class="stat"><strong>{{ last30 }}</strong><span>近 30 天</span></div>
      <div class="stat"><strong>{{ streak }}</strong><span>连续天数</span></div>
    </div>

    <div class="heatmap-scroll">
      <div class="heatmap">
        <div class="heatmap-weekdays">
          <span v-for="(wd, i) in WEEKDAYS" :key="i" :class="{ show: [1, 3, 5].includes(i) }">{{ wd }}</span>
        </div>
        <div class="heatmap-main">
          <div class="heatmap-months">
            <div v-for="(week, c) in cells" :key="'m' + c" class="heatmap-month-col">
              <span v-if="monthLabels[c]">{{ monthLabels[c] }}</span>
            </div>
          </div>
          <div class="heatmap-cols">
            <div v-for="(week, c) in cells" :key="'c' + c" class="heatmap-col">
              <div
                v-for="(cell, r) in week"
                :key="r"
                class="heatmap-cell"
                :data-level="cell.level"
                :title="`${dateKey(cell.d)} · ${cell.count} 次提交`"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="heatmap-legend">
      <span>少</span>
      <span class="heatmap-cell" data-level="0"></span>
      <span class="heatmap-cell" data-level="1"></span>
      <span class="heatmap-cell" data-level="2"></span>
      <span class="heatmap-cell" data-level="3"></span>
      <span class="heatmap-cell" data-level="4"></span>
      <span>多</span>
      <span v-if="data.source" class="legend-src">数据来源：{{ data.source === 'git' ? 'git 提交历史' : '演示数据' }}</span>
    </div>
  </div>
</template>
