# Agile LaTeX Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained Vue 3 component library (`agile-latex-formula`) providing a LaTeX editor with MathJax 3 rendering, symbol library, and export (LaTeX + MathML + base64 PNG).

**Architecture:** A single Vue 3 SFC (`AgileLatex.vue`) composes three sub-components (SymbolPanel, LatexInput, PreviewPanel) driven by three composables (useMathJax, useExport, useSymbols). Vite library mode produces ESM + CJS + .d.ts. MathJax 3 bundled; TDesign and Vue are peer dependencies.

**Tech Stack:** Vue 3 (Composition API), TypeScript, Vite 6 (library mode), MathJax 3 (full, with mhchem), TDesign Vue Next (peer), pnpm

## Global Constraints

- MathJax 3 (mathjax-full) from npm — no external CDN
- mhchem extension loaded for `\ce{}` chemistry support
- Desktop-only layout, fixed three-panel
- TDesign Vue Next is peer dependency (consumer installs it)
- Vue ^3.3 is peer dependency
- ESM + CJS + .d.ts build output

---

### File Structure

```
agile-latex-formula/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
├── index.html                      (dev playground entry)
├── dev/
│   ├── main.ts                     (dev bootstrap)
│   └── App.vue                     (dev playground)
├── src/
│   ├── index.ts                    (package entry — exports AgileLatex + types)
│   ├── types.ts                    (AgileLatexExport, SymbolItem interfaces)
│   ├── AgileLatex.vue              (main component — layout + wiring)
│   ├── components/
│   │   ├── SymbolPanel.vue         (top: t-tabs + symbol button grid)
│   │   ├── LatexInput.vue          (bottom-left: t-textarea)
│   │   └── PreviewPanel.vue        (bottom-right: MathJax rendered output)
│   └── composables/
│       ├── useMathJax.ts           (MathJax init, render, MathML extract)
│       ├── useExport.ts            (SVG → canvas → base64 PNG pipeline)
│       └── useSymbols.ts           (symbol categories definitions)
└── dist/                           (build output)
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `vite.config.ts`
- Create: `src/types.ts`
- Create: `src/index.ts`
- Create: `index.html`
- Create: `dev/main.ts`
- Create: `dev/App.vue`
- Create: `.gitignore`

**Interfaces:**
- Produces: `AgileLatexExport` interface, `SymbolItem` interface, package entry point, dev playground skeleton

- [ ] **Step 1: Create .gitignore**

```
node_modules
dist
*.local
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "agile-latex-formula",
  "version": "0.1.0",
  "description": "Vue 3 LaTeX editor component with MathJax rendering, symbol library, and export to LaTeX/MathML/base64 PNG",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/agile-latex-formula.cjs",
  "module": "./dist/agile-latex-formula.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/agile-latex-formula.mjs",
      "require": "./dist/agile-latex-formula.cjs"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -p tsconfig.build.json && vite build",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "tdesign-vue-next": "^1.9.0",
    "vue": "^3.3.0"
  },
  "dependencies": {
    "mathjax-full": "^3.2.2"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "tdesign-vue-next": "^1.9.0",
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.0.0",
    "vue": "^3.5.0",
    "vue-tsc": "^2.0.0"
  },
  "keywords": ["latex", "mathjax", "vue", "editor", "math", "formula"],
  "license": "MIT"
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "dev/**/*.ts", "dev/**/*.vue"],
  "references": [{ "path": "./tsconfig.build.json" }]
}
```

- [ ] **Step 4: Create tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationDir": "./dist",
    "emitDeclarationOnly": true
  },
  "include": ["src/**/*.ts", "src/**/*.vue"],
  "exclude": ["dev/**/*", "**/*.test.ts"]
}
```

- [ ] **Step 5: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgileLatex',
      formats: ['es', 'cjs'],
      fileName: (format) => `agile-latex-formula.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'tdesign-vue-next'],
      output: {
        globals: {
          vue: 'Vue',
          'tdesign-vue-next': 'TDesign',
        },
      },
    },
  },
})
```

- [ ] **Step 6: Create src/types.ts**

