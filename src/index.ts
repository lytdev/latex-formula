/**
 * agile-latex-formula — Vue 3 LaTeX 在线编辑器
 *
 * 导出主组件 AgileLatex 和导出类型 AgileLatexExport。
 * 消费者的安装方式：pnpm add @agilehub/agile-latex-formula
 * peer 依赖：vue (^3.3) — TDesign 已内置打包，无需额外安装
 *
 * TDesign 样式通过 import 引入，由 Vite 自定义插件在构建时
 * 将所有 CSS 内联注入 JS bundle，消费者无需手动导入 CSS。
 */
import 'tdesign-vue-next/es/style/index.css'

export { default as AgileLatex } from './AgileLatex.vue'
export type { AgileLatexExport } from './types'
