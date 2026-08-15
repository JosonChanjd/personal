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
          date: p.frontmatter.date || '',
          tags,
          category,
          excerpt: p.excerpt || '',
          pin: Boolean(p.frontmatter.pin)
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }
})
