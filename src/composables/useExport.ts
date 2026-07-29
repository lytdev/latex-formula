import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { toPng } from 'dom-to-image-more'

const PAD = 500 // padding in SVG viewBox units

/**
 * Hidden container for measuring SVG dimensions before capture.
 */
let measureDiv: HTMLDivElement | null = null
function getMeasureDiv(): HTMLDivElement {
  if (!measureDiv) {
    measureDiv = document.createElement('div')
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;'
    document.body.appendChild(measureDiv)
  }
  return measureDiv
}

/**
 * Convert LaTeX to a base64 PNG.
 *
 * 1. Render formula to SVG via MathJax
 * 2. Append to hidden DOM → getBBox for exact content bounds
 * 3. Crop viewBox to content area
 * 4. Capture with dom-to-image-more
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const div = getMeasureDiv()
  const clone = svgElement.cloneNode(true) as SVGElement
  div.innerHTML = ''
  div.appendChild(clone)

  // Get content bounds in SVG viewBox coordinates
  const vb = clone.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 12800, 2000]
  const vbW = vb[2] || 12800
  const contentG = clone.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null

  let cx = vb[0] ?? 0
  let cy = vb[1] ?? 0
  let cw = vbW
  let ch = vb[3] ?? 2000

  if (contentG) {
    try {
      const bbox = contentG.getBBox()
      if (bbox.width > 0 && bbox.height > 0) {
        // Parse translate from <g transform="translate(X, Y)">
        const xf = contentG.getAttribute('transform') || ''
        const m = xf.match(/translate\(\s*(-?[\d.]+)\s*,?\s*(-?[\d.]+)?\s*\)/)
        const tx = m ? parseFloat(m[1]) : 0
        const ty = m && m[2] !== undefined ? parseFloat(m[2]) : 0

        cx = tx + bbox.x - PAD
        cy = ty + bbox.y - PAD
        cw = bbox.width + PAD * 2
        ch = bbox.height + PAD * 2
      }
    } catch { /* use full viewBox */ }
  }

  // Crop viewBox and resize
  clone.setAttribute('viewBox', `${cx} ${cy} ${cw} ${ch}`)

  // Calculate pixel dimensions from viewBox ratio
  const exToPx = vbW > 0
    ? parseFloat(clone.getAttribute('width')?.replace('ex', '') || '0') * 8 / vbW
    : 1
  const pxW = Math.max(1, Math.ceil(cw * exToPx))
  const pxH = Math.max(1, Math.ceil(ch * exToPx))
  clone.setAttribute('width', `${pxW}`)
  clone.setAttribute('height', `${pxH}`)

  // Capture cropped SVG
  const dataUrl = await toPng(clone, {
    bgcolor: '#ffffff',
    scale: 2,
  })

  div.innerHTML = ''
  return dataUrl
}

export function useExport(): {
  exportFormula: (latex: string) => Promise<AgileLatexExport>
} {
  const { render, ready } = useMathJax()

  async function exportFormula(latex: string): Promise<AgileLatexExport> {
    ready()
    const { svgElement, mathml } = render(latex)
    const base64 = await svgToBase64(svgElement)
    return { latex, mathml, base64 }
  }

  return { exportFormula }
}