```typescript
export interface AgileLatexExport {
  /** LaTeX source code */
  latex: string
  /** MathML representation */
  mathml: string
  /** Base64-encoded PNG image (data:image/png;base64,...) */
  base64: string
}

export interface SymbolItem {
  /** Display label shown on the button */
  label: string
  /** LaTeX snippet to insert into the editor */
  latex: string
}
```

- [ ] **Step 7: Create src/index.ts (package entry)**

```typescript
export { default as AgileLatex } from './AgileLatex.vue'
export type { AgileLatexExport } from './types'
```

- [ ] **Step 8: Create index.html (dev playground)**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agile LaTeX - Dev Playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/dev/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 9: Create dev/main.ts**

```typescript
import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(TDesign)
app.mount('#app')
```

- [ ] **Step 10: Create dev/App.vue (skeleton)**

```vue
<template>
  <div class="playground">
    <h1>Agile LaTeX — Dev Playground</h1>
    <!-- Placeholder for AgileLatex component -->
  </div>
</template>

<script setup lang="ts">
// Will import AgileLatex once main component is built
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.playground { padding: 24px; height: 100vh; display: flex; flex-direction: column; }
</style>
```

- [ ] **Step 11: Install dependencies and verify dev server starts**

```bash
pnpm install
pnpm dev
```

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold project with Vite + Vue 3 + TypeScript + TDesign"
```

---

### Task 2: Symbol Data (useSymbols.ts)

**Files:**
- Create: `src/composables/useSymbols.ts`

**Interfaces:**
- Consumes: `SymbolItem` from `src/types.ts`
- Produces: `SymbolCategory` interface, `useSymbols()` composable returning `categories: ComputedRef<SymbolCategory[]>`

- [ ] **Step 1: Write symbol data types and import**

Create `src/composables/useSymbols.ts`:

```typescript
import { computed, type ComputedRef } from 'vue'
import type { SymbolItem } from '../types'

export interface SymbolCategory {
  key: string
  label: string
  symbols: SymbolItem[]
}

const GREEK_LOWERCASE = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi',
  'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
]

const GREEK_UPPERCASE = [
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
]

function greekSymbols(): SymbolItem[] {
  const lower: SymbolItem[] = GREEK_LOWERCASE.map((name) => ({
    label: `\\${name}`,
    latex: `\\${name} `,
  }))
  const upper: SymbolItem[] = GREEK_UPPERCASE.map((name) => ({
    label: `\\${name}`,
    latex: `\\${name} `,
  }))
  return [...lower, ...upper]
}

