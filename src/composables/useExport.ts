import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { Canvg } from 'canvg'

/** Maximum canvas dimension to prevent memory exhaustion. */
const MAX_CANVAS_SIZE = 4096

/**
 * Convert an SVG element to a base64 PNG data URI.
 *
 * Uses canvg to render SVG directly to canvas — avoids browser security
 * restrictions that prevent MathJax SVG (with <use> references) from
 * loading in <img> tags.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Serialize the SVG element to a string
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  // Parse ex-based dimensions from MathJax output (em=16, ex=8)
  const rawW = svgElement.getAttribute('width')
  const rawH = svgElement.getAttribute('height')
  let width = parseFloat(rawW ?? '0')
  let height = parseFloat(rawH ?? '0')
  if (rawW?.endsWith('ex')) width *= 8
  if (rawH?.endsWith('ex')) height *= 8

  // Fallback if dimensions still unknown
  if (!width || !height) {
    width = 400
    height = 200
  }

  // 2x for retina, cap to max
  width = Math.min(Math.ceil(width * 2), MAX_CANVAS_SIZE)
  height = Math.min(Math.ceil(height * 2), MAX_CANVAS_SIZE)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context')
  }

  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Use canvg to render SVG directly onto canvas — no <img> loading needed
  const v = Canvg.fromString(ctx, svgString)
  await v.render()

  return canvas.toDataURL('image/png')
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
