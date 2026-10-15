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
        <div class="symbol-grid" :class="{ 'symbol-grid--visual': visual }">
          <t-popup v-for="sym in cat.symbols" :key="sym.label" :disabled="!visual" placement="bottom"
            trigger="hover" :delay="[200, 100]" show-arrow destroy-on-close>
            <template #content>
              <div class="symbol-preview" role="tooltip">
                <div class="symbol-preview__title">{{ sym.label }}</div>
                <div v-if="previews[sym.latex]" class="symbol-preview__formula" v-html="previews[sym.latex]" />
                <div v-else class="symbol-preview__fallback">{{ sym.latex }}</div>
              </div>
            </template>
          <t-button size="small" variant="outline" :title="visual ? undefined : sym.label" :aria-label="sym.label" :disabled="readonly"
            @click="onSymbolClick(sym.latex)">
            <span v-if="visual && thumbnails[sym.latex]" class="symbol-thumbnail" aria-hidden="true" v-html="thumbnails[sym.latex]" />
            <span v-else>{{ sym.label }}</span>
          </t-button>
          </t-popup>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useSymbols } from '../composables/useSymbols'
import type { SymbolCategory } from '../types'
import { useMathJax } from '../composables/useMathJax'
import { SearchIcon } from 'tdesign-icons-vue-next'
import { Tabs as TTabs, TabPanel as TTabPanel, Input as TInput, Button as TButton, Empty as TEmpty, Popup as TPopup } from 'tdesign-vue-next'

/** 向父组件（LatexFormula）emit 需要插入的 LaTeX 代码片段 */
const emit = defineEmits<{
  insert: [latex: string]
}>()
const props = defineProps<{ readonly?: boolean; visual?: boolean; symbols?: SymbolCategory[] }>()
const { ready, render, isReady } = useMathJax()
onMounted(ready)
const thumbnailCache = new Map<string, string>()
const previewCache = new Map<string, string>()
// Render formula previews only for the active category.
const thumbnails = computed(() => {
  const result: Record<string, string> = {}
  if (!props.visual || !isReady.value) return result
  const category = filteredCategories.value.find(item => item.key === activeTab.value)
  for (const symbol of category?.symbols ?? []) {
    if (!thumbnailCache.has(symbol.latex)) {
      try {
        const latex = symbol.latex.replace(/\{\s*\}/g, '{\\square}')
        const output = render(latex)
        // Use the SVG alone: MathJax's display wrapper and baseline styles are
        // intended for text layout, and would clip a compact toolbar thumbnail.
        const svg = output.svgElement.querySelector('svg')?.cloneNode(true) as SVGElement | undefined
        if (!svg || output.mathml.includes('<merror')) {
          thumbnailCache.set(symbol.latex, '')
          continue
        }
        const [, , width, height] = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number)
        if (!(width > 0 && height > 0)) {
          thumbnailCache.set(symbol.latex, '')
          continue
        }
        // MathJax uses 1000 SVG units per em. Keep a shared 16px base size;
        // only shrink oversized formulas, never enlarge short glyphs to fill a cell.
        const scale = Math.min(0.016, 150 / width, 18 / height)
        svg.removeAttribute('style')
        svg.setAttribute('width', `${width * scale}px`)
        svg.setAttribute('height', `${height * scale}px`)
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        thumbnailCache.set(symbol.latex, svg.outerHTML)
        // Reuse the vector artwork at a readable size, bounded by the popup.
        const previewScale = Math.min(0.028, 440 / width, 180 / height)
        svg.setAttribute('width', `${width * previewScale}px`)
        svg.setAttribute('height', `${height * previewScale}px`)
        previewCache.set(symbol.latex, svg.outerHTML)
      } catch { thumbnailCache.set(symbol.latex, '') }
    }
    result[symbol.latex] = thumbnailCache.get(symbol.latex) || ''
  }
  return result
})
const previews = computed(() => Object.fromEntries(
  Object.keys(thumbnails.value).map(latex => [latex, previewCache.get(latex) || '']),
))

/** 搜索关键词 */
const searchLabel = ref('')

/** 从 composable 获取 8 个分类的全部符号数据 */
const { categories } = useSymbols(() => props.symbols ?? [])

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
watch(filteredCategories, (items) => {
  if (items.length && !items.some((item) => item.key === activeTab.value)) {
    activeTab.value = items[0].key
  }
})

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

.symbol-panel :deep(.t-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.symbol-panel :deep(.t-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.symbol-panel :deep(.t-tab-panel) {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.symbol-panel-search {
  padding: 8px 0 0 8px;
  width: 350px;
}

/* 符号网格 — flex-wrap 自动换行，内容超出时垂直滚动 */
.symbol-grid {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  padding: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.symbol-grid--visual { gap: 6px; }
.symbol-grid--visual :deep(.t-button) { min-width: 54px; height: 24px; padding: 2px 10px; }
.symbol-thumbnail { display: flex; align-items: center; justify-content: center; height: 18px; max-width: 150px; line-height: 0; pointer-events: none; }
.symbol-thumbnail :deep(svg) { display: block; flex: none; max-width: 150px; max-height: 18px; }

.symbol-preview { max-width: min(440px, calc(100vw - 48px)); padding: 4px 8px; }
.symbol-preview__title { margin-bottom: 12px; font-size: 14px; font-weight: 600; color: var(--td-text-color-primary); }
.symbol-preview__formula { display: flex; align-items: center; justify-content: center; padding: 8px 0; }
.symbol-preview__formula :deep(svg) { display: block; max-width: 100%; height: auto; }
.symbol-preview__fallback { font-family: monospace; overflow-wrap: anywhere; }

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
