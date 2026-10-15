import { createApp, h, ref } from 'vue'
import LatexFormula, { type FontFamilyOption, type SymbolCategory } from '../dist/latex-formula.mjs'

const value = ref(String.raw`\frac{d}{dx}\sin(x) = \cos(x)`)
const resultText = ref('pending')
let lastExport: unknown = null
const readonly = ref(false)
const customOptions = ref(false)
const fontFamilyOptions: FontFamilyOption[] = [
  { value: 'bold-italic', content: '自定义粗斜体', style: { variant: 'main', variantStyle: 'bolditalic' } },
  { value: 'mathbf', content: '自定义粗体名称' },
]
const symbols: SymbolCategory[] = [
  { key: 'Functions', label: '常用函数', symbols: [{ label: '自定义平方', latex: 'q^2' }] },
  { key: 'custom', label: '自定义分类', symbols: [{ label: '自定义分式', latex: String.raw`\frac{u}{v}` }] },
]
const editorRef = ref<InstanceType<typeof LatexFormula> | null>(null)
// Browser regression tests exercise the same public ref methods as consumers.
Object.defineProperty(window, '__formulaEditor', { get: () => editorRef.value })
Object.defineProperty(window, '__formulaExport', { get: () => lastExport })
const app = createApp({
  setup() {
    return () => h('div', { style: 'height:720px' }, [
      h('output', { id: 'export-result' }, resultText.value),
      h('button', { id: 'method-export', onClick: () => editorRef.value?.exportFormula() }, '方法导出'),
      h('button', { id: 'method-render', onClick: () => editorRef.value?.renderFormula('x^2') }, '方法载入'),
      h('button', { id: 'toggle-readonly', onClick: () => { readonly.value = !readonly.value } }, '切换只读'),
      h('button', { id: 'toggle-custom-options', onClick: () => { customOptions.value = !customOptions.value } }, '切换自定义配置'),
      h(LatexFormula, {
        ref: editorRef,
        modelValue: value.value,
        readonly: readonly.value,
        presetColors: customOptions.value ? ['#123456', '#abcdef'] : undefined,
        fontFamilyOptions: customOptions.value ? fontFamilyOptions : undefined,
        symbols: customOptions.value ? symbols : undefined,
        'onUpdate:modelValue': (next: string) => { value.value = next },
        onRender: (result: any) => { lastExport = result; resultText.value = `${result.latex}|${result.mathml.length}|${result.base64.slice(0,22)}` },
      }),
    ])
  },
})
app.mount('#app')
