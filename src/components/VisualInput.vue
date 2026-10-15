<template>
  <div class="visual-input" @keydown.capture="onKeyDown">
    <div v-if="error" class="visual-input__error" role="alert">{{ error }}，请切换到源码模式编辑。</div>
    <div v-else-if="loading" role="status">正在加载可视化编辑器…</div>
    <div ref="container" class="visual-input__field" />
    <p class="visual-input__hint">点击公式中的位置编辑；方向键移动，Tab 向后移动一个字符，Shift+Tab 向前移动一个字符。</p>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import type { MathfieldElement, Selection, Style } from 'mathlive'
import 'mathlive/fonts.css'
import { formulaFonts, formulaFontStyles } from '../composables/formulaFonts'
import { mathFontOptions } from '../composables/mathFontOptions'
import type { FontFamilyOption } from '../types'

const props = defineProps<{ modelValue: string; readonly?: boolean; fontFamilyOptions?: FontFamilyOption[] }>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  undo: []
  redo: []
}>()
const container = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const error = ref('')
let field: MathfieldElement | null = null
let selection: Selection | null = null
let disposed = false
let lastEmitted = ''
let focusFrame = 0

function withPlaceholders(latex: string) {
  return latex.replace(/\\placeholder(?:\[[^\]]*\])?\{[^}]*\}|\{\s*\}/g,
    match => match.startsWith('\\placeholder') ? match : '{\\placeholder{}}')
}

function syncValue(value: string) {
  if (!field) return
  // A visual edit already owns the current selection. Do not reset it on v-model echo.
  if (value !== lastEmitted) {
    field.setValue(withPlaceholders(value), { silenceNotifications: true })
    selection = null
    lastEmitted = value
  }
  error.value = field.errors.length ? '当前源码包含可视化编辑器不支持或不完整的语法' : ''
  field.readOnly = !!props.readonly || !!error.value
}

function onInput() {
  if (!field || props.readonly || error.value) return
  // MathLive's editable slots are editor-only; keep exported LaTeX MathJax-compatible.
  lastEmitted = field.getValue().replace(/\\placeholder(?:\[[^\]]*\])?\{[^}]*\}/g, ' ')
  emit('update:modelValue', lastEmitted)
  snapSelection()
}

function snapSelection() {
  if (field) selection = structuredClone(field.selection)
}

function focusEditor() {
  cancelAnimationFrame(focusFrame)
  focusFrame = requestAnimationFrame(() => {
    if (!disposed) field?.focus()
  })
}

function insert(latex: string, after?: string, placeholder = ' ') {
  if (!field || props.readonly || error.value) return
  field.focus()
  if (selection) field.selection = selection
  const selected = field.getValue(field.selection)
  const value = after === undefined ? withPlaceholders(latex) : latex + (selected || placeholder) + after
  field.insert(value, { insertionMode: 'replaceSelection', selectionMode: 'placeholder', silenceNotifications: true })
  onInput()
  focusEditor()
}

function applyFormatting(style: Style, wrapper?: string) {
  if (!field || props.readonly || error.value) return
  const savedSelection = selection
  field.focus()
  if (savedSelection) field.selection = savedSelection
  // With no selection, format the existing formula instead of an empty space.
  // MathLive's style API replaces previous styles instead of nesting commands.
  if (field.selection.ranges.every(([start, end]) => start === end) && field.getValue()) {
    field.select()
  }
  if (wrapper) {
    let selected = field.getValue(field.selection)
    if (wrapper.startsWith('class{lf-font-')) {
      selected = selected.replace(/\\class\{lf-font-(?:times|symbol)\}\{/g, '{')
    }
    field.insert(`\\${wrapper}{${selected || ' '}}`, {
      insertionMode: 'replaceSelection', selectionMode: 'after', silenceNotifications: true,
    })
  } else {
    if (style.variant) {
      const selected = field.getValue(field.selection)
      const cleaned = selected.replace(/\\class\{lf-font-(?:times|symbol)\}\{/g, '{')
      if (cleaned !== selected) {
        field.insert(cleaned, { insertionMode: 'replaceSelection', selectionMode: 'item', silenceNotifications: true })
      }
    }
    field.applyStyle(style, { operation: 'set' })
  }
  // MathLive paints selected atoms with its selection text color. Collapse the
  // selection so the newly applied formula color is immediately visible.
  field.position = Math.max(...field.selection.ranges.flat())
  onInput()
  focusEditor()
}

function applyColor(color: string) {
  applyFormatting({ color })
}

function applyFont(command: string) {
  const style = (props.fontFamilyOptions ?? mathFontOptions).find(option => option.value === command)?.style
  if (style) {
    applyFormatting(style)
    return
  }
  if (command === 'times') {
    applyFormatting({}, `class{${formulaFonts[command].className}}`)
    return
  }
  if (command === 'underline') applyFormatting({}, command)
  else if (command === 'mathbb') applyFormatting({ variant: 'double-struck', variantStyle: 'up' })
}

function applySize(command: string) {
  const sizes: Record<string, Style['fontSize']> = {
    tiny: 1, small: 4, normalsize: 5, large: 6, Large: 7, huge: 9,
  }
  const fontSize = sizes[command.replace(/^\\/, '')]
  if (fontSize) applyFormatting({ fontSize })
}

async function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.altKey && field) {
    event.stopImmediatePropagation()
    if (props.readonly || error.value) return
    event.preventDefault()
    // Use MathLive's arrow-key navigation to respect fractions, scripts and
    // placeholders, while preventing Tab from moving browser focus away.
    field.executeCommand(event.shiftKey ? 'moveToPreviousChar' : 'moveToNextChar')
    field.executeCommand('scrollIntoView')
    snapSelection()
    return
  }
  if (props.readonly || !(event.ctrlKey || event.metaKey)) return
  if (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'y') {
    event.preventDefault()
    event.stopImmediatePropagation()
    // MathLive dispatches input on a timer. Flush the current value before undo.
    onInput()
    await nextTick()
    if (disposed) return
    if (event.shiftKey || event.key.toLowerCase() === 'y') emit('redo')
    else emit('undo')
  }
}

