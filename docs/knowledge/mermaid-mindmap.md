---
title: 用 Mermaid 画脑图与流程图
date: 2025-06-05
tags: [Mermaid, 可视化, 脑图]
category: knowledge
description: 在 Markdown 中直接用 Mermaid 绘制脑图（mindmap）、流程图与序列图。
---

# 用 Mermaid 画脑图与流程图

本站内置 Mermaid 渲染，直接使用 ```` ```mermaid ```` 代码块即可绘制图表。

## 脑图 Mindmap

```mermaid
mindmap
  root((个人知识体系))
    前端
      VitePress
      组件化
      CSS
    后端
      网络基础
      API 设计
    工具
      Git
      Markdown
      Mermaid
```

## 流程图 Flowchart

```mermaid
flowchart LR
  A[写作 Markdown] --> B{是否需要图表}
  B -- 是 --> C[编写 mermaid 代码块]
  B -- 否 --> D[直接发布]
  C --> E[构建渲染 SVG]
  E --> D
```

## 序列图 Sequence

```mermaid
sequenceDiagram
  participant U as 读者
  participant S as 静态站点
  U->>S: 请求页面
  S-->>U: 返回 HTML/JS/CSS
  U->>U: 客户端搜索与图表渲染
```

> 提示：Mermaid 支持 `mindmap`、`flowchart`、`sequenceDiagram`、`classDiagram`、`gantt` 等多种图表类型，满足脑图与流程图需求。
