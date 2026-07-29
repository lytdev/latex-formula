import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { snapdom } from '@zumer/snapdom'

/**
 * Convert a LaTeX formula SVG to a base64 PNG via @zumer/snapdom.
 *
 * Strategy:
 * 1. Render the SVG into a fixed-size container so the browser lays it out
 * 2. Capture only the SVG element with snapdom at 2x resolution
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Create a container to host the SVG for layout
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:0;top:0;width:800px;font-size:16px;opacity:0;pointer-events:none;'

  const clone = svgElement.cloneNode(true) as SVGElement
  clone.removeAttribute('style')
  container.appendChild(clone)
  document.body.appendChild(container)

  // Capture the SVG element — snapdom renders it at its natural size
  const canvas = await snapdom.toCanvas(clone, {
    scale: 2,
    backgroundColor: '#ffffff',
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
