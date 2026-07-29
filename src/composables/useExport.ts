import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { toPng } from 'dom-to-image-more'

const PAD_PX = 16

let measureDiv: HTMLDivElement | null = null

/**
 * Capture an SVG formula as a cropped base64 PNG.
 *
 * Strategy:
 * 1. Append full SVG to hidden DOM for browser layout
 * 2. Use getBoundingClientRect for exact SVG pixel size
 * 3. Use getBBox + translate on content <g> for formula bounds in SVG units
 * 4. Map SVG-unit content bounds to pixel coordinates
 * 5. CSS-crop the SVG via a wrapper div → capture only formula area
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  if (!measureDiv) {
    measureDiv = document.createElement('div')
    measureDiv.style.cssText =
      'position:fixed;left:0;top:0;font-size:16px;opacity:0;pointer-events:none;'
    document.body.appendChild(measureDiv)
  }

  // Append clone to DOM for layout
  measureDiv.innerHTML = ''
  const clone = svgElement.cloneNode(true) as SVGElement
  measureDiv.appendChild(clone)

  // Get the SVG's actual pixel dimensions (browser-laid-out)
  const svgRect = clone.getBoundingClientRect()
  const svgPxW = svgRect.width
  const svgPxH = svgRect.height

  // Get viewBox for unit→px mapping
  const vb = clone.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 1, 1]
  const vbW = vb[2] || 1
  const vbH = vb[3] || 1
  const unitToPxX = svgPxW / vbW
  const unitToPxY = svgPxH / vbH

  // Find formula content bounds in SVG units
  const contentG = clone.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null
  let contentSvguX = vb[0] ?? 0
  let contentSvguY = vb[1] ?? 0
  let contentSvguW = vbW
  let contentSvguH = vbH

  if (contentG) {
    try {
      const bb = contentG.getBBox()
      if (bb.width > 0 && bb.height > 0) {
        const xf = contentG.getAttribute('transform') || ''
        const m = xf.match(/translate\(\s*(-?[\d.]+)\s*,?\s*(-?[\d.]+)?\s*\)/)
        const tx = m ? parseFloat(m[1]) : 0
        const ty = m && m[2] !== undefined ? parseFloat(m[2]) : 0
        contentSvguX = tx + bb.x
        contentSvguY = ty + bb.y
        contentSvguW = bb.width
        contentSvguH = bb.height
      }
    } catch { /* fallback: full viewBox */ }
  }

  // Convert to pixel coordinates
  const contentPxX = contentSvguX * unitToPxX
  const contentPxY = contentSvguY * unitToPxY
  const contentPxW = contentSvguW * unitToPxX
  const contentPxH = contentSvguH * unitToPxY

  // Add padding, clamp to SVG bounds
  const pad = PAD_PX
  const cropX = Math.max(0, Math.floor(contentPxX - pad))
  const cropY = Math.max(0, Math.floor(contentPxY - pad))
  const cropW = Math.min(Math.ceil(svgPxW - cropX), Math.ceil(contentPxW + pad * 2))
  const cropH = Math.min(Math.ceil(svgPxH - cropY), Math.ceil(contentPxH + pad * 2))

  // Create cropped capture element
  const captureSvg = svgElement.cloneNode(true) as SVGElement
  captureSvg.setAttribute('width', `${svgPxW}`)
  captureSvg.setAttribute('height', `${svgPxH}`)
  captureSvg.removeAttribute('style')

  const wrapper = document.createElement('div')
  wrapper.style.cssText = `width:${cropW}px;height:${cropH}px;overflow:hidden;position:relative;`
  captureSvg.style.cssText = `position:absolute;left:${-cropX}px;top:${-cropY}px;`
  wrapper.appendChild(captureSvg)

  measureDiv.innerHTML = ''
  measureDiv.appendChild(wrapper)

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
