import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { snapdom } from '@zumer/snapdom'

let measureDiv: HTMLDivElement | null = null

/**
 * Convert a LaTeX formula SVG to a base64 PNG via @zumer/snapdom.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  if (!measureDiv) {
    measureDiv = document.createElement('div')
    // font-size gives ex units a context to resolve naturally
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;font-size:16px;'
    document.body.appendChild(measureDiv)
  }

  const clone = svgElement.cloneNode(true) as SVGElement

  // Remove any style that might interfere with sizing
  clone.removeAttribute('style')

  // Let ex-based width/height resolve via inherited font-size: 16px
  measureDiv.innerHTML = ''
  measureDiv.appendChild(clone)

  const canvas = await snapdom.toCanvas(clone, {
    scale: 2,
    backgroundColor: '#ffffff',
  })

  measureDiv.innerHTML = ''
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
