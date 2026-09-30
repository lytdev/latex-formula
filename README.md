# latex-formula

Vue 3 LaTeX 编辑组件，支持符号搜索与插入、实时预览，以及导出 LaTeX、MathML 和 PNG data URL。

## 安装

```bash
pnpm add @agilehub/latex-formula
```

项目需要 Vue 3.3 或更高版本。组件样式随 JavaScript 包自动加载。

## 使用

```vue
<template>
  <div style="height: 720px">
    <LatexFormula v-model="latex" @render="onRender" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LatexFormula, type LatexFormulaExport } from '@agilehub/latex-formula'

const latex = ref(String.raw`\frac{a}{b}`)

function onRender(result: LatexFormulaExport) {
  // result.latex: 源公式
  // result.mathml: MathML 字符串
  // result.base64: data:image/png;base64,...，可直接赋给 <img> 的 src
  console.log(result)
}
</script>
```

可通过组件 ref 调用 `exportFormula()` 导出当前公式，或调用 `renderFormula(latex)` 载入并导出指定公式。这两个方法返回 `Promise<LatexFormulaExport>`，成功时也触发 `render` 事件。导出失败时 Promise 会拒绝；内置按钮会在组件内显示错误。

`readonly` 属性禁用输入和编辑工具栏；`placeholder` 可自定义占位文字。单次公式长度上限为 5000 个字符。

## 本地回归

```bash
pnpm build
pnpm test:package
pnpm dev
```

开发服务启动后，打开 `/smoke.html` 可直接操作构建产物。`test:package` 检查 ESM、CommonJS、类型入口和全部内置符号的 MathJax 排版。
