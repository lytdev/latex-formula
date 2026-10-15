import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

test('math font variants: actual fonts, LaTeX round trip, PNG export and reset', { timeout: 120000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5193', '--strictPort'], { stdio: 'pipe' })
  let browser
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Vite startup timed out')), 15000)
      server.stdout.on('data', data => {
        if (data.toString().includes('127.0.0.1:5193')) { clearTimeout(timer); resolve() }
      })
      server.on('error', reject)
    })
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined })
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:5193/smoke.html')
    const source = () => page.getByRole('button', { name: '源码', exact: true }).click()
    const visual = async () => {
      await page.getByRole('button', { name: '可视化', exact: true }).click()
      await page.waitForFunction(() => !!document.querySelector('math-field')?.shadowRoot)
    }
    const choose = async option => {
      await page.getByLabel('字体', { exact: true }).click()
      await page.getByLabel('字体', { exact: true }).selectOption(option)
    }
    const value = () => page.locator('math-field').evaluate(el => el.value)
    const cases = [
      ['mathnormal', 'KaTeX_Math', 'italic', '400'],
      ['mathrm', 'KaTeX_Main', 'normal', '400'],
      ['mathbf', 'KaTeX_Main', 'normal', '700'],
      ['mathit', 'KaTeX_Main', 'italic', '400'],
      ['mathsf', 'KaTeX_SansSerif', 'normal', '400'],
      ['mathtt', 'KaTeX_Typewriter', 'normal', '400'],
      ['mathcal', 'KaTeX_Caligraphic', 'normal', '400'],
      ['mathfrak', 'KaTeX_Fraktur', 'normal', '400'],
    ]
    for (const [option, family, style, weight] of cases) {
      await source()
      await page.locator('textarea').fill(String.raw`A+xyz+12+\alpha+\frac{B}{C}`)
      await visual()
      await choose(option)
      await page.waitForFunction(({ family, style, weight }) => {
        const el = [...document.querySelector('math-field').shadowRoot.querySelectorAll('.ML__base span')]
          .find(el => !el.children.length && el.textContent === 'A')
        if (!el) return false
        const css = getComputedStyle(el)
        return css.fontFamily.includes(family) && css.fontStyle === style && css.fontWeight === weight
      }, { family, style, weight })
      const latex = await value()
      assert.deepEqual(await page.locator('math-field').evaluate(el => el.errors), [], option)
      await source()
      assert.equal(await page.locator('textarea').inputValue(), latex)
      await page.locator('.latex-formula__preview svg').first().waitFor()
      assert.equal(await page.locator('.latex-formula__preview [data-mjx-error]').count(), 0, option)
      await visual()
      assert.equal(await value(), latex)
      await page.getByRole('button', { name: '导出', exact: true }).click()
      await page.waitForFunction(latex => {
        const text = document.querySelector('#export-result').textContent
        return text.startsWith(latex + '|') && text.includes('data:image/png;base64,')
      }, latex)
    }
    // A font change is one undo step, and only touches the selected character.
    await source()
    await page.locator('textarea').fill('A+B')
    await visual()
    await page.locator('math-field').evaluate(el => { el.focus(); el.selection = { ranges: [[0, 1]], direction: 'forward' } })
    await choose('mathtt')
    assert.match(await value(), /\\mathtt\{A\}\+B/)
    await page.getByTitle('撤销 (Ctrl+Z)', { exact: true }).click()
    assert.equal(await value(), 'A+B')
    await choose('times')
    await choose('mathnormal')
    assert.doesNotMatch(await value(), /lf-font-times/)
    await choose('mathbf')
    await choose('mathnormal')
    assert.doesNotMatch(await value(), /mathbf/)
    assert.deepEqual(errors, [])
  } finally {
    await browser?.close()
    server.kill()
  }
})
