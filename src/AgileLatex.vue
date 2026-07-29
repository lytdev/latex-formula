<template>
  <div class="agile-latex">
    <div class="agile-latex__top">
      <SymbolPanel @insert="handleInsert" />
    </div>
    <div class="agile-latex__toolbar">
      <span class="agile-latex__label">字体颜色</span>
      <button
        v-for="c in presetColors"
        :key="c"
        class="color-btn"
        :class="{ active: color === c }"
        :style="{ backgroundColor: c }"
        :title="c"
        @click="setColor(c)"
      />
      <button
        class="color-btn color-btn--none"
        :class="{ active: !color }"
        title="默认"
        @click="setColor('')"
      >×</button>
      <input
        type="color"
        class="color-input"
        :value="color || '#000000'"
        @input="setColor(($event.target as HTMLInputElement).value)"
      />
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
        <PreviewPanel :latex="coloredLatex" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// ── 字体颜色 ──
const color = ref('')
const presetColors = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#ff5722', '#795548', '#607d8b', '#000000',
]

const coloredLatex = computed(() => {
  if (!color.value || !props.modelValue.trim()) return props.modelValue
  return `{\\color{${color.value}} ${props.modelValue}}`
})

function setColor(c: string) {
  color.value = c
}

function handleInput(value: string) {
  emit('update:modelValue', value)
}

function handleInsert(latex: string) {
  const newValue = props.modelValue + latex
  emit('update:modelValue', newValue)
}

async function handleExport() {
  const result = await doExport()
  console.log('[AgileLatex] 导出:', result)
  emit('render', result)
}

async function doExport(): Promise<AgileLatexExport> {
  return await exportFormula(coloredLatex.value || '')
}

// --- Exposed methods ---

async function exposedExportFormula(): Promise<AgileLatexExport> {
  const result = await doExport()
  console.log('[AgileLatex] exportFormula:', result)
  emit('render', result)
  return result
}

async function exposedRenderFormula(latex: string): Promise<AgileLatexExport> {
  emit('update:modelValue', latex)
  const result = await exportFormula(coloredLatex.value)
  console.log('[AgileLatex] renderFormula:', result)
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
  height: 32%;
  min-height: 160px;
  border-bottom: 1px solid var(--td-component-border);
  overflow: hidden;
}

.agile-latex__toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-bottom: 1px solid var(--td-component-border);
  background: var(--td-bg-color-secondarycontainer);
}

.color-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s, border-color 0.15s;
}
.color-btn:hover {
  transform: scale(1.2);
}
.color-btn.active {
  border-color: var(--td-brand-color);
  transform: scale(1.15);
}

.color-btn--none {
  background: #fff;
  border: 2px solid #ccc;
  color: #666;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-input {
  width: 26px;
  height: 22px;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
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
}

.agile-latex__input-header .agile-latex__label {
  margin-bottom: 0;
}

.agile-latex__input :deep(.t-textarea__inner) {
  flex: 1;
}
</style>
