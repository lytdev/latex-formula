import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import type { Plugin, OutputChunk, OutputAsset } from 'rollup'

/**
 * Vite 插件：将所有 CSS 内联注入到 JS bundle 中。
 *
 * 常规 library mode 会将 CSS 提取到独立文件，消费者需要手动 import。
 * 此插件在 generateBundle 阶段读取 CSS 内容，删除独立的 CSS asset，
 * 并在 JS chunk 头部注入一段自执行函数，在运行时创建 <style> 元素。
 */
function inlineAllCss(): Plugin {
  const STYLE_ID = 'latex-formula-styles'
  return {
    name: 'inline-all-css',
    enforce: 'post',
    apply: 'build',
    generateBundle(_, bundle) {
      // 1. 收集所有 CSS 内容
      let css = ''
      for (const name of Object.keys(bundle)) {
        const chunk = bundle[name]
        if (chunk.type === 'asset' && name.endsWith('.css')) {
          css += (chunk as OutputAsset).source as string
          delete bundle[name] // 从产物中移除独立 CSS 文件
        }
      }
      if (!css) return

      // 2. 生成 CSS 注入代码
      const injectCode = `
(function(){if(typeof document<"u"&&!document.getElementById("${STYLE_ID}")){var e=document.createElement("style");e.id="${STYLE_ID}",e.textContent=${JSON.stringify(css)},document.head.appendChild(e)}})();`

      // 3. 注入到所有 JS chunk 头部
      for (const name of Object.keys(bundle)) {
        const chunk = bundle[name]
        if (chunk.type === 'chunk' && (name.endsWith('.mjs') || name.endsWith('.cjs'))) {
          ;(chunk as OutputChunk).code = injectCode + '\n' + (chunk as OutputChunk).code
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
    inlineAllCss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LatexFormula',
      formats: ['es', 'cjs'],
      fileName: (format) => `latex-formula.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
