> Vue 3 LaTeX editor component with MathJax rendering, symbol library, and export to LaTeX/MathML/base64 PNG

## 安装

```bash
pnpm i @agilehub/agile-latex-formula          #安装依赖
```
## 完整实例
```typescript
<template>
  <div style="height: 600px; padding: 20px;">
    <AgileLatex
      ref="formulaRef"
      v-model="latex"
      placeholder="输入数学公式，如：\frac{a}{b}"
      @render="onRender"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AgileLatex } from '@agilehub/agile-latex-formula'
import type { AgileLatexExport } from '@agilehub/agile-latex-formula'

const latex = ref('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}')
const formulaRef = ref<InstanceType<typeof AgileLatex>>()

function onRender(result: AgileLatexExport) {
  // 导出结果：latex / mathml / base64 三合一
  console.log('导出成功', result)
}
</script>
```