# 浮生记 (MyLife) — Phase 1 产品设计全过程记录

> 记录时间：2026年5月14日
> 阶段：Phase 1 MVP
> 状态：已完成，开发服务器可运行

---

## 一、产品构想

### 1.1 初始愿景

用户希望做一款**智能日记/写作软件**，取名 **MyLife**，核心诉求：

- 包含**随笔、小记、日记、小说**等多种写作模块
- 所有文件可**上传云端**
- 软件风格要非常有**设计感**
- 能根据写作内容和状态**智能推荐音乐**

### 1.2 需求讨论过程

通过三轮结构化提问，逐步明确了产品方向：

**第一轮 — 宏观定位：**

| 问题 | 用户选择 |
|------|----------|
| 目标平台 | 全平台覆盖，**先做 Web 版** |
| 技术栈 | 还没想好，一起讨论 |
| 后端方案 | 一起讨论 |
| 音乐推荐深度 | **AI 深度分析** + **集成第三方音乐平台** |

**第二轮 — 产品细节：**

| 问题 | 用户选择 |
|------|----------|
| 编辑器风格 | **混合模式** (默认沉浸式，可切换富文本/Markdown) |
| UI 设计风格 | **现代极简** |
| 小说模块功能 | **全部都要** (章节管理+角色世界观+写作统计) |
| AI 能力范围 | **写作助手** + **情绪日记分析** |

**第三轮 — 技术决策：**

| 问题 | 用户选择 |
|------|----------|
| 技术方案 | **Next.js + Tailwind** (推荐方案) |
| 云端同步策略 | **混合模式** (自动草稿 + 手动发布) |
| 额外功能 | **时间线视图** + **分享与发布** |

### 1.3 产品规格文档

基于讨论结果，生成了完整的产品规格文档 `PRODUCT_SPEC.md`，涵盖：
- 产品愿景与目标平台
- 完整技术架构 (前端/后端/AI/音乐)
- 四大写作模块的功能设计
- 混合模式编辑器规格
- AI 写作助手与情绪分析系统
- 音乐推荐系统架构
- 时间线视图与分享发布
- 数据库设计 (12张表)
- 5阶段开发路线图
- 项目目录结构
- 安全隐私与性能目标

---

## 二、Phase 1 实施规划

### 2.1 MVP 目标

**核心写作体验可用** — 用户能创建日记/随笔/小记、使用混合模式编辑器写作、浅深主题切换。

**关键决策：**
- 暂不接 Supabase，用 Zustand + localStorage 模拟数据层
- 编辑器选用 Tiptap (ProseMirror 封装)
- 不全量安装 shadcn/ui，用 Radix UI 原语手写组件
- 路由用 `(main)` 路由组，为未来 `(auth)` 留空间

### 2.2 七步实施计划

```
Step 1: 项目初始化 — Next.js 14 + Tailwind + 依赖安装 + 主题配置
Step 2: 设计系统 — 工具函数 / 状态管理 / 侧边栏 / 顶栏 / 主题切换
Step 3: Tiptap 编辑器 — 沉浸式 / 富文本 / Markdown 三模式
Step 4: 日记模块 — 日历视图 / 心情天气选择 / 创建编辑
Step 5: 随笔模块 — 列表 / 编辑页 / 标签系统
Step 6: 小记模块 — 瀑布流 / 快速记录 / 颜色标记 / 转换功能
Step 7: 首页仪表盘 — 统计卡片 / 最近写作 / 空状态 / 动画
```

---

## 三、Phase 1 开发执行

### 3.1 项目初始化

- 使用 `create-next-app@latest` 创建 Next.js 16 项目 (App Router + TypeScript + Tailwind CSS v4)
- 安装核心依赖：

```
@tiptap/react @tiptap/starter-kit         — 富文本编辑器
@tiptap/extension-placeholder              — 占位符
@tiptap/extension-character-count          — 字数统计
@tiptap/pm                                 — ProseMirror 核心
framer-motion                              — 动画引擎
zustand                                    — 状态管理
lucide-react                               — 图标库
date-fns                                   — 日期处理
clsx + tailwind-merge                      — 样式工具
```

### 3.2 初版构建 (现代极简风)

首先按"现代极简"风格完成了全部功能模块：

- **色彩系统**：冷调蓝灰，强调色 `#2563EB`
- **字体**：Inter + Noto Sans SC
- **编辑器**：带 300ms 防抖自动保存
- **布局**：240px 侧边栏 + 56px 顶栏

