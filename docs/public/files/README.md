# ByteLog 文档库

这里集中存放文档、PDF 与资料。

## 使用方式

1. 把文件放进 `docs/public/files/`（支持子目录）；
2. 运行 `npm run build` 或 `npm run dev`，`scripts/gen.mjs` 会自动扫描并生成清单；
3. 在「文档库」页面即可预览与下载。

## 添加说明与标签

编辑 `docs/public/files/_meta.json`，为文件添加 `description` 与 `tags`：

```json
{
  "/files/example.pdf": {
    "description": "一份示例文档",
    "tags": ["示例", "PDF"]
  }
}
```

> 说明：这里的是「轻量 NAS」——静态站点无法动态读写磁盘，文件由构建脚本扫描归档；适合存放不频繁变动的文档与 PDF。
