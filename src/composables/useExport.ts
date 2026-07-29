import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import html2canvas from 'html2canvas'

const PAD_PX = 16

let measureDiv: HTMLDivElement | null = null

/**
 * Convert a LaTeX formula to a base64 PNG.
 *
 * 1. Render SVG via MathJax
 * 2. Measure content bounds from DOM layout
 * 3. Crop via CSS overflow:hidden wrapper
 * 4. Capture with html2canvas
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  if (!measureDiv) {
    measureDiv = document.createElement('div')
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;font-size:16px;opacity:0;pointer-events:none;'
    document.body.appendChild(measureDiv)
  }

  // Measure: append to DOM so browser lays out the SVG
  measureDiv.innerHTML = ''
  const clone = svgElement.cloneNode(true) as SVGElement
  measureDiv.appendChild(clone)

  const svgRect = clone.getBoundingClientRect()
  const svgPxW = svgRect.width
  const svgPxH = svgRect.height

  // Map SVG units → pixels
  const vb = clone.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 1, 1]
  const vbW = vb[2] || 1
  const vbH = vb[3] || 1
  const u2pxX = svgPxW / vbW
  const u2pxY = svgPxH / vbH

  // Find formula content bounds in SVG units
  const contentG = clone.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null
  let cx = vb[0] ?? 0, cy = vb[1] ?? 0, cw = vbW, ch = vbH

  if (contentG) {
    try {
      const bb = contentG.getBBox()
      if (bb.width > 0 && bb.height > 0) {
        const xf = contentG.getAttribute('transform') || ''
        const m = xf.match(/translate\(\s*(-?[\d.]+)\s*,?\s*(-?[\d.]+)?\s*\)/)
        cx = (m ? parseFloat(m[1]) : 0) + bb.x
        cy = (m && m[2] !== undefined ? parseFloat(m[2]) : 0) + bb.y
        cw = bb.width
        ch = bb.height
      }
    } catch { /* use full viewBox */ }
  }

  // Content bounds in pixels, with padding
  const pad = PAD_PX
  const cropX = Math.max(0, Math.floor(cx * u2pxX - pad))
  const cropY = Math.max(0, Math.floor(cy * u2pxY - pad))
  const cropW = Math.min(Math.ceil(svgPxW - cropX), Math.ceil(cw * u2pxX + pad * 2))
  const cropH = Math.min(Math.ceil(svgPxH - cropY), Math.ceil(ch * u2pxY + pad * 2))

  // Build cropped capture element
  const captureSvg = svgElement.cloneNode(true) as SVGElement
  captureSvg.setAttribute('width', `${svgPxW}`)
  captureSvg.setAttribute('height', `${svgPxH}`)
  captureSvg.removeAttribute('style')
  captureSvg.style.cssText = `position:absolute;left:${-cropX}px;top:${-cropY}px;`

  const wrapper = document.createElement('div')
  wrapper.style.cssText = `width:${cropW}px;height:${cropH}px;overflow:hidden;position:relative;`
  wrapper.appendChild(captureSvg)

  measureDiv.innerHTML = ''
  measureDiv.appendChild(wrapper)

  const canvas = await html2canvas(wrapper, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    logging: false,
  })

  measureDiv.innerHTML = ''
  return canvas.toDataURL('image/png')
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
