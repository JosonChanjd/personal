// 构建辅助脚本：生成侧边栏、提交热力图数据、文档库清单
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, mkdirSync } from 'node:fs'
import { join, relative, resolve, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const docs = join(root, 'docs')
const publicDir = join(docs, 'public')

function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true })
}

// ---------- 1. 解析 Markdown frontmatter ----------
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const k = kv[1]
    let v = kv[2].trim()
    if (k === 'tags') {
      v = v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    } else {
      v = v.replace(/^['"]|['"]$/g, '')
    }
    fm[k] = v
  }
  return fm
}

// ---------- 2. 扫描文章，生成侧边栏 ----------
function scanPosts() {
  const sections = [
    { dir: 'knowledge', label: '知识库' },
    { dir: 'essays', label: '随笔' }
  ]
  const sidebar = {}
  for (const sec of sections) {
    const base = join(docs, sec.dir)
    if (!existsSync(base)) continue
    const files = []
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'index.md') continue
        const full = join(d, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith('.md')) files.push(full)
      }
    }
    walk(base)
    const items = files
      .map((f) => {
        const rel = relative(docs, f).replace(/\\/g, '/')
        const url = '/' + rel.replace(/\.md$/, '')
        const fm = parseFrontmatter(readFileSync(f, 'utf-8'))
        return { text: fm.title || url.split('/').filter(Boolean).pop(), link: url, date: fm.date || '' }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
    sidebar['/' + sec.dir + '/'] = [{ text: sec.label, items }]
  }
  return sidebar
}

// ---------- 3. 提交热力图数据（来自 git，无历史则生成演示数据） ----------
function dateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function collectCommits() {
  try {
    const out = execFileSync('git', ['log', '--date=short', '--pretty=format:%ad'], { cwd: root, encoding: 'utf-8' })
    const days = {}
    let total = 0
    for (const line of out.split(/\r?\n/)) {
      const d = line.trim()
      if (!d) continue
      days[d] = (days[d] || 0) + 1
      total += 1
    }
    return { days, total, source: 'git' }
  } catch {
    return sampleCommits()
  }
}
function sampleCommits() {
  let seed = 42
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const days = {}
  const today = new Date()
  let total = 0
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const r = rand()
    let c = 0
    if (r < 0.35) c = 0
    else if (r < 0.68) c = 1
    else if (r < 0.85) c = 2
    else if (r < 0.94) c = 3 + Math.floor(rand() * 3)
    else c = Math.floor(rand() * 3)
    if (c > 0) {
      days[dateKey(d)] = c
      total += c
    }
  }
  return { days, total, source: 'sample' }
}

// ---------- 4. 扫描文档库，生成清单 ----------
function scanFiles() {
  const dir = join(publicDir, 'files')
  const list = []
  if (existsSync(dir)) {
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === '_meta.json') continue
        const full = join(d, entry.name)
        if (entry.isDirectory()) walk(full)
        else {
          const st = statSync(full)
          const rel = '/' + relative(publicDir, full).replace(/\\/g, '/')
          list.push({
            name: entry.name,
            path: rel,
            size: st.size,
            mtime: st.mtime.toISOString().slice(0, 10),
            ext: extname(entry.name).slice(1).toLowerCase()
          })
        }
      }
    }
    walk(dir)
  }
  // 合并侧车元数据（描述 / 标签）
  const metaPath = join(dir, '_meta.json')
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
      for (const item of list) {
        const m = meta[item.path] || meta[item.name]
        if (m) {
          item.description = m.description || ''
          item.tags = m.tags || []
        }
      }
    } catch (e) {
      console.warn('[gen] _meta.json 解析失败：', e.message)
    }
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

// ---------- 5. 生成示例 PDF（最小合法单页 PDF） ----------
function makePdf(title, bodyLines) {
  const lines = bodyLines.map((t, i) => `BT /F1 12 Tf 72 ${720 - i * 22} Td (${t}) Tj ET`).join('\n')
  const stream = `BT /F1 22 Tf 72 744 Td (${title}) Tj ET\n${lines}`
  const objs = []
  objs.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  objs.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  objs.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n')
  objs.push(`4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`)
  objs.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')
  let pdf = '%PDF-1.4\n'
  const offsets = []
  for (const o of objs) {
    offsets.push(pdf.length)
    pdf += o
  }
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return pdf
}
function ensureSamplePdf() {
  const dir = join(publicDir, 'files')
  ensureDir(dir)
  const pdfPath = join(dir, 'sample-report.pdf')
  if (!existsSync(pdfPath)) {
    writeFileSync(pdfPath, makePdf('ByteLog Sample Report', ['This is a minimal valid PDF file.', 'Generated by ByteLog NAS demo.']))
    console.log('[gen] 已生成示例 PDF：sample-report.pdf')
  }
}

// ---------- 执行 ----------
function main() {
  ensureDir(join(docs, '.vitepress'))
  ensureDir(publicDir)
  ensureSamplePdf()

  const sidebar = scanPosts()
  writeFileSync(join(docs, '.vitepress', 'sidebar.json'), JSON.stringify(sidebar, null, 2))

  const commits = collectCommits()
  writeFileSync(join(publicDir, 'commits.json'), JSON.stringify(commits, null, 2))

  const files = scanFiles()
  writeFileSync(join(publicDir, 'files-manifest.json'), JSON.stringify(files, null, 2))

  console.log(`[gen] 侧边栏分区：${Object.keys(sidebar).length} 个`)
  console.log(`[gen] 提交记录：${commits.total} 次（来源 ${commits.source}）`)
  console.log(`[gen] 文档库文件：${files.length} 个`)
}

main()
