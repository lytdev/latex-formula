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
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;'
    document.body.appendChild(measureDiv)
  }

  // Clone and fix dimensions: convert ex → px so the element
  // has a resolvable size even off-screen.
  const clone = svgElement.cloneNode(true) as SVGElement
  const attW = clone.getAttribute('width')
  const attH = clone.getAttribute('height')
  const exW = attW ? parseFloat(attW.replace('ex', '')) : 15
  const exH = attH ? parseFloat(attH.replace('ex', '')) : 3
  clone.setAttribute('width', `${Math.ceil(exW * 8)}px`)
  clone.setAttribute('height', `${Math.ceil(exH * 8)}px`)

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
