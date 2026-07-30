<template>
  <div class="symbol-panel">
    <!-- 顶部符号分类标签页 -->
    <t-tabs v-model="activeTab" theme="card" size="medium">
      <t-tab-panel
        v-for="cat in categories"
        :key="cat.key"
        :value="cat.key"
        :label="cat.label"
      >
        <!-- 符号按钮网格：自动换行 + 滚动 -->
        <div class="symbol-grid">
          <t-button
            v-for="sym in cat.symbols"
            :key="sym.label"
            size="small"
            variant="outline"
            :title="sym.label"
            @click="onSymbolClick(sym.latex)"
          >
            {{ sym.label }}
          </t-button>
        </div>
      </t-tab-panel>
    </t-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSymbols } from '../composables/useSymbols'

/** 向父组件（AgileLatex）emit 需要插入的 LaTeX 代码片段 */
const emit = defineEmits<{
  insert: [latex: string]
}>()

/** 从 composable 获取 8 个分类的全部符号数据 */
const { categories } = useSymbols()

/** 当前选中的 Tab key，默认选中第一个分类 */
const activeTab = ref(categories.value[0]?.key ?? 'functions')

/** 点击符号按钮 → emit insert 事件，由父组件处理光标处插入 */
function onSymbolClick(latex: string) {
  emit('insert', latex)
}
</script>

<style scoped>
.symbol-panel {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 符号网格 — flex-wrap 自动换行，内容超出时垂直滚动 */
.symbol-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  max-height: calc(100% - 48px);
  overflow-y: auto;
}
</style>
