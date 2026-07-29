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
      { label: '\\ce{}', latex: '\\ce{ }' },
      { label: '\\ce{->}', latex: '\\ce{->}' },
      { label: '\\ce{<=>}', latex: '\\ce{<=>}' },
      { label: 'H₂O', latex: '\\ce{H2O}' },
      { label: 'CO₂', latex: '\\ce{CO2}' },
      { label: '同位素', latex: '\\ce{^{227}_{90}Th+}' },
      { label: '配离子', latex: '\\ce{[Fe(H2O)6]^2+}' },
      { label: '反应速率', latex: '\\ce{A ->[k] B}' },
      { label: '状态', latex: '\\ce{NaCl(aq)}' },
    ],
  },
]

export function useSymbols(): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => CATEGORIES)
  return { categories }
}
