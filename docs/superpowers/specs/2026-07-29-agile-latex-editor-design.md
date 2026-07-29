# Agile LaTeX Editor — Design Spec

**Date:** 2026-07-29  
**Status:** Approved  
**Project:** `agile-latex` — npm-published Vue 3 component

---

## 1. Overview

A self-contained Vue 3 component library that provides a LaTeX online editor. Covers mathematical formulas, physics formulas, and chemical equations. Includes a built-in symbol library (math symbols, Greek letters, arrows, function templates, matrix templates, chemistry templates). One-stop LaTeX formula generation and editing.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering engine | **MathJax 3** | Full LaTeX package support (AMSmath, mhchem, physics), native MathML output — essential for chemistry (`\ce`) |
| Build tool | **Vite (library mode)** | Modern, fast, tree-shaking, ESM + CJS outputs, `vite-plugin-dts` for type declarations |
| UI framework | **TDesign Vue Next** (peer dependency) | Per project requirements; consumer supplies their own instance |
| Language | **TypeScript** | Type safety, auto-completion for npm consumers |
| Target | **Desktop only** | Fixed three-panel layout, no responsive/mobile requirements |

---

## 2. Architecture

### Component Tree

```
AgileLatex.vue (entry — single-file component export)
├── SymbolPanel.vue         — Top: symbol/template quick-input buttons
│   └── uses TDesign t-tabs, t-button
├── LatexInput.vue          — Bottom-left: LaTeX code editor
│   └── uses TDesign t-textarea
├── PreviewPanel.vue        — Bottom-right: live MathJax-rendered output
│   └── scrollable container with MathJax output
└── composables/
    ├── useMathJax.ts       — MathJax init, render, MathML extraction
    ├── useExport.ts        — SVG → HTML5 canvas → base64 PNG pipeline
    └── useSymbols.ts       — Symbol categories & LaTeX snippet definitions
```

### Dependencies

| Package | Role | Bundle |
|---------|------|--------|
| `mathjax@3` | LaTeX → MathML + SVG rendering | Bundled (dependency) |
| `tdesign-vue-next` | UI components (tabs, buttons, textarea) | Peer dependency |
| `vue` (^3.3) | Runtime | Peer dependency |

### Build Output

ESM (`.mjs`) + CJS (`.cjs`) + TypeScript declarations (`.d.ts`) generated via Vite library mode + `vite-plugin-dts`.

---

## 3. Data Flow

```
┌──────────────────────────────────────────────────────────┐
│ Symbol button click (top panel)                          │
│   ↓ inserts snippet at cursor / appends to text          │
│ LatexInput updates (v-model)                             │
│   ↓ debounced 300ms                                      │
│ useMathJax.render(latexString) → renders in PreviewPanel │
│   ↓                                                      │
│ emit('render', result)                                   │
└──────────────────────────────────────────────────────────┘

Export flow (exportFormula method):
  current LaTeX string
  → MathJax typeset → SVG DOM output
  → SVG serialization → HTML5 Canvas → toDataURL('image/png')
  → MathJax MathML extraction
  → Return { latex, mathml, base64 }

Display flow (renderFormula method):
  set input → trigger render → return export object
```

### State Model

```
latexCode: string          — current LaTeX input (v-model)
previewHtml: string        — MathJax-rendered HTML/SVG for preview
activeSymbolTab: string    — currently selected symbol category tab
isRendering: boolean       — render in-progress flag
```

---

## 4. UI Layout (Desktop-only, fixed)

```
┌──────────────────────────────────────────────────────────┐
│  SymbolPanel (top section, ~30% height)                  │
│  [ 常用函数 | 希腊字母 | 运算 | 箭头 | 矩阵 | 化学公式 ]   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │\frac│ │\sqrt│ │\sum │ │\int │ │\lim │ │\sin │ │更多│  │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘     │
├───────────────────────┬──────────────────────────────────┤
│  LatexInput           │  PreviewPanel                    │
│  (~50% width)         │  (~50% width)                    │
│  ┌──────────────────┐ │  ┌────────────────────────────┐  │
│  │\frac{d}{dx}      │ │  │                            │  │
│  │\sin(x) = \cos(x) │ │  │   d                       │  │
│  │                  │ │  │  ── sin(x) = cos(x)        │  │
│  │                  │ │  │   dx                      │  │
│  │                  │ │  │                            │  │
│  └──────────────────┘ │  └────────────────────────────┘  │
│                    [ 导出 ]                              │
└───────────────────────┴──────────────────────────────────┘
```

### Symbol Categories & Content

1. **常用函数 (Common Functions):** `\frac{}{}`, `\sqrt{}`, `\sqrt[]{}`, `\sum`, `\int`, `\iint`, `\oint`, `\lim`, `\log`, `\ln`, `\sin`, `\cos`, `\tan`, `\arcsin`, `\arccos`, `\arctan`, `\max`, `\min`