const CATEGORIES: SymbolCategory[] = [
  {
    key: 'functions',
    label: '常用函数',
    symbols: [
      { label: '\\frac', latex: '\\frac{ }{ }' },
      { label: '\\sqrt', latex: '\\sqrt{ }' },
      { label: '\\sqrt[n]', latex: '\\sqrt[n]{ }' },
      { label: '\\sum', latex: '\\sum_{ }^{ }' },
      { label: '\\int', latex: '\\int_{ }^{ }' },
      { label: '\\iint', latex: '\\iint_{ }^{ }' },
      { label: '\\oint', latex: '\\oint_{ }^{ }' },
      { label: '\\lim', latex: '\\lim_{ \\to }' },
      { label: '\\log', latex: '\\log_{ }' },
      { label: '\\ln', latex: '\\ln ' },
      { label: '\\sin', latex: '\\sin ' },
      { label: '\\cos', latex: '\\cos ' },
      { label: '\\tan', latex: '\\tan ' },
      { label: '\\arcsin', latex: '\\arcsin ' },
      { label: '\\arccos', latex: '\\arccos ' },
      { label: '\\arctan', latex: '\\arctan ' },
      { label: '\\max', latex: '\\max ' },
      { label: '\\min', latex: '\\min ' },
    ],
  },
  {
    key: 'greek',
    label: '希腊字母',
    symbols: greekSymbols(),
  },
  {
    key: 'operators',
    label: '运算符号',
    symbols: [
      { label: '\\times', latex: '\\times ' },
      { label: '\\div', latex: '\\div ' },
      { label: '\\pm', latex: '\\pm ' },
      { label: '\\mp', latex: '\\mp ' },
      { label: '\\cdot', latex: '\\cdot ' },
      { label: '\\ast', latex: '\\ast ' },
      { label: '\\star', latex: '\\star ' },
      { label: '\\circ', latex: '\\circ ' },
      { label: '\\bullet', latex: '\\bullet ' },
      { label: '\\oplus', latex: '\\oplus ' },
      { label: '\\ominus', latex: '\\ominus ' },
      { label: '\\otimes', latex: '\\otimes ' },
      { label: '\\oslash', latex: '\\oslash ' },
      { label: '\\odot', latex: '\\odot ' },
      { label: '\\leq', latex: '\\leq ' },
      { label: '\\geq', latex: '\\geq ' },
      { label: '\\neq', latex: '\\neq ' },
      { label: '\\approx', latex: '\\approx ' },
      { label: '\\equiv', latex: '\\equiv ' },
      { label: '\\sim', latex: '\\sim ' },
      { label: '\\propto', latex: '\\propto ' },
      { label: '\\ll', latex: '\\ll ' },
      { label: '\\gg', latex: '\\gg ' },
    ],
  },
  {
    key: 'arrows',
    label: '箭头符号',
    symbols: [
      { label: '\\rightarrow', latex: '\\rightarrow ' },
      { label: '\\leftarrow', latex: '\\leftarrow ' },
      { label: '\\Rightarrow', latex: '\\Rightarrow ' },
      { label: '\\Leftarrow', latex: '\\Leftarrow ' },
      { label: '\\Leftrightarrow', latex: '\\Leftrightarrow ' },
      { label: '\\longrightarrow', latex: '\\longrightarrow ' },
      { label: '\\longleftarrow', latex: '\\longleftarrow ' },
      { label: '\\uparrow', latex: '\\uparrow ' },
      { label: '\\downarrow', latex: '\\downarrow ' },
      { label: '\\mapsto', latex: '\\mapsto ' },
      { label: '\\rightleftharpoons', latex: '\\rightleftharpoons ' },
    ],
  },
  {
    key: 'matrices',
    label: '矩阵模板',
    symbols: [
      {
        label: 'matrix',
        latex: '\\begin{matrix}\n & \\\\\n & \n\\end{matrix}',
      },
      {
        label: 'pmatrix',
        latex: '\\begin{pmatrix}\n & \\\\\n & \n\\end{pmatrix}',
      },
      {
        label: 'bmatrix',
        latex: '\\begin{bmatrix}\n & \\\\\n & \n\\end{bmatrix}',
      },
      {
        label: 'Bmatrix',
        latex: '\\begin{Bmatrix}\n & \\\\\n & \n\\end{Bmatrix}',
      },
      {
        label: 'vmatrix',
        latex: '\\begin{vmatrix}\n & \\\\\n & \n\\end{vmatrix}',
      },
      {
        label: 'Vmatrix',
        latex: '\\begin{Vmatrix}\n & \\\\\n & \n\\end{Vmatrix}',
      },
      {
        label: 'cases',
        latex: '\\begin{cases}\n & \\\\\n & \n\\end{cases}',
      },
    ],
  },
  {
    key: 'symbols',
    label: '数学符号',
    symbols: [
      { label: '\\infty', latex: '\\infty ' },
      { label: '\\partial', latex: '\\partial ' },
      { label: '\\nabla', latex: '\\nabla ' },
      { label: '\\forall', latex: '\\forall ' },
      { label: '\\exists', latex: '\\exists ' },
      { label: '\\emptyset', latex: '\\emptyset ' },
      { label: '\\in', latex: '\\in ' },
      { label: '\\notin', latex: '\\notin ' },
      { label: '\\subset', latex: '\\subset ' },
      { label: '\\supset', latex: '\\supset ' },
      { label: '\\subseteq', latex: '\\subseteq ' },
      { label: '\\supseteq', latex: '\\supseteq ' },
      { label: '\\cup', latex: '\\cup ' },
      { label: '\\cap', latex: '\\cap ' },
      { label: '\\setminus', latex: '\\setminus ' },
      { label: '\\angle', latex: '\\angle ' },
      { label: '\\triangle', latex: '\\triangle ' },
      { label: '\\square', latex: '\\square ' },
      { label: '\\perp', latex: '\\perp ' },
      { label: '\\parallel', latex: '\\parallel ' },
    ],
  },
  {
    key: 'chemistry',
    label: '化学公式',
    symbols: [
      { label: '\\ce{}', latex: '\\ce{ }' },
      { label: '\\ce{->}', latex: '\\ce{->}' },
      { label: '\\ce{<=>}', latex: '\\ce{<=>}' },
      { label: 'H₂O', latex: '\\ce{H2O}' },
      { label: 'CO₂', latex: '\\ce{CO2}' },
      { label: '同位素', latex: '\\ce{^{227}_{90}Th+}' },
      { label: '配离子', latex: '\\ce{[Fe(H2O)6]^2+}' },
      { label: '反应速率', latex: '\\ce{A ->[k] B}' },
      { label: '状态', latex: '\\ce{NaCl(aq)}' },
    ],
  },
]
```

- [ ] **Step 2: Add the composable function below the data in the same file**

```typescript
export function useSymbols(): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => CATEGORIES)
  return { categories }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 4: Commit**

