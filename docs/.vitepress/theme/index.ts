import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { defineComponent, h, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import './style.css'

import RelatedPosts from './components/RelatedPosts.vue'
import PostList from './components/PostList.vue'
import ContributionGraph from './components/ContributionGraph.vue'
import VisitCounter from './components/VisitCounter.vue'
import VideoEmbed from './components/VideoEmbed.vue'
import FileBrowser from './components/FileBrowser.vue'

// ---------- Mermaid（脑图 / 流程图 / 时序图等），动态加载以避免 SSR 副作用 ----------
let mermaidMod: (typeof import('mermaid'))['default'] | null = null

async function loadMermaid() {
  if (!mermaidMod) {
    const mod = await import('mermaid')
    mermaidMod = mod.default
    mermaidMod.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'dark',
      themeVariables: {
        primaryColor: '#161b22',
        primaryTextColor: '#e6edf3',
        primaryBorderColor: '#30363d',
        lineColor: '#8b949e',
        secondaryColor: '#0d1117',
        tertiaryColor: '#0d1117',
        fontFamily: 'Consolas, "Cascadia Code", monospace'
      }
    })
  }
  return mermaidMod
}

async function renderMermaid() {
  if (typeof window === 'undefined') return
  const m = await loadMermaid()
  // VitePress 会把 ```mermaid 渲染为 <div class="language-mermaid"><pre>...</pre></div>
  const containers = Array.from(document.querySelectorAll<HTMLElement>('.language-mermaid')).filter(
    (el) => !el.dataset.mermaidDone
  )
  for (const container of containers) {
    container.dataset.mermaidDone = '1'
    const code = container.querySelector('code')
    const text = (code ? code.textContent : container.textContent) || ''
    if (!text.trim()) continue
    try {
      const id = 'mm-' + Math.random().toString(36).slice(2, 10)
      const { svg } = await m.render(id, text)
      const wrap = document.createElement('div')
      wrap.className = 'mermaid-wrap'
      wrap.innerHTML = svg
      container.replaceWith(wrap)
    } catch (err) {
      console.error('[mermaid] 渲染失败：', err)
      container.classList.add('mermaid-failed')
    }
  }
}

const MermaidHook = defineComponent({
  name: 'MermaidHook',
  setup() {
    const route = useRoute()
    const run = () => {
      nextTick(() => {
        if (typeof window !== 'undefined') {
          requestAnimationFrame(() => renderMermaid())
        }
      })
    }
    onMounted(run)
    watch(() => route.path, run)
    return () => null
  }
})

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RelatedPosts', RelatedPosts)
    app.component('PostList', PostList)
    app.component('ContributionGraph', ContributionGraph)
    app.component('VisitCounter', VisitCounter)
    app.component('VideoEmbed', VideoEmbed)
    app.component('FileBrowser', FileBrowser)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 每个文章页底部自动展示「相关文章」关联
      'doc-after': () => h(RelatedPosts),
      'layout-bottom': () => h(MermaidHook)
    })
  }
} satisfies Theme
