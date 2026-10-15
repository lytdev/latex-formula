import type { Style } from 'mathlive'

/** Shared by the toolbar and MathLive; keep explicit mappings for compatibility. */
export const mathFontOptions: { value: string; content: string; english: string; style: Style }[] = [
  { value: 'mathnormal', content: '默认数学字体', english: 'Default math', style: { variant: 'normal', variantStyle: '' } },
  { value: 'mathrm', content: '衬线正体', english: 'Roman', style: { variant: 'main', variantStyle: 'up' } },
  { value: 'mathbf', content: '衬线粗体', english: 'Bold', style: { variant: 'main', variantStyle: 'bold' } },
  { value: 'mathit', content: '衬线斜体', english: 'Italic', style: { variant: 'main', variantStyle: 'italic' } },
  { value: 'mathsf', content: '无衬线体', english: 'Sans serif', style: { variant: 'sans-serif', variantStyle: 'up' } },
  { value: 'mathtt', content: '等宽体', english: 'Monospace', style: { variant: 'monospace', variantStyle: 'up' } },
  { value: 'mathcal', content: '花体', english: 'Calligraphic', style: { variant: 'calligraphic', variantStyle: 'up' } },
  { value: 'mathfrak', content: '哥特体', english: 'Fraktur', style: { variant: 'fraktur', variantStyle: 'up' } },
]
