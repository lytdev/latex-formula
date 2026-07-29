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
      { label: 'Gram-Schmidt', latex: '\\mathbf{u}_k = \\mathbf{v}_k - \\sum_{i=1}^{k-1} \\text{proj}_{\\mathbf{u}_i}(\\mathbf{v}_k)' },
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

export function useSymbols(): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => CATEGORIES)
  return { categories }
}
