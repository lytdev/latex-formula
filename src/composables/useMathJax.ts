import { ref, type Ref } from 'vue'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js'
import { HTMLMathItem } from 'mathjax-full/js/handlers/html/HTMLMathItem.js'
import type { MathDocument } from 'mathjax-full/js/core/MathDocument.js'
import type { MathItem } from 'mathjax-full/js/core/MathItem.js'

/**
 * Result of rendering a LaTeX expression.
 */
export interface RenderResult {
  /** The rendered SVG element. */
  svgElement: SVGElement
  /** The serialized MathML string. */
  mathml: string
}

// ── Module-level singleton state ──
// Only one MathJax instance is created across the application.
// The first call to useMathJax().ready() initializes it; subsequent
// calls to useMathJax() return the same shared refs and document.

const isReady = ref(false)

let doc: MathDocument<HTMLElement, Text, Document> | null = null
let mmlVisitor: SerializedMmlVisitor | null = null
let texInput: TeX<HTMLElement, Text, Document> | null = null

/**
 * MathJax 3 initialization and rendering wrapper.
 *
 * Call `ready()` on component mount to initialize MathJax
 * (requires DOM). Then use `render(latex, display?)` to convert
 * LaTeX to SVG + MathML.
 */
export function useMathJax(): {
  render: (latex: string, display?: boolean) => RenderResult
  ready: () => void
  isReady: Ref<boolean>
} {
  /**
   * Initialize MathJax with TeX input (AllPackages including mhchem)
   * and SVG output. Must be called after the DOM is available.
   */
  function ready(): void {
    if (isReady.value) return

    const adaptor = browserAdaptor()
    RegisterHTMLHandler(adaptor)

    texInput = new TeX({ packages: AllPackages })
    const svgOutput = new SVG({ fontCache: 'local' })

    doc = mathjax.document(document, {
      InputJax: texInput,
      OutputJax: svgOutput,
    }) as MathDocument<HTMLElement, Text, Document>

    mmlVisitor = new SerializedMmlVisitor()

    isReady.value = true
  }

  /**
   * Render LaTeX to an SVG element and MathML string.
   *
   * @param latex   - The LaTeX expression (e.g. `\\frac{a}{b}`).
   * @param display - Whether to render in display math mode (default `true`).
   * @returns An object with `svgElement` (SVGElement) and `mathml` (string).
   */
  function render(latex: string, display = true): RenderResult {
    if (!isReady.value) {
      throw new Error('MathJax is not ready. Call useMathJax().ready() first.')
    }

    // Create a MathItem for this expression
    const mathItem: MathItem<HTMLElement, Text, Document> = new HTMLMathItem(
      latex,
      texInput!,
      display,
    )

    // Set metrics for proper rendering
    mathItem.setMetrics(16, 8, 80 * 16, 1000000, 1)

    // Compile LaTeX to MmlNode tree
    mathItem.compile(doc!)

    // Serialize the MmlNode tree to a MathML string
    const mathml = mathItem.root
      ? mmlVisitor!.visitTree(mathItem.root)
      : '<math xmlns="http://www.w3.org/1998/Math/MathML"><merror><mtext>Parse error</mtext></merror></math>'

    // If parsing failed (root is null), early-return with an empty SVG element.
    // Do NOT call mathItem.typeset() — it would fail on a null root.
    if (!mathItem.root) {
      const errSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGElement
      return { svgElement: errSvg, mathml }
    }

    // Typeset the MmlNode tree to SVG
    mathItem.typeset(doc!)

    const svgElement = mathItem.typesetRoot as unknown as SVGElement

    return { svgElement, mathml }
  }

  return { render, ready, isReady }
}
