import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

test('render export includes PNG Blob: pixels, data URL parity, limits and cleanup', { timeout: 90000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5194', '--strictPort'], { stdio: 'pipe' })
  let browser
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Vite startup timed out')), 15000)
      server.stdout.on('data', data => {
        if (data.toString().includes('127.0.0.1:5194')) { clearTimeout(timer); resolve() }
      })
      server.on('error', reject)
      server.on('exit', code => { clearTimeout(timer); reject(new Error(`Vite exited: ${code}`)) })
    })
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:5194/smoke.html')
    await page.getByRole('button', { name: '源码', exact: true }).click()
    const input = page.locator('textarea')
    const latex = String.raw`\textcolor{#ff0000}{\frac{A}{B}}+\class{lf-font-times}{x}`
    await input.fill(latex)
    await page.getByRole('button', { name: '导出', exact: true }).click()
    await page.waitForFunction(() => window.__formulaExport?.blob instanceof Blob)
    const stats = await page.evaluate(async () => {
      const result = window.__formulaExport
      const blob = result.blob
      const bytes = new Uint8Array(await blob.arrayBuffer())
      const base64Bytes = Uint8Array.from(atob(result.base64.split(',')[1]), char => char.charCodeAt(0))
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')
      context.drawImage(bitmap, 0, 0)
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      let ink = 0, red = 0, transparent = 0
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] > 0) ink++
        else transparent++
        if (pixels[i] > 180 && pixels[i + 1] < 80 && pixels[i + 2] < 80 && pixels[i + 3] > 100) red++
      }
      bitmap.close()
      return { type: blob.type, size: blob.size, signature: [...bytes.slice(0, 8)],
        sameBytes: bytes.length === base64Bytes.length && bytes.every((byte, i) => byte === base64Bytes[i]),
        ink, red, transparent, latex: result.latex, mathml: result.mathml }
    })
    assert.equal(stats.type, 'image/png')
    assert.ok(stats.size > 100)
    assert.deepEqual(stats.signature, [137, 80, 78, 71, 13, 10, 26, 10])
    assert.ok(stats.sameBytes, 'blob and base64 contain the exact same PNG')
    assert.ok(stats.ink > 0 && stats.red > 0 && stats.transparent > 0)
    assert.equal(stats.latex, latex)
    assert.match(stats.mathml, /<math/)
    assert.equal(await input.inputValue(), latex)
    assert.equal(await page.evaluate(() => 'exportPngBlob' in window.__formulaEditor), false, 'no extra public export method')

    const returned = await page.evaluate(async () => {
      const result = await window.__formulaEditor.renderFormula('x^2')
      return { blob: result.blob instanceof Blob, sameEvent: result === window.__formulaExport, latex: result.latex }
    })
    assert.deepEqual(returned, { blob: true, sameEvent: true, latex: 'x^2' })
    assert.equal(await input.inputValue(), 'x^2')
    for (const [formula, message] of [
      ['', /不能为空/],
      ['x'.repeat(5001), /5000/],
      [String.raw`\rule{1000em}{1em}`, /图片尺寸过大/],
      [String.raw`\rule{400em}{400em}`, /图片尺寸过大/],
    ]) {
      await input.fill(formula)
      const result = await page.evaluate(async () => {
        try { await window.__formulaEditor.exportFormula(); return 'unexpected success' }
        catch (error) { return error.message }
      })
      assert.match(result, message)
    }
    await input.fill('x+y')
    // Flush the source preview before counting temporary measurement containers.
    await page.locator('.latex-formula__preview svg').first().waitFor()
    const failures = await page.evaluate(async () => {
      const results = []
      for (const mode of ['success', 'decode', 'context', 'encode']) {
        const create = URL.createObjectURL
        const revoke = URL.revokeObjectURL
        const getContext = HTMLCanvasElement.prototype.getContext
        const toBlob = HTMLCanvasElement.prototype.toBlob
        const created = [], revoked = []
        const before = document.body.children.length
        const previousResult = window.__formulaExport
        URL.createObjectURL = blob => {
          const url = create.call(URL, mode === 'decode' ? new Blob(['invalid svg'], { type: 'image/svg+xml' }) : blob)
          created.push(url)
          return url
        }
        URL.revokeObjectURL = url => { revoked.push(url); revoke.call(URL, url) }
        if (mode === 'context') HTMLCanvasElement.prototype.getContext = () => null
        if (mode === 'encode') HTMLCanvasElement.prototype.toBlob = callback => callback(null)
        let message = ''
        try { await window.__formulaEditor.exportFormula() }
        catch (error) { message = error.message }
        finally {
          URL.createObjectURL = create
          URL.revokeObjectURL = revoke
          HTMLCanvasElement.prototype.getContext = getContext
          HTMLCanvasElement.prototype.toBlob = toBlob
        }
        results.push({ mode, message, created, revoked, cleaned: document.body.children.length === before,
          eventUnchanged: previousResult === window.__formulaExport })
      }
      return results
    })
    for (const result of failures) {
      assert.equal(result.created.length, 1)
      assert.deepEqual(result.created, result.revoked, `${result.mode} releases the object URL`)
      assert.ok(result.cleaned, `${result.mode} removes its measurement container`)
      if (result.message) assert.ok(result.eventUnchanged, 'failed exports do not emit render')
    }
    assert.equal(failures[0].message, '')
    assert.match(failures[1].message, /SVG 图像解码失败/)
    assert.match(failures[2].message, /Canvas/)
    assert.match(failures[3].message, /PNG 编码失败/)
    await page.locator('#toggle-readonly').click()
    assert.ok(await page.evaluate(async () => (await window.__formulaEditor.exportFormula()).blob.size > 0))
    const concurrent = await page.evaluate(async () => {
      const pending = window.__formulaEditor.exportFormula()
      let message = ''
      try { await window.__formulaEditor.exportFormula() } catch (error) { message = error.message }
      const result = await pending
      return { message, sameEvent: result === window.__formulaExport }
    })
    assert.match(concurrent.message, /正在导出/)
    assert.ok(concurrent.sameEvent)
    assert.deepEqual(errors, [])
  } finally {
    await browser?.close()
    server.kill()
  }
})