全部 7 个页面和 15+ 个组件一次性构建完成，通过 `next build` 零错误。

### 3.3 遇到的技术问题与解决

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `BubbleMenu` 导入失败 | Tiptap v3 将 BubbleMenu 移至 `@tiptap/react/menus` 子路径 | 改为 `import { BubbleMenu } from "@tiptap/react/menus"` |
| `useRef` 类型错误 | React 19 要求 `useRef` 必须提供初始值 | 添加 `undefined` 初始值 |
| `tippyOptions` 不存在 | Tiptap v3 BubbleMenu 移除了 tippy 配置项 | 删除该 prop |
| `ringColor` CSS 属性不存在 | 非标准 CSS 属性不能写在 `style` 中 | 移除，改用 Tailwind ring 类 |

---

## 四、设计风格迭代

### 4.1 用户反馈

用户在初版完成后提出三项改进：
1. **删除自动保存功能** — 改为手动保存
2. **提升设计感** — 更加时尚
3. **融入中国风** — 中式美学

### 4.2 中国风设计改造方案

#### 配色系统重构

从冷调蓝灰体系完全转向中国传统色彩：

```
朱砂红  #B84C3D  — 主强调色 (accent)，印章、按钮
墨色    #2C2418  — 主文字 (ink)
翠玉绿  #5C8A6E  — 辅助色 (jade)，平静/感恩情绪
古金色  #C9943E  — 暖强调色 (gold)，统计数字
靛青色  #3B4A6B  — 辅助色 (indigo-ink)，忧郁/随笔

背景浅色：宣纸色 #F8F5F0 → #F0EBE3 → #FFFDF9
背景深色：墨夜色 #12100E → #1A1714 → #211E1A
```

#### 字体体系

```
标题/展示：Noto Serif SC (宋体族) — font-display
正文写作：Noto Serif SC — font-serif，行高 2.0，字间距 0.02em
界面文字：Inter + Noto Sans SC — font-sans
```

#### 中式设计元素

| 元素 | 实现方式 |
|------|----------|
| **印章效果** `.seal-stamp` | 朱红 2px 边框 + 微旋转(-3deg) + 宋体字 |
| **水墨晕染** `.ink-wash` | 双色径向渐变伪元素覆盖层 |
| **宣纸纹理** `.paper-texture` | 极淡金红径向渐变 |
| **中式分隔线** `.cn-divider` | 两端渐隐的水平线 + 居中文字 |
| **文字选中色** `::selection` | 朱砂红 15% 透明度 |

#### 品牌重塑

- 应用名：`MyLife` → **浮生记**
- 侧边栏 Logo：印章"记" + "浮 生 记" 书法风字间距
- 导航项：图标 + 单字汉字标识（归/记/文/念/著）

#### 文案风格

| 场景 | 旧版 | 中国风版 |
|------|------|----------|
| 早晨问候 | "早上好" | "晨光熹微" |
| 晚间问候 | "晚上好" | "月上柳梢" |
| 深夜问候 | "夜深了" | "夜阑人静" |
| 日记空状态 | "这一天还没有日记" | "此日无记" |
| 随笔空状态 | "还没有随笔" | "笔未落纸" |
| 小记空状态 | "还没有小记" | "念未起时" |
| 首页空状态 | "开启你的写作旅程" | "落笔生花" |
| 小记保存按钮 | "保存" | "落笔" |
| 搜索占位符 | "搜索你的文字..." | "搜文寻句..." |
| 每日诗句 | 无 | 轮播宋词名句 |

#### 心情标签重设计

从 emoji + 中文词语 → emoji + **单字** + 传统配色：

```
😊 喜 (#C9943E 古金)    😌 静 (#5C8A6E 翠玉)
😢 哀 (#3B4A6B 靛青)    😰 忧 (#8B6E5A 赭石)
😤 怒 (#B84C3D 朱砂)    🙏 恩 (#5C8A6E 翠玉)
🤩 兴 (#D4956A 赤金)    😴 倦 (#9C8E7C 灰褐)
```

### 4.3 自动保存删除

**Editor 组件：**
- 移除 `saveTimerRef` 和防抖定时器
- `onUpdate` 直接调用 `onChange` 传出内容，不触发持久化

**日记编辑页：**
- 移除 `autoSave` 回调、`saveTimerRef`、`saveStatus` 状态
- 新增 `content`、`mood`、`weather` 本地 state
- 新增 `hasChanges` 标记是否有未保存修改
- 新增"保存"按钮 (`<Save>` 图标)，手动调用 `updateWriting`

