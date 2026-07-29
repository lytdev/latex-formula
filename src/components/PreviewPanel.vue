<template>
  <div class="preview-panel">
    <div v-if="!isReady" class="preview-placeholder">
      Loading MathJax...
    </div>
    <div
      v-else-if="!latex.trim()"
      class="preview-placeholder"
    >
      输入 LaTeX 公式以预览
    </div>
    <div
      v-else
      ref="previewContainer"
      class="preview-content"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { useMathJax } from '../composables/useMathJax'

const props = defineProps<{
  latex: string
}>()

const { render, isReady, ready } = useMathJax()
const previewContainer: Ref<HTMLElement | null> = ref(null)

// Initialize MathJax on mount
ready()

function doRender(latexCode: string): void {
  if (!isReady.value || !previewContainer.value || !latexCode.trim()) return

  const { svgElement } = render(latexCode, true)
  const container = previewContainer.value

  // Clear previous content and append new SVG
  container.innerHTML = ''
  container.appendChild(svgElement)
}

// Debounced render on latex change
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.latex,
  (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doRender(newVal), 300)
  },
  { immediate: false },
)

// Initial render when MathJax is ready
watch(isReady, (ready) => {
  if (ready && props.latex.trim()) {
    doRender(props.latex)
  }
})
</script>

<style scoped>
.preview-panel {
  height: 100%;
  overflow: auto;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  padding: 16px;
  background: var(--td-bg-color-container);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  min-height: 100%;
}

.preview-content :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style>
