<template>
  <div class="latex-input">
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

defineProps<{
  modelValue: string
  placeholder?: string
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaRef = useTemplateRef('textareaRef')

/** Get the native <textarea> element for cursor/selection manipulation. */
function getNativeTextarea(): HTMLTextAreaElement | null {
  const el = (textareaRef.value as any)?.$el
  if (!el) return null
  return el.querySelector('textarea') ?? (el as HTMLTextAreaElement)
}

defineExpose({ getNativeTextarea })

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

.latex-input :deep(.t-textarea) {
  height: 100%;
}

.latex-input :deep(.t-textarea__inner) {
  height: 100% !important;
  min-height: 200px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}
</style>