```bash
git add src/composables/useSymbols.ts
git commit -m "feat: add symbol categories data (7 categories, 100+ symbols)"
```

---

### Task 3: MathJax Composable (useMathJax.ts)

**Files:**
- Create: `src/composables/useMathJax.ts`

**Interfaces:**
- Produces: `useMathJax()` → `{ render: (latex: string) => Promise<{ svgElement: SVGElement; mathml: string }>, isReady: Ref<boolean> }`

- [ ] **Step 1: Research MathJax 3 initialization in browser via npm**

The `mathjax-full` package provides component bundles. For Vue + Vite, we import from `mathjax-full/components/src/` which auto-initializes. We use the `tex-svg` component bundle that includes TeX input and SVG output. The `mhchem` extension is loaded through the `tex` package configuration.

MathJax exposes a global `MathJax` object after loading the component. Key methods:
- `MathJax.tex2svgPromise(math, options)` — returns Promise<SVG element>
- `MathJax.tex2mmlPromise(math, options)` — returns Promise<MathML string>

- [ ] **Step 2: Create the composable**

Create `src/composables/useMathJax.ts`:

```typescript
import { ref, type Ref } from 'vue'

// Import MathJax component bundle — this auto-initializes MathJax
// with TeX input, SVG output, and AllPackages (includes mhchem)
import 'mathjax-full/components/src/tex-svg-full/tex-svg-full.js'

// Type declaration for the MathJax global set by the component bundle
declare global {
  interface Window {
    MathJax: {
      startup: { promise: Promise<void> }
      tex2svgPromise: (math: string, options?: MathJaxOptions) => Promise<Element>
      tex2mmlPromise: (math: string, options?: MathJaxOptions) => Promise<string>
    }
  }
}

interface MathJaxOptions {
  display?: boolean
  em?: number
  ex?: number
  containerWidth?: number
}

interface RenderResult {
  svgElement: Element
  mathml: string
}

export function useMathJax(): {
  render: (latex: string, display?: boolean) => Promise<RenderResult>
  isReady: Ref<boolean>
} {
  const isReady = ref(false)

  // Wait for MathJax to finish loading
  const readyPromise = window.MathJax.startup.promise.then(() => {
    isReady.value = true
  })

  async function render(latex: string, display = true): Promise<RenderResult> {
    await readyPromise

    const svgElement = await window.MathJax.tex2svgPromise(latex, {
      display,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    })

    const mathml = await window.MathJax.tex2mmlPromise(latex, { display })

    return { svgElement, mathml }
  }

  return { render, isReady }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 4: Commit**

```bash
git add src/composables/useMathJax.ts
git commit -m "feat: add MathJax composable with tex2svg and tex2mml support"
```

---

### Task 4: Export Composable (useExport.ts)

**Files:**
- Create: `src/composables/useExport.ts`

**Interfaces:**
- Consumes: `AgileLatexExport` from `src/types.ts`, `useMathJax` from `src/composables/useMathJax.ts`
- Produces: `useExport()` → `{ exportFormula: (latex: string) => Promise<AgileLatexExport> }`

- [ ] **Step 1: Create the composable**

Create `src/composables/useExport.ts`:

```typescript
import { useMathJax } from './useMathJax'
import type { AgileLatexExport } from '../types'

