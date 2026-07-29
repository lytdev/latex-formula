export interface AgileLatexExport {
  /** LaTeX source code */
  latex: string
  /** MathML representation */
  mathml: string
  /** Base64-encoded PNG image (data:image/png;base64,...) */
  base64: string
}

export interface SymbolItem {
  /** Display label shown on the button */
  label: string
  /** LaTeX snippet to insert into the editor */
  latex: string
}
