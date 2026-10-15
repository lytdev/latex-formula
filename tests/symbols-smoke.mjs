import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'
import { ref } from 'vue'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/composables/useSymbols.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const module = { exports: {} }
new Function('require', 'module', 'exports', compiled)(require, module, module.exports)
const { useSymbols } = module.exports

test('symbol extensions merge reactively without modifying defaults or input', () => {
  const defaults = useSymbols().categories.value
  const original = JSON.stringify(defaults)
  const category = defaults[0]
  const input = [
    { key: category.key, label: '扩展分类名称', symbols: [
      { label: category.symbols[0].label, latex: 'z^2' },
      { label: '扩展公式', latex: 'a+b' },
    ] },
    { key: 'custom', label: '自定义分类', symbols: [{ label: '自定义公式', latex: 'c+d' }] },
  ]
  const snapshot = JSON.stringify(input)
  const extensions = ref(input)
  const { categories } = useSymbols(() => extensions.value)
  assert.equal(categories.value.length, defaults.length + 1)
  assert.equal(categories.value[0].label, '扩展分类名称')
  assert.equal(categories.value[0].symbols.length, new Set(category.symbols.map(symbol => symbol.label)).size + 1)
  assert.equal(categories.value[0].symbols[0].latex, 'z^2')
  assert.equal(JSON.stringify(useSymbols().categories.value), original)
  assert.equal(JSON.stringify(input), snapshot)
  extensions.value = []
  assert.equal(JSON.stringify(categories.value), original)
})

test('common formulas have distinct names and normalized LaTeX', () => {
  const symbols = useSymbols().categories.value.find(category => category.key === 'math-formulas').symbols
  const labels = new Set()
  const formulas = new Set()
  for (const symbol of symbols) {
    const normalized = symbol.latex.replace(/\\[,;!]|\\quad|\\qquad|\s/g, '')
    assert.ok(!labels.has(symbol.label), `duplicate label: ${symbol.label}`)
    assert.ok(!formulas.has(normalized), `duplicate formula: ${symbol.label}`)
    labels.add(symbol.label)
    formulas.add(normalized)
  }
})

test('every built-in symbol can be typeset', () => {
  const adaptor = liteAdaptor()
  RegisterHTMLHandler(adaptor)
  const doc = mathjax.document('', {
    InputJax: new TeX({ packages: AllPackages }),
    OutputJax: new SVG({ fontCache: 'none' }),
  })
  const failures = []
  let count = 0
  for (const category of useSymbols().categories.value) {
    for (const symbol of category.symbols) {
      count++
      try {
        const svg = adaptor.outerHTML(doc.convert(symbol.latex, { display: true }))
        if (svg.includes('data-mjx-error') || svg.includes('<merror')) {
          failures.push(`${category.key}/${symbol.label}: ${symbol.latex}`)
        }
      } catch (error) {
        failures.push(`${category.key}/${symbol.label}: ${error}`)
      }
    }
  }
  assert.ok(count > 300)
  assert.deepEqual(failures, [])
})
