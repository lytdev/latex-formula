import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { snapdom } from '@zumer/snapdom'

/**
 * Convert a LaTeX formula SVG to a base64 PNG via @zumer/snapdom.
 *
 * Renders the SVG in a fully visible DOM container so the browser
 * completes layout, then captures with snapdom.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Create a visible container — no opacity:0, let it auto-size to content
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;font-size:18px;padding:2px 0;margin:0;'

  const clone = svgElement.cloneNode(true) as SVGElement
  clone.removeAttribute('style')
  container.appendChild(clone)
  document.body.appendChild(container)

  // Capture the entire container (not just the SVG)
  const canvas = await snapdom.toCanvas(container, {
    scale: 2,
    reconcile: true,
  })

  document.body.removeChild(container)
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
