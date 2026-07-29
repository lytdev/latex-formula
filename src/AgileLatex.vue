<template>
  <div class="agile-latex">
    <div class="agile-latex__top">
      <SymbolPanel @insert="handleInsert" />
    </div>
    <div class="agile-latex__bottom">
      <div class="agile-latex__input">
        <div class="agile-latex__input-header">
          <span class="agile-latex__label">LaTeX 输入</span>
          <t-button size="small" theme="primary" @click="handleExport">
            导出
          </t-button>
        </div>
        <LatexInput
          :model-value="modelValue"
          :placeholder="placeholder"
          :readonly="readonly"
          @update:model-value="handleInput"
        />
      </div>
      <div class="agile-latex__preview">
        <div class="agile-latex__label">实时预览</div>
        <PreviewPanel :latex="modelValue" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'
import SymbolPanel from './components/SymbolPanel.vue'
import LatexInput from './components/LatexInput.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import { useExport } from './composables/useExport'
import type { AgileLatexExport } from './types'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>(), {
  modelValue: '',
  placeholder: '输入 LaTeX 公式...',
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'render': [result: AgileLatexExport]
}>()

const { exportFormula } = useExport()

function handleInput(value: string) {
  emit('update:modelValue', value)
}

function handleInsert(latex: string) {
  const newValue = props.modelValue + latex
  emit('update:modelValue', newValue)
}

async function handleExport() {
  const result = await doExport()
  // Result is returned to the consumer via the exposed method,
  // but the button also triggers a side effect.
  // We emit the render event so consumers can react.
  emit('render', result)
}

async function doExport(): Promise<AgileLatexExport> {
  return await exportFormula(props.modelValue || '')
}

// --- Exposed methods for parent component via template ref ---

async function exposedExportFormula(): Promise<AgileLatexExport> {
  const result = await doExport()
  emit('render', result)
  return result
}

async function exposedRenderFormula(latex: string): Promise<AgileLatexExport> {
  emit('update:modelValue', latex)
  await nextTick()
  const result = await doExport()
  emit('render', result)
  return result
}

defineExpose({
  exportFormula: exposedExportFormula,
  renderFormula: exposedRenderFormula,
})
</script>

<style scoped>
.agile-latex {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  overflow: hidden;
}

.agile-latex__top {
  height: 35%;
  min-height: 180px;
  border-bottom: 1px solid var(--td-component-border);
  overflow: hidden;
}

.agile-latex__bottom {
  flex: 1;
  display: flex;
  min-height: 0;
}

.agile-latex__input {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--td-component-border);
  padding: 12px;
  min-width: 0;
}

.agile-latex__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-width: 0;
}

.agile-latex__input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.agile-latex__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  margin-bottom: 8px;
}

.agile-latex__input-header .agile-latex__label {
  margin-bottom: 0;
}

.agile-latex__input :deep(.t-textarea__inner) {
  flex: 1;
}
</style>
