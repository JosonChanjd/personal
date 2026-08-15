---
title: VitePress 静态博客搭建指南
date: 2025-06-10
tags: [VitePress, 前端, 静态站点]
category: knowledge
pin: true
description: 从零搭建一个基于 VitePress、可部署到 GitHub Pages 的科技风格个人博客。
---

# VitePress 静态博客搭建指南

本文记录本站的技术选型与核心配置，帮助你快速复现一个类似的博客。

## 为什么选 VitePress

- **Markdown 优先**：所有内容都是 Markdown，写作即发布；
- **内置本地搜索**：无需后端即可全文检索；
- **静态产物**：构建结果是纯 HTML/JS/CSS，天然适配 GitHub Pages；
- **可扩展**：用 Vue 组件实现自定义功能（热力图、文档库、关联文章等）。

## 目录结构

```text
docs/
├── .vitepress/          # 站点配置与主题
│   ├── config.mts       # 站点配置
│   └── theme/           # 自定义主题与组件
├── knowledge/           # 知识库
├── essays/              # 随笔
├── public/              # 静态资源（图片、文档库文件）
├── nas.md               # 文档库页面
└── activity.md          # 动态页面
```

## 插入视频

使用全局组件 `<VideoEmbed>` 即可嵌入视频：

<VideoEmbed type="mp4" src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />

B 站 / YouTube 也可直接嵌入：

```html
<VideoEmbed type="bilibili" src="//player.bilibili.com/player.html?bvid=BV1xx411c7XX" />
<VideoEmbed type="youtube" src="https://www.youtube.com/embed/dQw4w9WgXcQ" />
```

## 插入图片

标准 Markdown 语法即可，支持懒加载：

![架构示意图](/images/architecture.svg)

## 部署到 GitHub Pages

1. 若为**项目页**仓库，把 `docs/.vitepress/config.mts` 中的 `base` 改为 `/<仓库名>/`；
2. 执行 `npm run build`，把 `docs/.vitepress/dist` 推送到 `gh-pages` 分支；
3. 在仓库 Settings → Pages 中选择 `gh-pages` 分支即可。
