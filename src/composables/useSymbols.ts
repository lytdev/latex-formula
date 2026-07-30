/**
 * 符号面板数据模块。
 *
 * 定义 8 个分类共 300+ 条 LaTeX 公式和符号的预置数据，
 * 涵盖大学数学（分析、代数、概率统计等）和化学。
 *
 * 数据分为两部分：
 *   1. 希腊字母 — 由数组自动生成（避免手写 34 条重复项）
 *   2. CATEGORIES — 手动维护的 8 个分类
 */
import { computed, type ComputedRef } from 'vue'
import type { SymbolItem } from '../types'

/** 符号分类 */
export interface SymbolCategory {
  /** 分类唯一标识（用于 Tab 切换） */
  key: string
  /** 分类中文名称 */
  label: string
  thumbnail?: string
  /** 该分类下的符号列表 */
  symbols: SymbolItem[]
}

const GREEK_LOWERCASE: [string, string][] = [
  ['α Alpha', 'alpha'], ['β Beta', 'beta'], ['γ Gamma', 'gamma'], ['δ Delta', 'delta'],
  ['ε Epsilon', 'epsilon'], ['ζ Zeta', 'zeta'], ['η Eta', 'eta'], ['θ Theta', 'theta'],
  ['ι Iota', 'iota'], ['κ Kappa', 'kappa'], ['λ Lambda', 'lambda'], ['μ Mu', 'mu'],
  ['ν Nu', 'nu'], ['ξ Xi', 'xi'], ['ο Omicron', 'omicron'], ['π Pi', 'pi'],
  ['ρ Rho', 'rho'], ['σ Sigma', 'sigma'], ['τ Tau', 'tau'], ['υ Upsilon', 'upsilon'],
  ['φ Phi', 'phi'], ['χ Chi', 'chi'], ['ψ Psi', 'psi'], ['ω Omega', 'omega'],
]

const GREEK_UPPERCASE: [string, string][] = [
  ['Γ Gamma', 'Gamma'], ['Δ Delta', 'Delta'], ['Θ Theta', 'Theta'],
  ['Λ Lambda', 'Lambda'], ['Ξ Xi', 'Xi'], ['Π Pi', 'Pi'],
  ['Σ Sigma', 'Sigma'], ['Φ Phi', 'Phi'], ['Ψ Psi', 'Psi'],
  ['Ω Omega', 'Omega'],
]

/** 由常量数组自动生成 34 个希腊字母符号（小写 24 + 大写 10） */
function greekSymbols(): SymbolItem[] {
  const lower: SymbolItem[] = GREEK_LOWERCASE.map(([label, name]) => ({
    label,
    latex: `\\${name} `,
  }))
  const upper: SymbolItem[] = GREEK_UPPERCASE.map(([label, name]) => ({
    label,
    latex: `\\${name} `,
  }))
  return [...lower, ...upper]
}

