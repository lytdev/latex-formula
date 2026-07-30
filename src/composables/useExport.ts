import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'
import { snapdom } from '@zumer/snapdom'

/**
 * 将 LaTeX 公式渲染成 SVG 后再转为 base64 PNG 图片。
 *
 * 核心流程：
 * 1. 将 SVG 克隆到屏幕外的一个可见容器中（不使用 opacity:0），
 *    让浏览器完成完整的布局计算
 * 2. 用 @zumer/snapdom 截取该容器为 Canvas
 * 3. Canvas → toDataURL → base64 PNG
 *
 * 使用屏幕外容器（left:-9999px）而非 opacity:0，
 * 是为了确保浏览器正确解析 SVG 内部的 ex 单位和 viewBox。
 */
export async function svgToBase64(svgElement: Element): Promise<string> {
  // 创建一个屏幕外但完全可见的容器，让 SVG 正确布局
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-9999px;top:0;font-size:18px;padding:2px 0;margin:0;'

  const clone = svgElement.cloneNode(true) as SVGElement
  clone.removeAttribute('style')
  container.appendChild(clone)
  document.body.appendChild(container)

  // 用 snapdom 截取容器为 Canvas（2x 分辨率保证清晰度）
  const canvas = await snapdom.toCanvas(container, {
    scale: 2,
    reconcile: true, // 像素级精确布局，避免文字换行偏差
  })

  // 清理并返回 base64 PNG
  document.body.removeChild(container)
  return canvas.toDataURL('image/png')
}

/**
 * 导出功能的组合式函数。
 *
 * @returns exportFormula — 接收 LaTeX 字符串，返回完整的导出对象
 */
export function useExport(): {
  exportFormula: (latex: string) => Promise<AgileLatexExport>
} {
  const { render, ready } = useMathJax()

  /**
   * 渲染 LaTeX 并导出为 { latex, mathml, base64 }。
   *
   * @param latex - 用户输入的 LaTeX 代码
   * @returns 包含 LaTeX 源码、MathML 字符串和 base64 PNG 的导出对象
   */
  async function exportFormula(latex: string): Promise<AgileLatexExport> {
    // 确保 MathJax 已初始化（幂等调用，重复调用无副作用）
    ready()
    // render 是同步的，直接获取 SVG 元素和 MathML 字符串
    const { svgElement, mathml } = render(latex)
    // SVG → base64 PNG
    const base64 = await svgToBase64(svgElement)
    return { latex, mathml, base64 }
  }

  return { exportFormula }
}
