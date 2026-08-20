// 本地静态预览服务器：直接托管已构建的 docs/.vitepress/dist，无需 vite/esbuild
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, sep, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..', 'docs', '.vitepress', 'dist')
const port = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml'
}

function mimeOf(p) {
  return MIME[extname(p).toLowerCase()] || 'application/octet-stream'
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile()
  } catch {
    return false
  }
}

// 支持 cleanUrls：/foo -> foo.html，/foo/ -> foo/index.html
async function resolvePath(pathname) {
  let p
  try {
    p = decodeURIComponent(pathname)
  } catch {
    return null
  }
  const full = resolve(root, '.' + (p.replace(/\//g, sep)))
  if (full !== root && !full.startsWith(root + sep)) return null

  if (await isFile(full)) return full
  if (p.endsWith('/')) {
    const idx = join(full, 'index.html')
    if (await isFile(idx)) return idx
  }
  if (!extname(p)) {
    const html = full + '.html'
    if (await isFile(html)) return html
  }
  return null
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    let file = await resolvePath(url.pathname)
    if (!file) {
      const nf = join(root, '404.html')
      if (await isFile(nf)) {
        file = nf
        res.statusCode = 404
      }
    }
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('404 Not Found')
      return
    }
    const data = await readFile(file)
    res.writeHead(res.statusCode || 200, {
      'Content-Type': mimeOf(file),
      'Cache-Control': 'no-cache'
    })
    res.end(data)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('500 ' + e.message)
  }
})

server.listen(port, () => {
  console.log(`[serve] ByteLog 预览已启动： http://localhost:${port}/`)
  console.log(`[serve] 托管目录：${root}`)
})
