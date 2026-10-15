import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { test } from 'node:test'

const require = createRequire(import.meta.url)
const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('ESM and CommonJS expose the same component API without a DOM', async () => {
  const esm = await import('../dist/latex-formula.mjs')
  const cjs = require('../dist/latex-formula.cjs')
  assert.equal(esm.default, esm.LatexFormula)
  assert.equal(cjs.default, cjs.LatexFormula)
  assert.equal(typeof esm.LatexFormula, 'object')
  assert.equal(typeof cjs.LatexFormula, 'object')
})

test('published entry points and declarations exist', async () => {
  for (const path of [pkg.main, pkg.module, pkg.types]) {
    assert.ok((await readFile(new URL(`..${path.slice(1)}`, import.meta.url))).length > 0)
  }
  const declarations = await readFile(new URL('../dist/index.d.ts', import.meta.url), 'utf8')
  assert.match(declarations, /default/)
  assert.match(declarations, /LatexFormulaExport/)
  for (const type of ['FontFamilyOption', 'SymbolCategory', 'SymbolItem']) {
    assert.ok(declarations.includes(type), `public type: ${type}`)
  }
})
