import { createApp, h, ref } from 'vue'
import LatexFormula from '../dist/latex-formula.mjs'

const value = ref(String.raw`\frac{d}{dx}\sin(x) = \cos(x)`)
const resultText = ref('pending')
const readonly = ref(false)
const editorRef = ref<{ exportFormula: () => Promise<unknown>; renderFormula: (latex: string) => Promise<unknown> } | null>(null)
const app = createApp({
  setup() {
    return () => h('div', { style: 'height:720px' }, [
      h('output', { id: 'export-result' }, resultText.value),
      h('button', { id: 'method-export', onClick: () => editorRef.value?.exportFormula() }, '方法导出'),
      h('button', { id: 'method-render', onClick: () => editorRef.value?.renderFormula('x^2') }, '方法载入'),
      h('button', { id: 'toggle-readonly', onClick: () => { readonly.value = !readonly.value } }, '切换只读'),
      h(LatexFormula, {
        ref: editorRef,
        modelValue: value.value,
        readonly: readonly.value,
        'onUpdate:modelValue': (next: string) => { value.value = next },
        onRender: (result: any) => { resultText.value = `${result.latex}|${result.mathml.length}|${result.base64.slice(0,22)}` },
      }),
    ])
  },
})
app.mount('#app')
