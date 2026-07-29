import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { toPng } from 'dom-to-image-more'

const PAD = 500 // SVG viewBox units padding around content

let measureDiv: HTMLDivElement | null = null

/**
 * Render SVG off-screen to measure actual content bounds,
 * then capture only the formula area wrapped in a cropped div.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // Lazy init measure container
  if (!measureDiv) {
    measureDiv = document.createElement('div')
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;opacity:0;pointer-events:none;'
    document.body.appendChild(measureDiv)
  }

  // Put SVG in measure container to get bounds
  measureDiv.innerHTML = ''
  measureDiv.appendChild(svgElement.cloneNode(true))
  const svg = measureDiv.firstElementChild as SVGElement

  // Get full viewBox
  const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 12800, 2000]
  const vbX = vb[0] ?? 0, vbY = vb[1] ?? 0, vbW = vb[2] ?? 12800, vbH = vb[3] ?? 2000

  // Get exact content bounds
  const contentG = svg.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null
  let cx = vbX, cy = vbY, cw = vbW, ch = vbH

  if (contentG) {
    try {
      const bb = contentG.getBBox()
      if (bb.width > 0 && bb.height > 0) {
        const xf = contentG.getAttribute('transform') || ''
        const m = xf.match(/translate\(\s*(-?[\d.]+)\s*,?\s*(-?[\d.]+)?\s*\)/)
        const tx = m ? parseFloat(m[1]) : 0
        const ty = m && m[2] !== undefined ? parseFloat(m[2]) : 0
        cx = tx + bb.x - PAD
        cy = ty + bb.y - PAD
        cw = bb.width + PAD * 2
        ch = bb.height + PAD * 2
      }
    } catch { /* fallback: full viewBox */ }
  }

  // Build cropped capture element: a div that clips the SVG via overflow:hidden
  // This avoids manipulating the SVG's own viewBox/coordinates at all.
  const scaleX = (parseFloat(svg.getAttribute('width')?.replace('ex', '') ?? '0') || 15) * 8 / vbW
  const scaleY = (parseFloat(svg.getAttribute('height')?.replace('ex', '') ?? '0') || 3) * 8 / vbH

  const fullPxW = Math.ceil(vbW * scaleX)
  const fullPxH = Math.ceil(vbH * scaleY)
  const cropPxW = Math.max(1, Math.round(cw * scaleX))
  const cropPxH = Math.max(1, Math.round(ch * scaleY))
  const offsetX = Math.round(cx * scaleX)
  const offsetY = Math.round(cy * scaleY)

  // Clone the SVG for capture
  const captureSvg = svgElement.cloneNode(true) as SVGElement
  captureSvg.setAttribute('width', `${fullPxW}`)
  captureSvg.setAttribute('height', `${fullPxH}`)
  captureSvg.removeAttribute('style')

  // Wrapper div clips to content area
  const wrapper = document.createElement('div')
  wrapper.style.cssText =
    `width:${cropPxW}px;height:${cropPxH}px;overflow:hidden;position:relative;`
  // Position the SVG inside so the content area is visible through the window
  captureSvg.style.position = 'absolute'
  captureSvg.style.left = `${-offsetX}px`
  captureSvg.style.top = `${-offsetY}px`
  wrapper.appendChild(captureSvg)

  measureDiv.innerHTML = ''
  measureDiv.appendChild(wrapper)

  // Capture the cropped div
  const dataUrl = await toPng(wrapper, {
    bgcolor: '#ffffff',
    scale: 2,
  })

  measureDiv.innerHTML = ''
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
