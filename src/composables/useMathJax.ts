import { ref, type Ref } from 'vue'
import { applySvgFonts } from './formulaFonts'
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

/** 单次渲染的结果：SVG 元素 + MathML 字符串 */
export interface RenderResult {
  /** 渲染后的 SVG 元素 */
  svgElement: SVGElement
  /** 序列化后的 MathML 字符串 */
  mathml: string
}

/** 同步排版必须有上限，避免嵌入宿主页面时被超长输入阻塞。 */
export const MAX_LATEX_LENGTH = 5000

// ═══════════════════════════════════════════════════════════
// 模块级单例状态
// 整个应用只创建一个 MathJax 实例。首次调用 useMathJax().ready()
// 完成初始化，后续调用返回共享的 ref 和 document。
// ═══════════════════════════════════════════════════════════

/** MathJax 是否已初始化 */
const isReady = ref(false)

/** MathJax 文档对象（TeX 输入 → SVG 输出） */
let doc: MathDocument<HTMLElement, Text, Document> | null = null

/** MathML 序列化访问器 */
let mmlVisitor: SerializedMmlVisitor | null = null

/** TeX 输入处理器（含 AllPackages） */
let texInput: TeX<HTMLElement, Text, Document> | null = null

/**
 * MathJax 3 初始化与渲染封装。
 *
 * 使用方式：
 *   1. 组件挂载时调用 ready() 初始化（需要 DOM 存在）
 *   2. 之后调用 render(latex, display?) 将 LaTeX 转为 SVG + MathML
 *
 * 关键设计决策：
 *   - fontCache: 'none' — 字形直接内联到每个 SVG 中，使每个 SVG 自包含、
 *     可独立序列化为图片（用于导出 PNG）
 *   - AllPackages — 包含 mhchem（化学公式）、AMSmath 等所有标准宏包
 *   - display 模式 — 公式居中、大号渲染，适合预览和导出
 */
export function useMathJax(): {
  render: (latex: string, display?: boolean) => RenderResult
  ready: () => void
  isReady: Ref<boolean>
} {
  /**
   * 初始化 MathJax。
   * 幂等调用 — 重复调用时 if (isReady.value) return 直接跳过。
   * 必须在 DOM 可用后调用（即组件 onMounted 之后）。
   */
  function ready(): void {
    if (isReady.value) return

    // 设置浏览器 DOM 适配器
    const adaptor = browserAdaptor()
    RegisterHTMLHandler(adaptor)

    // TeX 输入处理器 — AllPackages 包含 mhchem、AMSmath 等
    texInput = new TeX({ packages: AllPackages })
    // SVG 输出 — fontCache: 'none' 确保每个公式自包含
    const svgOutput = new SVG({ fontCache: 'none' })

    // 创建 MathJax 文档对象
    doc = mathjax.document(document, {
      InputJax: texInput,
      OutputJax: svgOutput,
    }) as MathDocument<HTMLElement, Text, Document>

    mmlVisitor = new SerializedMmlVisitor()

    isReady.value = true
  }

  /**
   * 将 LaTeX 字符串渲染为 SVG 和 MathML。
   *
   * @param latex   - LaTeX 表达式，如 `\\frac{a}{b}`、`\\ce{H2O}`
   * @param display - 是否使用展示模式（居中、大号），默认 true
   * @returns { svgElement: SVG 元素, mathml: MathML 字符串 }
   */
  function render(latex: string, display = true): RenderResult {
    if (latex.length > MAX_LATEX_LENGTH) {
      throw new Error(`公式过长，最多支持 ${MAX_LATEX_LENGTH} 个字符`)
    }
    if (!isReady.value) {
      throw new Error('MathJax 未初始化，请先调用 useMathJax().ready()')
    }

    // 为本次渲染创建 MathItem
    const mathItem: MathItem<HTMLElement, Text, Document> = new HTMLMathItem(
      latex,
      texInput!,
      display,
    )

    // 设置字体度量参数：em=16px, ex=8px, containerWidth=1280px
    mathItem.setMetrics(16, 8, 80 * 16, 1000000, 1)

    // 第一步：编译 LaTeX → MmlNode 语法树
    mathItem.compile(doc!)

    // 第二步：将语法树序列化为 MathML 字符串
    const mathml = mathItem.root
      ? mmlVisitor!.visitTree(mathItem.root)
      : '<math xmlns="http://www.w3.org/1998/Math/MathML"><merror><mtext>Parse error</mtext></merror></math>'

    // 如果解析失败（root 为 null），提前返回空 SVG + 错误 MathML
    if (!mathItem.root) {
      const errSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as unknown as SVGElement
      return { svgElement: errSvg, mathml }
    }

    // 第三步：将语法树渲染为 SVG 元素
    mathItem.typeset(doc!)

    const svgElement = mathItem.typesetRoot as unknown as SVGElement
    applySvgFonts(svgElement)

    return { svgElement, mathml }
  }

  return { render, ready, isReady }
}