const CATEGORIES: SymbolCategory[] = [
  {
    key: 'functions',
    label: '常用函数',
    symbols: [
      // ── 分式/根式 ──
      { label: '分式', latex: '\\frac{ }{ }' },
      { label: '平方根', latex: '\\sqrt{ }' },
      { label: 'n次根', latex: '\\sqrt[n]{ }' },
      // ── 求和/求积/极限 ──
      { label: '求和 ', latex: '\\sum_{ }^{ }' },
      { label: '求积', latex: '\\prod_{ }^{ }' },
      { label: '极限', latex: '\\lim_{ \\to }' },
      { label: '上极限', latex: '\\limsup_{n \\to \\infty}' },
      { label: '下极限', latex: '\\liminf_{n \\to \\infty}' },
      { label: '上确界', latex: '\\sup_{ }' },
      { label: '下确界', latex: '\\inf_{ }' },
      { label: '最大值', latex: '\\max_{ }' },
      { label: '最小值', latex: '\\min_{ }' },
      // ── 积分 ──
      { label: '不定积分', latex: '\\int_{ }^{ }' },
      { label: '二重积分', latex: '\\iint_{ }^{ }' },
      { label: '三重积分', latex: '\\iiint_{ }^{ }' },
      { label: '环路积分 ', latex: '\\oint_{ }^{ }' },
      { label: '多重积分', latex: '\\idotsint ' },
      // ── 对数/指数 ──
      { label: '对数', latex: '\\log_{ }' },
      { label: '自然对数', latex: '\\ln ' },
      { label: '常用对数', latex: '\\lg ' },
      { label: '指数函数', latex: '\\exp( )' },
      // ── 三角函数 ──
      { label: '正弦', latex: '\\sin ' },
      { label: '余弦', latex: '\\cos ' },
      { label: '正切', latex: '\\tan ' },
      { label: '余切', latex: '\\cot ' },
      { label: '正割', latex: '\\sec ' },
      { label: '余割', latex: '\\csc ' },
      // ── 反三角函数 ──
      { label: '反正弦', latex: '\\arcsin ' },
      { label: '反余弦', latex: '\\arccos ' },
      { label: '反正切', latex: '\\arctan ' },
      // ── 双曲函数 ──
      { label: '双曲正弦', latex: '\\sinh ' },
      { label: '双曲余弦', latex: '\\cosh ' },
      { label: '双曲正切', latex: '\\tanh ' },
      // ── 取整/取余 ──
      { label: '向下取整', latex: '\\lfloor \\rfloor' },
      { label: '向上取整', latex: '\\lceil \\rceil' },
      { label: '取模', latex: '\\bmod ' },
      // ── 模(绝对值/范数) ──
      { label: '绝对值', latex: '\\lvert \\rvert' },
      { label: '范数', latex: '\\lVert \\rVert' },
      // ── 上标/下标 ──
      { label: '上标', latex: '^{ }' },
      { label: '下标', latex: '_{ }' },
      { label: '上下标', latex: '_{ }^{ }' },
      // ── 定界符 ──
      { label: '圆括号', latex: '\\left( \\right)' },
      { label: '方括号', latex: '\\left[ \\right]' },
      { label: '花括号', latex: '\\left\\{ \\right\\}' },
      { label: '尖括号', latex: '\\langle \\rangle' },
      { label: '分式', latex: '\\frac{ }{ }' },
      // ── 数学修饰 ──
      { label: '一阶导', latex: '\\dot{ }' },
      { label: '二阶导', latex: '\\ddot{ }' },
      { label: '帽子', latex: '\\hat{ } \\quad \\widehat{ }' },
      { label: '波浪', latex: '\\tilde{ }' },
      { label: '上划线', latex: '\\bar{ } \\quad \\overline{ }' },
      { label: '下划线', latex: '\\underline{ }' },
      { label: '向量', latex: '\\vec{ }' },
      { label: '导函数', latex: 'f^{\\prime}(x)' },
      // ── 分段函数 ──
      { label: '分段函数', latex: '\\begin{cases} \\\\ \\end{cases}' },
      // ── 组合/二项式 ──
      { label: '组合数', latex: '\\binom{ }{ }' },
      // ── 复数 ──
      { label: '实部', latex: '\\Re(z)' },
      { label: '虚部', latex: '\\Im(z)' },
      { label: '辐角', latex: '\\arg(z)' },
      // ── 期望/方差/概率 ──
      { label: '期望', latex: '\\mathbb{E}[ ]' },
      { label: '概率', latex: '\\mathbb{P}( )' },
      { label: '方差', latex: '\\operatorname{Var}( )' },
      { label: '协方差', latex: '\\operatorname{Cov}( , )' },
      // ── 特殊函数 ──
      { label: '狄拉克δ', latex: '\\delta( )' },
      { label: '阶跃函数', latex: 'H( )' },
      { label: 'Gamma函数', latex: '\\Gamma( )' },
      { label: '行列式', latex: '\\det( )' },
      { label: '迹', latex: '\\operatorname{tr}( )' },
      { label: '维数', latex: '\\dim ' },
      { label: '核', latex: '\\ker ' },
      { label: '度数', latex: '\\deg ' },
      { label: '最大公约', latex: '\\gcd( , )' },
      { label: '最小公倍', latex: '\\operatorname{lcm}( , )' }
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
      { label: '乘号 ×', latex: '\\times ' },
      { label: '除号 ÷', latex: '\\div ' },
      { label: '正负号 ±', latex: '\\pm ' },
      { label: '负正号 ∓', latex: '\\mp ' },
      { label: '点乘 ·', latex: '\\cdot ' },
      { label: '星号 ∗', latex: '\\ast ' },
      { label: '星形 ⋆', latex: '\\star ' },
      { label: '复合 ∘', latex: '\\circ ' },
      { label: '实心圆 •', latex: '\\bullet ' },
      { label: '直和 ⊕', latex: '\\oplus ' },
      { label: '直差 ⊖', latex: '\\ominus ' },
      { label: '直积 ⊗', latex: '\\otimes ' },
      { label: '直除 ⊘', latex: '\\oslash ' },
      { label: '直点 ⊙', latex: '\\odot ' },
      { label: '小于等于 ≤', latex: '\\leq ' },
      { label: '大于等于 ≥', latex: '\\geq ' },
      { label: '不等于 ≠', latex: '\\neq ' },
      { label: '约等于 ≈', latex: '\\approx ' },
      { label: '恒等于 ≡', latex: '\\equiv ' },
      { label: '相似 ∼', latex: '\\sim ' },
      { label: '正比于 ∝', latex: '\\propto ' },
      { label: '远小于 ≪', latex: '\\ll ' },
      { label: '远大于 ≫', latex: '\\gg ' },
    ],
  },
  {
    key: 'arrows',
    label: '箭头符号',
    symbols: [
      { label: '右箭头 →', latex: '\\rightarrow ' },
      { label: '左箭头 ←', latex: '\\leftarrow ' },
      { label: '双线右 ⇒', latex: '\\Rightarrow ' },
      { label: '双线左 ⇐', latex: '\\Leftarrow ' },
      { label: '双线左右 ⇔', latex: '\\Leftrightarrow ' },
      { label: '长右箭头 ⟶', latex: '\\longrightarrow ' },
      { label: '长左箭头 ⟵', latex: '\\longleftarrow ' },
      { label: '上箭头 ↑', latex: '\\uparrow ' },
      { label: '下箭头 ↓', latex: '\\downarrow ' },
      { label: '映射箭头 ↦', latex: '\\mapsto ' },
      { label: '可逆箭头 ⇌', latex: '\\rightleftharpoons ' },
    ],
  },
  {
    key: 'matrices',
    label: '矩阵模板',
    symbols: [
      {
        label: '无框矩阵 matrix',
        latex: '\\begin{matrix}\n & \\\\\n & \n\\end{matrix}',
      },
      {
        label: '圆括号矩阵 pmatrix',
        latex: '\\begin{pmatrix}\n & \\\\\n & \n\\end{pmatrix}',
      },
      {
        label: '方括号矩阵 bmatrix',
        latex: '\\begin{bmatrix}\n & \\\\\n & \n\\end{bmatrix}',
      },
      {
        label: '花括号矩阵 Bmatrix',
        latex: '\\begin{Bmatrix}\n & \\\\\n & \n\\end{Bmatrix}',
      },
      {
        label: '行列式 vmatrix',
        latex: '\\begin{vmatrix}\n & \\\\\n & \n\\end{vmatrix}',
      },
      {
        label: '范数矩阵 Vmatrix',
        latex: '\\begin{Vmatrix}\n & \\\\\n & \n\\end{Vmatrix}',
      },
      {
        label: '分段函数 cases',
        latex: '\\begin{cases}\n & \\\\\n & \n\\end{cases}',
      },
    ],
  },
  {
    key: 'symbols',
    label: '数学符号',
    symbols: [
      { label: '无穷 ∞', latex: '\\infty ' },
      { label: '偏导数 ∂', latex: '\\partial ' },
      { label: '梯度/旋度 ∇', latex: '\\nabla ' },
      { label: '任意/对所有 ∀', latex: '\\forall ' },
      { label: '存在 ∃', latex: '\\exists ' },
      { label: '空集 ∅', latex: '\\emptyset ' },
      { label: '属于 ∈', latex: '\\in ' },
      { label: '不属于 ∉', latex: '\\notin ' },
      { label: '子集 ⊂', latex: '\\subset ' },
      { label: '超集 ⊃', latex: '\\supset ' },
      { label: '子集或等于 ⊆', latex: '\\subseteq ' },
      { label: '超集或等于 ⊇', latex: '\\supseteq ' },
      { label: '并集 ∪', latex: '\\cup ' },
      { label: '交集 ∩', latex: '\\cap ' },
      { label: '差集 \\', latex: '\\setminus ' },
      { label: '角 ∠', latex: '\\angle ' },
      { label: '三角形 △', latex: '\\triangle ' },
      { label: '方形 □', latex: '\\square ' },
      { label: '垂直 ⊥', latex: '\\perp ' },
      { label: '平行 ∥', latex: '\\parallel ' },
    ],
  },
  {
    key: 'math-formulas',
    label: '常用公式',
    symbols: [
      // ── 极限 ──
      { label: '极限定义', latex: '\\lim_{x \\to a} f(x) = L' },
      { label: '无穷极限', latex: '\\lim_{x \\to \\infty} f(x)' },
      { label: '单侧极限', latex: '\\lim_{x \\to a^+} f(x)' },
      { label: '重要极限1', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
      { label: '重要极限2', latex: '\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e' },
      // ── 导数 ──
      { label: '导数定义', latex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}' },
      { label: '幂函数导数', latex: '\\frac{d}{dx} x^n = n x^{n-1}' },
      { label: '指数导数', latex: '\\frac{d}{dx} e^x = e^x' },
      { label: '对数导数', latex: '\\frac{d}{dx} \\ln x = \\frac{1}{x}' },
      { label: '三角函数导数', latex: '\\frac{d}{dx}\\sin x = \\cos x' },
      { label: '链式法则', latex: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}' },
      { label: '乘积法则', latex: '(fg)\' = f\'g + fg\'' },
      { label: '商法则', latex: '(\\frac{f}{g})\' = \\frac{f\'g - fg\'}{g^2}' },
      { label: '偏导数', latex: '\\frac{\\partial f}{\\partial x}' },
      { label: '梯度', latex: '\\nabla f = (\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y})' },
      { label: '拉普拉斯', latex: '\\nabla^2 f = \\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2}' },
      // ── 积分 ──
      { label: '不定积分', latex: '\\int f(x)\\,dx' },
      { label: '定积分', latex: '\\int_a^b f(x)\\,dx' },
      { label: '幂函数积分', latex: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C' },
      { label: '指数积分', latex: '\\int e^x\\,dx = e^x + C' },
      { label: '分部积分', latex: '\\int u\\,dv = uv - \\int v\\,du' },
      { label: '换元积分', latex: '\\int f(g(x))g\'(x)\\,dx = \\int f(u)\\,du' },
      { label: '二重积分', latex: '\\iint_D f(x,y)\\,dA' },
      { label: '三重积分', latex: '\\iiint_E f(x,y,z)\\,dV' },
      { label: '曲线积分', latex: '\\int_C \\mathbf{F} \\cdot d\\mathbf{r}' },
      { label: '曲面积分', latex: '\\iint_S \\mathbf{F} \\cdot d\\mathbf{S}' },
      { label: '围道积分', latex: '\\oint_C f(z)\\,dz' },
      // ── 级数 ──
      { label: '无穷级数', latex: '\\sum_{n=1}^{\\infty} a_n' },
      { label: '几何级数', latex: '\\sum_{n=0}^{\\infty} r^n = \\frac{1}{1-r}' },
      { label: 'p-级数', latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^p}' },
      { label: '泰勒展开', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n' },
      { label: '麦克劳林', latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n' },
      { label: 'e^x展开', latex: 'e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}' },
      { label: 'sin展开', latex: '\\sin x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}' },
      { label: 'cos展开', latex: '\\cos x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}' },
      { label: '傅里叶级数', latex: 'f(x) = a_0 + \\sum_{n=1}^{\\infty} (a_n\\cos nx + b_n\\sin nx)' },
      // ── 微分方程 ──
      { label: '一阶ODE', latex: '\\frac{dy}{dx} + P(x)y = Q(x)' },
      { label: '二阶ODE', latex: 'y\'\' + ay\' + by = 0' },
      { label: '特征方程', latex: 'r^2 + ar + b = 0' },
      { label: '波动方程', latex: '\\frac{\\partial^2 u}{\\partial t^2} = c^2\\frac{\\partial^2 u}{\\partial x^2}' },
      { label: '热方程', latex: '\\frac{\\partial u}{\\partial t} = \\alpha\\frac{\\partial^2 u}{\\partial x^2}' },
      { label: '拉普拉斯方程', latex: '\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} = 0' },
      // ── 线性代数 ──
      { label: '矩阵乘法', latex: 'AB = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} e \\\\ f \\end{bmatrix}' },
      { label: '行列式', latex: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad-bc' },
      { label: '特征值', latex: 'A\\mathbf{v} = \\lambda \\mathbf{v}' },
      { label: '特征方程', latex: '\\det(A - \\lambda I) = 0' },
      { label: '逆矩阵', latex: 'A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)' },
      { label: '迹', latex: '\\text{tr}(A) = \\sum_{i=1}^{n} a_{ii}' },
      { label: '转置', latex: 'A^T \\quad (A^T)_{ij} = A_{ji}' },
      { label: '施密特正交化', latex: '\\mathbf{u}_k = \\mathbf{v}_k - \\sum_{i=1}^{k-1} \\text{proj}_{\\mathbf{u}_i}(\\mathbf{v}_k)' },
      // ── 概率统计 ──
      { label: '期望', latex: 'E[X] = \\sum_{i} x_i p_i' },
      { label: '方差', latex: '\\text{Var}(X) = E[(X-\\mu)^2]' },
      { label: '正态分布', latex: 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}' },
      { label: '二项分布', latex: 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}' },
      { label: '泊松分布', latex: 'P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}' },
      { label: '贝叶斯公式', latex: 'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}' },
      { label: '协方差', latex: '\\text{Cov}(X,Y) = E[(X-\\mu_X)(Y-\\mu_Y)]' },
      { label: '相关系数', latex: '\\rho_{XY} = \\frac{\\text{Cov}(X,Y)}{\\sigma_X\\sigma_Y}' },
      { label: '中心极限', latex: '\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} N(0,1)' },
      // ── 三角函数 ──
      { label: '毕达哥拉斯恒等式', latex: '\\sin^2\\theta + \\cos^2\\theta = 1' },
      { label: '二倍角', latex: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta' },
      { label: '和差化积', latex: '\\sin A + \\sin B = 2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}' },
      { label: '欧拉公式', latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta' },
      { label: '正切/余切', latex: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}' },
      // ── 向量分析 ──
      { label: '点积', latex: '\\mathbf{a} \\cdot \\mathbf{b} = |a||b|\\cos\\theta' },
      { label: '叉积', latex: '\\mathbf{a} \\times \\mathbf{b} = |a||b|\\sin\\theta\\,\\mathbf{n}' },
      { label: '散度', latex: '\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}' },
      { label: '旋度', latex: '\\nabla \\times \\mathbf{F}' },
      { label: '格林定理', latex: '\\oint_C (L\\,dx + M\\,dy) = \\iint_D (\\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y})\\,dA' },
      { label: '斯托克斯定理', latex: '\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}' },
      { label: '散度定理', latex: '\\iint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E (\\nabla \\cdot \\mathbf{F})\\,dV' },
      // ── 复数 ──
      { label: '复数定义', latex: 'z = a + bi' },
      { label: '复共轭', latex: '\\overline{z} = a - bi' },
      { label: '模长', latex: '|z| = \\sqrt{a^2 + b^2}' },
      { label: '极坐标形式', latex: 'z = r(\\cos\\theta + i\\sin\\theta)' },
      { label: '棣莫弗公式', latex: '(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta' },
      // ── 其他常用 ──
      { label: '绝对值/范数', latex: '|x| = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}' },
      { label: '阶乘', latex: 'n! = n \\cdot (n-1) \\cdots 2 \\cdot 1' },
      { label: 'Gamma函数', latex: '\\Gamma(z) = \\int_0^{\\infty} t^{z-1} e^{-t}\\,dt' },
      { label: '二项式系数', latex: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}' },
      { label: '柯西-施瓦茨', latex: '|\\langle u,v \\rangle| \\le \\|u\\| \\|v\\|' },
      { label: '均值定理', latex: 'f\'(c) = \\frac{f(b)-f(a)}{b-a}' },
      { label: '洛必达法则', latex: '\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f\'(x)}{g\'(x)}' },
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

/**
 * 符号数据的组合式函数。
 * 返回一个响应式的 categories 数组，供 SymbolPanel 渲染。
 */
export function useSymbols(): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => CATEGORIES)
  return { categories }
}
