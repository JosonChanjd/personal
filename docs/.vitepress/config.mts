import { defineConfig } from 'vitepress'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadGeneratedSidebar() {
  const p = resolve(__dirname, 'sidebar.json')
  if (!existsSync(p)) return {}
  try {
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

const generatedSidebar = loadGeneratedSidebar()

// github.io 部署说明：若是「用户主页」仓库（<user>.github.io），base 保持 '/'；
// 若是「项目页」仓库（<user>.github.io/<repo>/），请把 base 改成 '/<repo>/'。
const base = '/personal/'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Jie-OceanGull',
  description: '科技平台：知识积累 · 随笔 · 文档库 · 搜索 · 自动关联',
  base,
  cleanUrls: true,
  appearance: 'dark',
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0b0f14' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    // 不蒜子：静态站免后端访问统计（PV/UV）
    ['script', { async: '', src: '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js' }]
  ],
  markdown: {
    lineNumbers: true,
    image: { lazyLoading: true },
    theme: { light: 'github-light', dark: 'github-dark' }
  },
  themeConfig: {
    logo: `${base}logo.svg`,
    nav: [
      { text: '首页', link: '/' },
      { text: '知识库', link: '/knowledge/' },
      { text: '随笔', link: '/essays/' },
      { text: '文档库', link: '/nas' },
      { text: '动态', link: '/activity' },
      { text: '关于', link: '/about' }
    ],
    sidebar: {
      ...generatedSidebar,
      '/nas': [{ text: '文档库', items: [{ text: 'NAS 文档库', link: '/nas' }] }],
      '/activity': [{ text: '动态', items: [{ text: '更改频次 · 访问记录', link: '/activity' }] }]
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    outline: { level: [2, 3], label: '本页目录' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/' }],
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium', timeStyle: 'short' } },
    footer: {
      message: '基于 VitePress 构建 · 静态部署于 GitHub Pages',
      copyright: '© 2025 ByteLog · 科技风格个人博客'
    }
  }
})
