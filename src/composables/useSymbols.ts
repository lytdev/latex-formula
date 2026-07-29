import { computed, type ComputedRef } from 'vue'
import type { SymbolItem } from '../types'

export interface SymbolCategory {
  key: string
  label: string
  symbols: SymbolItem[]
}

const GREEK_LOWERCASE = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi',
  'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
]

const GREEK_UPPERCASE = [
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
]

function greekSymbols(): SymbolItem[] {
  const lower: SymbolItem[] = GREEK_LOWERCASE.map((name) => ({
    label: `\\${name}`,
    latex: `\\${name} `,
  }))
  const upper: SymbolItem[] = GREEK_UPPERCASE.map((name) => ({
    label: `\\${name}`,
    latex: `\\${name} `,
  }))
  return [...lower, ...upper]
}

const CATEGORIES: SymbolCategory[] = [
  {
    key: 'functions',
    label: '常用函数',
    symbols: [
      { label: '\\frac', latex: '\\frac{ }{ }' },
      { label: '\\sqrt', latex: '\\sqrt{ }' },
      { label: '\\sqrt[n]', latex: '\\sqrt[n]{ }' },
      { label: '\\sum', latex: '\\sum_{ }^{ }' },
      { label: '\\int', latex: '\\int_{ }^{ }' },
      { label: '\\iint', latex: '\\iint_{ }^{ }' },
      { label: '\\oint', latex: '\\oint_{ }^{ }' },
      { label: '\\lim', latex: '\\lim_{ \\to }' },
      { label: '\\log', latex: '\\log_{ }' },
      { label: '\\ln', latex: '\\ln ' },
      { label: '\\sin', latex: '\\sin ' },
      { label: '\\cos', latex: '\\cos ' },
      { label: '\\tan', latex: '\\tan ' },
      { label: '\\arcsin', latex: '\\arcsin ' },
      { label: '\\arccos', latex: '\\arccos ' },
      { label: '\\arctan', latex: '\\arctan ' },
      { label: '\\max', latex: '\\max ' },
      { label: '\\min', latex: '\\min ' },
    ],
  },
  {
    key: 'greek',
    label: '希腊字母',
    symbols: greekSymbols(),
  },
  {
    key: 'operators',
    label: '运算符号',
    symbols: [
      { label: '\\times', latex: '\\times ' },
      { label: '\\div', latex: '\\div ' },
      { label: '\\pm', latex: '\\pm ' },
      { label: '\\mp', latex: '\\mp ' },
      { label: '\\cdot', latex: '\\cdot ' },
      { label: '\\ast', latex: '\\ast ' },
      { label: '\\star', latex: '\\star ' },
      { label: '\\circ', latex: '\\circ ' },
      { label: '\\bullet', latex: '\\bullet ' },
      { label: '\\oplus', latex: '\\oplus ' },
      { label: '\\ominus', latex: '\\ominus ' },
      { label: '\\otimes', latex: '\\otimes ' },
      { label: '\\oslash', latex: '\\oslash ' },
      { label: '\\odot', latex: '\\odot ' },
      { label: '\\leq', latex: '\\leq ' },
      { label: '\\geq', latex: '\\geq ' },
      { label: '\\neq', latex: '\\neq ' },
      { label: '\\approx', latex: '\\approx ' },
      { label: '\\equiv', latex: '\\equiv ' },
      { label: '\\sim', latex: '\\sim ' },
      { label: '\\propto', latex: '\\propto ' },
      { label: '\\ll', latex: '\\ll ' },
      { label: '\\gg', latex: '\\gg ' },
    ],
  },
  {
    key: 'arrows',
    label: '箭头符号',
    symbols: [
      { label: '\\rightarrow', latex: '\\rightarrow ' },
      { label: '\\leftarrow', latex: '\\leftarrow ' },
      { label: '\\Rightarrow', latex: '\\Rightarrow ' },
      { label: '\\Leftarrow', latex: '\\Leftarrow ' },
      { label: '\\Leftrightarrow', latex: '\\Leftrightarrow ' },
      { label: '\\longrightarrow', latex: '\\longrightarrow ' },
      { label: '\\longleftarrow', latex: '\\longleftarrow ' },
      { label: '\\uparrow', latex: '\\uparrow ' },
      { label: '\\downarrow', latex: '\\downarrow ' },
      { label: '\\mapsto', latex: '\\mapsto ' },
      { label: '\\rightleftharpoons', latex: '\\rightleftharpoons ' },
    ],
  },
  {
    key: 'matrices',
    label: '矩阵模板',
    symbols: [
      {
        label: 'matrix',
        latex: '\\begin{matrix}\n & \\\\\n & \n\\end{matrix}',
      },
      {
        label: 'pmatrix',
        latex: '\\begin{pmatrix}\n & \\\\\n & \n\\end{pmatrix}',
      },
      {
        label: 'bmatrix',
        latex: '\\begin{bmatrix}\n & \\\\\n & \n\\end{bmatrix}',
      },
      {
        label: 'Bmatrix',
        latex: '\\begin{Bmatrix}\n & \\\\\n & \n\\end{Bmatrix}',
      },
      {
        label: 'vmatrix',
        latex: '\\begin{vmatrix}\n & \\\\\n & \n\\end{vmatrix}',
      },
      {
        label: 'Vmatrix',
        latex: '\\begin{Vmatrix}\n & \\\\\n & \n\\end{Vmatrix}',
      },
      {
        label: 'cases',
        latex: '\\begin{cases}\n & \\\\\n & \n\\end{cases}',
      },
    ],
  },
  {
    key: 'symbols',
    label: '数学符号',
    symbols: [
      { label: '\\infty', latex: '\\infty ' },
      { label: '\\partial', latex: '\\partial ' },
      { label: '\\nabla', latex: '\\nabla ' },
      { label: '\\forall', latex: '\\forall ' },
      { label: '\\exists', latex: '\\exists ' },
      { label: '\\emptyset', latex: '\\emptyset ' },
      { label: '\\in', latex: '\\in ' },
      { label: '\\notin', latex: '\\notin ' },
      { label: '\\subset', latex: '\\subset ' },
      { label: '\\supset', latex: '\\supset ' },
      { label: '\\subseteq', latex: '\\subseteq ' },
      { label: '\\supseteq', latex: '\\supseteq ' },
      { label: '\\cup', latex: '\\cup ' },
      { label: '\\cap', latex: '\\cap ' },
      { label: '\\setminus', latex: '\\setminus ' },
      { label: '\\angle', latex: '\\angle ' },
      { label: '\\triangle', latex: '\\triangle ' },
      { label: '\\square', latex: '\\square ' },
      { label: '\\perp', latex: '\\perp ' },
      { label: '\\parallel', latex: '\\parallel ' },
    ],
  },
  {
    key: 'chemistry',
    label: '化学公式',
    symbols: [
      // ── 基本分子 ──
      { label: '水', latex: '\\ce{H2O}' },
      { label: 'CO₂', latex: '\\ce{CO2}' },
      { label: '硫酸', latex: '\\ce{H2SO4}' },
      { label: '硝酸', latex: '\\ce{HNO3}' },
      { label: '盐酸', latex: '\\ce{HCl}' },
      { label: '氢氧化钠', latex: '\\ce{NaOH}' },
      { label: '氨', latex: '\\ce{NH3}' },
      { label: '苯', latex: '\\ce{C6H6}' },
      // ── 化学反应 ──
      { label: '反应箭头', latex: '\\ce{A -> B}' },
      { label: '可逆反应', latex: '\\ce{A <=> B}' },
      { label: '加热条件', latex: '\\ce{A ->[\\Delta] B}' },
      { label: '催化剂', latex: '\\ce{A ->[cat.] B}' },
      { label: '上下标注', latex: '\\ce{A ->[上][下] B}' },
      { label: '气体沉淀', latex: '\\ce{A + B -> C ^ + D v}' },
      // ── 化学平衡 ──
      { label: '平衡常数', latex: 'K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}' },
      { label: '平衡', latex: '\\ce{2NO2 <=> N2O4}' },
      // ── 同位素/核化学 ──
      { label: '同位素', latex: '\\ce{^{235}_{92}U}' },
      { label: '核反应', latex: '\\ce{^{235}_{92}U + ^{1}_{0}n -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^{1}_{0}n}' },
      { label: 'α衰变', latex: '\\ce{^{238}_{92}U -> ^{234}_{90}Th + ^{4}_{2}He}' },
      { label: 'β衰变', latex: '\\ce{^{14}_{6}C -> ^{14}_{7}N + ^{0}_{-1}e}' },
      // ── 配位化合物 ──
      { label: '配离子', latex: '\\ce{[Fe(H2O)6]^2+}' },
      { label: '配合物', latex: '\\ce{[Cu(NH3)4]^2+}' },
      { label: 'EDTA', latex: '\\ce{[Fe(EDTA)]-}' },
      { label: '配合物命名', latex: '\\ce{K4[Fe(CN)6]}' },
      // ── 氧化还原/氧化态 ──
      { label: '离子电荷', latex: '\\ce{Fe^2+}' },
      { label: '氧化态上标', latex: '\\ce{Fe^{III}}' },
      { label: '氧化态下标', latex: '\\ce{Fe^{3+} + e- -> Fe^{2+}}' },
      { label: '氧化态详情', latex: '\\ce{2Mn^{VII}O4- + 5H2^{I}O2 -> 2Mn^{II}^2+ + 5^{0}O2 ^ + 8H2O}' },
      // ── 有机化学 ──
      { label: '苯环结构', latex: '\\ce{[:30]*6(-=-=-=)}' },
      { label: '环己烷', latex: '\\ce{[:30]*6(-----)}' },
      { label: '甲基', latex: '\\ce{CH3-}' },
      { label: '羧基', latex: '\\ce{-COOH}' },
      { label: '羟基', latex: '\\ce{-OH}' },
      { label: '氨基', latex: '\\ce{-NH2}' },
      { label: '醛基', latex: '\\ce{-CHO}' },
      { label: '酯基', latex: '\\ce{-COOR}' },
      { label: '乙醇', latex: '\\ce{CH3CH2OH}' },
      { label: '乙酸', latex: '\\ce{CH3COOH}' },
      // ── 酸碱化学 ──
      { label: 'pH值', latex: '\\text{pH} = -\\log[\\ce{H+}]' },
      { label: 'pOH值', latex: '\\text{pOH} = -\\log[\\ce{OH-}]' },
      { label: '水的离子积', latex: 'K_w = [\\ce{H+}][\\ce{OH-}] = 10^{-14}' },
      { label: 'Henderson公式', latex: '\\text{pH} = \\text{p}K_a + \\log\\frac{[\\ce{A-}]}{[\\ce{HA}]}' },
      { label: '缓冲', latex: '\\ce{HA + OH- -> A- + H2O}' },
      // ── 热力学 ──
      { label: '反应焓', latex: '\\Delta H' },
      { label: '吉布斯自由能', latex: '\\Delta G = \\Delta H - T\\Delta S' },
      { label: '标准状态', latex: '\\Delta G^{\\circ} = -RT\\ln K' },
      { label: '燃烧热', latex: '\\Delta_c H^{\\circ}' },
      { label: '生成热', latex: '\\Delta_f H^{\\circ}' },
      // ── 电化学 ──
      { label: '能斯特方程', latex: 'E = E^{\\circ} - \\frac{RT}{nF}\\ln Q' },
      { label: '标准电势', latex: '\\ce{Zn^2+ + 2e- -> Zn} \\quad E^{\\circ} = -0.76\\,\\text{V}' },
      { label: '原电池', latex: '\\ce{Zn | Zn^2+ || Cu^2+ | Cu}' },
      // ── 化学键 ──
      { label: 'σ键/π键', latex: '\\sigma\\text{-}\\pi\\text{-}\\text{bond}' },
      { label: 'Lewis结构', latex: '\\ce{:O=C=O:}' },
      // ── 聚合反应 ──
      { label: '聚合', latex: '\\ce{n CH2=CH2 ->[cat.] ~(CH2-CH2)_{n}~}' },
      // ── 立体化学 ──
      { label: '手性', latex: '\\ce{HOOC-^{*}CHCl-COOH}' },
      // ── 状态标注 ──
      { label: '状态(s)', latex: '\\ce{NaCl(s)}' },
      { label: '状态(aq)', latex: '\\ce{NaCl(aq)}' },
      { label: '状态(l)', latex: '\\ce{H2O(l)}' },
      { label: '状态(g)', latex: '\\ce{CO2(g)}' },
      { label: '沉淀↓', latex: '\\ce{Ag+ + Cl- -> AgCl v}' },
      { label: '气体↑', latex: '\\ce{Zn + 2HCl -> ZnCl2 + H2 ^}' },
    ],
  },
]

export function useSymbols(): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => CATEGORIES)
  return { categories }
}