**随笔编辑页：**
- 同样移除自动保存逻辑
- 标签操作也改为本地 state，保存时一并写入

---

## 五、最终产物

### 5.1 文件结构

```
mylife/
├── PRODUCT_SPEC.md              — 产品需求规格文档
├── DESIGN_PROCESS.md            — 本文档
└── app/                         — Next.js 项目
    ├── src/
    │   ├── app/
    │   │   ├── globals.css      — 全局样式 (中国风变量+水墨纹理+编辑器样式)
    │   │   ├── layout.tsx       — 根布局 (ThemeProvider)
    │   │   └── (main)/
    │   │       ├── layout.tsx   — 主布局 (Sidebar + TopBar)
    │   │       ├── page.tsx     — 首页仪表盘 (诗意问候+统计+近作)
    │   │       ├── diary/
    │   │       │   ├── page.tsx — 日记列表 (日历/列表双视图)
    │   │       │   └── [id]/page.tsx — 日记编辑 (手动保存)
    │   │       ├── essays/
    │   │       │   ├── page.tsx — 随笔列表 (卡片网格)
    │   │       │   └── [id]/page.tsx — 随笔编辑 (手动保存)
    │   │       └── notes/
    │   │           └── page.tsx — 小记瀑布流
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.tsx      — 中国风侧边栏 (印章Logo+单字导航)
    │   │   │   ├── TopBar.tsx       — 极简顶栏 (搜索+主题切换)
    │   │   │   └── ThemeProvider.tsx — 主题状态同步
    │   │   ├── editor/
    │   │   │   ├── Editor.tsx       — Tiptap 编辑器 (宣纸质感)
    │   │   │   ├── Toolbar.tsx      — 格式化工具栏
    │   │   │   └── EditorModeSwitch.tsx — 沉浸/富文/源码切换
    │   │   ├── diary/
    │   │   │   ├── DiaryCalendar.tsx — 日历组件
    │   │   │   ├── DiaryCard.tsx     — 日记卡片
    │   │   │   ├── MoodPicker.tsx    — 心情选择器
    │   │   │   └── WeatherPicker.tsx — 天气选择器
    │   │   ├── essays/
    │   │   │   ├── EssayCard.tsx     — 随笔卡片
    │   │   │   └── TagManager.tsx    — 标签管理器
    │   │   └── notes/
    │   │       ├── NoteCard.tsx      — 小记卡片
    │   │       └── QuickNoteInput.tsx — 快速记录输入
    │   ├── stores/
    │   │   ├── uiStore.ts       — UI 状态 (主题/侧边栏/编辑器模式)
    │   │   └── writingStore.ts  — 写作数据 (CRUD + localStorage)
    │   └── lib/
    │       ├── types.ts         — 类型定义 (中国风配色常量)
    │       └── utils.ts         — 工具函数 (cn/字数/日期)
    └── package.json
```

### 5.2 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.2.6 |
| 语言 | TypeScript | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 编辑器 | Tiptap | 3.23 |
| 状态管理 | Zustand (persist) | — |
| 动画 | Framer Motion | — |
| 图标 | Lucide React | — |
| 日期 | date-fns | — |
| 运行时 | Node.js | 20.20.2 |

### 5.3 功能清单

- [x] 首页仪表盘 (诗意问候 / 四宫格统计 / 快速创建 / 近作列表)
- [x] 日记模块 (日历视图 / 列表视图 / 心情选择 / 天气选择)
- [x] 随笔模块 (卡片网格 / 标签系统 / 封面展示)
- [x] 小记模块 (瀑布流 / 快速记录 / 颜色标记 / 一键转换)
- [x] 混合模式编辑器 (沉浸式 / 富文本 / Markdown)
- [x] 手动保存 (用户主动点击保存按钮)
- [x] 浅色/深色主题切换
- [x] 可折叠侧边栏导航
- [x] 数据持久化 (localStorage)
- [x] 中国风设计体系

### 5.4 后续阶段展望

```
Phase 2: 智能化 — Claude API 写作助手 + 情绪分析 + 音乐推荐
Phase 3: 小说工坊 — 章节树 + 角色卡片 + 世界观 + 关系图谱
Phase 4: 社交回顾 — 时间线 + 分享卡片 + 年度报告
Phase 5: 跨平台 — Supabase 云同步 + Tauri 桌面端 + PWA
```

---

*文档版本: v1.0*
*最后更新: 2026-05-14*