export function useExport(): {
  exportFormula: (latex: string) => Promise<AgileLatexExport>
} {
  const { render } = useMathJax()

  /**
   * Convert an SVG element to a base64 PNG data URI.
   * Pipeline: SVG element → XML string → Blob → Image → Canvas → dataURL
   */
  async function svgToBase64(svgElement: Element): Promise<string> {
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)

    // Create an SVG blob and object URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Use the SVG's natural dimensions, or fall back to reasonable defaults
        const bbox = (svgElement as SVGElement).getBBox?.()
        canvas.width = bbox ? Math.ceil(bbox.width) * 2 : img.width * 2 || 800
        canvas.height = bbox ? Math.ceil(bbox.height) * 2 : img.height * 2 || 200

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error('Failed to get canvas 2d context'))
          return
        }
        // White background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // Draw the image scaled to fill canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const dataUrl = canvas.toDataURL('image/png')
        URL.revokeObjectURL(url)
        resolve(dataUrl)
      }
      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    })
  }

  async function exportFormula(latex: string): Promise<AgileLatexExport> {
    const { svgElement, mathml } = await render(latex)
    const base64 = await svgToBase64(svgElement)

    return {
      latex,
      mathml,
      base64,
    }
  }

  return { exportFormula }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add src/composables/useExport.ts
git commit -m "feat: add export composable (SVG → canvas → base64 PNG pipeline)"
```

---

### Task 5: SymbolPanel Component

**Files:**
- Create: `src/components/SymbolPanel.vue`

**Interfaces:**
- Consumes: `useSymbols()` from `src/composables/useSymbols.ts`, `t-tabs`, `t-tab-panel`, `t-button` from TDesign
- Produces: emits `insert(latex: string)` when a symbol button is clicked

- [ ] **Step 1: Create SymbolPanel.vue**

Create `src/components/SymbolPanel.vue`:

```vue
<template>
  <div class="symbol-panel">
    <t-tabs v-model="activeTab" theme="card" size="medium">
      <t-tab-panel
        v-for="cat in categories"
        :key="cat.key"
        :value="cat.key"
        :label="cat.label"
      >
        <div class="symbol-grid">
          <t-button
            v-for="sym in cat.symbols"
            :key="sym.label"
            size="small"
            variant="outline"
            :title="sym.label"
            @click="onSymbolClick(sym.latex)"
          >
            {{ sym.label }}
          </t-button>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSymbols } from '../composables/useSymbols'

const emit = defineEmits<{
  insert: [latex: string]
}>()

const { categories } = useSymbols()
const activeTab = ref(categories.value[0]?.key ?? 'functions')

function onSymbolClick(latex: string) {
  emit('insert', latex)
}
</script>

<style scoped>
.symbol-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.symbol-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  max-height: calc(100% - 48px);
  overflow-y: auto;
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SymbolPanel.vue
git commit -m "feat: add SymbolPanel with 7 tabbed symbol categories"
```

---

### Task 6: LatexInput Component

**Files:**
- Create: `src/components/LatexInput.vue`

**Interfaces:**
- Consumes: `modelValue` prop, `placeholder` prop, `readonly` prop, `t-textarea` from TDesign
- Produces: emits `update:modelValue(value: string)`

- [ ] **Step 1: Create LatexInput.vue**

Create `src/components/LatexInput.vue`:

```vue
<template>
  <div class="latex-input">
    <t-textarea
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :autosize="{ minRows: 8, maxRows: 20 }"
      @change="onInput"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(value: string) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.latex-input {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.latex-input :deep(.t-textarea) {
  height: 100%;
}

.latex-input :deep(.t-textarea__inner) {
  height: 100% !important;
  min-height: 200px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add src/components/LatexInput.vue
git commit -m "feat: add LatexInput component with monospace textarea"
```

---

### Task 7: PreviewPanel Component

**Files:**
- Create: `src/components/PreviewPanel.vue`

**Interfaces:**
- Consumes: `latex` prop, `useMathJax()` composable
- Produces: renders MathJax SVG in a scrollable container

- [ ] **Step 1: Create PreviewPanel.vue**

Create `src/components/PreviewPanel.vue`:

```vue
<template>
  <div class="preview-panel">
    <div v-if="!isReady" class="preview-placeholder">
      Loading MathJax...
    </div>
    <div
      v-else-if="!latex.trim()"
      class="preview-placeholder"
    >
      输入 LaTeX 公式以预览
    </div>
    <div
      v-else
      ref="previewContainer"
      class="preview-content"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { useMathJax } from '../composables/useMathJax'

const props = defineProps<{
  latex: string
}>()

const { render, isReady } = useMathJax()
const previewContainer: Ref<HTMLElement | null> = ref(null)

async function doRender(latexCode: string) {
  if (!isReady.value || !previewContainer.value || !latexCode.trim()) return

  const { svgElement } = await render(latexCode, true)
  const container = previewContainer.value

  // Clear previous content and append new SVG
  container.innerHTML = ''
  container.appendChild(svgElement)
}

// Debounced render on latex change
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.latex,
  (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doRender(newVal), 300)
  },
  { immediate: false },
)

