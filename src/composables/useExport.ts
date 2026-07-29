import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'

/** Maximum canvas dimension to prevent memory exhaustion. */
const MAX_CANVAS_SIZE = 4096

/** Fallback dimensions when the SVG image has no natural size. */
const FALLBACK_WIDTH = 400
const FALLBACK_HEIGHT = 200

/**
 * Convert an SVG element to a base64 PNG data URI.
 *
 * Pipeline: SVG element → XML string → Blob → Image → Canvas → dataURL.
 * This is a standalone utility so it can be used independently of the
 * export pipeline (e.g. by PreviewPanel for @render events).
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Clone and fix up the SVG for standalone rendering.
  // MathJax outputs width/height in ex units (e.g. width="15ex") which
  // browsers cannot resolve when the SVG is loaded as a standalone <img>
  // (there's no CSS font context). We convert ex-based dimensions to px
  // using the em/ex values from the metrics (em=16, ex=8).
  const clone = svgElement.cloneNode(true) as SVGElement

  // Convert ex-based width/height to px so the standalone image resolves
  const rawW = clone.getAttribute('width')
  const rawH = clone.getAttribute('height')
  if (rawW && rawW.endsWith('ex')) {
    clone.setAttribute('width', String(parseFloat(rawW) * 8))
  }
  if (rawH && rawH.endsWith('ex')) {
    clone.setAttribute('height', String(parseFloat(rawH) * 8))
  }

  // Ensure explicit namespace for standalone rendering
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)

  // Use data URI instead of blob URL — better same-origin handling
  const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)

  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')

      const naturalW = img.naturalWidth || FALLBACK_WIDTH
      const naturalH = img.naturalHeight || FALLBACK_HEIGHT

      canvas.width = Math.min(Math.ceil(naturalW * 2), MAX_CANVAS_SIZE)
      canvas.height = Math.min(Math.ceil(naturalH * 2), MAX_CANVAS_SIZE)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas 2d context'))
        return
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/png')
      resolve(dataUrl)
    }
    img.onerror = () => {
      reject(new Error('Failed to load SVG image for export'))
    }
    img.src = dataUri
  })
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
