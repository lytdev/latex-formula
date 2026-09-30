<template>
  <div class="latex-formula" @keydown="onKeyDown">
    <!-- 顶部：符号面板 -->
    <div class="latex-formula__top">
      <SymbolPanel :readonly="readonly" @insert="handleInsert" />
    </div>
    <!-- 底部：输入区（左）+ 预览区（右） -->
    <div class="latex-formula__bottom">
      <div class="latex-formula__input">
        <!-- 工具栏：撤销/恢复/清除 + 字体 + 字号 + 颜色 -->
        <div class="latex-formula__input-header">
          <span class="latex-formula__label">LaTeX 输入</span>
          <div class="latex-formula__toolbar" @mousedown="snapSelection">
            <t-button size="small" variant="text" :disabled="readonly || !canUndo" title="撤销 (Ctrl+Z)" @click="undo">
              <rollback-icon :fill-color='["#bbd3fb", "#f78d94"]' size="22px"
                :stroke-color='["currentColor", "#0052d9"]' :stroke-width="2.5" />
            </t-button>
            <t-button size="small" variant="text" :disabled="readonly || !canRedo" title="恢复 (Ctrl+Shift+Z)" @click="redo">
              <rollfront-icon :fill-color='["#bbd3fb", "#f78d94"]' size="22px"
                :stroke-color='["currentColor", "#0052d9"]' :stroke-width="2.5" />
            </t-button>
            <t-button size="small" variant="text" :disabled="readonly" @click="clearInput">
              <clear-icon :fill-color='["#bbd3fb", "#f78d94"]' size="22px" :stroke-color='["currentColor", "#0052d9"]'
                :stroke-width="2.5" />
            </t-button>
            <span class="toolbar-sep" />
            <!-- 字体样式下拉 -->
            <select class="latex__toolbar-select" aria-label="字体" :disabled="readonly" @change="onFontSelect">
              <option value="">字体</option>
              <option v-for="opt in fontFamilyOptions" :key="opt.value" :value="opt.value">{{ opt.content }}</option>
            </select>
            <!-- 字号下拉 -->
            <select class="latex__toolbar-select" aria-label="字号" :disabled="readonly" @change="onFontSizeSelect">
              <option value="">字号</option>
              <option v-for="opt in fontSizeOptions" :key="opt.value" :value="opt.value">{{ opt.content }}</option>
            </select>
            <span class="toolbar-sep" />
            <!-- TDesign 颜色选择器（含预设色块 + 自定义取色） -->
            <t-color-picker size="small" :swatch-colors="presetColors" defaultValue="#e74c3c" :colorModes="['monochrome']" :disabled="readonly"
              :borderless="true" format="HEX" :popup-props="{ placement: 'bottom-right' }" :recent-colors="[]"
              @change="onColorPickerChange" />
          </div>
        </div>
        <!-- LaTeX 输入框 -->
        <LatexInput ref="latexInputRef" :model-value="modelValue" :placeholder="placeholder" :readonly="readonly"
          @update:model-value="handleInput" />
      </div>
      <!-- 实时公式预览区域 -->
      <div class="latex-formula__preview">
        <div class="latex__preview-header">
          <span class="latex-formula__label">实时预览</span>
          <div class="latex__preview-action">
            <t-button size="small" theme="primary" @click="handlePreview" :disabled="!modelValue || exporting">
              <template #icon>
                <camera-1-icon :fill-color='"transparent"' :stroke-color='"#ffffff"' :stroke-width="2.5" />
              </template>
              预览
            </t-button>
            <t-button size="small" theme="primary" @click="handleExport" :disabled="!modelValue || exporting">
              <template #icon>
                <export-icon :fill-color='["#bbd3fb", "#f78d94"]' :stroke-color='["currentColor", "#ecf2fe"]'
                  :stroke-width="2.5" />
              </template>
              导出
            </t-button>
          </div>
        </div>
        <div v-if="exportError" class="latex-formula__error" role="alert">{{ exportError }}</div>
        <PreviewPanel :latex="modelValue" />
      </div>
    </div>
    <t-dialog v-model:visible="dialogVisible" :cancelBtn="null" confirmBtn="下载" width="80%" :onConfirm="downloadLatex" @closed="clearPreviewResult">
      <div class="preview-container">
        <img :src="lastResult?.base64">
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import SymbolPanel from './components/SymbolPanel.vue'
import LatexInput from './components/LatexInput.vue'
import PreviewPanel from './components/PreviewPanel.vue'
import { useExport } from './composables/useExport'
import type { LatexFormulaExport } from './types'
import { RollbackIcon, RollfrontIcon, ClearIcon, ExportIcon, Camera1Icon } from 'tdesign-icons-vue-next'
import { Button as TButton, ColorPicker as TColorPicker, Dialog as TDialog } from 'tdesign-vue-next'