2. **希腊字母 (Greek Letters):** Lowercase (`\alpha`–`\omega`) + Uppercase (`\Gamma`, `\Delta`, `\Theta`, `\Lambda`, `\Xi`, `\Pi`, `\Sigma`, `\Phi`, `\Psi`, `\Omega`)

3. **运算符号 (Operators):** `\times`, `\div`, `\pm`, `\mp`, `\cdot`, `\ast`, `\star`, `\circ`, `\bullet`, `\oplus`, `\ominus`, `\otimes`, `\oslash`, `\odot`, `\leq`, `\geq`, `\neq`, `\approx`, `\equiv`, `\sim`, `\propto`, `\ll`, `\gg`

4. **箭头符号 (Arrows):** `\rightarrow`, `\leftarrow`, `\Rightarrow`, `\Leftarrow`, `\Leftrightarrow`, `\longrightarrow`, `\longleftarrow`, `\uparrow`, `\downarrow`, `\mapsto`, `\rightleftharpoons`

5. **矩阵模板 (Matrix Templates):** `\begin{matrix}` (plain), `\begin{pmatrix}` (parentheses), `\begin{bmatrix}` (brackets), `\begin{Bmatrix}` (braces), `\begin{vmatrix}` (determinant), `\begin{Vmatrix}` (norm), `\begin{cases}` (piecewise)

6. **数学符号 (Math Symbols):** `\infty`, `\partial`, `\nabla`, `\forall`, `\exists`, `\emptyset`, `\in`, `\notin`, `\subset`, `\supset`, `\subseteq`, `\supseteq`, `\cup`, `\cap`, `\setminus`, `\angle`, `\triangle`, `\square`, `\perp`, `\parallel`

7. **化学公式 (Chemistry):** `\ce{}` wrapper, `\ce{->}`, `\ce{<=>}`, `\ce{H2O}`, `\ce{CO2}`, `\ce{^{227}_{90}Th+}`, `\ce{[Fe(H2O)6]^2+}`, `\ce{A ->[k] B}`, `\ce{NaCl(aq)}`

---

## 5. Component API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `''` | LaTeX input code (v-model) |
| `placeholder` | `string` | `'输入 LaTeX 公式...'` | Input placeholder text |
| `readonly` | `boolean` | `false` | Disable editing |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | v-model update (standard Vue) |
| `render` | `AgileLatexExport` | Emitted each time preview re-renders |

### Exposed Methods (via template ref)

```typescript
interface AgileLatexExport {
  latex: string    // LaTeX source code
  mathml: string   // MathML representation
  base64: string   // Base64-encoded PNG (data:image/png;base64,...)
}

// exportFormula(): AgileLatexExport
// Returns export object for current formula

// renderFormula(latex: string): AgileLatexExport
// Sets LaTeX input, renders, and returns export object
```

### Consumer Usage

```vue
<template>
  <AgileLatex
    v-model="latexCode"
    placeholder="输入公式..."
    ref="editorRef"
    @render="handleRender"
  />
  <t-button @click="doExport">导出</t-button>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { AgileLatex, type AgileLatexExport } from 'agile-latex'
import 'tdesign-vue-next/es/style/index.css'

const latexCode = ref('')
const editorRef = useTemplateRef('editorRef')

function handleRender(result: AgileLatexExport) {
  console.log('rendered:', result)
}

function doExport() {
  const result = editorRef.value!.exportFormula()
  // use result.latex, result.mathml, result.base64
}
</script>
```

---

## 6. Export Pipeline Detail

The `base64` PNG generation is entirely client-side:

```
MathJax typeset LaTeX
  → produces SVG element in DOM
  → serialize SVG to XML string
  → draw SVG onto HTML5 Canvas (via Image + drawImage)
  → canvas.toDataURL('image/png')
  → return data URI string
```

This requires no external service, works offline, and produces a standard PNG.

---

## 7. Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript 5.x |
| Build | Vite 6.x (library mode) + `vite-plugin-dts` |
| Renderer | MathJax 3 (TeX input, SVG + MathML output, mhchem extension) |
| UI Kit | TDesign Vue Next (peer dep, t-tabs, t-button, t-textarea) |
| CSS | Scoped styles + TDesign CSS variables |
| Package manager | pnpm (recommended for library dev) |
| Lint | ESLint + Prettier (optional, can add later) |

---

## 8. Out of Scope

- Mobile/responsive layout (desktop-only by design)
- Equation numbering / cross-referencing
- Multi-editor tabs or file management
- History/undo beyond browser-native undo
- LaTeX AST editing or graphical equation builder

---

## 9. Reference

- MathJax 3 docs: https://docs.mathjax.org/en/latest/
- TDesign Vue Next: https://tdesign.tencent.com/vue-next/overview
- Reference projects: processon.com/latex, latexlive.com
