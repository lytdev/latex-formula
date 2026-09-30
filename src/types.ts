/** 导出结果对象 — 包含 LaTeX 源码、MathML 和 base64 图片 */
export interface LatexFormulaExport {
  /** LaTeX 源码 */
  latex: string
  /** MathML 格式的公式表示 */
  mathml: string
  /** Base64 编码的 PNG 图片（data:image/png;base64,...） */
  base64: string
}

/** 符号面板中的单个符号项 */
export interface SymbolItem {
  /** 按钮上显示的中文标签 */
  label: string
  /** 点击后插入编辑器的 LaTeX 代码片段 */
  latex: string
  thumbnail?: string
}
