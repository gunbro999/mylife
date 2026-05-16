# 诗歌赏析功能 — 设计规格文档

> 日期: 2026-05-15 | 项目: 浮生记 (MyLife) | Phase: 5

## 1. 功能概述

在浮生记中新增「诗歌赏析」模块。根据**时辰**、**节气**、**地点**三个维度向用户推荐古诗、词、曲、古文，提供 AI 生成的赏析内容，搭配交互式中国地图浏览地域诗词。

## 2. 入口与导航

- 侧边栏新增导航项「诗」（label: 诗, sublabel: 赏诗），路由 `/poetry`
- 图标使用 lucide-react 的 `ScrollText`
- 位置：在「览」（年报）之后，作为最后一个导航项
- 与现有模块不联动，独立使用

## 3. 数据模型

### 3.1 Poem 类型定义

```typescript
interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: "先秦" | "两汉" | "魏晋" | "南北朝" | "唐" | "五代" | "宋" | "元" | "明" | "清";
  type: "诗" | "词" | "曲" | "文";
  content: string[];
  background?: string;
  notes?: Record<string, string>;
  tags: {
    time: TimeTag[];
    terms: string[];
    places: PlaceTag[];
    moods: string[];
    objects: string[];
  };
}
```

### 3.2 标签体系

| 维度 | 标签选项 |
|------|---------|
| 时辰 (time) | 清晨、上午、正午、午后、黄昏、入夜、深夜、通用 |
| 节气 (terms) | 二十四节气 + 春/夏/秋/冬 (季节兜底) |
| 地域 (places) | 省份名 + 历史地名（长安、洛阳、江南、塞外等） |
| 心情 (moods) | 闲适、豪放、婉约、伤春、悲秋、思乡、怀古等 |
| 意象 (objects) | 日月星辰、风花雪月、山水草木、鸟兽虫鱼等 |

### 3.3 数据存储

- 诗词数据：本地 JSON 文件 (`src/data/poems.json`)，首期 200-300 首
- AI 赏析：运行时按需生成，缓存至 localStorage (`poem-analysis-{id}`)
- 用户偏好：不持久化，仅内存状态

## 4. 页面布局

### 4.1 整体结构

路由 `/poetry`，三 Tab 切换布局：

```
┌──────────────────────────────┐
│  📜 诗歌赏析                  │
│                              │
│  [ 时辰 ] [ 节气 ] [ 地方 ]   │
│  ─────────────────────────── │
│                              │
│  Tab 内容区                   │
│  - 当前状态提示               │
│  - 诗词卡片列表（瀑布流）      │
│  - 可滚动加载                 │
└──────────────────────────────┘
```

### 4.2 时辰 Tab

- 自动检测当前时间段（7段划分），顶部显示应景标题
- 匹配当前时辰 + 当前季节的诗词
- 可手动切换到其他时辰浏览
- 时间段划分：清晨(5-7)、上午(8-11)、正午(12-13)、午后(14-17)、黄昏(18-19)、入夜(20-22)、深夜(23-4)

### 4.3 节气 Tab

- 自动检测当前节气，顶部展示节气介绍卡片（名称、含义、物候）
- 推荐匹配当前节气的诗词
- 可手动切换浏览其他节气
- 非节气精确匹配时按当前季节兜底

### 4.4 地方 Tab

- 上部：SVG 中国地图，省份可 hover/点击
- 下部：选中省份的诗词列表
- 默认不选中（展示全部），省份选中后联动筛选
- 省份标签包含历史地名以实现更广覆盖（如河南 → 洛阳、开封、中原）

## 5. 诗词卡片

### 5.1 卡片展示

- 朝代标签 + 类型标签（如 [唐] 诗）
- 标题（书名号）
- 作者
- 正文预览（最多4行）
- 点击展开详情

### 5.2 详情展开

点击卡片后展开，展示：
- 完整诗文
- 注释（如数据中有）
- 创作背景（如数据中有）
- AI 赏析（200-400字中国风文章 + 主题关键词 + 精华点评）
- 相关诗词推荐（基于 tags 匹配，最多 5 首）

## 6. AI 赏析

### 6.1 API

```
POST /api/ai/poem-analysis
Request:  { title, author, dynasty, content, background? }
Response: { appreciation, themes[], beauty }
// appreciation: 200-400字中国风赏析文章
// themes: 主题关键词，用于关联推荐
// beauty: 一句精华点评，卡片上展示（AI未生成时为空）
```

### 6.2 缓存策略

- 首次生成后存入 localStorage (`poem-analysis-{id}`)
- 后续打开直接从缓存读取，不重复调用
- 提供「重新生成」按钮
- 复用现有 aiConfigStore 的提供商配置

### 6.3 降级处理

- 未配置 AI 密钥：仅展示诗词自带注释和背景
- AI 调用失败：同样降级，并静默提示

## 7. 中国地图

- 纯 SVG 内联实现，无外部地图依赖
- 省份用 `<path>` 元素表示，hover 高亮、点击选中
- 配色使用主题变量，与中国风设计统一
- 省份数据预设对应地域标签：`provinceTags: { "河南": ["河南", "洛阳", "开封", "中原"], ... }`

## 8. 文件清单

| 文件 | 说明 |
|------|------|
| `src/data/poems.json` | 诗词数据集（200-300首，含标签） |
| `src/data/china-map.ts` | SVG path 数据 + 省份标签映射 |
| `src/stores/poetryStore.ts` | 诗词状态（当前Tab、选中省份、赏析缓存） |
| `src/components/poetry/PoetryCard.tsx` | 诗词卡片 |
| `src/components/poetry/PoetryDetail.tsx` | 诗词详情（modal 或展开区域） |
| `src/components/poetry/TimeTab.tsx` | 时辰推荐 |
| `src/components/poetry/TermTab.tsx` | 节气推荐 |
| `src/components/poetry/PlaceTab.tsx` | 地方推荐 |
| `src/components/poetry/ChinaMap.tsx` | SVG 中国地图 |
| `src/components/poetry/SolarTermBadge.tsx` | 节气介绍卡片 |
| `src/app/(main)/poetry/page.tsx` | 诗歌赏析页面 |
| `src/app/api/ai/poem-analysis/route.ts` | AI 赏析 API |
| `src/components/layout/Sidebar.tsx` | 新增「诗」导航项（修改） |

## 9. 非功能需求

- **性能：** SVG 地图单次渲染 < 50ms，诗词列表虚拟滚动（超过 50 条时）
- **离线：** 诗词数据本地 JSON，无网络时仍可浏览（仅 AI 赏析不可用）
- **主题：** 卡片/地图/标签均使用 CSS 变量，随主题切换自动适配
- **国际化：** 仅中文，不涉及 i18n
