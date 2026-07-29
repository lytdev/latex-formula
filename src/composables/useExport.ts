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
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  // Create an SVG blob and object URL
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)

  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')

      // Use naturalWidth/naturalHeight (the SVG's intrinsic size)
      // rather than getBBox() which may not be available or accurate.
      const naturalW = img.naturalWidth || FALLBACK_WIDTH
      const naturalH = img.naturalHeight || FALLBACK_HEIGHT

      // Scale up 2x for retina sharpness, capped to MAX_CANVAS_SIZE
      canvas.width = Math.min(Math.ceil(naturalW * 2), MAX_CANVAS_SIZE)
      canvas.height = Math.min(Math.ceil(naturalH * 2), MAX_CANVAS_SIZE)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get canvas 2d context'))
        return
      }
      // White background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // Draw the image scaled to fill canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const dataUrl = canvas.toDataURL('image/png')
      URL.revokeObjectURL(url)
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image for export'))
    }
    img.src = url
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
