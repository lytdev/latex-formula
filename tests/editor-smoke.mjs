import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

test('built visual editor: round trip, structured input, history, formatting and readonly', { timeout: 90000 }, async () => {
  const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5189', '--strictPort'], { stdio: 'pipe' })
  let browser
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Vite startup timed out')), 15000)
      server.stdout.on('data', data => { if (data.toString().includes('127.0.0.1:5189')) { clearTimeout(timer); resolve() } })
      server.on('error', reject)
      server.on('exit', code => { clearTimeout(timer); reject(new Error(`Vite exited: ${code}`)) })
    })
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined, headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] })
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    const errors = []
    const remoteRequests = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', route => {
      if (!route.request().url().startsWith('http://127.0.0.1:5189')) {
        remoteRequests.push(route.request().url())
        return route.abort()
      }
      return route.continue()
    })
    await page.goto('http://127.0.0.1:5189/smoke.html')
    const source = () => page.getByRole('button', { name: '源码', exact: true }).click()
    const visual = async () => {
      await page.getByRole('button', { name: '可视化', exact: true }).click()
      await page.waitForFunction(() => !!document.querySelector('math-field')?.shadowRoot)
    }
    const value = () => page.locator('math-field').evaluate(el => el.value)
    const textarea = page.locator('textarea')
    const original = String.raw`\frac{a}{b} + x^{2}`
    await source()
    await textarea.fill(original)
    await visual()
    assert.match(await value(), /frac/)
    await source()
    assert.equal(await textarea.inputValue(), original, 'switching alone preserves exact source')

    await visual()
    await page.getByRole('button', { name: '清除', exact: true }).click()
    await page.getByRole('button', { name: '分式', exact: true }).first().click()
    await page.waitForFunction(() => document.activeElement?.tagName === 'MATH-FIELD' && !!document.activeElement.shadowRoot?.activeElement)
    await page.keyboard.type('a')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.type('b')
    assert.match(await value(), /\\frac\{a\}\{b\}/, 'fraction slots are directly editable')
    await source()
    assert.match(await textarea.inputValue(), /\\frac\{a\}\{b\}/)
    await visual()
    await page.getByRole('button', { name: '清除', exact: true }).click()
    assert.equal(await value(), '')
    await page.getByTitle('撤销 (Ctrl+Z)', { exact: true }).click()
    assert.match(await value(), /frac/)
    await page.getByTitle('恢复 (Ctrl+Shift+Z)', { exact: true }).click()
    assert.equal(await value(), '')

    await page.locator('math-field').click()
    await page.waitForFunction(() => document.activeElement?.tagName === 'MATH-FIELD')
    await page.keyboard.type('x')
    assert.equal(await value(), 'x')
    await page.keyboard.press('Control+z')
    assert.equal(await value(), '')
    await page.keyboard.press('Control+Shift+z')
    assert.equal(await value(), 'x')
    await page.locator('math-field').evaluate(el => el.focus())
    await page.waitForFunction(() => !!document.querySelector('math-field').shadowRoot.activeElement)
    await page.keyboard.press('Control+a')
    await page.getByLabel('字体', { exact: true }).click()
    await page.getByLabel('字体', { exact: true }).selectOption('mathbf')
    assert.match(await value(), /\\mathbf\{x\}/)
    await page.locator('#toggle-readonly').click()
    assert.equal(await page.locator('math-field').evaluate(el => el.readOnly), true)
    const readonlyValue = await value()
    await page.locator('math-field').click()
    await page.keyboard.type('q')
    assert.equal(await value(), readonlyValue)
    await page.locator('#toggle-readonly').click()
    await page.getByRole('button', { name: '导出', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('#export-result')?.textContent.includes('data:image/png;base64,'))

    await source()
    await textarea.fill('x+y')
    await visual()
    await page.locator('.t-color-picker__trigger').click()
    await page.getByTitle('#007dff', { exact: true }).click()
    assert.equal(await value(), 'x+y')
    await page.getByRole('button', { name: '确定', exact: true }).click()
    await page.locator('.t-color-picker__panel').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => {
      const letters = [...document.querySelector('math-field').shadowRoot.querySelectorAll('.ML__mathit')]
      return letters.length === 2 && letters.every(el => getComputedStyle(el).color === 'rgb(0, 125, 255)')
    })
    assert.match(await value(), /\\textcolor\{#007dff\}\{x\+y\}/)
    await source()
    assert.match(await textarea.inputValue(), /textcolor/)
    await textarea.fill('x+y')
    await visual()
    // Select just x using MathLive's public range API, then use the actual picker.
    await page.locator('math-field').evaluate(el => {
      el.focus()
      el.selection = { ranges: [[0, 1]], direction: 'forward' }
    })
    await page.locator('.t-color-picker__trigger').click()
    await page.getByTitle('#54ff00', { exact: true }).click()
    assert.equal(await value(), 'x+y')
    await page.getByRole('button', { name: '确定', exact: true }).click()
    await page.locator('.t-color-picker__panel').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => {
      const letters = [...document.querySelector('math-field').shadowRoot.querySelectorAll('.ML__mathit')]
      return letters.length === 2 && getComputedStyle(letters[0]).color === 'rgb(84, 255, 0)'
        && getComputedStyle(letters[1]).color !== 'rgb(84, 255, 0)'
    })
    assert.match(await value(), /\\textcolor\{#54ff00\}\{x\}\+y/)
    await page.getByTitle('撤销 (Ctrl+Z)', { exact: true }).click()
    assert.equal(await value(), 'x+y')
    // Palette changes remain a draft until explicitly confirmed.
    await page.locator('.t-color-picker__trigger').click()
    await page.locator('.t-color-picker__saturation').waitFor({ state: 'visible' })
    const palette = await page.locator('.t-color-picker__saturation').boundingBox()
    await page.mouse.move(palette.x + palette.width * 0.4, palette.y + palette.height * 0.3)
    await page.mouse.down()
    await page.mouse.move(palette.x + palette.width * 0.7, palette.y + palette.height * 0.4, { steps: 5 })
    assert.equal(await page.locator('.t-color-picker__panel').isVisible(), true)
    assert.equal(await value(), 'x+y')
    await page.mouse.up()
    assert.equal(await value(), 'x+y')
    await page.getByRole('button', { name: '确定', exact: true }).click()
    await page.locator('.t-color-picker__panel').waitFor({ state: 'hidden' })
    assert.match(await value(), /\\textcolor/)
    await page.getByTitle('撤销 (Ctrl+Z)', { exact: true }).click()
    assert.equal(await value(), 'x+y')
    const confirmedColor = await page.getByRole('button', { name: '公式颜色', exact: true }).innerText()
    await page.locator('.t-color-picker__trigger').click()
    await page.getByTitle('#007dff', { exact: true }).click()
    await page.getByRole('button', { name: '取消', exact: true }).click()
    await page.locator('.t-color-picker__panel').waitFor({ state: 'hidden' })
    assert.equal(await value(), 'x+y')
    assert.equal(await page.getByRole('button', { name: '公式颜色', exact: true }).innerText(), confirmedColor)
    await source()
    await textarea.fill('A+B')
    await visual()
    const chooseFormat = async (label, option) => {
      await page.getByLabel(label, { exact: true }).click()
      await page.getByLabel(label, { exact: true }).selectOption(option)
    }
    // No selection: format the existing formula, rather than an empty space.
    await chooseFormat('字体', 'mathsf')
    assert.match(await value(), /\\mathsf\{A\+B\}/)
    await chooseFormat('字号', 'huge')
    assert.match(await value(), /\\huge/)
    const largeHeight = await page.locator('math-field').evaluate(el =>
      el.shadowRoot.querySelector('.ML__base').getBoundingClientRect().height)
    await chooseFormat('字号', 'tiny')
    assert.match(await value(), /\\tiny/)
    assert.doesNotMatch(await value(), /\\huge/)
    await page.waitForFunction(height =>
      document.querySelector('math-field').shadowRoot.querySelector('.ML__base').getBoundingClientRect().height < height,
      largeHeight)
    await source()
    await textarea.fill('A+B')
    await visual()
    await page.locator('math-field').evaluate(el => {
      el.focus()
      el.selection = { ranges: [[0, 1]], direction: 'forward' }
    })
    await chooseFormat('字体', 'mathbb')
    assert.match(await value(), /\\mathbb\{A\}\+B/)
    await page.getByTitle('撤销 (Ctrl+Z)', { exact: true }).click()
    assert.equal(await value(), 'A+B')
    await source()
    // Tab follows character navigation even in complete formulas without slots.
    const navigationFormulas = [
      String.raw`\frac{d}{dx}\sin(x)=\cos(x)+x^{2}+\sqrt{y}`,
      String.raw`\frac{ }{ }+\ce{[Cu(NH3)4]^2+}+x^{ }+\sqrt{ }`,
      '',
    ]
    const mathfield = page.locator('math-field')
    const selectionRanges = () => mathfield.evaluate(el => el.selection.ranges)
    for (const latex of navigationFormulas) {
      await textarea.fill(latex)
      await visual()
      const initialValue = await value()
      await mathfield.evaluate(el => { el.focus(); el.position = 0 })
      await page.waitForFunction(() => !!document.querySelector('math-field').shadowRoot.activeElement)
      const steps = await mathfield.evaluate(el => el.lastOffset + 3)
      for (const [arrow, tab, fromEnd] of [
        ['ArrowRight', 'Tab', false],
        ['ArrowLeft', 'Shift+Tab', true],
      ]) {
        const reset = () => mathfield.evaluate((el, end) => { el.position = end ? el.lastOffset : 0 }, fromEnd)
        await reset()
        const expected = []
        for (let step = 0; step < steps; step++) {
          await page.keyboard.press(arrow)
          expected.push(await selectionRanges())
        }
        await reset()
        for (const ranges of expected) {
          await page.keyboard.press(tab)
          assert.deepEqual(await selectionRanges(), ranges, `${tab} follows ${arrow}`)
          assert.equal(await mathfield.evaluate(el => el.hasFocus()), true, 'Tab keeps focus, including at boundaries')
        }
      }
      assert.equal(await value(), initialValue, 'navigation does not modify the formula')
      await source()
    }
    await textarea.fill(Array.from({ length: 60 }, (_, index) => `x_{${index}}`).join('+'))
    await visual()
    await page.waitForFunction(() => {
      const content = document.querySelector('math-field').shadowRoot.querySelector('[part=content]')
      return content.scrollWidth > content.clientWidth && content.offsetHeight > content.clientHeight
    })
    const scroll = page.locator('math-field').locator('[part=content]')
    const bounds = await scroll.boundingBox()
    // Drag the actual scrollbar thumb, rather than setting scrollLeft in script.
    await page.mouse.move(bounds.x + 10, bounds.y + bounds.height - 5)
    await page.mouse.down()
    await page.mouse.move(bounds.x + 200, bounds.y + bounds.height - 5, { steps: 5 })
    await page.mouse.up()
    assert.ok(await scroll.evaluate(el => el.scrollLeft > 0))
    await page.locator('math-field').evaluate(el => el.focus())
    await page.waitForFunction(() => !!document.querySelector('math-field').shadowRoot.activeElement)
    await page.keyboard.press('End')
    await page.waitForFunction(() => {
      const content = document.querySelector('math-field').shadowRoot.querySelector('[part=content]')
      return content.scrollLeft + content.clientWidth >= content.scrollWidth - 10
    })
    await page.keyboard.press('Home')
    await page.waitForFunction(() => document.querySelector('math-field').shadowRoot.querySelector('[part=content]').scrollLeft < 10)
    await source()
    await textarea.fill('x+y')
    await visual()
    await page.waitForFunction(() => {
      const content = document.querySelector('math-field').shadowRoot.querySelector('[part=content]')
      return content.scrollWidth === content.clientWidth && content.offsetHeight === content.clientHeight
    })
    await page.locator('math-field').evaluate(el => { el.focus(); el.position = 0 })
    await page.waitForFunction(() => !!document.querySelector('math-field').shadowRoot.activeElement)
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('math-field').evaluate(el => el.hasFocus()), true)
    assert.equal(await page.locator('math-field').evaluate(el => el.position), 1)
    await page.keyboard.type('z')
    assert.equal(await value(), 'xz+y')
    await source()
    const unsupported = String.raw`\unknowncommand{x}`
    await textarea.fill(unsupported)
    await visual()
    assert.match(await page.getByRole('alert').innerText(), /源码/)
    await source()
    assert.equal(await textarea.inputValue(), unsupported)
    // Public props update both the toolbar and editor behavior at runtime.
    await page.locator('#toggle-custom-options').click()
    await textarea.fill('A+B')
    await visual()
    assert.equal(await page.getByLabel('字体', { exact: true }).locator('option[value="mathbf"]').innerText(), '自定义粗体名称')
    assert.equal(await page.getByLabel('字体', { exact: true }).locator('option[value="mathbf"]').count(), 1)
    await chooseFormat('字体', 'bold-italic')
    assert.notEqual(await value(), 'A+B')
    await page.waitForFunction(() => {
      const glyph = [...document.querySelector('math-field').shadowRoot.querySelectorAll('.ML__base span')]
        .find(el => !el.children.length && el.textContent === 'A')
      if (!glyph) return false
      const style = getComputedStyle(glyph)
      return style.fontStyle === 'italic' && style.fontWeight === '700'
    })
    assert.equal(await page.locator('math-field').evaluate(el => el.errors.length), 0)
    const customStyledValue = await value()
    await source()
    assert.equal(await textarea.inputValue(), customStyledValue)
    await page.locator('.latex-formula__preview svg').first().waitFor()
    assert.equal(await page.locator('.latex-formula__preview [data-mjx-error]').count(), 0)
    await visual()
    await page.getByRole('button', { name: '导出', exact: true }).click()
    await page.waitForFunction(latex => {
      const result = document.querySelector('#export-result').textContent
      return result.startsWith(latex + '|') && result.includes('data:image/png;base64,')
    }, customStyledValue)
    await page.locator('.t-color-picker__trigger').click()
    await page.getByTitle('#123456', { exact: true }).waitFor()
    assert.equal(await page.getByTitle('#123456', { exact: true }).count(), 1)
    assert.equal(await page.getByTitle('#ff0000', { exact: true }).count(), 0)
    await page.getByTitle('#123456', { exact: true }).click()
    await page.getByRole('button', { name: '确定', exact: true }).click()
    assert.match(await value(), /123456/)
    await page.getByRole('button', { name: '自定义平方', exact: true }).click()
    assert.match(await value(), /q\^2/)
    await page.getByText('自定义分类', { exact: true }).click()
    await page.getByRole('button', { name: '自定义分式', exact: true }).hover()
    await page.getByRole('tooltip').filter({ hasText: '自定义分式' }).locator('svg').waitFor()
    await page.getByRole('button', { name: '自定义分式', exact: true }).click()
    assert.match(await value(), /\\frac\{u\}\{v\}/)
    await source()
    const customSearch = page.getByPlaceholder('输入公式标题查询').filter({ visible: true })
    await customSearch.fill('自定义平方')
    await page.getByRole('button', { name: '自定义平方', exact: true }).waitFor()
    await page.locator('#toggle-custom-options').click()
    await page.getByRole('button', { name: '重置', exact: true }).click()
    assert.equal(await page.getByText('自定义分类', { exact: true }).count(), 0)
    await visual()
    assert.equal(await page.getByLabel('字体', { exact: true }).locator('option[value="bold-italic"]').count(), 0)
    assert.equal(await page.getByLabel('字体', { exact: true }).locator('option[value="mathbf"]').innerText(), '衬线粗体')
    assert.deepEqual(errors, [])
    assert.deepEqual(remoteRequests, [], 'editor and fonts work without a CDN')
  } finally {
    await browser?.close()
    server.kill()
  }
})