/**
 * 组件 Props — 通过 v-model 绑定 LaTeX 代码
 */
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>(), {
  modelValue: '',
  placeholder: '输入 LaTeX 公式...',
  readonly: false,
})

const dialogVisible = ref(false)
const exporting = ref(false)
const exportError = ref('')
let disposed = false
let selectionFrame = 0


const lastResult = ref<LatexFormulaExport>({
  latex: '',
  /** MathML 格式的公式表示 */
  mathml: '',
  /** Base64 编码的 PNG 图片（data:image/png;base64,...） */
  base64: ''
})

function clearPreviewResult() {
  lastResult.value = { latex: '', mathml: '', base64: '' }
}

/**
 * 组件 Events
 *   update:modelValue — v-model 标准 emit
 *   render           — 导出/渲染完成时触发，携带 { latex, mathml, base64 }
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'render': [result: LatexFormulaExport]
}>()

/** 导出功能 composable */
const { exportFormula } = useExport()
/** LatexInput 组件的模板引用，用于获取原生 textarea 操作光标 */
const latexInputRef = ref<InstanceType<typeof LatexInput> | null>(null)

// ═══════════════════════════════════════════════════════════
// 撤销 / 恢复
// 历史机制：每次输入变化时 pushHistory 保存当前值，
// undo 从 history 弹出上一个值，同时推入 future 栈。
// 新输入后 future 清空（标准编辑器行为）。
// 最大 200 步历史，超出自动丢弃最早的。
// ═══════════════════════════════════════════════════════════

const MAX_HISTORY = 200
const history = ref<string[]>([])
const future = ref<string[]>([])

const canUndo = computed(() => history.value.length > 0)
const canRedo = computed(() => future.value.length > 0)

/** 将当前值推入历史栈（跳过连续重复） */
function pushHistory(value: string) {
  const last = history.value[history.value.length - 1]
  if (last === value) return
  if (history.value.length >= MAX_HISTORY) {
    history.value.shift()
  }
  history.value.push(value)
  future.value = [] // 新输入清空 redo 栈
}

/** 撤销：从 history 弹出上一步，当前值推入 future */
function undo() {
  if (props.readonly || !canUndo.value) return
  const prev = history.value.pop()!
  future.value.push(props.modelValue)
  emit('update:modelValue', prev)
}

/** 恢复：从 future 弹出下一步，当前值推入 history */
function redo() {
  if (props.readonly || !canRedo.value) return
  const next = future.value.pop()!
  history.value.push(props.modelValue)
  emit('update:modelValue', next)
}

// ── 全局快捷键 Ctrl+Z / Ctrl+Shift+Z ──
function onKeyDown(e: KeyboardEvent) {
  if (props.readonly || e.defaultPrevented || !(e.target instanceof HTMLTextAreaElement)) return
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

onUnmounted(() => {
  disposed = true
  if (selectionFrame) cancelAnimationFrame(selectionFrame)
})

// ═══════════════════════════════════════════════════════════
// 字体颜色
// ═══════════════════════════════════════════════════════════

/** 预设色板（红/橙/黄/绿/青/蓝/紫/粉/深橙/棕/灰/黑） */
const presetColors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#e91e63',
  '#ff5722', '#795548', '#607d8b', '#000000']

// ═══════════════════════════════════════════════════════════
// 光标/选区处理
// 工具栏按钮点击会先触发 blur → textarea 选区清空 → @click 读取不到。
// 所以在 @mousedown 时快照选区，insertAtCursor 用快照值做 fallback。
// ═══════════════════════════════════════════════════════════

let lastSelection: { start: number; end: number } | null = null

/** 快照当前 textarea 的光标/选区位置 */
function snapSelection() {
  const ta = latexInputRef.value?.getNativeTextarea()
  if (ta) {
    lastSelection = { start: ta.selectionStart, end: ta.selectionEnd }
  }
}

/**
 * 在光标处（或选中范围内）插入 LaTeX 代码。
 *
 * 两种模式：
 *   有选中文本 → 用 before/after 包裹选中内容
 *   无选中文本 → 在 cursor 插入 before + placeholder + after，光标放在中间
 *
 * @param before      插入在内容之前的 LaTeX 代码（如 \textcolor{red}{）
 * @param after       插入在内容之后的 LaTeX 代码（如 }）
 * @param placeholder 无选中时插入的占位文本（如 " "）
 */
