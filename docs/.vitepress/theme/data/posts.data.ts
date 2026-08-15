import { createContentLoader } from 'vitepress'

export interface PostData {
  title: string
  url: string
  date: string
  tags: string[]
  category: 'knowledge' | 'essay'
  excerpt: string
  pin: boolean
}

// frontmatter 里未加引号的 date 会被 YAML 解析成 Date 对象，这里统一归一化为 YYYY-MM-DD 字符串
function toDateString(d: unknown): string {
  if (!d) return ''
  if (d instanceof Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return String(d)
}

export default createContentLoader(['knowledge/**/*.md', 'essays/**/*.md'], {
  excerpt: true,
  transform(raw): PostData[] {
    return raw
      .filter((p) => !(p.src || '').endsWith('index.md') && !p.url.endsWith('/'))
      .map((p) => {
        const category = p.url.startsWith('/knowledge') ? 'knowledge' : 'essay'
        const tags = Array.isArray(p.frontmatter.tags)
          ? p.frontmatter.tags
          : p.frontmatter.tags
            ? [p.frontmatter.tags]
            : []
        return {
          title: p.frontmatter.title || p.url.split('/').filter(Boolean).pop() || '',
          url: p.url,
          date: toDateString(p.frontmatter.date),
          tags,
          category,
          excerpt: p.excerpt || '',
          pin: Boolean(p.frontmatter.pin)
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }
})
