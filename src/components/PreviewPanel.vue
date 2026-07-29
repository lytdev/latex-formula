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
import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useMathJax } from '../composables/useMathJax'
import type { AgileLatexExport } from '../types'

const props = defineProps<{
  latex: string
}>()

const emit = defineEmits<{
  render: [result: AgileLatexExport]
}>()

const { render, isReady, ready } = useMathJax()
const previewContainer: Ref<HTMLElement | null> = ref(null)

// Initialize MathJax on mount
ready()

function doRender(latexCode: string): void {
  if (!isReady.value || !previewContainer.value || !latexCode.trim()) return

  const { svgElement, mathml } = render(latexCode, true)
  const container = previewContainer.value

  // Clear previous content and append new SVG
  container.innerHTML = ''
  container.appendChild(svgElement)

  // Emit render event with latex + mathml (base64 is omitted here —
  // it is generated on demand via the explicit export button / exportFormula).
  emit('render', { latex: latexCode, mathml, base64: '' })
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

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
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
}

.preview-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.preview-content {
  display: block;
  overflow: visible;
}

.preview-content :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
