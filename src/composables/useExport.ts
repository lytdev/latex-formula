import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { snapdom } from '@zumer/snapdom'

const CAPTURE_WIDTH = 800

/**
 * Convert a LaTeX formula SVG to a base64 PNG via @zumer/snapdom.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const container = document.createElement('div')
  container.style.cssText = `
    position:fixed;left:0;top:0;
    width:${CAPTURE_WIDTH}px;
    font-size:16px;
    opacity:0;pointer-events:none;
  `

  const clone = svgElement.cloneNode(true) as SVGElement
  clone.removeAttribute('style')

  // Let CSS control the display size: SVG fills container width,
  // height auto-calculates from the viewBox aspect ratio.
  clone.style.width = '100%'
  clone.style.height = 'auto'

  container.appendChild(clone)
  document.body.appendChild(container)

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
