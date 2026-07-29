<template>
  <div class="playground">
    <h1 class="title">Agile LaTeX — Dev Playground</h1>
    <div class="editor-wrapper">
      <AgileLatex
        ref="editorRef"
        v-model="latexCode"
        placeholder="输入 LaTeX 公式..."
        @render="onRender"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AgileLatex, type AgileLatexExport } from '../src/index'

const latexCode = ref(String.raw`\frac{d}{dx}\sin(x) = \cos(x)`)
const lastResult = ref<AgileLatexExport | null>(null)

function onRender(result: AgileLatexExport) {
  lastResult.value = result
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
.playground { padding: 24px; height: 100vh; display: flex; flex-direction: column; gap: 16px; }
.title { font-size: 20px; font-weight: 600; }
.editor-wrapper { flex: 1; min-height: 0; }
.export-preview { background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #e0e0e0; }
.export-preview h3 { font-size: 16px; margin-bottom: 12px; }
.export-sections { display: flex; gap: 16px; }
.export-section { flex: 1; }
.export-section h4 { font-size: 13px; margin-bottom: 8px; color: #666; }
.export-section pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.export-img { max-width: 200px; height: auto; border: 1px solid #e0e0e0; border-radius: 4px; }
</style>
