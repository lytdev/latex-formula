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
import { computed, type ComputedRef } from "vue";
import type { SymbolCategory, SymbolItem } from "../types";
export type { SymbolCategory } from "../types";

const GREEK_LOWERCASE: [string, string][] = [
  ["α Alpha", "alpha"],
  ["β Beta", "beta"],
  ["γ Gamma", "gamma"],
  ["δ Delta", "delta"],
  ["ε Epsilon", "epsilon"],
  ["ζ Zeta", "zeta"],
  ["η Eta", "eta"],
  ["θ Theta", "theta"],
  ["ι Iota", "iota"],
  ["κ Kappa", "kappa"],
  ["λ Lambda", "lambda"],
  ["μ Mu", "mu"],
  ["ν Nu", "nu"],
  ["ξ Xi", "xi"],
  ["ο Omicron", "omicron"],
  ["π Pi", "pi"],
  ["ρ Rho", "rho"],
  ["σ Sigma", "sigma"],
  ["τ Tau", "tau"],
  ["υ Upsilon", "upsilon"],
  ["φ Phi", "phi"],
  ["χ Chi", "chi"],
  ["ψ Psi", "psi"],
  ["ω Omega", "omega"],
];

const GREEK_UPPERCASE: [string, string][] = [
  ["Γ Gamma", "Gamma"],
  ["Δ Delta", "Delta"],
  ["Θ Theta", "Theta"],
  ["Λ Lambda", "Lambda"],
  ["Ξ Xi", "Xi"],
  ["Π Pi", "Pi"],
  ["Σ Sigma", "Sigma"],
  ["Φ Phi", "Phi"],
  ["Ψ Psi", "Psi"],
  ["Ω Omega", "Omega"],
];

/** 由常量数组自动生成 34 个希腊字母符号（小写 24 + 大写 10） */
function greekSymbols(): SymbolItem[] {
  const lower: SymbolItem[] = GREEK_LOWERCASE.map(([label, name]) => ({
    label,
    latex: `\\${name} `,
  }));
  const upper: SymbolItem[] = GREEK_UPPERCASE.map(([label, name]) => ({
    label,
    latex: `\\${name} `,
  }));
  return [...lower, ...upper];
}

