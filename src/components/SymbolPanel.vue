<template>
  <div class="symbol-panel">
    <t-tabs v-model="activeTab" theme="card" size="medium">
      <t-tab-panel
        v-for="cat in categories"
        :key="cat.key"
        :value="cat.key"
        :label="cat.label"
      >
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

const emit = defineEmits<{
  insert: [latex: string]
}>()

const { categories } = useSymbols()
const activeTab = ref(categories.value[0]?.key ?? 'functions')

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

.symbol-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  max-height: calc(100% - 48px);
  overflow-y: auto;
}
</style>
