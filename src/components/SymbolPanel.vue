<template>
  <div class="symbol-panel">
    <!-- 顶部符号分类标签页 -->

    <t-tabs v-model="activeTab" theme="card" size="medium" v-if="filteredCategories && filteredCategories.length > 0">
      <t-tab-panel v-for="cat in filteredCategories" :key="cat.key" :value="cat.key" :label="cat.label">
        <div class="symbol-panel-search">
          <t-input placeholder="输入公式标题查询" clearable v-model="searchLabel">
            <template #suffixIcon>
              <search-icon :style="{ cursor: 'pointer' }" />
            </template>
          </t-input>
        </div>
        <!-- 符号按钮网格：自动换行 + 滚动 -->
        <div class="symbol-grid">
          <t-button v-for="sym in cat.symbols" :key="sym.label" size="small" variant="outline" :title="sym.label"
            @click="onSymbolClick(sym.latex)">
            {{ sym.label }}
          </t-button>
        </div>
      </t-tab-panel>
    </t-tabs>
    <div class="tab-empty" v-else>
      <t-empty>
        <template #action>
          <t-button @click="refresh" size="small">重置</t-button>
        </template>
      </t-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSymbols } from '../composables/useSymbols'
import { SearchIcon } from 'tdesign-icons-vue-next'

/** 向父组件（AgileLatex）emit 需要插入的 LaTeX 代码片段 */
const emit = defineEmits<{
  insert: [latex: string]
}>()

/** 搜索关键词 */
const searchLabel = ref('')

/** 从 composable 获取 8 个分类的全部符号数据 */
const { categories } = useSymbols()

const refresh = () => {
  searchLabel.value = ''
}

/**
 * 过滤后的分类数据：
 * 当 searchLabel 为空时返回全部符号；
 * 有搜索词时，每个分类只保留 label 包含关键词的符号，
 * 且过滤掉完全没有匹配项的空白分类。
 */
const filteredCategories = computed(() => {
  const kw = searchLabel.value.trim().toLowerCase()
  if (!kw) return categories.value

  return categories.value
    .map((cat) => ({
      ...cat,
      symbols: cat.symbols.filter((sym) =>
        sym.label.toLowerCase().includes(kw),
      ),
    }))
    .filter((cat) => cat.symbols.length > 0)
})

/** 当前选中的 Tab key，默认选中第一个分类 */
const activeTab = ref(filteredCategories.value[0]?.key ?? 'functions')

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

.symbol-panel-search {
  padding: 4px;
  width: 250px;
}

/* 符号网格 — flex-wrap 自动换行，内容超出时垂直滚动 */
.symbol-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.tab-empty {
  padding-top: 14px;
}

.symbol-panel :deep(.t-empty__action) {
  margin-top: 8px;
}

.symbol-panel :deep(.t-empty__title) {
  margin-top: 4px
}
</style>