function insertAtCursor(before: string, after: string, placeholder: string) {
  if (props.readonly) return
  const ta = latexInputRef.value?.getNativeTextarea()
  if (!ta) return

  // 优先用当前选区，若为空则用 @mousedown 快照的选区
  let start = ta.selectionStart
  let end = ta.selectionEnd
  if (document.activeElement !== ta && lastSelection) {
    start = lastSelection.start
    end = lastSelection.end
  }
  lastSelection = null
  const text = props.modelValue
  start = Math.min(start, text.length)
  end = Math.min(end, text.length)
  pushHistory(text)

  if (start !== end) {
    // 包裹选中的文本
    const selected = text.slice(start, end)
    const newText = text.slice(0, start) + before + selected + after + text.slice(end)
    emit('update:modelValue', newText)
    // 恢复选中状态：包裹后的内容保持选中
    selectionFrame = requestAnimationFrame(() => {
      if (disposed || !ta.isConnected) return
      ta.focus()
      ta.setSelectionRange(start, start + before.length + selected.length + after.length)
    })
  } else {
    // 在光标位置插入模板，光标放在中间
    const newText = text.slice(0, start) + before + placeholder + after + text.slice(end)
    emit('update:modelValue', newText)
    const cursorPos = start + before.length + placeholder.length
    selectionFrame = requestAnimationFrame(() => {
      if (disposed || !ta.isConnected) return
      ta.focus()
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }
}

// ═══════════════════════════════════════════════════════════
// 字号 & 字体样式 选项数据
// ═══════════════════════════════════════════════════════════

/** 字号下拉选项 — 对应 LaTeX 声明式字号命令 */
const fontSizeOptions = [
  { content: '超小', value: 'tiny' },
  { content: '小', value: 'small' },
  { content: '正常', value: 'normalsize' },
  { content: '大', value: 'large' },
  { content: '超大', value: 'Large' },
  { content: '巨无霸大', value: 'huge' },
]

/** 字体样式下拉选项 — 对应 LaTeX 字体命令 */
const fontFamilyOptions = [
  { content: '加粗', value: 'mathbf' },
  { content: '斜体', value: 'mathit' },
  { content: '下划线', value: 'underline' },
  { content: 'Sans serif', value: 'mathsf' },
  { content: '手写体', value: 'mathcal' },
  { content: '黑板报体', value: 'mathbb' },
  { content: '德文尖角体', value: 'mathfrak' },
]

// ═══════════════════════════════════════════════════════════
// 工具栏按钮处理函数
// ═══════════════════════════════════════════════════════════

/** 字号下拉选项点击 → 插入 {\size ...} */
function onFontSizeSelect(event: Event) {
  const select = event.target as HTMLSelectElement
  if (select.value) applySize(`\\${select.value}`)
  select.value = ''
}

function onFontSelect(event: Event) {
  const select = event.target as HTMLSelectElement
  if (select.value) applyFont(select.value)
  select.value = ''
}

/** 颜色按钮 → 插入 \textcolor{hex}{...} */
function applyColor(hex: string) {
  insertAtCursor(`\\textcolor{${hex}}{`, '}', ' ')
}

/** 字体样式按钮 → 插入 \style{...} */
function applyFont(cmd: string) {
  insertAtCursor(`\\${cmd}{`, '}', ' ')
}

/** 字号声明 → 插入 {\size ...} */
function applySize(cmd: string) {
  insertAtCursor(`{${cmd} `, '}', ' ')
}

/** TDesign ColorPicker 选中颜色 */
function onColorPickerChange(value: string) {
  applyColor(value)
}

/** 清空输入框 */
function clearInput() {
  if (props.readonly || !props.modelValue) return
  pushHistory(props.modelValue)
  emit('update:modelValue', '')
}

// ═══════════════════════════════════════════════════════════
// 输入处理
// ═══════════════════════════════════════════════════════════

/** 用户在 textarea 输入 → 保存历史 + 更新 modelValue */
function handleInput(value: string) {
  if (props.readonly || value === props.modelValue) return
  pushHistory(props.modelValue)
  emit('update:modelValue', value)
}

/**
 * 符号面板点击 → 在光标位置插入符号的 LaTeX 代码
 * （不再追加到末尾，而是智能插入到光标/选区位置）
 */
function handleInsert(latex: string) {
  if (props.readonly) return
  pushHistory(props.modelValue)
  const ta = latexInputRef.value?.getNativeTextarea()
  if (!ta) {
    emit('update:modelValue', props.modelValue + latex) // fallback：追加到末尾
    return
  }
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const text = props.modelValue
  // 替换选中文本或在光标处插入
  const newText = text.slice(0, start) + latex + text.slice(end)
  emit('update:modelValue', newText)
  // 插入后光标移到末尾
  const cursorPos = start + latex.length
  selectionFrame = requestAnimationFrame(() => {
    if (disposed || !ta.isConnected) return
    ta.focus()
    ta.setSelectionRange(cursorPos, cursorPos)
  })
}

// ═══════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════

/** 导出按钮 → 渲染当前公式 → console.log + emit render */
async function handleExport() {
  try {
    const result = await doExport()
    if (!disposed) emit('render', result)
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : '公式导出失败'
  }
}

async function handlePreview() {
  try {
    const result = await doExport()
    if (disposed) return
    lastResult.value = result
    dialogVisible.value = true
  } catch (error) {
    exportError.value = error instanceof Error ? error.message : '公式预览失败'
  }
}
/** 将 lastResult.base64 转为 Blob 并触发客户端下载 */
const downloadLatex = () => {
  const base64 = lastResult.value.base64
  if (!base64) return

  // base64 格式: data:image/png;base64,xxxx
  const parts = base64.split(',')
  if (parts.length < 2) return

  const byteString = atob(parts[1])
  const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'image/png'

  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([ab], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `latex-formula.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 内部导出逻辑：调用 useExport 的 exportFormula */
async function doExport(): Promise<LatexFormulaExport> {
  if (exporting.value) throw new Error('公式正在导出，请稍后重试')
  exporting.value = true
  exportError.value = ''
  try {
    return await exportFormula(props.modelValue || '')
  } finally {
    exporting.value = false
  }
}

// ═══════════════════════════════════════════════════════════
// 对外暴露的方法（通过 template ref 调用）
// ═══════════════════════════════════════════════════════════

/**
 * 导出当前公式为 { latex, mathml, base64 }
 * 供父组件通过 ref.exportFormula() 调用
 */
async function exposedExportFormula(): Promise<LatexFormulaExport> {
  const result = await doExport()
  emit('render', result)
  return result
}

/**
 * 载入一段 LaTeX 并立即渲染导出
 * 供父组件通过 ref.renderFormula(latex) 调用
 *
 * @param latex — 要渲染的 LaTeX 字符串
 */
async function exposedRenderFormula(latex: string): Promise<LatexFormulaExport> {
  if (props.readonly) throw new Error('只读状态下无法载入公式')
  emit('update:modelValue', latex)
  await nextTick()
  if (exporting.value) throw new Error('公式正在导出，请稍后重试')
  exporting.value = true
  try {
    const result = await exportFormula(latex)
    if (!disposed) emit('render', result)
    return result
  } finally {
    exporting.value = false
  }
}

defineExpose({
  exportFormula: exposedExportFormula,
  renderFormula: exposedRenderFormula,
})
</script>

<style scoped>
/* ── 主布局 ── */
.latex-formula {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 450px;
  min-width: 860px;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  overflow: hidden;
}

/* 顶部：符号面板占 32% 高度 */
.latex-formula__top {
  height: 32%;
  min-height: 150px;
  border-bottom: 1px solid var(--td-component-border);
  overflow: hidden;
}

/* 底部：输入区 + 预览区 flex 平分 */
.latex-formula__bottom {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 工具栏（撤销/恢复/清除/字体/字号/颜色） */
.latex-formula__toolbar {
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.latex-formula__toolbar :deep(.t-button__text) {
  display: flex;
  align-items: center;
}

.latex__toolbar-select {
  height: 28px;
  margin-left: 4px;
  padding: 0 4px;
  color: var(--td-text-color-primary);
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
}

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--td-component-border);
  margin: 0 6px;
}

/* 颜色预设色块按钮 */
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

.latex-formula__input {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--td-component-border);
  padding: 12px;
  min-width: 0;
}

.latex-formula__preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-width: 0;
}

.latex-formula__input-header,
.latex__preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.latex-formula__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
}

.latex-formula__input-header .latex-formula__label {
  margin-bottom: 0;
}

.latex-formula__input :deep(.t-textarea__inner) {
  flex: 1;
}

.latex__preview-action {
  display: flex;
  align-items: center;
  justify-content: end;
  flex: 1;
}

.latex__preview-action :deep(.t-button) {
  margin-left: 4px;
}
</style>
