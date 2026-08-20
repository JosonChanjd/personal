# ByteLog

科技风格个人博客，基于 [VitePress](https://vitepress.dev/)，面向 GitHub Pages 静态部署。

## 功能

- 🧠 **知识库**：系统化的学习与积累
- ✍️ **随笔**：日常记录
- 🔍 **全文搜索**：站内本地搜索（`Ctrl/Cmd + K`）
- 🔗 **自动关联**：文章按标签自动关联「相关文章」
- 🗂️ **文档库（NAS）**：文档 / PDF 预览与下载
- 🎨 **Markdown 富媒体**：视频、图片、脑图（Mermaid）
- 📈 **GitHub 风格**：更改频次热力图 + 访问记录

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 构建到 docs/.vitepress/dist
npm run preview  # 预览构建产物
```

> 注：本项目在受限环境下安装依赖时，可用 `npm install --cache <工作区内目录>` 把 npm 缓存重定向到可写位置。

## 目录结构

```text
docs/
├── .vitepress/
│   ├── config.mts              # 站点配置
│   └── theme/                  # 主题、样式与自定义组件
│       ├── index.ts            # 注册组件 + Mermaid 渲染
│       ├── style.css           # 科技风主题
│       ├── components/         # 关联/列表/热力图/访问/视频/文档库
│       └── data/posts.data.ts  # 文章数据加载器
├── knowledge/                  # 知识库（Markdown）
├── essays/                     # 随笔（Markdown）
├── public/
│   ├── images/                 # 图片
│   └── files/                  # 文档库（NAS）文件
├── index.md                    # 首页
├── nas.md                      # 文档库页面
├── activity.md                 # 动态页面
└── about.md                    # 关于
scripts/
└── gen.mjs                     # 生成侧边栏 / 热力图数据 / 文件清单
```

## 如何写文章

在 `docs/knowledge/` 或 `docs/essays/` 新建 `.md`，frontmatter 示例：

```yaml
---
title: 文章标题
date: 2025-06-10
tags: [标签1, 标签2]
description: 一句话摘要
pin: true   # 可选，置顶
---
```

- 侧边栏与文章列表由 `scripts/gen.mjs` 自动生成，无需手动维护；
- 文章底部「相关文章」按标签重叠度自动关联（知识 ↔ 随笔互通）。

## 富媒体语法

- 图片：`![描述](/images/xxx.svg)`
- 视频：`<VideoEmbed type="mp4" src="...mp4" />`（`type` 支持 `mp4` / `bilibili` / `youtube`）
- 脑图 / 流程图：```` ```mermaid ```` 代码块（`mindmap`、`flowchart`、`sequenceDiagram` 等）

## 文档库（NAS）

1. 文件放入 `docs/public/files/`（支持子目录）；
2. 编辑 `docs/public/files/_meta.json` 添加描述与标签；
3. `npm run dev` / `npm run build` 会自动生成清单，在「文档库」页面预览/下载。

## 部署到 GitHub Pages（GitHub Actions 自动部署）

本项目已包含 `.github/workflows/deploy.yml`，只需：

1. 将 `docs/.vitepress/config.mts` 的 `base` 设为 `/<仓库名>/`（项目页，如 `/personal/`）或 `/`（用户主页）；
2. 推送到 GitHub；
3. 在仓库 Settings → Pages 中把 **Source** 设为 **GitHub Actions**。

之后每次 push 都会自动构建并发布，无需手动维护 `dist`。

> 手动方式：`npm run build` 后把 `docs/.vitepress/dist` 推送到 `gh-pages` 分支，并在 Pages 中选择该分支。

## 说明

- **更改频次热力图**：构建时通过 `git log` 统计提交，生成 `public/commits.json`；无 git 历史时回退为演示数据。
- **访问记录**：全网 PV/UV 由[不蒜子](https://busuanzi.ibruce.info)提供（需联网）；本机访问热度保存在浏览器 `localStorage`。
