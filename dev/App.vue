<template>
  <div class="playground">
    <t-button @click="exportData">导出数据</t-button>
    <div class="editor-wrapper">
      <AgileLatex ref="editorRef" v-model="latexCode" placeholder="输入 LaTeX 公式..." @render="onRender" />
    </div>
    <t-dialog v-model:visible="dialogVisible" :cancelBtn="null" :confirmBtn="null" width="80%">
      <div class="preview-container">
        <img :src="lastResult?.base64">
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref,useTemplateRef } from 'vue'
import { AgileLatex, type AgileLatexExport } from '../src/index'

const latexCode = ref(String.raw`\frac{d}{dx}\sin(x) = \cos(x)`)
const lastResult = ref<AgileLatexExport | null>(null)
const dialogVisible = ref(false)
const editorRef =useTemplateRef('editorRef')
const exportData = async () => {
  const result = await editorRef.value?.exportFormula()
  console.log(result)
}
function onRender(result: AgileLatexExport) {
  console.log("onRender", result)
  dialogVisible.value = true
  lastResult.value = result
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.playground {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-wrapper {
  flex: 1;
  min-height: 0;
}

.export-img {
  max-width: 200px;
  height: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
