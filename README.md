> Vue 3 LaTeX editor component with MathJax rendering, symbol library, and export to LaTeX/MathML/base64 PNG

## 安装

```bash
pnpm i @agilehub/agile-latex-formula          #安装依赖
```
## 完整实例
```typescript
<template>
  <el-dialog v-model="visible" width="960px" title="公式编辑器" destroy-on-close>
    <div class="dialog-viewer-shell" style="450px">
      <AgileLatex v-model="latex" @render="onRender"/>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AgileLatex } from '@agilehub/agile-latex-formula'
import type { AgileLatexExport } from '@agilehub/agile-latex-formula'

const emit = defineEmits(["renderExport"]);

const latex = ref('')
//建议将latex转成base64存储
const prefix = 'base64,';

const showDialog = (latexData: string) => {
  if (latexData && latexData.startsWith(prefix)) {
    const index = latexData.indexOf(prefix);
    const result = index !== -1 ? latexData.substring(index + prefix.length) : latexData;
    latex.value = atob(result);
    visible.value = true
  }
}

function onRender(result: AgileLatexExport) {
  // 导出结果：latex / mathml / base64 三合一
  console.log('导出成功', result)
   emit('renderExport', result)
}

defineExpose({
  showDialog,
})

</script>
```