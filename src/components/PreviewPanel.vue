<template>
  <div class="preview-panel">
    <!-- MathJax 未加载完成 -->
    <div v-if="!isReady" class="preview-placeholder">
      正在加载 MathJax...
    </div>
    <!-- 输入为空 -->
    <div v-else-if="!latex.trim()" class="preview-placeholder">
      输入 LaTeX 公式以预览
    </div>
    <!-- 渲染公式的容器 -->
    <div v-else ref="previewContainer" class="preview-content" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useMathJax } from '../composables/useMathJax'

/** 接收父组件传入的 LaTeX 字符串 */
const props = defineProps<{
  latex: string
}>()

/**
 * useMathJax 返回三个值：
 *   render(latex, display?) — 同步渲染 LaTeX → { svgElement, mathml }
 *   isReady — 响应式布尔值，MathJax 是否已初始化
 *   ready() — 初始化 MathJax（幂等调用）
 */
const { render, isReady, ready } = useMathJax()

/** 预览容器 DOM 引用 */
const previewContainer: Ref<HTMLElement | null> = ref(null)

// ── 组件挂载时初始化 MathJax ──
ready()

/**
 * 执行实际渲染：
 * 1. 调用 MathJax render 获取 SVG 元素
 * 2. 清空旧内容，追加新 SVG
 *
 * 渲染是同步的（MathJax direct API），无 await 开销。
 */
function doRender(latexCode: string): void {
  if (!isReady.value || !previewContainer.value || !latexCode.trim()) return

  const { svgElement } = render(latexCode, true)
  const container = previewContainer.value

  // 清空并追加（纯视觉渲染，不触发任何事件或日志）
  container.innerHTML = ''
  container.appendChild(svgElement)
}

// ── 输入变化 → 300ms 防抖 → 重新渲染 ──
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => props.latex,
  (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doRender(newVal), 300)
  },
  { immediate: true }
)

// ── MathJax 就绪后首次渲染 ──
watch(isReady, (readyVal) => {
  if (readyVal && props.latex.trim()) {
    doRender(props.latex)
  }
})

// ── 组件卸载时清除定时器，避免内存泄漏 ──
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

/* placeholder 文字居中显示 */
.preview-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 公式内容区域 — 自然文档流，让 MathJax 自己控制布局 */
.preview-content {
  display: block;
  overflow: visible;
}

/* 限制 SVG 宽度不超出容器，高度自适应 */
.preview-content :deep(svg) {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
