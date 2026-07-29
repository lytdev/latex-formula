import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'

export function useExport(): {
  exportFormula: (latex: string) => Promise<AgileLatexExport>
} {
  const { render, ready } = useMathJax()

  /**
   * Convert an SVG element to a base64 PNG data URI.
   * Pipeline: SVG element → XML string → Blob → Image → Canvas → dataURL
   */
  async function svgToBase64(svgElement: Element): Promise<string> {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)

    // Create an SVG blob and object URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Use the SVG's natural dimensions, or fall back to reasonable defaults
        const bbox = (svgElement as SVGGraphicsElement).getBBox?.()
        canvas.width = bbox ? Math.ceil(bbox.width) * 2 : img.width * 2 || 800
        canvas.height = bbox ? Math.ceil(bbox.height) * 2 : img.height * 2 || 200

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
      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    })
  }

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
