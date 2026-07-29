import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { Canvg } from 'canvg'

/** Maximum canvas dimension. */
const MAX_CANVAS_SIZE = 4096

/** Padding around content (in SVG coordinate space). */
const CONTENT_PADDING = 1000

/**
 * Convert an SVG element to a base64 PNG data URI.
 *
 * Uses the DOM's getBBox() on the formula content to find exact bounds,
 * then renders only that region via canvg — no wasted whitespace.
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  const serializer = new XMLSerializer()

  // Get the SVG's coordinate space from its viewBox
  const viewBox = svgElement.getAttribute('viewBox')
  const vbParts = viewBox?.split(/\s+/).map(Number) ?? []
  const vbX = vbParts[0] ?? 0
  const vbY = vbParts[1] ?? 0
  const vbW = vbParts[2] ?? 12800
  const vbH = vbParts[3] ?? 2000

  // Find the content <g> and get its actual bounding box
  const contentG = svgElement.querySelector('g[data-mml-node="math"]') as SVGGraphicsElement | null
  let contentBBox: DOMRect | null = null
  try {
    contentBBox = contentG?.getBBox() ?? null
  } catch {
    // getBBox may fail if element isn't in the DOM
  }

  let cropX: number, cropY: number, cropW: number, cropH: number

  if (contentBBox && contentBBox.width > 0 && contentBBox.height > 0) {
    // Use exact content bounds with padding
    const pad = CONTENT_PADDING
    cropX = Math.max(vbX, contentBBox.x - pad)
    cropY = Math.max(vbY, contentBBox.y - pad)
    cropW = Math.min(vbW - (cropX - vbX), contentBBox.width + pad * 2)
    cropH = Math.min(vbH - (cropY - vbY), contentBBox.height + pad * 2)
  } else {
    // Fallback: use full viewBox
    cropX = vbX
    cropY = vbY
    cropW = vbW
    cropH = vbH
  }

  // Calculate pixel dimensions from the viewBox ratio
  const rawW = parseFloat(svgElement.getAttribute('width') ?? '0')
  const exToPx = rawW > 0 && (svgElement.getAttribute('width') ?? '').endsWith('ex')
    ? rawW / vbW
    : 1

  const contentW = Math.ceil(cropW * exToPx)
  const contentH = Math.ceil(cropH * exToPx)

  // 2x retina, capped
  const outW = Math.min(contentW * 2, MAX_CANVAS_SIZE)
  const outH = Math.min(contentH * 2, MAX_CANVAS_SIZE)

  // Build a cropped SVG by adjusting the viewBox
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(serializer.serializeToString(svgElement), 'image/svg+xml')
  const svgRoot = svgDoc.documentElement
  svgRoot.setAttribute('viewBox', `${cropX} ${cropY} ${cropW} ${cropH}`)
  svgRoot.setAttribute('width', `${contentW}`)
  svgRoot.setAttribute('height', `${contentH}`)
  const croppedSvgString = new XMLSerializer().serializeToString(svgRoot)

  // Render to canvas
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas 2d context')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, outW, outH)

  const v = Canvg.fromString(ctx, croppedSvgString, {
    ignoreDimensions: true,
    scaleWidth: outW,
    scaleHeight: outH,
  })
  await v.render()

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
