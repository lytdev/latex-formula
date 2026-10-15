# latex-formula

一个用于 Vue 3 的 LaTeX 公式编辑组件，适合在题库、课程内容、笔记和文档系统中录入公式。

支持以下功能：

- **可视化编辑**：直接点击公式编辑分式、根式、上下标、矩阵等结构，支持字体、字号和颜色设置。
- **源码编辑**：输入 LaTeX，右侧实时预览；两种编辑模式共用同一份数据。
- **公式模板**：内置常用函数、常用符号、矩阵、数学公式、化学公式和物理公式，支持按名称搜索。
- **放大查看**：可视化模式下，鼠标悬停在模板上可查看名称和清晰的矢量公式预览。
- **撤销与恢复**：支持工具栏按钮和键盘快捷键。
- **预览与导出**：获取 LaTeX、MathML、PNG 图片 data URL 和 PNG Blob。
- **调用方扩展**：通过 `presetColors`、`fontFamilyOptions`、`symbols` 自定义色板、扩展字体及公式模板。

## 目录

- [1. 安装与环境要求](#1-安装与环境要求)
- [2. 快速开始](#2-快速开始)
- [3. 编辑器操作说明](#3-编辑器操作说明)
- [4. 参数 Props](#4-参数-props)
- [5. 自定义预设颜色](#5-自定义预设颜色)
- [6. 扩展字体选项](#6-扩展字体选项)
- [7. 扩展公式与分类](#7-扩展公式与分类)
- [8. 事件与导出数据](#8-事件与导出数据)
- [9. 通过组件 ref 调用方法](#9-通过组件-ref-调用方法)
- [10. 完整配置示例](#10-完整配置示例)
- [11. 常见问题与使用限制](#11-常见问题与使用限制)
- [12. 本地开发与测试](#12-本地开发与测试)

## 1. 安装与环境要求

在已有的 Vue 3 项目根目录执行以下任一命令：

```bash
pnpm add @agilehub/latex-formula
```

```bash
npm install @agilehub/latex-formula
```

项目需要 **Vue 3.3 或更高版本**。本文示例使用 Vue 单文件组件（`.vue`）和 `<script setup lang="ts">`，可以放入 Vue + TypeScript 项目的 `src/App.vue` 或业务页面中使用。

TDesign、MathJax、MathLive 及默认数学字体随组件构建产物提供，无需在调用方单独注册 TDesign，也无需配置字体 CDN。样式会随组件 JavaScript 自动加载，**不需要额外导入 CSS 文件**。

组件既支持命名导入，也支持默认导入，二选一即可：

```ts
import { LatexFormula } from '@agilehub/latex-formula'
```

```ts
import LatexFormula from '@agilehub/latex-formula'
```

编辑、预览和图片导出需要浏览器 DOM。服务端可以导入包，但不要在服务端调用导出方法；SSR 项目应在客户端挂载后使用编辑器相关功能。

## 2. 快速开始

下面是一个完整的页面示例。将代码放入页面组件后，编辑公式，再点击编辑器右侧的“导出”，即可在下方看到导出图片。

```vue
<template>
  <main>
    <div class="editor-scroll">
      <div class="editor-container">
        <LatexFormula v-model="latex" @render="onRender" />
      </div>
    </div>

    <p>当前 LaTeX：</p>
    <pre>{{ latex }}</pre>

    <section v-if="result">
      <p>导出图片：</p>
      <img :src="result.base64" alt="导出的公式" style="max-width: 100%" />
      <p><a :href="result.base64" download="formula.png">下载 PNG</a></p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LatexFormula, type LatexFormulaExport } from '@agilehub/latex-formula'

const latex = ref(String.raw`\frac{d}{dx}\sin(x)=\cos(x)`)
const result = ref<LatexFormulaExport | null>(null)

function onRender(value: LatexFormulaExport) {
  result.value = value
}
</script>

<style scoped>
.editor-scroll { overflow-x: auto; }
.editor-container { height: 720px; min-width: 680px; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; }
</style>
```

接入时注意三个要点：

1. 使用 `v-model` 绑定一个字符串。组件通过它接收初始公式，并将编辑后的 LaTeX 同步回父组件。
2. 为父容器设置明确高度，例如 `720px`。组件使用父容器高度，当前最小宽度为 `680px`；窄屏可像示例一样在外层添加横向滚动。
3. 使用 `String.raw` 编写 JavaScript 中的 LaTeX，避免反斜杠被解释为 JavaScript 转义字符。

如果使用普通字符串，反斜杠需要写两次。下面两种写法等价：

```ts
const formulaA = String.raw`\frac{a}{b}`
const formulaB = '\\frac{a}{b}'
```

用户在编辑器的源码输入框中直接输入 `\frac{a}{b}` 即可，不需要再转义。

## 3. 编辑器操作说明

### 3.1 编辑模式

组件默认进入**可视化模式**，点击清除按钮旁的“源码 / 可视化”可切换。

| 模式 | 公式模板区域 | 编辑区域 | 字体、字号、颜色工具 |
| --- | --- | --- | --- |
| 可视化 | 显示公式缩略图，悬停可放大查看 | 直接点击公式编辑 | 显示 |
| 源码 | 显示公式名称 | 左侧输入 LaTeX，右侧实时预览 | 隐藏；可直接修改 LaTeX 样式命令 |

两种模式共用 `v-model`、撤销/恢复和导出功能。仅切换模式不会主动改写原始源码；在可视化模式中实际编辑后，MathLive 可能规范化 LaTeX 的写法。

当前没有对外提供初始模式参数或模式切换方法，由用户在工具栏切换。

### 3.2 插入和编辑公式

1. 选择顶部分类，也可以输入公式名称搜索。搜索按名称匹配，忽略英文大小写；不是按 LaTeX 源码搜索。
2. 点击公式模板，在当前光标处插入；如果存在选区，则替换选中的内容。
3. 在可视化公式中点击需要修改的位置，输入字符或使用方向键移动。
4. 公式长度超过编辑区域宽度时，可使用编辑区底部的横向滚动条。

搜索会筛选各分类中的匹配项；没有结果时可以点击“重置”恢复列表。

### 3.3 字体、字号和颜色

先选中需要修改的字符，再选择字体、字号或颜色。有选区时修改选中部分；没有选区且公式非空时，修改整条公式。

颜色面板采用“确认后应用”的方式：

- 选择预设色块、拖动取色区域或修改颜色值，只更新面板里的待选颜色。
- 点击“确定”才设置公式颜色，并关闭面板。
- 点击“取消”或在面板外关闭，不应用本次颜色修改。

字体和字号选择完成后，下拉框会回到“字体”“字号”提示文字；它们是操作入口，不持续显示当前选区的样式状态。

字号包含：超小、小、正常、大、超大、巨无霸大。工具栏颜色值表示最近确认的颜色，不代表当前公式所有字符一定都采用该颜色。

### 3.4 键盘操作

| 操作 | 快捷键或方式 |
| --- | --- |
| 移动光标 | 方向键 |
| 可视化模式向后移动一个字符位置 | `Tab` |
| 可视化模式向前移动一个字符位置 | `Shift+Tab` |
| 撤销 | `Ctrl+Z`；macOS 使用 `Command+Z` |
| 恢复 | `Ctrl+Shift+Z`；macOS 使用 `Command+Shift+Z` |
| 清空公式 | 工具栏清除按钮 |

可视化模式中的 Tab 导航遵循公式结构，与左右方向键的移动规则一致；在公式首尾继续按 Tab / Shift+Tab 会保留编辑器焦点。它不是只在空白占位符之间跳转。源码模式不使用这一自定义 Tab 行为。

### 3.5 预览、导出和下载的区别

| 入口 | 行为 |
| --- | --- |
| “预览”按钮 | 生成图片并打开组件自带的预览弹窗，不触发 `render` 事件 |
| 预览弹窗中的“下载”按钮 | 下载 PNG 图片，文件名为 `latex-formula.png` |
| “导出”按钮 | 生成结果并触发 `render` 事件，供调用方保存、展示或上传；不会自动下载 |
| 组件 ref 方法 | 返回结果 Promise，同时在成功时触发 `render` 事件 |

## 4. 参数 Props

所有数组参数均支持响应式更新。JavaScript 中使用驼峰名称，Vue 模板中推荐使用短横线形式，例如 `fontFamilyOptions` 对应 `:font-family-options`。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` / `v-model` | `string` | `''` | 当前 LaTeX 公式，推荐始终通过 `v-model` 绑定 |
| `placeholder` | `string` | `'输入 LaTeX 公式...'` | 源码输入框为空时的提示文字；不控制可视化区域的提示 |
| `readonly` | `boolean` | `false` | 禁止编辑、插入模板、格式修改、撤销/恢复和清除；仍可切换模式、搜索和导出 |
| `presetColors` | `string[]` | 内置色板 | 替换颜色面板的预设色块 |
| `fontFamilyOptions` | `FontFamilyOption[]` | `[]` | 在默认字体选项上合并扩展 |
| `symbols` | `SymbolCategory[]` | `[]` | 在默认公式分类上合并扩展 |

字体和公式参数的默认值虽然是空数组，界面仍会显示内置选项。它们表示“额外配置”，不是整份列表的替换值。

只读模式不会阻止父组件修改绑定数据：父组件仍可通过给 `latex` 赋值更新展示的公式，但调用 `renderFormula()` 会拒绝，因为该方法包含载入公式的编辑动作。

## 5. 自定义预设颜色

传入颜色字符串数组即可替换内置色板。建议使用六位十六进制格式 `#RRGGBB`。

```ts
const presetColors = ['#000000', '#0052d9', '#e34d59', '#2ba471']
```

模板中绑定：

```vue
<template>
  <div style="height: 720px">
    <LatexFormula v-model="latex" :preset-colors="presetColors" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LatexFormula } from '@agilehub/latex-formula'

const latex = ref('x+y')
const presetColors = ref(['#000000', '#0052d9', '#e34d59'])
</script>
```

当前内置色板为：

```json
["#ff0000", "#e67e22", "#fac800", "#54ff00", "#007dff", "#9b59b6", "#e91e63", "#795548", "#000000"]
```

行为说明：

- 不传参数或设为 `undefined`：使用默认色板。
- 传入 `[]`：移除预设色块，仍可通过取色面板自定义颜色。
- 更改色板不会自动修改已有公式颜色，也不会把第一个预设色自动设为当前颜色。
- 该参数是色板替换，不是追加；如需保留某些默认色，请在传入数组中一并列出。

## 6. 扩展字体选项

### 6.1 数据结构

从包入口导入 `FontFamilyOption` 类型即可获得字段和样式值的 TypeScript 提示。

| 字段 | 类型 | 必填 | 用途 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 选项唯一标识，用于合并和选择，建议使用非空字符串 |
| `content` | `string` | 是 | 下拉框显示名称 |
| `english` | `string` | 否 | 英文名称元数据；当前下拉框只显示 `content` |
| `style` | MathLive 字体样式对象 | 新增字体时需要 | 支持 `variant` 和 `variantStyle` 两个字段 |

配置示例，放入页面的 `<script setup lang="ts">` 中：

```ts
import type { FontFamilyOption } from '@agilehub/latex-formula'

const fontFamilyOptions: FontFamilyOption[] = [
  {
    value: 'custom-bold-italic',
    content: '粗斜体',
    english: 'Bold italic',
    style: { variant: 'main', variantStyle: 'bolditalic' },
  },
  {
    value: 'custom-sans-bold',
    content: '无衬线粗体',
    style: { variant: 'sans-serif', variantStyle: 'bold' },
  },
  // 复用默认样式，仅修改下拉框中的名称。
  { value: 'mathbf', content: '加粗' },
]
```

在组件上绑定 `:font-family-options="fontFamilyOptions"`，完整页面见第 10 节。

### 6.2 默认字体及标识

| `value` | 默认名称 | `style.variant` | `style.variantStyle` |
| --- | --- | --- | --- |
| `mathnormal` | 默认数学字体 | `normal` | `''` |
| `mathrm` | 衬线正体 | `main` | `up` |
| `mathbf` | 衬线粗体 | `main` | `bold` |
| `mathit` | 衬线斜体 | `main` | `italic` |
| `mathsf` | 无衬线体 | `sans-serif` | `up` |
| `mathtt` | 等宽体 | `monospace` | `up` |
| `mathcal` | 花体 | `calligraphic` | `up` |
| `mathfrak` | 哥特体 | `fraktur` | `up` |
| `times` | Times New Roman | 内置专用处理 | — |
| `underline` | 下划线 | 内置 LaTeX 包裹处理 | — |
| `mathbb` | 黑板报体 | 内部使用 `double-struck` | `up` |

### 6.3 合并规则和兼容范围

- 按 `value` 区分选项，区分大小写。
- 新 `value` 追加到默认列表末尾；相同 `value` 合并并覆盖配置，保留原有位置。
- 只传相同 `value` 和新的 `content`，会继承原样式。
- 传入 `style` 时替换该选项的整个 `style` 对象，不按子字段深度合并；建议同时明确设置 `variant` 和 `variantStyle`。
- 重复传入同一 `value` 时，后面的配置覆盖前面的同名字段。
- 传 `[]` 或不传参数表示仅使用默认字体，不会清空默认列表。

新增 `value` 必须提供有效的 `style` 才能应用样式。`value` 是业务标识，不会自动作为 LaTeX 命令执行；仅填写一个字体名称也不会加载字体文件。

此接口用于组合 MathLive 支持的数学字体变体，**不是任意 CSS `font-family` 配置接口**。不同数学字体的字符覆盖范围不同，花体、黑板报体等对部分小写字母、数字或符号可能没有对应字形。建议使用实际业务公式检查可视化编辑、源码预览与导出效果。

Times New Roman 是内置的特殊选项，依赖用户设备可用的字体；未安装时会回退到衬线字体。默认数学字体由组件提供。

## 7. 扩展公式与分类

### 7.1 数据结构

`symbols` 接收一个 **分类对象数组**，不是单个分类对象，也不是以分类 key 为键的字典。

```ts
import type { SymbolCategory, SymbolItem } from '@agilehub/latex-formula'

const item: SymbolItem = {
  label: '自定义分式',
  latex: String.raw`\frac{a+b}{c}`,
}

const symbols: SymbolCategory[] = [
  {
    key: 'my-formulas',
    label: '我的公式',
    symbols: [item],
  },
]
```

| 对象 | 字段 | 必填 | 说明 |
| --- | --- | --- | --- |
| 分类 | `key: string` | 是 | 分类唯一标识，区分大小写 |
| 分类 | `label: string` | 是 | Tab 显示名称 |
| 分类 | `symbols: SymbolItem[]` | 是 | 该分类的公式列表 |
| 公式 | `label: string` | 是 | 名称，用于搜索、悬停标题和同分类内的合并 |
| 公式 | `latex: string` | 是 | 点击后插入的 LaTeX 代码 |

两种对象的类型中还保留了可选的 `thumbnail?: string` 字段，但当前面板不会读取它显示自定义图片。缩略图和悬停预览根据 `latex` 自动生成，通常无需填写该字段。

### 7.2 内置分类 key

要往已有分类添加公式，必须使用下面的确切 key；名称相同但 key 不同会生成另一个分类。

| `key` | 默认分类名称 |
| --- | --- |
| `Functions` | 常用函数 |
| `Operators` | 常用符号 |
| `Matrices` | 矩阵模板 |
| `math-formulas` | 常用公式 |
| `Chemistry` | 化学公式 |
| `Physics` | 物理公式 |

例如，下面同时扩展已有分类并新增分类：

```ts
import type { SymbolCategory } from '@agilehub/latex-formula'

const symbols: SymbolCategory[] = [
  {
    key: 'Functions',
    label: '常用函数',
    symbols: [
      { label: '自定义平方', latex: 'x^{2}' },
      { label: '可编辑分式', latex: String.raw`\frac{ }{ }` },
    ],
  },
  {
    key: 'my-course',
    label: '课程公式',
    symbols: [
      { label: '勾股定理', latex: 'a^2+b^2=c^2' },
      { label: '水的生成', latex: String.raw`\ce{2H2 + O2 -> 2H2O}` },
    ],
  },
]
```

`\frac{ }{ }` 中的空白花括号会在可视化编辑器里转换为可编辑占位；源码和导出仍使用 LaTeX 表达式。

### 7.3 合并与更新规则

1. 未传 `symbols`、传入 `undefined` 或 `[]` 时，使用内置分类。
2. 分类 `key` 不存在时，追加新分类；存在时合并公式列表，并用传入的 `label` 更新分类名称。
3. 同分类中按公式 `label` 合并。同名公式覆盖原公式，新名称追加到末尾；不同分类中的同名公式彼此独立。
4. 同一分类传入多个同名公式时，后一个生效。不同名称但 LaTeX 相同的公式仍会保留，不按数学等价关系自动去重。
5. 给已有分类传入 `symbols: []` 不会删除该分类的默认公式。这是扩展接口，目前不提供移除内置分类或公式的参数。
6. 配置变化会更新面板；不会自动替换已插入编辑区域的公式。移除扩展配置也不会删除编辑区内已有内容。

公式扩展不会修改调用方的原始配置或其他组件实例的默认列表。对于响应式配置，可以重新给 `ref` 赋值：

```ts
import { ref } from 'vue'
import type { SymbolCategory } from '@agilehub/latex-formula'

const symbols = ref<SymbolCategory[]>([])

function loadCourseFormulas() {
  symbols.value = [
    { key: 'course', label: '课程公式', symbols: [{ label: '质量能量关系', latex: 'E=mc^2' }] },
  ]
}

function resetToDefaults() {
  symbols.value = []
}
```

### 7.4 从 JSON 文件加载

创建 `src/formula-symbols.json`：

```json
[
  {
    "key": "my-formulas",
    "label": "我的公式",
    "symbols": [
      { "label": "分式示例", "latex": "\\frac{a+b}{c}" },
      { "label": "积分示例", "latex": "\\int_0^1 x^2\\,dx" },
      { "label": "化学反应", "latex": "\\ce{2H2 + O2 -> 2H2O}" }
    ]
  }
]
```

在同目录的页面中导入：

```vue
<template>
  <div style="height: 720px">
    <LatexFormula v-model="latex" :symbols="symbols" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LatexFormula, type SymbolCategory } from '@agilehub/latex-formula'
import formulaSymbols from './formula-symbols.json'

const latex = ref('')
const symbols: SymbolCategory[] = formulaSymbols
</script>
```

JSON 中的每个反斜杠必须写成 `\\`。如果 TypeScript 提示无法导入 JSON，请在项目配置中启用 `compilerOptions.resolveJsonModule`。

从接口加载时也应使用同样的数组结构，并在传给组件前检查 `key`、`label`、`symbols` 和 `latex` 的类型。TypeScript 类型不会自动验证服务器返回的 JSON。

扩展只增加模板数据，不安装新的 LaTeX 宏包。要在两种模式和导出中使用，公式需同时兼容 MathLive 和 MathJax。

## 8. 事件与导出数据

### 8.1 事件

| 事件 | 回调参数 | 触发时机 |
| --- | --- | --- |
| `update:modelValue` | `latex: string` | 用户编辑、插入、格式修改、清除、撤销/恢复，或调用 `renderFormula()` 载入内容时；使用 `v-model` 即可自动接收 |
| `render` | `result: LatexFormulaExport` | 点击“导出”或调用公开方法成功导出时 |

`render` **不是输入变化事件**，也不会在右侧实时预览更新时触发。需要随输入保存源码时，可监听绑定的 `latex`；需要图片时再导出。

### 8.2 导出结果

```ts
interface LatexFormulaExport {
  latex: string
  mathml: string
  base64: string
  blob: Blob
}
```

| 字段 | 含义 | 常见用法 |
| --- | --- | --- |
| `latex` | 本次导出的 LaTeX 源码 | 保存到数据库，用于下次继续编辑 |
| `mathml` | MathML 字符串 | 交给支持 MathML 的系统处理 |
| `base64` | 完整的 `data:image/png;base64,...` 字符串 | 直接绑定 `<img :src>` 或下载链接 |
| `blob` | MIME 类型为 `image/png` 的 PNG 二进制对象 | 直接放入 `FormData` 上传，或构造 `File` |

`base64` 已包含 data URL 前缀，不需要再次拼接。它是 PNG 图片，不是 SVG 字符串，也不是已经上传到服务器的图片地址。

### 8.3 在 onRender 中使用 PNG Blob

无需调用额外方法。点击“导出”后，`onRender(result)` 同时收到 `latex`、`mathml`、`base64` 和 `blob`；`exportFormula()`、`renderFormula()` 的 Promise 返回对象也包含这四个字段。

`blob` 与 `base64` 来自同一次 PNG 编码，图片内容完全一致。生成的图片为透明背景、固定 2 倍倍率，当前没有对外提供缩放参数。

例如，在页面的 `@render="onRender"` 回调中准备上传数据：

```ts
import type { LatexFormulaExport } from '@agilehub/latex-formula'

function onRender(result: LatexFormulaExport) {
  const formData = new FormData()
  formData.append('file', result.blob, 'formula.png')
  formData.append('latex', result.latex)
  // 将 formData 传给业务上传接口。
  // 使用 fetch 上传 FormData 时，不要手动设置 multipart/form-data 的 Content-Type。

  // 若上传组件需要 File，可直接使用 Blob 构造，无需解析 base64。
  const file = new File([result.blob], 'formula.png', { type: 'image/png' })
  console.log(file.name, file.size, file.type)
}
```

如果用 `URL.createObjectURL(result.blob)` 创建临时预览地址，在不再展示图片时（例如替换图片、组件卸载后）调用 `URL.revokeObjectURL(url)` 释放地址。对于简单预览，仍可直接使用 `result.base64`，无需管理临时地址。

`Blob` 不能作为普通 JSON 字段保存图片字节。上传文件使用 `FormData`；保存 JSON 时可选择 `latex`、`mathml`、`base64`。建议同时保存 `latex`，仅保存图片无法恢复可编辑的公式结构。

## 9. 通过组件 ref 调用方法

在 Vue 中给组件绑定 `ref`，挂载后可使用以下方法：

| 方法 | 参数 | 返回值 | 行为 |
| --- | --- | --- | --- |
| `exportFormula()` | 无 | `Promise<LatexFormulaExport>` | 导出当前绑定公式，不修改公式内容 |
| `renderFormula(latex)` | `latex: string` | `Promise<LatexFormulaExport>` | 发出模型更新并载入指定源码，再导出该公式 |

两个方法成功时都会触发 `render` 事件；不要同时在事件回调和 Promise 完成后重复执行同一份上传逻辑。

方法失败时 Promise 会拒绝，调用方需要 `try/catch`。内置按钮则会在组件中显示错误提示。`renderFormula()` 会先更新绑定值，再尝试导出；导出失败不会自动回滚源码。只读状态调用它会直接拒绝。

如果只是回填已保存的公式，直接设置 `latex.value = savedLatex` 即可，不必调用 `renderFormula()`。修改 `latex.value` 后需要立即导出时，应先 `await nextTick()`，让新的 prop 更新到组件。

不要并发调用导出方法；等待当前导出结束后再发起下一次。组件 ref 在挂载前为 `null`，不应在挂载前调用。

## 10. 完整配置示例

下面的页面同时演示三个扩展参数、只读切换、通过 ref 导出、载入示例公式、错误处理和图片下载。可以直接作为 Vue + TypeScript 项目的页面组件使用。

```vue
<template>
  <main>
    <div class="actions">
      <label><input v-model="readonly" type="checkbox" />只读模式</label>
      <button :disabled="busy || !editorRef" @click="exportCurrent">导出当前公式</button>
      <button :disabled="busy || readonly || !editorRef" @click="loadExample">载入并导出示例</button>
      <button @click="resetOptions">恢复默认配置</button>
    </div>

    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>

    <div class="editor-scroll">
      <div class="editor-container">
        <LatexFormula
          ref="editorRef"
          v-model="latex"
          placeholder="输入 LaTeX，例如 \frac{a}{b}"
          :readonly="readonly"
          :preset-colors="presetColors"
          :font-family-options="fontFamilyOptions"
          :symbols="symbols"
          @render="onRender"
        />
      </div>
    </div>

    <p>当前源码：</p>
    <pre>{{ latex }}</pre>

    <section v-if="result">
      <img :src="result.base64" alt="导出的公式" style="max-width: 100%" />
      <p><a :href="result.base64" download="formula.png">下载 PNG</a></p>
      <details>
        <summary>查看 MathML</summary>
        <pre>{{ result.mathml }}</pre>
      </details>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  LatexFormula,
  type LatexFormulaExport,
  type FontFamilyOption,
  type SymbolCategory,
} from '@agilehub/latex-formula'

const editorRef = ref<InstanceType<typeof LatexFormula> | null>(null)
const latex = ref(String.raw`\frac{a+b}{c}`)
const readonly = ref(false)
const busy = ref(false)
const errorMessage = ref('')
const result = ref<LatexFormulaExport | null>(null)

const presetColors = ref<string[] | undefined>(['#000000', '#0052d9', '#e34d59'])
const fontFamilyOptions = ref<FontFamilyOption[]>([
  {
    value: 'custom-bold-italic',
    content: '粗斜体',
    style: { variant: 'main', variantStyle: 'bolditalic' },
  },
  { value: 'mathbf', content: '加粗' },
])
const symbols = ref<SymbolCategory[]>([
  {
    key: 'Functions',
    label: '常用函数',
    symbols: [{ label: '自定义平方', latex: 'x^{2}' }],
  },
  {
    key: 'course',
    label: '课程公式',
    symbols: [
      { label: '质量能量关系', latex: 'E=mc^2' },
      { label: '课程分式', latex: String.raw`\frac{a+b}{c}` },
    ],
  },
])

function onRender(value: LatexFormulaExport) {
  // 内置“导出”按钮和下面两个 ref 方法均会触发此事件。
  result.value = value
  errorMessage.value = ''
}

async function runExport(nextLatex?: string) {
  const editor = editorRef.value
  if (!editor || busy.value) return
  busy.value = true
  errorMessage.value = ''
  try {
    if (nextLatex === undefined) {
      await editor.exportFormula()
    } else {
      await editor.renderFormula(nextLatex)
    }
    // 结果统一由 onRender 接收，不重复处理。
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '公式导出失败'
  } finally {
    busy.value = false
  }
}

function exportCurrent() {
  return runExport()
}

function loadExample() {
  return runExport(String.raw`\int_0^1 x^2\,dx=\frac{1}{3}`)
}

function resetOptions() {
  presetColors.value = undefined // 恢复默认色板；[] 表示无预设色块。
  fontFamilyOptions.value = []   // 移除字体扩展，保留默认字体。
  symbols.value = []             // 移除公式扩展，保留默认分类。
}
</script>

<style scoped>
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px; }
.editor-scroll { overflow-x: auto; }
.editor-container { min-width: 680px; height: 720px; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; }
[role='alert'] { color: #c0392b; }
</style>
```

JavaScript 项目可以移除 `lang="ts"`、`type` 导入及变量的类型注解，其余使用方式相同。

## 11. 常见问题与使用限制

### 为什么修改字体后看起来没有变化？

检查是否处于可视化模式，以及新增选项是否提供 `style`。选项名称 `content` 和标识 `value` 本身不会生成字体效果。部分数学字体只覆盖部分字符，可先用 `A+B` 测试，再验证业务公式。

### 为什么 JSON 中的公式显示异常？

先检查反斜杠是否正确转义。JavaScript 普通字符串和 JSON 中写 `"\\frac{a}{b}"`，`String.raw` 中写 `\frac{a}{b}`。也要检查 LaTeX 花括号是否配对、命令是否被当前渲染器支持。

### 为什么添加公式后出现重复分类？

分类按 `key` 合并，不按 `label` 合并。内置常用函数的 key 是 `Functions`，不是 `functions`。同分类内公式按 `label` 合并；要覆盖原公式，请使用它的原名称。

### 为什么传入空数组后默认字体、公式还在？

`fontFamilyOptions` 和 `symbols` 都是扩展参数，空数组代表不添加扩展。只有 `presetColors` 是替换式参数，空数组会清空色板预设。

### 为什么“导出”没有自动下载文件？

“导出”通过 `render` 事件把结果交给调用方。可以像示例一样展示下载链接，也可以打开组件“预览”弹窗后点击“下载”。

### 为什么可视化模式提示不支持语法？

源码预览/导出使用 MathJax，可视化编辑使用 MathLive，两者支持的语法并非完全相同。遇到不支持或不完整的源码时，可视化区域会提示切回源码模式，原始源码仍保留。扩展模板应检查编辑、预览和导出三个环节。

化学表达式可使用 `\ce{...}`，但这不等于支持任意有机化学结构绘图语法。新增模板不会让组件自动支持 `chemfig` 等其他排版系统的命令。

### 长公式和导出有哪些限制？

- MathJax 单次预览/导出支持的源码长度上限为 **5000 个字符**。输入区域并不自动截断超长内容。
- PNG 以 2 倍比例生成；取整后的图片任一边超过 `16,384px`，或面积超过 `32,000,000` 像素时会拒绝导出。可视化编辑区能滚动查看，不代表超大图片一定能导出。
- 空公式、超过长度上限、MathJax 返回错误节点、SVG 图像解码失败、Canvas 创建失败或 PNG 编码失败时，导出会拒绝并返回错误；只有完整导出成功才触发 `render`。正式保存前仍应检查预览。
- 公共导出结果包含 LaTeX、MathML、PNG data URL 和 PNG Blob，目前没有 SVG 文件、PDF 或 Word 导出接口。

### 为什么编辑器在小屏幕上超出容器？

当前组件有 `680px` 最小宽度和 `450px` 最小高度，顶部模板区还有最小高度约束。建议使用示例中的 `720px` 高度，并在较窄的父容器外添加 `overflow-x: auto`。父容器过矮会压缩底部编辑空间。

## 12. 本地开发与测试

以下命令用于开发本仓库；只安装 npm 包的调用方不需要执行。

```bash
pnpm install
pnpm dev
```

开发服务展示 `dev/` 下的 Playground，访问地址以终端输出为准。

构建及回归测试：

```bash
pnpm build
pnpm test:package
pnpm exec playwright install chromium
pnpm test:editor
pnpm test:png
```

- `pnpm build`：先运行 `vue-tsc -p tsconfig.build.json`，通过后构建 ESM、CommonJS 和类型声明到 `dist/`。
- `pnpm test:package`：检查包入口、公开类型、公式扩展合并与内置公式的 MathJax 排版。
- `pnpm test:editor`：启动本地测试服务，使用浏览器验证编辑、格式、Tab 导航、滚动、只读、自定义配置、预览和导出。
- `pnpm test:png`：验证 `render` 事件和 ref 方法中的 PNG Blob、图片内容、与 base64 的字节一致性、尺寸限制及失败后的资源释放。
- 浏览器测试使用构建产物，修改源码后应先重新执行 `pnpm build`。开发服务中的 `/smoke.html` 也使用构建产物。
- Playwright 浏览器只需在首次使用或更新后安装。如已有 Edge，可跳过安装 Chromium，改用下面的 PowerShell 命令。

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
pnpm test:editor
pnpm test:png
```

额外的字体兼容性检查：

```bash
node --test tests/font-compatibility.mjs
```

字体检查验证实际字形、源码往返、PNG 导出和样式恢复；同样支持 `PLAYWRIGHT_CHANNEL` 环境变量。

本包使用 Apache-2.0 许可证。