const CATEGORIES: SymbolCategory[] = [
  {
    key: "Functions",
    label: "常用函数",
    symbols: [
      // ── 分式/根式 ──
      { label: "分式", latex: "\\frac{ }{ }" },
      { label: "平方根", latex: "\\sqrt{ }" },
      { label: "n次根", latex: "\\sqrt[n]{ }" },
      // ── 求和/求积/极限 ──
      { label: "求和 ", latex: "\\sum_{ }^{ }" },
      { label: "求积", latex: "\\prod_{ }^{ }" },
      { label: "极限", latex: "\\lim_{ \\to }" },
      { label: "上极限", latex: "\\limsup_{n \\to \\infty}" },
      { label: "下极限", latex: "\\liminf_{n \\to \\infty}" },
      { label: "上确界", latex: "\\sup_{ }" },
      { label: "下确界", latex: "\\inf_{ }" },
      { label: "最大值", latex: "\\max_{ }" },
      { label: "最小值", latex: "\\min_{ }" },
      // ── 积分 ──
      { label: "不定积分", latex: "\\int_{ }^{ }" },
      { label: "二重积分", latex: "\\iint_{ }^{ }" },
      { label: "三重积分", latex: "\\iiint_{ }^{ }" },
      { label: "环路积分 ", latex: "\\oint_{ }^{ }" },
      { label: "多重积分", latex: "\\idotsint " },
      // ── 对数/指数 ──
      { label: "对数", latex: "\\log_{ }" },
      { label: "自然对数", latex: "\\ln " },
      { label: "常用对数", latex: "\\lg " },
      { label: "指数函数", latex: "\\exp( )" },
      // ── 三角函数 ──
      { label: "正弦", latex: "\\sin " },
      { label: "余弦", latex: "\\cos " },
      { label: "正切", latex: "\\tan " },
      { label: "余切", latex: "\\cot " },
      { label: "正割", latex: "\\sec " },
      { label: "余割", latex: "\\csc " },
      // ── 反三角函数 ──
      { label: "反正弦", latex: "\\arcsin " },
      { label: "反余弦", latex: "\\arccos " },
      { label: "反正切", latex: "\\arctan " },
      // ── 双曲函数 ──
      { label: "双曲正弦", latex: "\\sinh " },
      { label: "双曲余弦", latex: "\\cosh " },
      { label: "双曲正切", latex: "\\tanh " },
      // ── 取整/取余 ──
      { label: "向下取整", latex: "\\lfloor \\rfloor" },
      { label: "向上取整", latex: "\\lceil \\rceil" },
      { label: "取模", latex: "\\bmod " },
      // ── 模(绝对值/范数) ──
      { label: "绝对值", latex: "\\lvert \\rvert" },
      { label: "范数", latex: "\\lVert \\rVert" },
      // ── 上标/下标 ──
      { label: "上标", latex: "^{ }" },
      { label: "下标", latex: "_{ }" },
      { label: "上下标", latex: "_{ }^{ }" },
      // ── 定界符 ──
      { label: "圆括号", latex: "\\left( \\right)" },
      { label: "方括号", latex: "\\left[ \\right]" },
      { label: "花括号", latex: "\\left\\{ \\right\\}" },
      { label: "尖括号", latex: "\\langle \\rangle" },
      { label: "分式", latex: "\\frac{ }{ }" },
      // ── 数学修饰 ──
      { label: "一阶导", latex: "\\dot{ }" },
      { label: "二阶导", latex: "\\ddot{ }" },
      { label: "帽子", latex: "\\hat{ } \\quad \\widehat{ }" },
      { label: "波浪", latex: "\\tilde{ }" },
      { label: "上划线", latex: "\\bar{ } \\quad \\overline{ }" },
      { label: "下划线", latex: "\\underline{ }" },
      { label: "向量", latex: "\\vec{ }" },
      { label: "导函数", latex: "f^{\\prime}(x)" },
      // ── 分段函数 ──
      { label: "分段函数", latex: "\\begin{cases} \\\\ \\end{cases}" },
      // ── 组合/二项式 ──
      { label: "组合数", latex: "\\binom{ }{ }" },
      // ── 复数 ──
      { label: "实部", latex: "\\Re(z)" },
      { label: "虚部", latex: "\\Im(z)" },
      { label: "辐角", latex: "\\arg(z)" },
      // ── 期望/方差/概率 ──
      { label: "期望", latex: "\\mathbb{E}[ ]" },
      { label: "概率", latex: "\\mathbb{P}( )" },
      { label: "方差", latex: "\\operatorname{Var}( )" },
      { label: "协方差", latex: "\\operatorname{Cov}( , )" },
      // ── 特殊函数 ──
      { label: "狄拉克δ", latex: "\\delta( )" },
      { label: "阶跃函数", latex: "H( )" },
      { label: "Gamma函数", latex: "\\Gamma( )" },
      { label: "行列式", latex: "\\det( )" },
      { label: "迹", latex: "\\operatorname{tr}( )" },
      { label: "维数", latex: "\\dim " },
      { label: "核", latex: "\\ker " },
      { label: "度数", latex: "\\deg " },
      { label: "最大公约", latex: "\\gcd( , )" },
      { label: "最小公倍", latex: "\\operatorname{lcm}( , )" },
      // ── 微分与极限模板 ──
      { label: "左极限", latex: String.raw`\lim_{x\to a^-}f(x)` },
      { label: "右极限", latex: String.raw`\lim_{x\to a^+}f(x)` },
      { label: "无穷远极限", latex: String.raw`\lim_{x\to\infty}f(x)` },
      { label: "普通导数", latex: String.raw`\frac{\mathrm{d}f}{\mathrm{d}x}` },
      {
        label: "二阶普通导数",
        latex: String.raw`\frac{\mathrm{d}^2f}{\mathrm{d}x^2}`,
      },
      {
        label: "n 阶导数",
        latex: String.raw`\frac{\mathrm{d}^nf}{\mathrm{d}x^n}`,
      },
      { label: "偏导数", latex: String.raw`\frac{\partial f}{\partial x}` },
      {
        label: "二阶偏导数",
        latex: String.raw`\frac{\partial^2f}{\partial x^2}`,
      },
      {
        label: "混合偏导数",
        latex: String.raw`\frac{\partial^2f}{\partial x\partial y}`,
      },
      {
        label: "全微分 二元",
        latex: String.raw`\mathrm{d}f=\frac{\partial f}{\partial x}\mathrm{d}x+\frac{\partial f}{\partial y}\mathrm{d}y`,
      },
      {
        label: "时间导数",
        latex: String.raw`\frac{\mathrm{d}\mathbf{r}}{\mathrm{d}t}`,
      },
      {
        label: "二阶时间导数",
        latex: String.raw`\frac{\mathrm{d}^2\mathbf{r}}{\mathrm{d}t^2}`,
      },
      // ── 定积分、曲线与曲面积分 ──
      { label: "定积分", latex: String.raw`\int_a^b f(x)\,\mathrm{d}x` },
      {
        label: "反常积分 半无限区间",
        latex: String.raw`\int_0^{\infty}f(x)\,\mathrm{d}x`,
      },
      {
        label: "反常积分 全实轴",
        latex: String.raw`\int_{-\infty}^{\infty}f(x)\,\mathrm{d}x`,
      },
      {
        label: "平面区域二重积分",
        latex: String.raw`\iint_D f(x,y)\,\mathrm{d}x\,\mathrm{d}y`,
      },
      {
        label: "空间区域三重积分",
        latex: String.raw`\iiint_V f(x,y,z)\,\mathrm{d}x\,\mathrm{d}y\,\mathrm{d}z`,
      },
      {
        label: "第一类曲线积分",
        latex: String.raw`\int_C f(x,y,z)\,\mathrm{d}s`,
      },
      {
        label: "第二类曲线积分 环流",
        latex: String.raw`\int_C\mathbf{F}\cdot\mathrm{d}\mathbf{r}`,
      },
      {
        label: "第一类曲面积分",
        latex: String.raw`\iint_S f(x,y,z)\,\mathrm{d}S`,
      },
      {
        label: "通量积分",
        latex: String.raw`\iint_S\mathbf{F}\cdot\mathbf{n}\,\mathrm{d}S`,
      },
      { label: "复变围道积分", latex: String.raw`\oint_C f(z)\,\mathrm{d}z` },
      // ── 向量分析与场算符 ──
      { label: "散度算符", latex: String.raw`\nabla\cdot\mathbf{F}` },
      { label: "旋度算符", latex: String.raw`\nabla\times\mathbf{F}` },
      { label: "拉普拉斯算符", latex: String.raw`\nabla^2 f` },
      {
        label: "方向导数 单位方向向量",
        latex: String.raw`D_{\mathbf{u}}f=\nabla f\cdot\mathbf{u},\quad\lVert\mathbf{u}\rVert=1`,
      },
      { label: "向量点积", latex: String.raw`\mathbf{a}\cdot\mathbf{b}` },
      { label: "向量叉积", latex: String.raw`\mathbf{a}\times\mathbf{b}` },
      {
        label: "标量三重积",
        latex: String.raw`\mathbf{a}\cdot(\mathbf{b}\times\mathbf{c})`,
      },
      // ── 级数与积分变换 ──
      { label: "无穷级数", latex: String.raw`\sum_{n=1}^{\infty}a_n` },
      { label: "幂级数", latex: String.raw`\sum_{n=0}^{\infty}a_n(x-x_0)^n` },
      {
        label: "泰勒级数模板",
        latex: String.raw`\sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(x-a)^n`,
      },
      {
        label: "傅里叶级数模板",
        latex: String.raw`\frac{a_0}{2}+\sum_{n=1}^{\infty}\left(a_n\cos(n\omega_0t)+b_n\sin(n\omega_0t)\right)`,
      },
      {
        label: "傅里叶变换 角频率约定",
        latex: String.raw`\hat{f}(\omega)=\int_{-\infty}^{\infty}f(t)e^{-i\omega t}\,\mathrm{d}t`,
      },
      {
        label: "傅里叶逆变换 角频率约定",
        latex: String.raw`f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\hat{f}(\omega)e^{i\omega t}\,\mathrm{d}\omega`,
      },
      {
        label: "拉普拉斯变换 单边",
        latex: String.raw`F(s)=\int_0^{\infty}f(t)e^{-st}\,\mathrm{d}t`,
      },
      // ── 常见函数与特殊函数记号 ──
      { label: "符号函数", latex: String.raw`\operatorname{sgn}(x)` },
      { label: "双曲余切", latex: String.raw`\coth x` },
      { label: "双曲正割", latex: String.raw`\operatorname{sech}(x)` },
      { label: "双曲余割", latex: String.raw`\operatorname{csch}(x)` },
      { label: "反双曲正弦", latex: String.raw`\operatorname{arsinh}(x)` },
      { label: "反双曲余弦", latex: String.raw`\operatorname{arcosh}(x)` },
      { label: "反双曲正切", latex: String.raw`\operatorname{artanh}(x)` },
      {
        label: "sinc 函数 非归一化",
        latex: String.raw`\operatorname{sinc}(x)=\begin{cases}\frac{\sin x}{x}&x\ne0\\1&x=0\end{cases}`,
      },
      { label: "Beta 函数", latex: String.raw`\mathrm{B}(x,y)` },
      { label: "误差函数", latex: String.raw`\operatorname{erf}(x)` },
      { label: "第一类贝塞尔函数", latex: String.raw`J_{\nu}(x)` },
      { label: "第二类贝塞尔函数", latex: String.raw`Y_{\nu}(x)` },
      { label: "勒让德多项式", latex: String.raw`P_n(x)` },
      { label: "连带勒让德函数", latex: String.raw`P_{\ell}^{m}(x)` },
      { label: "厄米多项式", latex: String.raw`H_n(x)` },
      { label: "拉盖尔多项式", latex: String.raw`L_n(x)` },
      { label: "球谐函数", latex: String.raw`Y_{\ell}^{m}(\theta,\varphi)` },
      // ── 概率统计与复变函数 ──
      { label: "条件概率", latex: String.raw`\mathbb{P}(A\mid B)` },
      { label: "条件期望", latex: String.raw`\mathbb{E}[X\mid Y]` },
      { label: "概率密度函数", latex: String.raw`f_X(x)` },
      { label: "累积分布函数", latex: String.raw`F_X(x)=\mathbb{P}(X\le x)` },
      {
        label: "特征函数 概率",
        latex: String.raw`\varphi_X(t)=\mathbb{E}[e^{itX}]`,
      },
      { label: "复共轭", latex: String.raw`\overline{z}` },
      {
        label: "复指数 欧拉公式",
        latex: String.raw`e^{i\theta}=\cos\theta+i\sin\theta`,
      },
      { label: "留数记号", latex: String.raw`\operatorname{Res}_{z=z_0}f(z)` },
      // ── 振动、波动、电磁学与量子算符 ──
      {
        label: "简谐振动函数",
        latex: String.raw`x(t)=A\cos(\omega t+\varphi)`,
      },
      {
        label: "指数衰减函数",
        latex: String.raw`A(t)=A_0e^{-\gamma t},\quad\gamma>0`,
      },
      {
        label: "简谐行波函数",
        latex: String.raw`y(x,t)=A\cos(kx-\omega t+\varphi)`,
      },
      {
        label: "复平面波",
        latex: String.raw`\psi(\mathbf{r},t)=A e^{i(\mathbf{k}\cdot\mathbf{r}-\omega t)}`,
      },
      {
        label: "电场与势函数",
        latex: String.raw`\mathbf{E}=-\nabla\phi-\frac{\partial\mathbf{A}}{\partial t}`,
      },
      {
        label: "磁场与矢势",
        latex: String.raw`\mathbf{B}=\nabla\times\mathbf{A}`,
      },
      { label: "态矢 ket", latex: String.raw`\left|\psi\right\rangle` },
      { label: "对偶态 bra", latex: String.raw`\left\langle\psi\right|` },
      {
        label: "量子态内积",
        latex: String.raw`\left\langle\phi\mid\psi\right\rangle`,
      },
      {
        label: "算符平均值 归一化态",
        latex: String.raw`\left\langle\psi\right|\hat{A}\left|\psi\right\rangle`,
      },
      {
        label: "对易子",
        latex: String.raw`[\hat{A},\hat{B}]=\hat{A}\hat{B}-\hat{B}\hat{A}`,
      },
      {
        label: "动量算符 位置表象",
        latex: String.raw`\hat{\mathbf{p}}=-i\hbar\nabla`,
      },
      {
        label: "概率密度 波函数",
        latex: String.raw`\rho(\mathbf{r},t)=|\psi(\mathbf{r},t)|^2`,
      },
    ],
  },
  {
    key: "Operators",
    label: "常用符号",
    symbols: [
      { label: "乘号 ×", latex: "\\times " },
      { label: "除号 ÷", latex: "\\div " },
      { label: "正负号 ±", latex: "\\pm " },
      { label: "负正号 ∓", latex: "\\mp " },
      { label: "点乘 ·", latex: "\\cdot " },
      { label: "星号 ∗", latex: "\\ast " },
      { label: "星形 ⋆", latex: "\\star " },
      { label: "复合 ∘", latex: "\\circ " },
      { label: "实心圆 •", latex: "\\bullet " },
      { label: "直和 ⊕", latex: "\\oplus " },
      { label: "直差 ⊖", latex: "\\ominus " },
      { label: "直积 ⊗", latex: "\\otimes " },
      { label: "直除 ⊘", latex: "\\oslash " },
      { label: "直点 ⊙", latex: "\\odot " },
      { label: "小于等于 ≤", latex: "\\leq " },
      { label: "大于等于 ≥", latex: "\\geq " },
      { label: "不等于 ≠", latex: "\\neq " },
      { label: "约等于 ≈", latex: "\\approx " },
      { label: "恒等于 ≡", latex: "\\equiv " },
      { label: "相似 ∼", latex: "\\sim " },
      { label: "正比于 ∝", latex: "\\propto " },
      { label: "远小于 ≪", latex: "\\ll " },
      { label: "远大于 ≫", latex: "\\gg " },
      { label: "右箭头 →", latex: "\\rightarrow " },
      { label: "左箭头 ←", latex: "\\leftarrow " },
      { label: "双线右 ⇒", latex: "\\Rightarrow " },
      { label: "双线左 ⇐", latex: "\\Leftarrow " },
      { label: "双线左右 ⇔", latex: "\\Leftrightarrow " },
      { label: "长右箭头 ⟶", latex: "\\longrightarrow " },
      { label: "长左箭头 ⟵", latex: "\\longleftarrow " },
      { label: "上箭头 ↑", latex: "\\uparrow " },
      { label: "下箭头 ↓", latex: "\\downarrow " },
      { label: "映射箭头 ↦", latex: "\\mapsto " },
      { label: "可逆箭头 ⇌", latex: "\\rightleftharpoons " },
      { label: "无穷 ∞", latex: "\\infty " },
      { label: "偏导数 ∂", latex: "\\partial " },
      { label: "梯度/旋度 ∇", latex: "\\nabla " },
      { label: "任意/对所有 ∀", latex: "\\forall " },
      { label: "存在 ∃", latex: "\\exists " },
      { label: "空集 ∅", latex: "\\emptyset " },
      { label: "属于 ∈", latex: "\\in " },
      { label: "不属于 ∉", latex: "\\notin " },
      { label: "子集 ⊂", latex: "\\subset " },
      { label: "超集 ⊃", latex: "\\supset " },
      { label: "子集或等于 ⊆", latex: "\\subseteq " },
      { label: "超集或等于 ⊇", latex: "\\supseteq " },
      { label: "并集 ∪", latex: "\\cup " },
      { label: "交集 ∩", latex: "\\cap " },
      { label: "差集 \\", latex: "\\setminus " },
      { label: "角 ∠", latex: "\\angle " },
      { label: "三角形 △", latex: "\\triangle " },
      { label: "方形 □", latex: "\\square " },
      { label: "垂直 ⊥", latex: "\\perp " },
      { label: "平行 ∥", latex: "\\parallel " },
    ].concat(greekSymbols()),
  },
  {
    key: "Matrices",
    label: "矩阵模板",
    symbols: [
      // 常用维数与向量
      {
        label: "二阶矩阵 2×2",
        latex: String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}`,
      },
      {
        label: "三阶矩阵 3×3",
        latex: String.raw`\begin{bmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{bmatrix}`,
      },
      {
        label: "四阶矩阵 4×4",
        latex: String.raw`\begin{bmatrix}a_{11}&a_{12}&a_{13}&a_{14}\\a_{21}&a_{22}&a_{23}&a_{24}\\a_{31}&a_{32}&a_{33}&a_{34}\\a_{41}&a_{42}&a_{43}&a_{44}\end{bmatrix}`,
      },
      {
        label: "一般矩阵 m×n",
        latex: String.raw`A=\begin{bmatrix}a_{11}&a_{12}&\cdots&a_{1n}\\a_{21}&a_{22}&\cdots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{m1}&a_{m2}&\cdots&a_{mn}\end{bmatrix}`,
      },
      {
        label: "行向量",
        latex: String.raw`\mathbf{x}=\begin{bmatrix}x_1&x_2&\cdots&x_n\end{bmatrix}`,
      },
      {
        label: "列向量",
        latex: String.raw`\mathbf{x}=\begin{bmatrix}x_1\\x_2\\\vdots\\x_n\end{bmatrix}`,
      },
      {
        label: "三维向量",
        latex: String.raw`\mathbf{r}=\begin{pmatrix}x\\y\\z\end{pmatrix}`,
      },
      // 线性代数常用结构
      {
        label: "单位矩阵",
        latex: String.raw`I_n=\begin{bmatrix}1&0&\cdots&0\\0&1&\cdots&0\\\vdots&\vdots&\ddots&\vdots\\0&0&\cdots&1\end{bmatrix}`,
      },
      {
        label: "零矩阵",
        latex: String.raw`O=\begin{bmatrix}0&0&0\\0&0&0\\0&0&0\end{bmatrix}`,
      },
      {
        label: "对角矩阵",
        latex: String.raw`D=\begin{bmatrix}d_1&0&\cdots&0\\0&d_2&\cdots&0\\\vdots&\vdots&\ddots&\vdots\\0&0&\cdots&d_n\end{bmatrix}`,
      },
      {
        label: "上三角矩阵",
        latex: String.raw`U=\begin{bmatrix}u_{11}&u_{12}&u_{13}\\0&u_{22}&u_{23}\\0&0&u_{33}\end{bmatrix}`,
      },
      {
        label: "下三角矩阵",
        latex: String.raw`L=\begin{bmatrix}l_{11}&0&0\\l_{21}&l_{22}&0\\l_{31}&l_{32}&l_{33}\end{bmatrix}`,
      },
      {
        label: "对称矩阵",
        latex: String.raw`A=\begin{bmatrix}a&b&c\\b&d&e\\c&e&f\end{bmatrix}`,
      },
      {
        label: "反对称矩阵",
        latex: String.raw`A=\begin{bmatrix}0&a&b\\-a&0&c\\-b&-c&0\end{bmatrix}`,
      },
      {
        label: "厄米矩阵",
        latex: String.raw`H=\begin{bmatrix}a&z\\\overline{z}&b\end{bmatrix},\quad a,b\in\mathbb{R}`,
      },
      {
        label: "三对角矩阵",
        latex: String.raw`T=\begin{bmatrix}a_1&b_1&0&0\\c_1&a_2&b_2&0\\0&c_2&a_3&b_3\\0&0&c_3&a_4\end{bmatrix}`,
      },
      {
        label: "分块矩阵",
        latex: String.raw`M=\begin{bmatrix}A&B\\C&D\end{bmatrix}`,
      },
      {
        label: "分块对角矩阵",
        latex: String.raw`M=\begin{bmatrix}A&0&0\\0&B&0\\0&0&C\end{bmatrix}`,
      },
      {
        label: "若尔当块",
        latex: String.raw`J=\begin{bmatrix}\lambda&1&0\\0&\lambda&1\\0&0&\lambda\end{bmatrix}`,
      },
      {
        label: "范德蒙德矩阵",
        latex: String.raw`V=\begin{bmatrix}1&x_1&x_1^2\\1&x_2&x_2^2\\1&x_3&x_3^2\end{bmatrix}`,
      },
      // 方程组、行列式与矩阵运算
      {
        label: "线性方程组矩阵形式",
        latex: String.raw`\begin{bmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{bmatrix}\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}=\begin{bmatrix}b_1\\b_2\\b_3\end{bmatrix}`,
      },
      {
        label: "增广矩阵",
        latex: String.raw`\left[\begin{array}{ccc|c}a_{11}&a_{12}&a_{13}&b_1\\a_{21}&a_{22}&a_{23}&b_2\\a_{31}&a_{32}&a_{33}&b_3\end{array}\right]`,
      },
      {
        label: "行阶梯矩阵",
        latex: String.raw`\begin{bmatrix}1&a&b&c\\0&1&d&e\\0&0&1&f\end{bmatrix}`,
      },
      {
        label: "二阶行列式展开",
        latex: String.raw`\begin{vmatrix}a&b\\c&d\end{vmatrix}=ad-bc`,
      },
      {
        label: "三阶行列式",
        latex: String.raw`\begin{vmatrix}a_{11}&a_{12}&a_{13}\\a_{21}&a_{22}&a_{23}\\a_{31}&a_{32}&a_{33}\end{vmatrix}`,
      },
      {
        label: "二阶逆矩阵",
        latex: String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix},\quad ad-bc\ne0`,
      },
      {
        label: "矩阵转置",
        latex: String.raw`\begin{bmatrix}a&b&c\\d&e&f\end{bmatrix}^{T}=\begin{bmatrix}a&d\\b&e\\c&f\end{bmatrix}`,
      },
      {
        label: "特征值方程",
        latex: String.raw`\det\begin{bmatrix}a_{11}-\lambda&a_{12}\\a_{21}&a_{22}-\lambda\end{bmatrix}=0`,
      },
      {
        label: "相似对角化",
        latex: String.raw`P^{-1}AP=\begin{bmatrix}\lambda_1&0&0\\0&\lambda_2&0\\0&0&\lambda_3\end{bmatrix}`,
      },
      {
        label: "二次型",
        latex: String.raw`Q=\begin{bmatrix}x&y\end{bmatrix}\begin{bmatrix}a&b\\b&c\end{bmatrix}\begin{bmatrix}x\\y\end{bmatrix}=ax^2+2bxy+cy^2`,
      },
      {
        label: "克罗内克积 分块形式",
        latex: String.raw`A\otimes B=\begin{bmatrix}a_{11}B&a_{12}B\\a_{21}B&a_{22}B\end{bmatrix}`,
      },
      // 多元微积分与概率统计
      {
        label: "雅可比矩阵 二元",
        latex: String.raw`J=\begin{bmatrix}\frac{\partial f}{\partial x}&\frac{\partial f}{\partial y}\\\frac{\partial g}{\partial x}&\frac{\partial g}{\partial y}\end{bmatrix}`,
      },
      {
        label: "海森矩阵 二元",
        latex: String.raw`H_f=\begin{bmatrix}\frac{\partial^2 f}{\partial x^2}&\frac{\partial^2 f}{\partial x\partial y}\\\frac{\partial^2 f}{\partial y\partial x}&\frac{\partial^2 f}{\partial y^2}\end{bmatrix}`,
      },
      {
        label: "协方差矩阵",
        latex: String.raw`\Sigma=\begin{bmatrix}\operatorname{Var}(X)&\operatorname{Cov}(X,Y)\\\operatorname{Cov}(Y,X)&\operatorname{Var}(Y)\end{bmatrix}`,
      },
      // 坐标变换、力学与量子力学
      {
        label: "平面旋转矩阵",
        latex: String.raw`R(\theta)=\begin{bmatrix}\cos\theta&-\sin\theta\\\sin\theta&\cos\theta\end{bmatrix}`,
      },
      {
        label: "绕 x 轴旋转矩阵",
        latex: String.raw`R_x(\theta)=\begin{bmatrix}1&0&0\\0&\cos\theta&-\sin\theta\\0&\sin\theta&\cos\theta\end{bmatrix}`,
      },
      {
        label: "绕 y 轴旋转矩阵",
        latex: String.raw`R_y(\theta)=\begin{bmatrix}\cos\theta&0&\sin\theta\\0&1&0\\-\sin\theta&0&\cos\theta\end{bmatrix}`,
      },
      {
        label: "绕 z 轴旋转矩阵",
        latex: String.raw`R_z(\theta)=\begin{bmatrix}\cos\theta&-\sin\theta&0\\\sin\theta&\cos\theta&0\\0&0&1\end{bmatrix}`,
      },
      {
        label: "叉乘反对称矩阵",
        latex: String.raw`[\mathbf{a}]_{\times}=\begin{bmatrix}0&-a_z&a_y\\a_z&0&-a_x\\-a_y&a_x&0\end{bmatrix}`,
      },
      {
        label: "惯性张量",
        latex: String.raw`\mathbf{I}=\begin{bmatrix}I_{xx}&I_{xy}&I_{xz}\\I_{yx}&I_{yy}&I_{yz}\\I_{zx}&I_{zy}&I_{zz}\end{bmatrix}`,
      },
      {
        label: "应力张量",
        latex: String.raw`\boldsymbol{\sigma}=\begin{bmatrix}\sigma_{xx}&\sigma_{xy}&\sigma_{xz}\\\sigma_{yx}&\sigma_{yy}&\sigma_{yz}\\\sigma_{zx}&\sigma_{zy}&\sigma_{zz}\end{bmatrix}`,
      },
      {
        label: "泡利矩阵 σx",
        latex: String.raw`\sigma_x=\begin{pmatrix}0&1\\1&0\end{pmatrix}`,
      },
      {
        label: "泡利矩阵 σy",
        latex: String.raw`\sigma_y=\begin{pmatrix}0&-i\\i&0\end{pmatrix}`,
      },
      {
        label: "泡利矩阵 σz",
        latex: String.raw`\sigma_z=\begin{pmatrix}1&0\\0&-1\end{pmatrix}`,
      },
      {
        label: "二分量量子态",
        latex: String.raw`\psi=\begin{pmatrix}\alpha\\\beta\end{pmatrix},\quad |\alpha|^2+|\beta|^2=1`,
      },
      // 保留空白模板，便于自定义填写。
      {
        label: "无框矩阵 matrix",
        latex: "\\begin{matrix}\n & \\\\\n & \n\\end{matrix}",
      },
      {
        label: "圆括号矩阵 pmatrix",
        latex: "\\begin{pmatrix}\n & \\\\\n & \n\\end{pmatrix}",
      },
      {
        label: "方括号矩阵 bmatrix",
        latex: "\\begin{bmatrix}\n & \\\\\n & \n\\end{bmatrix}",
      },
      {
        label: "花括号矩阵 Bmatrix",
        latex: "\\begin{Bmatrix}\n & \\\\\n & \n\\end{Bmatrix}",
      },
      {
        label: "行列式 vmatrix",
        latex: "\\begin{vmatrix}\n & \\\\\n & \n\\end{vmatrix}",
      },
      {
        label: "范数矩阵 Vmatrix",
        latex: "\\begin{Vmatrix}\n & \\\\\n & \n\\end{Vmatrix}",
      },
      {
        label: "数乘",
        latex: String.raw`kA = \begin{pmatrix} ka_{11} & ka_{12} & \cdots & ka_{1n} \\ ka_{21} & ka_{22} & \cdots & ka_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ ka_{m1} & ka_{m2} & \cdots & ka_{mn} \end{pmatrix}`,
      },
      {
        label: "mmm 行 nnn 列矩阵",
        latex: String.raw`A = \begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{m1} & a_{m2} & \cdots & a_{mn} \end{pmatrix}`,
      },
      {
        label: "对角矩阵",
        latex: String.raw`D = \begin{pmatrix} d_1 & 0 & \cdots & 0 \\ 0 & d_2 & \cdots & 0 \\ \vdots & \vdots & \ddots & \vdots \\ 0 & 0 & \cdots & d_n \end{pmatrix}`,
      },
      {
        label: "矩阵转置",
        latex: String.raw`A^T = \begin{pmatrix} a_{11} & a_{21} & \cdots & a_{m1} \\ a_{12} & a_{22} & \cdots & a_{m2} \\ \vdots & \vdots & \ddots & \vdots \\ a_{1n} & a_{2n} & \cdots & a_{mn} \end{pmatrix}`,
      },
      {
        label: "零阵",
        latex: String.raw`O = \begin{pmatrix} 0 & 0 & \cdots & 0 \\ 0 & 0 & \cdots & 0 \\ \vdots & \vdots & \ddots & \vdots \\ 0 & 0 & \cdots & 0 \end{pmatrix}`,
      },
      {
        label: "nnn 阶方阵",
        latex: String.raw`A = \begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{n1} & a_{n2} & \cdots & a_{nn} \end{pmatrix}`,
      },
    ],
  },
  {
    key: "math-formulas",
    label: "常用公式",
    symbols: [
      // ── 极限 ──
      { label: "极限定义", latex: "\\lim_{x \\to a} f(x) = L" },
      { label: "无穷极限", latex: "\\lim_{x \\to \\infty} f(x)" },
      { label: "单侧极限", latex: "\\lim_{x \\to a^+} f(x)" },
      { label: "重要极限1", latex: "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1" },
      {
        label: "重要极限2",
        latex: "\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e",
      },
      // ── 导数 ──
      {
        label: "导数定义",
        latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}",
      },
      { label: "幂函数导数", latex: "\\frac{d}{dx} x^n = n x^{n-1}" },
      { label: "指数导数", latex: "\\frac{d}{dx} e^x = e^x" },
      { label: "对数导数", latex: "\\frac{d}{dx} \\ln x = \\frac{1}{x}" },
      { label: "三角函数导数", latex: "\\frac{d}{dx}\\sin x = \\cos x" },
      {
        label: "链式法则",
        latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}",
      },
      { label: "乘积法则", latex: "(fg)' = f'g + fg'" },
      { label: "商法则", latex: "(\\frac{f}{g})' = \\frac{f'g - fg'}{g^2}" },
      { label: "偏导数", latex: "\\frac{\\partial f}{\\partial x}" },
      {
        label: "梯度",
        latex:
          "\\nabla f = (\\frac{\\partial f}{\\partial x}, \\frac{\\partial f}{\\partial y})",
      },
      {
        label: "拉普拉斯",
        latex:
          "\\nabla^2 f = \\frac{\\partial^2 f}{\\partial x^2} + \\frac{\\partial^2 f}{\\partial y^2}",
      },
      // ── 积分 ──
      { label: "不定积分", latex: "\\int f(x)\\,dx" },
      { label: "定积分", latex: "\\int_a^b f(x)\\,dx" },
      {
        label: "幂函数积分",
        latex: "\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C",
      },
      { label: "指数积分", latex: "\\int e^x\\,dx = e^x + C" },
      { label: "分部积分", latex: "\\int u\\,dv = uv - \\int v\\,du" },
      { label: "换元积分", latex: "\\int f(g(x))g'(x)\\,dx = \\int f(u)\\,du" },
      { label: "二重积分", latex: "\\iint_D f(x,y)\\,dA" },
      { label: "三重积分", latex: "\\iiint_E f(x,y,z)\\,dV" },
      { label: "曲线积分", latex: "\\int_C \\mathbf{F} \\cdot d\\mathbf{r}" },
      { label: "曲面积分", latex: "\\iint_S \\mathbf{F} \\cdot d\\mathbf{S}" },
      { label: "围道积分", latex: "\\oint_C f(z)\\,dz" },
      // ── 级数 ──
      { label: "无穷级数", latex: "\\sum_{n=1}^{\\infty} a_n" },
      {
        label: "几何级数",
        latex: "\\sum_{n=0}^{\\infty} r^n = \\frac{1}{1-r}",
      },
      { label: "p-级数", latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^p}" },
      {
        label: "泰勒展开",
        latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n",
      },
      {
        label: "麦克劳林",
        latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!}x^n",
      },
      {
        label: "e^x展开",
        latex: "e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
      },
      {
        label: "正态分布密度",
        latex: String.raw`f(x)=\frac{1}{\sigma\sqrt{2\pi}}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right),\quad\sigma>0`,
      },
      {
        label: "sin展开",
        latex:
          "\\sin x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}",
      },
      {
        label: "cos展开",
        latex: "\\cos x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}",
      },
      {
        label: "傅里叶级数",
        latex: "f(x) = a_0 + \\sum_{n=1}^{\\infty} (a_n\\cos nx + b_n\\sin nx)",
      },
      // ── 微分方程 ──
      { label: "一阶ODE", latex: "\\frac{dy}{dx} + P(x)y = Q(x)" },
      { label: "二阶ODE", latex: "y'' + ay' + by = 0" },
      { label: "常系数微分方程的特征方程", latex: "r^2 + ar + b = 0" },
      {
        label: "波动方程",
        latex:
          "\\frac{\\partial^2 u}{\\partial t^2} = c^2\\frac{\\partial^2 u}{\\partial x^2}",
      },
      {
        label: "热方程",
        latex:
          "\\frac{\\partial u}{\\partial t} = \\alpha\\frac{\\partial^2 u}{\\partial x^2}",
      },
      {
        label: "拉普拉斯方程",
        latex:
          "\\frac{\\partial^2 u}{\\partial x^2} + \\frac{\\partial^2 u}{\\partial y^2} = 0",
      },
      // ── 线性代数 ──
      {
        label: "矩阵乘法",
        latex:
          "AB = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} e \\\\ f \\end{bmatrix}",
      },
      {
        label: "行列式",
        latex:
          "\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad-bc",
      },
      { label: "特征值", latex: "A\\mathbf{v} = \\lambda \\mathbf{v}" },
      { label: "矩阵特征方程", latex: "\\det(A - \\lambda I) = 0" },
      { label: "逆矩阵", latex: "A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)" },
      { label: "迹", latex: "\\text{tr}(A) = \\sum_{i=1}^{n} a_{ii}" },
      { label: "转置", latex: "A^T \\quad (A^T)_{ij} = A_{ji}" },
      {
        label: "施密特正交化",
        latex:
          "\\mathbf{u}_k = \\mathbf{v}_k - \\sum_{i=1}^{k-1} \\text{proj}_{\\mathbf{u}_i}(\\mathbf{v}_k)",
      },
      // ── 概率统计 ──
      { label: "期望", latex: "E[X] = \\sum_{i} x_i P(X=x_i)" },
      { label: "方差", latex: "\\operatorname{Var}(X) = E[(X-E[X])^2] = E[X^2]-(E[X])^2" },
      {
        label: "正态分布",
        latex:
          "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}",
      },
      { label: "二项分布", latex: "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}" },
      {
        label: "卷积积分",
        latex: String.raw`(f*g)(t)=\int_{-\infty}^{\infty}f(\tau)g(t-\tau)\,\mathrm{d}\tau`,
      },
      {
        label: "泊松分布",
        latex: "P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}",
      },
      { label: "贝叶斯公式", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}" },
      { label: "协方差", latex: "\\text{Cov}(X,Y) = E[(X-\\mu_X)(Y-\\mu_Y)]" },
      {
        label: "相关系数",
        latex: "\\rho_{XY} = \\frac{\\text{Cov}(X,Y)}{\\sigma_X\\sigma_Y}",
      },
      {
        label: "中心极限",
        latex:
          "\\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\xrightarrow{d} N(0,1)",
      },
      // ── 三角函数 ──
      {
        label: "毕达哥拉斯恒等式",
        latex: "\\sin^2\\theta + \\cos^2\\theta = 1",
      },
      { label: "二倍角", latex: "\\sin 2\\theta = 2\\sin\\theta\\cos\\theta" },
      {
        label: "和差化积",
        latex: "\\sin A + \\sin B = 2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}",
      },
      {
        label: "欧拉公式",
        latex: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta",
      },
      {
        label: "正切/余切",
        latex: "\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}",
      },
      // ── 向量分析 ──
      {
        label: "点积",
        latex: "\\mathbf{a} \\cdot \\mathbf{b} = |a||b|\\cos\\theta",
      },
      {
        label: "叉积",
        latex:
          "\\mathbf{a} \\times \\mathbf{b} = |a||b|\\sin\\theta\\,\\mathbf{n}",
      },
      {
        label: "散度",
        latex:
          "\\nabla \\cdot \\mathbf{F} = \\frac{\\partial F_x}{\\partial x} + \\frac{\\partial F_y}{\\partial y} + \\frac{\\partial F_z}{\\partial z}",
      },
      { label: "旋度", latex: "\\nabla \\times \\mathbf{F}" },
      {
        label: "格林定理",
        latex:
          "\\oint_C (L\\,dx + M\\,dy) = \\iint_D (\\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y})\\,dA",
      },
      {
        label: "斯托克斯定理",
        latex:
          "\\oint_C \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_S (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}",
      },
      {
        label: "散度定理",
        latex:
          "\\iint_S \\mathbf{F} \\cdot d\\mathbf{S} = \\iiint_E (\\nabla \\cdot \\mathbf{F})\\,dV",
      },
      // ── 复数 ──
      { label: "复数定义", latex: "z = a + bi" },
      { label: "复共轭", latex: "\\overline{z} = a - bi" },
      { label: "模长", latex: "|z| = \\sqrt{a^2 + b^2}" },
      { label: "极坐标形式", latex: "z = r(\\cos\\theta + i\\sin\\theta)" },
      {
        label: "棣莫弗公式",
        latex:
          "(\\cos\\theta + i\\sin\\theta)^n = \\cos n\\theta + i\\sin n\\theta",
      },
      // ── 其他常用 ──
      {
        label: "绝对值/范数",
        latex: "|x| = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}",
      },
      { label: "阶乘", latex: "n! = n \\cdot (n-1) \\cdots 2 \\cdot 1" },
      {
        label: "Gamma函数",
        latex: "\\Gamma(z) = \\int_0^{\\infty} t^{z-1} e^{-t}\\,dt",
      },
      { label: "二项式系数", latex: "\\binom{n}{k} = \\frac{n!}{k!(n-k)!}" },
      {
        label: "柯西-施瓦茨",
        latex: "|\\langle u,v \\rangle| \\le \\|u\\| \\|v\\|",
      },
      { label: "均值定理", latex: "f'(c) = \\frac{f(b)-f(a)}{b-a}" },
      {
        label: "洛必达法则",
        latex:
          "\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}",
      },
      {
        label: "二项式展开",
        latex: String.raw`(x+y)^n = \sum_{k=0}^{n} C(n,k) x^k y^{n-k}`,
      },
      {
        label: "几何级数求和",
        latex: String.raw`S_n = a + ar + ar^2 + ar^3 + \ldots + ar^{n-1}`,
      },
      {
        label: "幂级数（一般形式）",
        latex: String.raw`f(x) = \sum_{n=0}^{\infty} a_n (x - c)^n`,
      },
      {
        label: "三角级数 - 简谐振动",
        latex: String.raw`y(t) = A \cos(\omega t + \phi)`,
      },
      {
        label: "三角级数、三角函数的正交性",
        latex: String.raw`\int_{0}^{2\pi} \sin(nx) \sin(mx) \, dx = 0 \, , (n \neq m)`,
      },
      {
        label: "收敛性判别（简单条件）",
        latex: String.raw`\text{如果} \lim_{n \to \infty} a_n = 0, \text{则可能收敛}`,
      },
      {
        label: "正弦、余弦级数，傅里叶级数的复数形式",
        latex: String.raw`f(t) = \sum_{n=-\infty}^{\infty} c_n e^{i n \omega t}`,
      },
      {
        label: "定积分的线性性质",
        latex: String.raw`\int_{a}^{b} (f(x) + g(x)) \, dx = \int_{a}^{b} f(x) \, dx + \int_{a}^{b} g(x) \, dx`,
      },
      {
        label: "常数的定积分",
        latex: String.raw`\int_{a}^{b} k \, dx = k(b-a)`,
      },
      {
        label: "多项式",
        latex: String.raw`P(x) = a_n x^n + a_{n-1} x^{n-1} + \ldots + a_1 x + a_0`,
      },
      {
        label: "复数乘法",
        latex: String.raw`z_1 z_2 = r_1 r_2 \left(\cos(\theta_1 + \theta_2) + i \sin(\theta_1 + \theta_2)\right)`,
      },
      {
        label: "伯努利方程",
        latex: String.raw`\frac{dy}{dx} + P(x)y = Q(x)y^n`,
      },
      {
        label: "不定积分的线性性质",
        latex: String.raw`\int (f(x) + g(x)) \, dx = \int f(x) \, dx + \int g(x) \, dx`,
      },
      {
        label: "詹森不等式",
        latex: String.raw`f\left( \frac{x_1 + x_2 + \cdots + x_n}{n} \right) \leq \frac{f(x_1) + f(x_2) + \cdots + f(x_n)}{n}`,
      },
      {
        label: "柯西不等式",
        latex: String.raw`\left( \sum_{i=1}^{n} a_i b_i \right)^2 \leq \left( \sum_{i=1}^{n} a_i^2 \right) \left( \sum_{i=1}^{n} b_i^2 \right)`,
      },
      {
        label: "贝叶斯公式（全概率展开）",
        latex: String.raw`P(B_i \mid A) = \frac{P(A \mid B_i) P(B_i)}{\sum_{j=1}^{n} P(A \mid B_j) P(B_j)}`,
      },
      {
        label: "超几何概率分布",
        latex: String.raw`P(X = k) = \frac{C(K, k)C(N-K, n-k)}{C(N, n)}`,
      },
      {
        label: "独立事件的乘法公式",
        latex: String.raw`P(A \cap B) = P(A) \cdot P(B)`,
      },
      { label: "对立事件的概率", latex: String.raw`P(A^c) = 1 - P(A)` },
      {
        label: "多个事件的乘法公式",
        latex: String.raw`P(A_1 \cap A_2 \cap \cdots \cap A_n) = P(A_1) \cdot P(A_2 \mid A_1) \cdots P(A_n \mid A_1 \cap A_2 \cap \cdots \cap A_{n-1})`,
      },
      {
        label: "概率的乘法公式",
        latex: String.raw`P(A \cap B) = P(A) \cdot P(B \mid A)`,
      },
      { label: "概率的规范性", latex: String.raw`P(\Omega) = 1` },
      { label: "概率的有界性", latex: String.raw`0 \leq P(A) \leq 1` },
      {
        label: "概率与频率的关系",
        latex: String.raw`P(A) \approx \frac{N(A)}{N}`,
      },
      { label: "古典概型", latex: String.raw`P(A) = \frac{m(A)}{m(S)}` },
      {
        label: "加法公式（互斥）",
        latex: String.raw`P(A \cup B) = P(A) + P(B), \quad \text{若 } A \cap B = \emptyset`,
      },
      {
        label: "加法公式（一般）",
        latex: String.raw`P(A \cup B) = P(A) + P(B) - P(A \cap B)`,
      },
      { label: "空集的概率", latex: String.raw`P(\emptyset) = 0` },
      { label: "频率的定义", latex: String.raw`f = \frac{n}{N}` },
      {
        label: "全概率公式",
        latex: String.raw`P(A) = \sum_{i=1}^{n} P(A \mid B_i) P(B_i)`,
      },
      {
        label: "三事件互相独立",
        latex: String.raw`P(A \cap B \cap C) = P(A)P(B)P(C)`,
      },
      {
        label: "条件概率公式",
        latex: String.raw`P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \quad P(B) > 0`,
      },
      {
        label: "二重积分中值定理",
        latex: String.raw`\iint_R f(x,y) \, dx \, dy = f(\xi, \eta) \cdot \text{Area}(R)`,
      },
      {
        label: "牛顿-莱布尼茨公式",
        latex: String.raw`\int_a^b f'(x) \, dx = f(b) - f(a)`,
      },
    ],
  },
  {
    key: "Chemistry",
    label: "化学公式",
    symbols: [
      // ── 基本分子 ──
      { label: "水", latex: "\\ce{H2O}" },
      { label: "CO₂", latex: "\\ce{CO2}" },
      { label: "硫酸", latex: "\\ce{H2SO4}" },
      { label: "硝酸", latex: "\\ce{HNO3}" },
      { label: "盐酸", latex: "\\ce{HCl}" },
      { label: "氢氧化钠", latex: "\\ce{NaOH}" },
      { label: "氨", latex: "\\ce{NH3}" },
      { label: "苯", latex: "\\ce{C6H6}" },
      // ── 化学反应 ──
      { label: "反应箭头", latex: "\\ce{A -> B}" },
      { label: "可逆反应", latex: "\\ce{A <=> B}" },
      { label: "加热条件", latex: "\\ce{A ->[\\Delta] B}" },
      { label: "催化剂", latex: "\\ce{A ->[cat.] B}" },
      { label: "上下标注", latex: "\\ce{A ->[上][下] B}" },
      { label: "气体沉淀", latex: "\\ce{A + B -> C ^ + D v}" },
      // ── 化学平衡 ──
      { label: "平衡常数", latex: "K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}" },
      { label: "平衡", latex: "\\ce{2NO2 <=> N2O4}" },
      // ── 同位素/核化学 ──
      { label: "同位素", latex: "\\ce{^{235}_{92}U}" },
      {
        label: "核反应",
        latex:
          "\\ce{^{235}_{92}U + ^{1}_{0}n -> ^{141}_{56}Ba + ^{92}_{36}Kr + 3^{1}_{0}n}",
      },
      {
        label: "α衰变",
        latex: "\\ce{^{238}_{92}U -> ^{234}_{90}Th + ^{4}_{2}He}",
      },
      { label: "β衰变", latex: "\\ce{^{14}_{6}C -> ^{14}_{7}N + ^{0}_{-1}e}" },
      // ── 配位化合物 ──
      { label: "配离子", latex: "\\ce{[Fe(H2O)6]^2+}" },
      { label: "配合物", latex: "\\ce{[Cu(NH3)4]^2+}" },
      { label: "EDTA", latex: "\\ce{[Fe(EDTA)]-}" },
      { label: "配合物命名", latex: "\\ce{K4[Fe(CN)6]}" },
      // ── 氧化还原/氧化态 ──
      { label: "离子电荷", latex: "\\ce{Fe^2+}" },
      { label: "氧化态上标", latex: "\\ce{Fe^{III}}" },
      { label: "氧化态下标", latex: "\\ce{Fe^{3+} + e- -> Fe^{2+}}" },
      {
        label: "氧化态详情",
        latex:
          "\\ce{2Mn^{VII}O4- + 5H2^{I}O2 -> 2Mn^{II}^2+ + 5^{0}O2 ^ + 8H2O}",
      },
      // ── 有机化学 ──
      // mhchem 不支持 chemfig 的角度与环闭合语法，使用标准环骨架符号。
      { label: "苯环结构", latex: "\\text{⌬}" },
      { label: "环己烷", latex: "\\text{⬡}" },
      { label: "甲基", latex: "\\ce{CH3-}" },
      { label: "羧基", latex: "\\ce{-COOH}" },
      { label: "羟基", latex: "\\ce{-OH}" },
      { label: "氨基", latex: "\\ce{-NH2}" },
      { label: "醛基", latex: "\\ce{-CHO}" },
      { label: "酯基", latex: "\\ce{-COOR}" },
      { label: "乙醇", latex: "\\ce{CH3CH2OH}" },
      { label: "乙酸", latex: "\\ce{CH3COOH}" },
      // ── 酸碱化学 ──
      { label: "pH值", latex: "\\text{pH} = -\\log[\\ce{H+}]" },
      { label: "pOH值", latex: "\\text{pOH} = -\\log[\\ce{OH-}]" },
      { label: "水的离子积", latex: "K_w = [\\ce{H+}][\\ce{OH-}] = 10^{-14}" },
      {
        label: "Henderson公式",
        latex:
          "\\text{pH} = \\text{p}K_a + \\log\\frac{[\\ce{A-}]}{[\\ce{HA}]}",
      },
      { label: "缓冲", latex: "\\ce{HA + OH- -> A- + H2O}" },
      // ── 热力学 ──
      { label: "反应焓", latex: "\\Delta H" },
      { label: "吉布斯自由能", latex: "\\Delta G = \\Delta H - T\\Delta S" },
      { label: "标准状态", latex: "\\Delta G^{\\circ} = -RT\\ln K" },
      { label: "燃烧热", latex: "\\Delta_c H^{\\circ}" },
      { label: "生成热", latex: "\\Delta_f H^{\\circ}" },
      // ── 电化学 ──
      { label: "能斯特方程", latex: "E = E^{\\circ} - \\frac{RT}{nF}\\ln Q" },
      {
        label: "标准电势",
        latex: "\\ce{Zn^2+ + 2e- -> Zn} \\quad E^{\\circ} = -0.76\\,\\text{V}",
      },
      { label: "原电池", latex: "\\ce{Zn | Zn^2+ || Cu^2+ | Cu}" },
      // ── 化学键 ──
      { label: "σ键/π键", latex: "\\sigma\\text{-}\\pi\\text{-}\\text{bond}" },
      { label: "Lewis结构", latex: "\\ce{:O=C=O:}" },
      // ── 聚合反应 ──
      { label: "聚合", latex: "\\ce{n CH2=CH2 ->[cat.] ~(CH2-CH2)_{n}~}" },
      // ── 立体化学 ──
      { label: "手性", latex: "\\ce{HOOC-^{*}CHCl-COOH}" },
      // ── 状态标注 ──
      { label: "状态(s)", latex: "\\ce{NaCl(s)}" },
      { label: "状态(aq)", latex: "\\ce{NaCl(aq)}" },
      { label: "状态(l)", latex: "\\ce{H2O(l)}" },
      { label: "状态(g)", latex: "\\ce{CO2(g)}" },
      { label: "沉淀↓", latex: "\\ce{Ag+ + Cl- -> AgCl v}" },
      { label: "气体↑", latex: "\\ce{Zn + 2HCl -> ZnCl2 + H2 ^}" },
      {
        label: "镁与钛四氯化物反应",
        latex:
          "2\\text{Mg} + \\text{TiCl}_4 \\xrightarrow{\\text{熔融}} 2\\text{MgCl}_2 + \\text{Ti}",
      },
      {
        label: "铝与氯气反应",
        latex:
          "2\\text{Al} + 3\\text{Cl}_2 \\xrightarrow{\\text{点燃}} 2\\text{AlCl}_3",
      },
      {
        label: "过氧化钠与钠的歧化反应",
        latex:
          "\\text{Na}_2\\text{O}_2 + 2\\text{Na} \\xrightarrow{\\Delta} 2\\text{Na}_2\\text{O}",
      },
      {
        label: "次氯酸在光照下分解",
        latex:
          "2\\text{HClO} \\xrightarrow{\\text{光照}} 2\\text{HCl} + \\text{O}_2",
      },
      {
        label: "电镀铜",
        latex:
          "\\text{Cu}^{2+} + 2e^- \\rightarrow \\text{Cu} \\quad (\\text{在阴极发生反应})",
      },

      {
        label: "氯化钠熔融电解",
        latex:
          "2\\text{NaCl (熔融)} \\xrightarrow{\\text{电解}} 2\\text{Na} + \\text{Cl}_2",
      },
    ],
  },
  {
    key: "Physics",
    label: "物理公式",
    symbols: [
      { label: "计算波的传播速度", latex: "v = \\lambda f" },
      { label: "计算光波的波长", latex: "\\lambda = \\frac{c}{f}" },
      { label: "计算带电粒子在磁场中的受力", latex: "F = qvB \\sin \\theta" },
      { label: "计算圆形电流环的磁场", latex: "B = \\frac{\\mu_0 I}{2R}" },
      { label: "计算穿过线圈的磁通量", latex: "\\Phi = B A" },
      { label: "计算电磁波在真空中的传播速度", latex: "v = c" },
      {
        label: "计算电场中的能量密度",
        latex: "u_E = \\frac{1}{2} \\epsilon_0 E^2",
      },
      { label: "计算电磁波的波长", latex: "\\lambda = \\frac{c}{f}" },
      { label: "计算光子的能量", latex: "E = h f" },
      { label: "计算感应电动势", latex: "\\mathcal{E} = -\\frac{d\\Phi}{dt}" },
      { label: "计算磁通量（考虑角度）", latex: "\\Phi = B A \\cos \\theta" },
      { label: "计算电路中的电压、电流或电阻", latex: "V = IR" },
      { label: "计算电路中元件的功率", latex: "P = I^2 R" },
      {
        label: "计算串联电路中的总电压",
        latex: "V_{\\text{total}} = V_1 + V_2 + \\cdots + V_n",
      },
      {
        label: "计算并联电路中的总电阻",
        latex:
          "\\frac{1}{R_{\\text{total}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots + \\frac{1}{R_n}",
      },
      { label: "计算电器的功率", latex: "P = VI" },
      { label: "计算通过电路的电量", latex: "Q = It" },
      { label: "计算物体的动量", latex: "p = mv" },
      { label: "计算力对物体的冲量", latex: "J = F \\times t" },
      {
        label: "计算外力对物体动能的影响",
        latex: "\\Delta E_k = W_{\\text{外}}",
      },
      { label: "计算物体的总能量", latex: "E_{\\text{总}} = E_k + E_p" },
      { label: "计算光的折射率", latex: "n = \\frac{c}{v}" },
      {
        label: "计算透镜或镜头的焦距",
        latex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
      },
      {
        label: "计算光的全反射临界角",
        latex: "\\theta_c = \\arcsin \\frac{n_2}{n_1}",
      },
      { label: "计算核反应中的能量释放", latex: "E = \\Delta m c^2" },
      {
        label: "计算衰变后的放射性物质数量",
        latex: "N(t) = N_0 e^{-\\lambda t}",
      },
      { label: "计算简谐振动的周期", latex: "T = 2\\pi \\sqrt{\\frac{m}{k}}" },
      { label: "计算弹簧的恢复力", latex: "F = -kx" },
      { label: "计算液体在深度处的压力", latex: "P = \\rho g h" },
      { label: "计算液体对容器壁施加的压力", latex: "F = P A" },
      { label: "计算物体的动能", latex: "E_k = \\frac{1}{2} mv^2" },
      { label: "计算物体的重力势能", latex: "E_p = mgh" },
      { label: "计算系统中的能量变化", latex: "\\Delta E = Q - W" },
      { label: "计算物体之间的摩擦力", latex: "f = \\mu N" },
      { label: "计算物体所做的功", latex: "W = F \\times s" },
      { label: "计算机械功率", latex: "P = \\frac{W}{t}" },
      { label: "计算理想气体的状态", latex: "PV = nRT" },
      { label: "计算给定体积下的气体压力", latex: "P = \\frac{nRT}{V}" },
      { label: "计算气体内能的变化", latex: "\\Delta U = Q - W" },
      {
        label: "计算气体的内能变化（热容）",
        latex: "C_v = \\frac{\\partial U}{\\partial T}",
      },
      {
        label: "计算气体体积变化对内能的影响",
        latex: "\\frac{\\partial U}{\\partial V} = -P",
      },
      { label: "计算物体吸收或释放的热量", latex: "Q = mc\\Delta T" },
      { label: "计算物体熔化或蒸发时的热量", latex: "Q = mL" },
      { label: "计算粒子的动能", latex: "E_k = \\frac{1}{2} mv^2" },
      { label: "计算电子跃迁的能量", latex: "\\Delta E = h f" },
      { label: "计算物体的速度（运动学）", latex: "v = u + at" },
      {
        label: "计算物体在加速运动中的位移",
        latex: "s = ut + \\frac{1}{2} a t^2",
      },
      { label: "计算物体的速度或位移（运动学公式）", latex: "v^2 = u^2 + 2as" },
      { label: "计算振动的位移", latex: "x(t) = A \\cos(\\omega t + \\phi)" },
      { label: "计算简谐振动的角频率", latex: "\\omega = 2\\pi f" },
      { label: "计算简谐振动的频率", latex: "f = \\frac{1}{T}" },
      { label: "计算电感器的自感系数", latex: "L = \\frac{\\Phi}{I}" },
      { label: "计算弹簧的弹性势能", latex: "E = \\frac{1}{2} k x^2" },
      { label: "计算物体表面的摩擦系数", latex: "\\mu = \\frac{F_f}{N}" },
      {
        label: "计算物体因温度变化而产生的膨胀（线）",
        latex: "\\Delta L = \\alpha \\times L_0 \\times \\Delta T",
      },
      {
        label: "计算物体因温度变化而产生的膨胀（体）",
        latex: "\\Delta V = \\beta \\times V_0 \\times \\Delta T",
      },
      { label: "计算系统中的能量变化", latex: "\\Delta E = Q - W" },
      { label: "计算声波的传播速度", latex: "v = \\lambda \\times f" },
      { label: "计算声音的响度", latex: "L = 10 \\log_{10} \\frac{I}{I_0}" },
      { label: "计算物体在圆周运动中的加速度", latex: "a_c = \\frac{v^2}{r}" },
      { label: "计算物体在加速运动中的最终速度", latex: "v^2 = u^2 + 2as" },
      { label: "计算液体对容器壁施加的压力", latex: "F = P \\times A" },
      {
        label: "计算液体在深度处的压力",
        latex: "P = \\rho \\times g \\times h",
      },
      {
        label: "计算物体在圆周运动中的向心力",
        latex: "F_c = \\frac{m v^2}{r}",
      },
    ],
  },
];

/**
 * 符号数据的组合式函数。
 * 返回一个响应式的 categories 数组，供 SymbolPanel 渲染。
 */
export function useSymbols(
  extensions: () => SymbolCategory[] = () => [],
): { categories: ComputedRef<SymbolCategory[]> } {
  const categories = computed(() => {
    // Clone before merging so instances and caller-owned JSON stay independent.
    const merged = new Map(CATEGORIES.map(category => [category.key, {
      ...category, symbols: category.symbols.map(symbol => ({ ...symbol })),
    }]));
    for (const category of extensions()) {
      const existing = merged.get(category.key);
      const symbols = new Map(existing?.symbols.map(symbol => [symbol.label, symbol]));
      for (const symbol of category.symbols) symbols.set(symbol.label, { ...symbol });
      merged.set(category.key, { ...existing, ...category, symbols: [...symbols.values()] });
    }
    return [...merged.values()];
  });
  return { categories };
}
