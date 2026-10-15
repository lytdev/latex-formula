import type { Style } from 'mathlive'

/** 字体扩展项；相同 value 可修改内置选项，新选项需提供 style。 */
export interface FontFamilyOption {
  value: string
  content: string
  english?: string
  style?: Pick<Style, 'variant' | 'variantStyle'>
}

/** 符号分类；相同 key 合并分类，相同 label 覆盖公式。 */
export interface SymbolCategory {
  key: string
  label: string
  thumbnail?: string
  symbols: SymbolItem[]
}

/** 导出结果对象 — 包含 LaTeX 源码、MathML、base64 和 PNG Blob */
export interface LatexFormulaExport {
  /** LaTeX 源码 */
  latex: string
  /** MathML 格式的公式表示 */
  mathml: string
  /** Base64 编码的 PNG 图片（data:image/png;base64,...） */
  base64: string
  /** PNG 二进制图片，MIME 类型为 image/png，与 base64 内容相同 */
  blob: Blob,
  url?: string
}

/** 符号面板中的单个符号项 */
export interface SymbolItem {
  /** 按钮上显示的中文标签 */
  label: string
  /** 点击后插入编辑器的 LaTeX 代码片段 */
  latex: string
  thumbnail?: string
}
