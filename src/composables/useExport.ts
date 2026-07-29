import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { toPng } from 'dom-to-image-more'

/**
 * Hidden container for rendering formulas off-screen.
 */
let exportContainer: HTMLDivElement | null = null
function getExportContainer(): HTMLDivElement {
  if (!exportContainer) {
    exportContainer = document.createElement('div')
    exportContainer.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;'
    document.body.appendChild(exportContainer)
  }
  return exportContainer
}

/**
 * Convert a LaTeX formula to a base64 PNG by rendering it in a
 * hidden DOM element and capturing with dom-to-image-more.
 * No SVG serialization needed — it captures exactly what MathJax renders.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const container = getExportContainer()

  // Clear previous content and append the new SVG
  container.innerHTML = ''
  container.appendChild(svgElement.cloneNode(true))

  // Capture the rendered element as PNG at 2x resolution
  const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
    bgcolor: '#ffffff',
    scale: 2,
  })

  // Clean up
  container.innerHTML = ''

  return dataUrl
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
