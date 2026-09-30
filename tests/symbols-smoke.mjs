import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import ts from 'typescript'
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/composables/useSymbols.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const module = { exports: {} }
new Function('require', 'module', 'exports', compiled)(require, module, module.exports)
const { useSymbols } = module.exports

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
