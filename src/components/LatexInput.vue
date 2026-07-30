<template>
  <div class="latex-input">
    <!-- TDesign 多行文本输入框，等宽字体便于编写 LaTeX -->
    <t-textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :autosize="{ minRows: 8, maxRows: 20 }"
      @change="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'

/** 接收父组件通过 v-model 传入的 LaTeX 文本 */
defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>()

/** 向父组件 emit v-model 更新事件 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/** TDesign Textarea 组件的模板引用 */
const textareaRef = useTemplateRef('textareaRef')

/**
 * 获取原生 <textarea> DOM 元素。
 *
 * 这是实现光标处插入的关键 — AgileLatex 通过此方法读取
 * selectionStart/selectionEnd 来在正确位置插入符号/颜色/样式。
 */
function getNativeTextarea(): HTMLTextAreaElement | null {
  // TDesign 的 t-textarea 外层是包裹 div，需要穿透到内部 <textarea>
  const el = (textareaRef.value as any)?.$el
  if (!el) return null
  return el.querySelector('textarea') ?? (el as HTMLTextAreaElement)
}

/** 对外暴露 getNativeTextarea，供父组件 AgileLatex 调用 */
defineExpose({ getNativeTextarea })

/** 输入变化 → 通知父组件更新 modelValue */
function onInput(value: string) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.latex-input {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 让 textarea 撑满父容器高度 */
.latex-input :deep(.t-textarea) {
  height: 100%;
}

.latex-input :deep(.t-textarea__inner) {
  height: 100% !important;
  min-height: 200px;
  /* 等宽字体 — LaTeX 代码由反斜杠和花括号组成，等宽字体更易阅读 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}
</style>
