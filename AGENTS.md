# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # 启动开发服务器（dev/ 目录的 Playground）
pnpm build        # 生产构建 → dist/（先类型检查再 Vite 打包）
pnpm preview      # 预览生产构建
```

构建前自动运行 `vue-tsc -p tsconfig.build.json` 做类型检查，零错误才继续 Vite 打包。

## Architecture

这是一个 Vue 3 组件库（npm 包），核心是单个 SFC `AgileLatex.vue`，对外暴露方法和事件。

**三层结构：**

```
AgileLatex.vue （主组件 — 布局 + 数据流编排）
├── SymbolPanel.vue    顶部符号面板：8 个 Tab 分类、搜索过滤
├── LatexInput.vue     左下输入区：TDesign t-textarea，暴露原生 textarea 用于光标操作
├── PreviewPanel.vue   右下预览区：防抖 300ms 渲染 MathJax SVG
└── composables/
    ├── useMathJax.ts    MathJax 3 单例：LaTeX → SVG + MathML（同步渲染）
    ├── useExport.ts     SVG → 屏幕外容器 → @zumer/snapdom 截图 → base64 PNG
    └── useSymbols.ts    8 个分类 300+ 条预置公式/符号数据
```

**关键设计决策：**

- `useMathJax` 是**模块级单例**（`let doc, mmlVisitor` 在模块顶层），整个应用只有一个 MathJax 实例
- `fontCache: 'none'` — 字形内联到每个 SVG，使 SVG 自包含（可独立导出为图片）
- `render()` 是**同步的**（MathJax direct API），不使用 component bundle 的 Promise API
- 工具栏按钮会先 blur textarea，所以在 `@mousedown` 快照选区，`@click` 用快照值插入
- `@zumer/snapdom` 用于导出 PNG：将 SVG 放入屏幕外可见容器（`left:-9999px`），完整布局后用 `toCanvas` 截取

**包导出：**
- 默认导出 `AgileLatex` 组件
- 类型导出 `AgileLatexExport`（`{ latex, mathml, base64 }`）
- TDesign 和 Vue 是 **peer dependencies**，MathJax 和 snapdom 是 bundled dependencies

**npm 发布范围：** `"files": ["dist"]`，只有构建产物会发布。
