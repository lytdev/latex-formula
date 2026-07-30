<template>
  <div class="agile-latex">
    <div class="agile-latex__top">
      <SymbolPanel @insert="handleInsert" />
    </div>
    <div class="agile-latex__bottom">
      <div class="agile-latex__input">
        <div class="agile-latex__input-header">
          <span class="agile-latex__label">LaTeX 输入</span>
          <div class="agile-latex__toolbar">
            <t-button size="small" variant="text" :disabled="!canUndo" title="撤销 (Ctrl+Z)" @click="undo">↩ 撤销</t-button>
            <t-button size="small" variant="text" :disabled="!canRedo" title="恢复 (Ctrl+Shift+Z)" @click="redo">↪
              恢复</t-button>
            <span class="toolbar-sep" />
            <t-button size="small" variant="text" @click="clearInput">✕ 清除</t-button>
            <span class="toolbar-sep" />
            <span class="agile-latex__label">颜色</span>
            <button v-for="c in presetColors" :key="c" class="color-btn" :style="{ backgroundColor: c }" :title="c"
              @click="applyColor(c)" />
            <t-color-picker
              size="small"
              :swatch-colors="presetColors"
              :popup-props="{ placement: 'bottom-right' }"
              @change="onColorPickerChange"
            />
          </div>
         
        </div>
        <LatexInput ref="latexInputRef" :model-value="modelValue" :placeholder="placeholder" :readonly="readonly"
          @update:model-value="handleInput" />
      </div>
      <div class="agile-latex__preview">
        <div class="latex__preview-header">
          <span class="agile-latex__label">实时预览</span>
          <t-button size="small" theme="primary" @click="handleExport">
            导出
          </t-button>
        </div>
        <PreviewPanel :latex="modelValue" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, onMounted, onUnmounted } from 'vue'
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
const latexInputRef = useTemplateRef('latexInputRef')

// ── 撤销/恢复 ──
const MAX_HISTORY = 200
const history = ref<string[]>([])
const future = ref<string[]>([])

const canUndo = computed(() => history.value.length > 0)
const canRedo = computed(() => future.value.length > 0)

function pushHistory(value: string) {
  const last = history.value[history.value.length - 1]
  if (last === value) return // skip duplicates
  if (history.value.length >= MAX_HISTORY) {
    history.value.shift()
  }
  history.value.push(value)
  future.value = []
}

function undo() {
  if (!canUndo.value) return
  const prev = history.value.pop()!
  future.value.push(props.modelValue)
  emit('update:modelValue', prev)
}

function redo() {
  if (!canRedo.value) return
  const next = future.value.pop()!
  history.value.push(props.modelValue)
  emit('update:modelValue', next)
}

// Ctrl+Z / Ctrl+Shift+Z hotkeys
function onKeyDown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      undo()
    } else if (e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      redo()
    } else if (e.key === 'Z') {
      e.preventDefault()
      redo()
    }
  }
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))

// ── 字体颜色 ──
const presetColors = [
  '#e74c3c', '#f1c40f', '#1abc9c', '#3498db', '#e91e63',
  '#ff5722',
]

function insertAtCursor(before: string, after: string, placeholder: string) {
  const ta = latexInputRef.value?.getNativeTextarea()
  if (!ta) return

  const start = ta.selectionStart
  const end = ta.selectionEnd
  const text = props.modelValue

  if (start !== end) {
    // Wrap selected text
    const selected = text.slice(start, end)
    const newText = text.slice(0, start) + before + selected + after + text.slice(end)
    emit('update:modelValue', newText)
    // Restore selection: select the wrapped portion
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start, start + before.length + selected.length + after.length)
    })
  } else {
    // Insert with placeholder at cursor
    const newText = text.slice(0, start) + before + placeholder + after + text.slice(end)
    emit('update:modelValue', newText)
    // Place cursor inside the inserted content
    const cursorPos = start + before.length + placeholder.length
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }
}

function applyColor(hex: string) {
  insertAtCursor(`\\textcolor{${hex}}{`, '}', ' ')
}

function onColorPickerChange(value: string) {
  applyColor(value)
}

function clearInput() {
  pushHistory(props.modelValue)
  emit('update:modelValue', '')
}

function handleInput(value: string) {
  pushHistory(props.modelValue)
  emit('update:modelValue', value)
}

function handleInsert(latex: string) {
  pushHistory(props.modelValue)
  const newValue = props.modelValue + latex
  emit('update:modelValue', newValue)
}

async function handleExport() {
  const result = await doExport()
  console.log('[AgileLatex] 导出:', result)
  emit('render', result)
}

async function doExport(): Promise<AgileLatexExport> {
  return await exportFormula(props.modelValue || '')
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
  const result = await exportFormula(latex)
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
  padding: 0 12px;
  background: var(--td-bg-color-secondarycontainer);
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--td-component-border);
  margin: 0 6px;
}

.color-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s;
}

.color-btn:hover {
  transform: scale(1.2);
  border-color: rgba(255, 255, 255, 0.5);
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

.agile-latex__input-header,.latex__preview-header {
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