onMounted(async () => {
  try {
    const { MathfieldElement: Mathfield } = await import('mathlive')
    if (disposed || !container.value) return
    // Vite embeds fonts.css and its WOFF2 assets in the library bundle.
    Mathfield.fontsDirectory = null
    Mathfield.soundsDirectory = null
    field = new Mathfield()
    field.defaultMode = 'math'
    field.mathVirtualKeyboardPolicy = 'manual'
    field.setAttribute('aria-label', '可视化公式编辑器')
    field.addEventListener('input', onInput)
    field.addEventListener('blur', snapSelection)
    field.addEventListener('pointerdown', focusEditor)
    container.value.appendChild(field)
    const editorStyle = document.createElement('style')
    editorStyle.textContent = `${formulaFontStyles}
      .ML__content::-webkit-scrollbar { width: 10px; height: 10px; }
      .ML__content::-webkit-scrollbar-track { background: #f3f3f3; border-radius: 5px; }
      .ML__content::-webkit-scrollbar-thumb { background: #a6a6a6; border-radius: 5px; border: 2px solid #f3f3f3; }
      .ML__content::-webkit-scrollbar-thumb:hover { background: #777; }
    `
    field.shadowRoot?.appendChild(editorStyle)
    syncValue(props.modelValue)
  } catch {
    error.value = '可视化编辑器加载失败'
  } finally {
    loading.value = false
  }
})

watch(() => props.modelValue, syncValue)
watch(() => props.readonly, () => {
  if (field) field.readOnly = !!props.readonly || !!error.value
})
onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(focusFrame)
  field?.removeEventListener('input', onInput)
  field?.removeEventListener('blur', snapSelection)
  field?.removeEventListener('pointerdown', focusEditor)
  field?.remove()
  field = null
})
defineExpose({ insert, snapSelection, applyColor, applyFont, applySize })
</script>

<style scoped>
.visual-input { flex: 1; min-height: 0; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
/* Keep scrolling on MathLive's content so caret navigation and the visible
   scrollbar share the same scroll position. */
.visual-input__field { flex: 1; min-height: 0; min-width: 0; overflow-x: hidden; overflow-y: auto; }
.visual-input__field :deep(math-field) {
  display: block; width: 100%; max-width: 100%; height: 100%; min-height: 100%; box-sizing: border-box; padding: 16px; font-size: 24px;
  border: 1px solid var(--td-component-border); border-radius: var(--td-radius-default);
  background: var(--td-bg-color-container); color: var(--td-text-color-primary);
  --caret-color: var(--td-brand-color);
  --selection-background-color: var(--td-brand-color-light);
}
.visual-input__field :deep(math-field::part(container)) { height: 100%; }
.visual-input__field :deep(math-field::part(content)) {
  min-width: 0;
  min-height: 0;
  height: 100%;
  align-self: stretch;
  align-items: flex-start;
  overflow-x: auto;
  overflow-y: auto;
}
.visual-input__field :deep(math-field::part(virtual-keyboard-toggle)),
.visual-input__field :deep(math-field::part(menu-toggle)) { display: none; }
.visual-input__field :deep(math-field:focus-within) { outline: 2px solid var(--td-brand-color); outline-offset: -1px; }
.visual-input__hint { margin: 0; font-size: 12px; line-height: 1.6; color: var(--td-text-color-secondary); }
.visual-input__error { font-size: 13px; color: var(--td-error-color); }
</style>
