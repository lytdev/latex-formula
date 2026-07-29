import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { Canvg } from 'canvg'

const MAX_CANVAS_SIZE = 4096
const CONTENT_PADDING_VB = 500 // padding in SVG viewBox units

/**
 * Get a hidden container for measuring SVG elements.
 * Created once, reused across exports.
 */
let measureContainer: HTMLElement | null = null
function getMeasureContainer(): HTMLElement {
  if (!measureContainer) {
    measureContainer = document.createElement('div')
    measureContainer.style.cssText =
      'position:fixed;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;visibility:hidden;'
    document.body.appendChild(measureContainer)
  }
  return measureContainer
}

/**
 * Convert an SVG element to a cropped base64 PNG.
 *
 * Strategy:
 * 1. Append SVG to hidden DOM container so browser lays it out
 * 2. Use getBBox() on content <g> for exact formula bounds
 * 3. Crop the SVG viewBox to match content bounds
 * 4. Render cropped SVG via canvg at 2x resolution
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Step 1: append to hidden DOM for layout
  const container = getMeasureContainer()
  const clone = svgElement.cloneNode(true) as SVGElement
  container.appendChild(clone)

  // Step 2: get content bounding box in SVG coordinates
  const viewBox = clone.getAttribute('viewBox')
  const vbParts = viewBox?.split(/\s+/).map(Number) ?? []
  const vbW = vbParts[2] || 12800
  const vbH = vbParts[3] || 2000

  const contentG = clone.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null
  let cx = vbParts[0] ?? 0
  let cy = vbParts[1] ?? 0
  let cw = vbW
  let ch = vbH

  if (contentG) {
    try {
      const bbox = contentG.getBBox()
      if (bbox.width > 0 && bbox.height > 0) {
        // getBBox returns coords in the <g>'s LOCAL space.
        // The <g> has transform="translate(tx, ty)" for centering —
        // add that offset to get SVG-viewBox-space coordinates.
        const xf = contentG.getAttribute('transform') || ''
        const m = xf.match(/translate\(\s*(-?[\d.]+)\s*,?\s*(-?[\d.]+)?\s*\)/)
        const tx = m ? parseFloat(m[1]) : 0
        const ty = m && m[2] !== undefined ? parseFloat(m[2]) : 0

        cx = tx + bbox.x - CONTENT_PADDING_VB
        cy = ty + bbox.y - CONTENT_PADDING_VB
        cw = bbox.width + CONTENT_PADDING_VB * 2
        ch = bbox.height + CONTENT_PADDING_VB * 2
      }
    } catch {
      // getBBox failed, use full viewBox
    }
  }

  // Step 3: build cropped SVG string
  clone.setAttribute('viewBox', `${cx} ${cy} ${cw} ${ch}`)
  // Width/height in px: preserve aspect ratio, base on vb ratio
  const vbRatio = (parseFloat(clone.getAttribute('width')?.replace('ex', '') ?? '0') || 120) / vbW
  const pxW = Math.max(1, Math.ceil(cw * vbRatio))
  const pxH = Math.max(1, Math.ceil(ch * vbRatio))
  clone.setAttribute('width', `${pxW}`)
  clone.setAttribute('height', `${pxH}`)

  const svgString = new XMLSerializer().serializeToString(clone)

  // Remove clone from DOM — no longer needed
  container.removeChild(clone)

  // Step 4: render cropped SVG at 2x to canvas
  const outW = Math.min(pxW * 2, MAX_CANVAS_SIZE)
  const outH = Math.min(pxH * 2, MAX_CANVAS_SIZE)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas 2d context')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)

  const v = Canvg.fromString(ctx, svgString, {
    ignoreDimensions: true,
    scaleWidth: outW,
    scaleHeight: outH,
  })
  await v.render()

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
