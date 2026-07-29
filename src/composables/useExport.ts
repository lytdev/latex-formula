import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { Canvg } from 'canvg'

const MAX_CANVAS_SIZE = 4096
const PADDING_PX = 8

/**
 * Scan canvas pixels to find the bounding box of actual content
 * (any pixel darker than pure white).
 */
function scanContentBounds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } {
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data
  let minX = w, minY = h, maxX = 0, maxY = 0

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      // Treat any pixel that isn't near-white as content
      if (d[i] < 248 || d[i + 1] < 248 || d[i + 2] < 248) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (minX > maxX) {
    // No content found — return full image
    return { x: 0, y: 0, w, h }
  }

  // Add padding, clamp to image bounds
  const p = PADDING_PX
  const x = Math.max(0, minX - p)
  const y = Math.max(0, minY - p)
  const cw = Math.min(w - x, maxX - minX + p * 2)
  const ch = Math.min(h - y, maxY - minY + p * 2)
  return { x, y, w: cw, h: ch }
}

/**
 * Convert an SVG element to a cropped base64 PNG.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const clone = svgElement.cloneNode(true) as SVGElement

  // Get pixel dimensions from the SVG's ex-based width/height
  const exW = parseFloat(clone.getAttribute('width')?.replace('ex', '') ?? '0') || 10
  const exH = parseFloat(clone.getAttribute('height')?.replace('ex', '') ?? '0') || 2
  const pxW = Math.ceil(exW * 8) // ex → px (em=16, ex=8)
  const pxH = Math.ceil(exH * 8)

  // Ensure explicit namespace
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  // Remove any background-color from the SVG (MathJax may add a gray bg)
  clone.removeAttribute('style')
  clone.querySelectorAll('[style]').forEach((el) => {
    ;(el as HTMLElement).style.backgroundColor = ''
    ;(el as HTMLElement).style.background = ''
  })

  const svgString = new XMLSerializer().serializeToString(clone)

  // Render at 1x to detect content bounds
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = pxW
  tempCanvas.height = pxH
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) throw new Error('Failed to get canvas 2d context')

  tempCtx.fillStyle = '#ffffff'
  tempCtx.fillRect(0, 0, pxW, pxH)

  const v1 = Canvg.fromString(tempCtx, svgString)
  await v1.render()

  // Scan for actual content
  const bounds = scanContentBounds(tempCtx, pxW, pxH)

  if (bounds.w <= 2 || bounds.h <= 2) {
    // Content too small — use full image
    return tempCanvas.toDataURL('image/png')
  }

  // Render cropped region at 2x
  const outW = Math.min(bounds.w * 2, MAX_CANVAS_SIZE)
  const outH = Math.min(bounds.h * 2, MAX_CANVAS_SIZE)

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas 2d context')

  // Draw cropped region from temp canvas, scaled 2x
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)
  ctx.drawImage(
    tempCanvas,
    bounds.x, bounds.y, bounds.w, bounds.h,
    0, 0, outW, outH,
  )

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