// Initial render when MathJax is ready
watch(isReady, (ready) => {
  if (ready && props.latex.trim()) {
    doRender(props.latex)
  }
})
</script>

<style scoped>
.preview-panel {
  height: 100%;
  overflow: auto;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  padding: 16px;
  background: var(--td-bg-color-container);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  min-height: 100%;
}

.preview-content :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PreviewPanel.vue
git commit -m "feat: add PreviewPanel with debounced MathJax SVG rendering"
```

---

### Task 8: Main AgileLatex Component

**Files:**
- Create: `src/AgileLatex.vue`

**Interfaces:**
- Consumes: All sub-components and composables
- Produces: `AgileLatex` component with props (modelValue, placeholder, readonly), events (update:modelValue, render), exposed methods (exportFormula, renderFormula)

- [ ] **Step 1: Create AgileLatex.vue**

Create `src/AgileLatex.vue`:

```vue
<template>
  <div class="agile-latex-formula">
    <div class="agile-latex-formula__top">
      <SymbolPanel @insert="handleInsert" />
    </div>
    <div class="agile-latex-formula__bottom">
      <div class="agile-latex-formula__input">
        <div class="agile-latex-formula__input-header">
          <span class="agile-latex-formula__label">LaTeX 输入</span>
          <t-button size="small" theme="primary" @click="handleExport">
            导出
          </t-button>
        </div>
        <LatexInput
          :model-value="modelValue"
          :placeholder="placeholder"
          :readonly="readonly"
          @update:model-value="handleInput"
        />
      </div>
      <div class="agile-latex-formula__preview">
        <div class="agile-latex-formula__label">实时预览</div>
        <PreviewPanel :latex="modelValue" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import SymbolPanel from './components/SymbolPanel.vue'
import LatexInput from './components/LatexInput.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import { useExport } from './composables/useExport'
import type { AgileLatexExport } from './types'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>(), {
  modelValue: '',
  placeholder: '输入 LaTeX 公式...',
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'render': [result: AgileLatexExport]
}>()

const { exportFormula } = useExport()

function handleInput(value: string) {
  emit('update:modelValue', value)
}

function handleInsert(latex: string) {
  const newValue = props.modelValue + latex
  emit('update:modelValue', newValue)
}

async function handleExport() {
  const result = await doExport()
  // Result is returned to the consumer via the exposed method,
  // but the button also triggers a side effect.
  // We emit the render event so consumers can react.
  emit('render', result)
}

async function doExport(): Promise<AgileLatexExport> {
  return await exportFormula(props.modelValue || '')
}

// --- Exposed methods for parent component via template ref ---

async function exposedExportFormula(): Promise<AgileLatexExport> {
  const result = await doExport()
  emit('render', result)
  return result
}

async function exposedRenderFormula(latex: string): Promise<AgileLatexExport> {
  emit('update:modelValue', latex)
  await nextTick()
  const result = await doExport()
  emit('render', result)
  return result
}

defineExpose({
  exportFormula: exposedExportFormula,
  renderFormula: exposedRenderFormula,
})
</script>

<style scoped>
.agile-latex-formula {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  overflow: hidden;
}

.agile-latex-formula__top {
  height: 35%;
  min-height: 180px;
  border-bottom: 1px solid var(--td-component-border);
  overflow: hidden;
}

.agile-latex-formula__bottom {
  flex: 1;
  display: flex;
  min-height: 0;
}

.agile-latex-formula__input {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--td-component-border);
  padding: 12px;
  min-width: 0;
}

