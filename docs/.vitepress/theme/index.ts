import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { useRouter } from 'vitepress'
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
  const pres = Array.from(document.querySelectorAll<HTMLElement>('pre')).filter((pre) => {
    const cls = pre.className || ''
    const code = pre.querySelector('code')
    const codeCls = code ? code.className || '' : ''
    return cls.includes('language-mermaid') || codeCls.includes('language-mermaid')
  })
  for (const pre of pres) {
    if (pre.dataset.mermaidDone) continue
    pre.dataset.mermaidDone = '1'
    const text = pre.textContent || ''
    if (!text.trim()) continue
    try {
      const id = 'mm-' + Math.random().toString(36).slice(2, 10)
      const { svg } = await m.render(id, text)
      const wrap = document.createElement('div')
      wrap.className = 'mermaid-wrap'
      wrap.innerHTML = svg
      pre.replaceWith(wrap)
    } catch (err) {
      console.error('[mermaid] 渲染失败：', err)
      pre.classList.add('mermaid-failed')
    }
  }
}

const MermaidHook = defineComponent({
  name: 'MermaidHook',
  setup() {
    const router = useRouter()
    const run = () => nextTick(() => renderMermaid())
    onMounted(run)
    router.afterEach(run)
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
