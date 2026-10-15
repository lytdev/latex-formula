import { useMathJax } from './useMathJax'
import type { LatexFormulaExport } from '../types'

/** Rasterize self-contained MathJax SVG directly, without a base64 intermediate. */
async function svgToPngBlob(svgElement: Element, scale: number): Promise<Blob> {
  const svg = (svgElement.matches('svg') ? svgElement : svgElement.querySelector('svg'))?.cloneNode(true) as SVGSVGElement | undefined
  if (!svg) throw new Error('公式未生成有效的 SVG 图像')
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:18px;color:#000;'
  container.appendChild(svg)
  document.body.appendChild(container)
  let url: string | undefined
  try {
    // Resolve MathJax's ex units in the document before decoding the standalone SVG.
    const bounds = svg.getBoundingClientRect()
    const width = Math.ceil(bounds.width * scale)
    const height = Math.ceil(bounds.height * scale)
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error('公式图片尺寸无效，无法导出')
    }
    if (width > 16_384 || height > 16_384 || width * height > 32_000_000) {
      throw new Error('图片尺寸过大，请缩短公式或减小字号。')
    }
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    svg.style.color = '#000'
    url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml;charset=utf-8',
    }))
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG 图像解码失败。'))
      img.src = url!
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法创建 Canvas。')
    context.drawImage(img, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 编码失败。')), 'image/png')
    })
  } finally {
    if (url) URL.revokeObjectURL(url)
    container.remove()
  }
}

/** 同一份 PNG 数据同时提供 Blob 和兼容的 data URL。 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('PNG 数据读取失败。'))
    }
    reader.onerror = () => reject(new Error('PNG 数据读取失败。'))
    reader.onabort = () => reject(new Error('PNG 数据读取已取消。'))
    reader.readAsDataURL(blob)
  })
}

export function useExport(): {
  exportFormula: (latex: string) => Promise<LatexFormulaExport>
} {
  const { render, ready } = useMathJax()

  async function exportFormula(latex: string): Promise<LatexFormulaExport> {
    if (!latex.trim()) throw new Error('公式不能为空')
    ready()
    const { svgElement, mathml } = render(latex)
    if (mathml.includes('<merror')) throw new Error('公式语法错误，无法导出 PNG')
    const blob = await svgToPngBlob(svgElement, 2)
    const base64 = await blobToDataUrl(blob)
    return { latex, mathml, base64, blob }
  }

  return { exportFormula }
}