.agile-latex-formula__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-width: 0;
}

.agile-latex-formula__input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agile-latex-formula__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
}

.agile-latex-formula__input-header .agile-latex-formula__label {
  margin-bottom: 0;
}

.agile-latex-formula__input :deep(.t-textarea__inner) {
  flex: 1;
}
</style>
```

- [ ] **Step 2: Update src/index.ts**

Read current `src/index.ts` (Task 1 created it), replace it with the actual component export if needed. The Task 1 export already matches.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm exec vue-tsc --noEmit -p tsconfig.json
```

- [ ] **Step 4: Commit**

```bash
git add src/AgileLatex.vue
git commit -m "feat: add AgileLatex main component with full wiring and export API"
```

---

### Task 9: Dev Playground Integration

**Files:**
- Modify: `dev/App.vue`

**Interfaces:**
- Consumes: `AgileLatex` component, `AgileLatexExport` type

- [ ] **Step 1: Update dev/App.vue with full playground**

Replace `dev/App.vue`:

```vue
<template>
  <div class="playground">
    <h1 class="title">Agile LaTeX — Dev Playground</h1>
    <div class="editor-wrapper">
      <AgileLatex
        ref="editorRef"
        v-model="latexCode"
        placeholder="输入 LaTeX 公式..."
        @render="onRender"
      />
    </div>
    <div v-if="lastResult" class="export-preview">
      <h3>导出结果</h3>
      <div class="export-sections">
        <div class="export-section">
          <h4>LaTeX 代码</h4>
          <pre>{{ lastResult.latex }}</pre>
        </div>
        <div class="export-section">
          <h4>MathML 代码</h4>
          <pre>{{ lastResult.mathml }}</pre>
        </div>
        <div class="export-section">
          <h4>Base64 图片</h4>
          <img v-if="lastResult.base64" :src="lastResult.base64" alt="Formula PNG" class="export-img" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { AgileLatex, type AgileLatexExport } from '../src/index'

const latexCode = ref(String.raw`\frac{d}{dx}\sin(x) = \cos(x)`)
const editorRef = useTemplateRef('editorRef')
const lastResult = ref<AgileLatexExport | null>(null)

function onRender(result: AgileLatexExport) {
  lastResult.value = result
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
.playground { padding: 24px; height: 100vh; display: flex; flex-direction: column; gap: 16px; }
.title { font-size: 20px; font-weight: 600; }
.editor-wrapper { flex: 1; min-height: 0; }
.export-preview { background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e0e0e0; }
.export-preview h3 { font-size: 16px; margin-bottom: 12px; }
.export-sections { display: flex; gap: 16px; }
.export-section { flex: 1; }
.export-section h4 { font-size: 13px; margin-bottom: 8px; color: #666; }
.export-section pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.export-img { max-width: 200px; height: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
</style>
```

- [ ] **Step 2: Start dev server and smoke test**

```bash
pnpm dev
```

Verify: browser opens, `\frac{d}{dx}\sin(x) = \cos(x)` renders as a formula, symbol tabs are clickable, typing in the textarea updates the preview.

- [ ] **Step 3: Commit**

```bash
git add dev/App.vue
git commit -m "feat: add dev playground with full export result display"
```

---

### Task 10: Build Library & Verify Output

**Files:**
- No new files — verifies `dist/` output

- [ ] **Step 1: Run production build**

```bash
pnpm build
```

- [ ] **Step 2: Verify output files exist**

```bash
ls dist/
```

Expected output:
```
dist/
├── agile-latex-formula.mjs       (ESM)
├── agile-latex-formula.cjs       (CJS)
├── index.d.ts            (type declarations)
├── AgileLatex.vue.d.ts   (component type)
├── types.d.ts            (export types)
└── ... (chunk files if any)
```

- [ ] **Step 3: Verify .d.ts exports match expected API**

Read `dist/index.d.ts` and confirm it exports:
- `AgileLatex` (component)
- `AgileLatexExport` (type)

- [ ] **Step 4: Strip MathJax fonts from treeshaking check**

The `mathjax-full` package includes font files at `mathjax-full/es5/output/svg/fonts/`. Verify the build bundles them correctly by checking the ESM output doesn't reference missing imports.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "build: verify production build outputs ESM + CJS + .d.ts"
```
