import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { Canvg } from 'canvg'

/** Maximum canvas dimension to prevent memory exhaustion. */
const MAX_CANVAS_SIZE = 4096

/** Padding around content in the exported image (px). */
const CONTENT_PADDING = 12

/**
 * Find the bounding box of non-white pixels in image data.
 */
function getContentBounds(imageData: ImageData): {
  minX: number; minY: number; maxX: number; maxY: number
} {
  const { data, width, height } = imageData
  let minX = width, minY = height, maxX = 0, maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      // Non-white pixel (R, G, B all < 250)
      if (data[idx] < 250 || data[idx + 1] < 250 || data[idx + 2] < 250) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  // Fallback if no content found (empty SVG)
  if (minX > maxX) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 }
  }

  return { minX, minY, maxX, maxY }
}

/**
 * Convert an SVG element to a base64 PNG data URI.
 *
 * Renders SVG via canvg to a canvas, crops to actual content bounds,
 * then scales up 2x for retina sharpness.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  // Parse ex-based dimensions from MathJax (em=16, ex=8)
  const rawW = svgElement.getAttribute('width')
  const rawH = svgElement.getAttribute('height')
  let width = parseFloat(rawW ?? '0')
  let height = parseFloat(rawH ?? '0')
  if (rawW?.endsWith('ex')) width *= 8
  if (rawH?.endsWith('ex')) height *= 8
  if (!width || !height) { width = 800; height = 200 }

  // Cap initial canvas size
  width = Math.min(Math.ceil(width), MAX_CANVAS_SIZE)
  height = Math.min(Math.ceil(height), MAX_CANVAS_SIZE)

  // Step 1: render SVG at full resolution onto a canvas
  const fullCanvas = document.createElement('canvas')
  fullCanvas.width = width
  fullCanvas.height = height
  const fullCtx = fullCanvas.getContext('2d')
  if (!fullCtx) throw new Error('Failed to get canvas 2d context')

  fullCtx.fillStyle = '#ffffff'
  fullCtx.fillRect(0, 0, width, height)

  const v = Canvg.fromString(fullCtx, svgString)
  await v.render()

  // Step 2: find the actual content bounding box
  const imageData = fullCtx.getImageData(0, 0, width, height)
  const bounds = getContentBounds(imageData)

  // Step 3: crop content region with padding
  const pad = CONTENT_PADDING
  let cropX = Math.max(0, bounds.minX - pad)
  let cropY = Math.max(0, bounds.minY - pad)
  let cropW = Math.min(width - cropX, bounds.maxX - bounds.minX + pad * 2)
  let cropH = Math.min(height - cropY, bounds.maxY - bounds.minY + pad * 2)

  // Step 4: create cropped canvas at 2x for retina
  const outCanvas = document.createElement('canvas')
  outCanvas.width = Math.min(Math.ceil(cropW * 2), MAX_CANVAS_SIZE)
  outCanvas.height = Math.min(Math.ceil(cropH * 2), MAX_CANVAS_SIZE)
  const outCtx = outCanvas.getContext('2d')
  if (!outCtx) throw new Error('Failed to get output canvas 2d context')

  outCtx.fillStyle = '#ffffff'
  outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height)
  outCtx.drawImage(
    fullCanvas,
    cropX, cropY, cropW, cropH,
    0, 0, outCanvas.width, outCanvas.height,
  )

  return outCanvas.toDataURL('image/png')
}

export function useExport(): {
  exportFormula: (latex: string) => Promise<AgileLatexExport>
} {
  const { render, ready } = useMathJax()

  async function exportFormula(latex: string): Promise<AgileLatexExport> {
    // Ensure MathJax is initialized (idempotent)
    ready()

    // render is synchronous — no await needed
    const { svgElement, mathml } = render(latex)
    const base64 = await svgToBase64(svgElement)

    return {
      latex,
      mathml,
      base64,
    }
  }

  return { exportFormula }
}
