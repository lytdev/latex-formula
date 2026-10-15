/** Explicit font markers survive LaTeX mode switches and history. */
export const formulaFonts = {
  times: { className: 'lf-font-times', family: '"Times New Roman", serif' },
} as const

export const formulaFontStyles = Object.values(formulaFonts).map(({ className, family }) =>
  `.${className} { --lf-font-family: ${family}; }
   .${className} .ML__cmr, .${className} .ML__mathit, .${className} .ML__mathbf, .${className} .ML__mathbfit, .${className} .ML__text { font-family: var(--lf-font-family); }`,
).join('\n')

/** MathJax normally draws outlines; marked ordinary glyphs use the chosen font. */
export function applySvgFonts(root: Element) {
  for (const path of root.querySelectorAll<SVGPathElement>('path[data-c]')) {
    const owner = path.closest('.lf-font-times')
    if (!owner) continue
    const code = Number.parseInt(path.getAttribute('data-c') || '', 16)
    if (!Number.isFinite(code)) continue
    const original = String.fromCodePoint(code)
    const character = original.normalize('NFKD')
    // Keep extensible delimiters, operators and TeX construction pieces intact.
    if (!/^[\p{L}\p{N}]$/u.test(character)) continue
    const font = formulaFonts.times
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.textContent = character
    text.setAttribute('font-family', font.family)
    text.setAttribute('font-size', '1000')
    text.setAttribute('stroke', 'none')
    // MathJax glyph coordinates point upwards; SVG text coordinates point downwards.
    text.setAttribute('transform', `${path.getAttribute('transform') || ''} scale(1,-1)`)
    if ((code >= 0x1d434 && code <= 0x1d49b) || code === 0x210e) text.setAttribute('font-style', 'italic')
    if ((code >= 0x1d400 && code <= 0x1d433) || (code >= 0x1d468 && code <= 0x1d49b)) text.setAttribute('font-weight', 'bold')
    path.replaceWith(text)
  }
}
