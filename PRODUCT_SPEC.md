# MyLife - 产品需求规格文档

> 一款融合写作、记录与智能体验的全平台日记软件

---

## 1. 产品愿景

MyLife 是一个面向个人创作者的智能写作与生活记录平台。它不仅是日记本，更是一个懂你情绪、伴你创作、帮你回顾人生轨迹的数字伙伴。

**核心理念：** 让每一次书写都成为一种享受。

---

## 2. 目标平台与开发策略

| 阶段 | 平台 | 目标 |
|------|------|------|
| **Phase 1** | Web 应用 | 最快出效果，验证核心体验 |
| **Phase 2** | 桌面端 (Tauri) | 复用 Web 代码，提供原生体验 |
| **Phase 3** | 移动端 (React Native / PWA) | 随时随地记录 |

---

## 3. 技术架构

### 3.1 前端

| 技术 | 用途 |
|------|------|
| **Next.js 14** (App Router) | 全栈框架，SSR/SSG 支持 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS** | 原子化样式 |
| **shadcn/ui** | 高质量 UI 组件库 |
| **Tiptap** | 可扩展的富文本编辑器 |
| **Framer Motion** | 流畅动画与过渡效果 |

### 3.2 后端 & 云服务

| 技术 | 用途 |
|------|------|
| **Supabase** | 一站式后端 (PostgreSQL + Auth + Storage + Realtime) |
| **Supabase Edge Functions** | 服务端逻辑 (Deno Runtime) |
| **Vercel** | 前端部署与 CDN |
| **Supabase Storage** | 文件/图片/附件云端存储 |

### 3.3 AI 服务

| 技术 | 用途 |
|------|------|
| **Claude API** | 写作助手 (续写、润色、风格改写) + 情绪分析 |
| **Spotify Web API** | 海外音乐推荐与播放 |
| **网易云音乐 API** | 国内音乐推荐与播放 (备选) |

### 3.4 架构图概览

```
┌─────────────────────────────────────────────────┐
│                   用户设备                        │
│  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Web App  │  │  Desktop  │  │  Mobile App  │ │
│  │ (Next.js) │  │  (Tauri)  │  │ (RN / PWA)   │ │
│  └─────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
└────────┼──────────────┼────────────────┼─────────┘
         │              │                │
         └──────────────┼────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │        Vercel (CDN)          │
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────────┐
         │         Supabase             │
         │  ┌────────┐ ┌────────────┐   │
         │  │  Auth   │ │  Database   │  │
         │  │        │ │ (PostgreSQL)│   │
         │  └────────┘ └────────────┘   │
         │  ┌────────┐ ┌────────────┐   │
         │  │Storage │ │  Realtime   │   │
         │  │ (OSS)  │ │  (Sync)    │   │
         │  └────────┘ └────────────┘   │
         │  ┌────────────────────────┐  │
         │  │   Edge Functions       │  │
         │  │  (AI调用 / 业务逻辑)    │  │
         │  └────────────────────────┘  │
         └──────────────────────────────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │Claude  │ │Spotify │ │网易云   │
         │  API   │ │  API   │ │音乐API │
         └────────┘ └────────┘ └────────┘
```

---

## 4. 功能模块详细设计

### 4.1 写作模块

MyLife 包含四大写作类型，共享同一编辑器内核，但各有独特功能。

#### 4.1.1 日记 (Diary)

- **每日一页：** 以日期为单位组织，日历视图快速导航
- **心情标记：** 写作时可选择当日心情 (emoji 或自定义图标)
- **天气记录：** 自动获取或手动选择当日天气
- **照片附件：** 支持插入照片、录音等多媒体内容
- **回顾提醒：** "一年前的今天" 回忆推送

#### 4.1.2 随笔 (Essay)

- **自由创作：** 无固定结构，灵感来了就写
- **标签分类：** 自定义标签系统，灵活归类
- **封面图：** 每篇随笔可设置封面图，增强仪式感
- **字数统计：** 实时字数与阅读时间估算

#### 4.1.3 小记 (Quick Note)

- **快速捕获：** 类似便签，极速记录灵感闪念
- **卡片视图：** 瀑布流卡片展示，一目了然
- **颜色标记：** 不同颜色区分类别或优先级
- **转换功能：** 小记可一键升级为日记或随笔

#### 4.1.4 小说 (Novel)

- **项目管理：** 每部小说作为独立项目
- **章节树：** 树状章节结构，支持拖拽排序
- **大纲视图：** 可视化故事大纲，支持折叠/展开
- **角色卡片：** 角色档案 (姓名、外貌、性格、背景故事、头像)
- **世界观设定：** 世界观百科，包含地图、势力、历史等
- **关系图谱：** 可视化角色关系网络图
- **写作统计：** 每日字数、总字数、章节进度、写作热力图
- **目标设定：** 设定每日/每周写作目标，进度追踪

### 4.2 编辑器

基于 **Tiptap** 构建的混合模式编辑器：

- **默认模式 - 沉浸式写作：**
  - 极简界面，全屏无干扰
  - 打字机模式 (当前行始终居中)
  - 专注模式 (高亮当前段落，其余变淡)
  - 柔和的光标动画

- **切换模式 - 富文本编辑：**
  - 标题、粗体、斜体、引用等常用格式
  - 图片、视频嵌入
  - 代码块 (支持语法高亮)
  - 表格、分割线、待办列表
  - 悬浮工具栏 (选中文字出现)

- **切换模式 - Markdown：**
  - 原生 Markdown 语法支持
  - 即时预览 (所见即所得)
  - 支持导出为 .md 文件

- **通用能力：**
  - 自动保存草稿 (每 3 秒)
  - 版本历史 (可回溯任意版本)
  - 全文搜索与替换
  - 快捷键体系

### 4.3 AI 智能功能

#### 4.3.1 写作助手

| 功能 | 说明 |
|------|------|
| **智能续写** | 根据上下文自动续写，支持调节创造力程度 |
| **文风改写** | 将文本转换为不同风格 (正式/口语/文艺/幽默) |
| **润色优化** | 语法修正、用词优化、句式调整 |
| **摘要生成** | 为长文自动生成摘要 |
| **取名灵感** | 为角色/章节/文章提供命名建议 |

#### 4.3.2 情绪分析

- **实时情绪识别：** 分析文字中的情绪倾向 (快乐、忧伤、焦虑、平静、愤怒、感恩...)
- **情绪日报：** 每日写作结束后生成情绪总结
- **情绪趋势图：** 周/月/年的情绪变化可视化
- **心情洞察：** AI 生成的个人情绪分析报告，发现潜在情绪模式
- **温暖提示：** 检测到持续低落情绪时，给出关怀性建议

#### 4.3.3 智能标签与搜索

- **自动标签：** AI 分析内容自动生成标签
- **语义搜索：** 不只是关键词匹配，理解搜索意图
- **关联推荐：** "你可能还想回顾这些相关内容"

### 4.4 音乐推荐系统

#### 核心逻辑

```
写作内容 ──→ AI 情绪/氛围分析 ──→ 生成音乐标签 ──→ 调用音乐 API ──→ 推荐歌单
写作状态 ──→ 检测写作节奏     ──→ 匹配场景     ──→ 调整推荐策略
```

#### 4.4.1 基于内容的推荐

- AI 分析当前写作的文字情绪与主题
- 映射到音乐风格标签 (例：忧伤叙事 → Lo-fi / 独立民谣)
- 从音乐平台 API 获取匹配歌单

#### 4.4.2 基于写作状态的推荐

| 状态 | 推荐策略 |
|------|----------|
| 刚开始写作 | 轻柔的环境音乐，帮助进入状态 |
| 高速写作中 | 节奏匹配的纯音乐，维持心流 |
| 长时间暂停 | 激励性轻音乐，唤回注意力 |
| 写到高潮段落 | 匹配情节氛围的史诗/戏剧性音乐 |

#### 4.4.3 音乐播放器

- 内嵌迷你播放器 (不遮挡写作区域)
- 支持 Spotify / 网易云音乐 账号绑定
- 收藏歌曲到个人歌单
- "写作BGM" 专属播放列表
- 音量随写作状态自动调节

### 4.5 时间线视图

- **多维时间线：** 纵向时间轴展示所有类型的写作内容
- **筛选器：** 按类型 (日记/随笔/小记/小说) 和标签筛选
- **年度回顾：** 自动生成年度写作报告
  - 写了多少字、多少天
  - 情绪变化曲线
  - 最活跃的写作时间段
  - 关键词云
  - 听过最多的歌曲
- **"那年今日"：** 回顾历史同日的内容
- **可视化日历：** 热力图展示写作频率

### 4.6 云端同步

#### 同步策略：混合模式

- **自动草稿保存：** 编辑过程中实时保存草稿到云端 (基于 Supabase Realtime)
- **手动发布确认：** 完成写作后，用户手动点击"保存"确认最终版本
- **版本管理：** 保留历史版本，可随时回溯
- **冲突处理：** 多设备编辑冲突时提示用户选择版本
- **离线支持：** 断网时本地缓存，恢复网络后自动同步

#### 存储结构

```
Supabase Storage
├── users/{userId}/
│   ├── avatars/          # 用户头像
│   ├── diary/            # 日记附件
│   ├── essays/           # 随笔封面图和附件
│   ├── notes/            # 小记图片
│   └── novels/           # 小说素材和设定图
│       ├── {novelId}/
│       │   ├── covers/
│       │   ├── character-avatars/
│       │   └── world-maps/
```

### 4.7 分享与发布

- **精美分享卡片：** 将文字转化为精美图片分享到社交媒体
- **公开链接：** 生成独立网页链接，任何人可通过链接阅读
- **自定义外观：** 选择分享页面的字体、配色、排版风格
- **阅读统计：** 分享出去的文章可查看阅读次数
- **评论互动：** 公开文章可开启/关闭评论功能

---

## 5. UI/UX 设计规范

### 5.1 设计风格：现代极简

**设计关键词：** 呼吸感、克制、优雅、专注

#### 色彩系统

```
// 浅色主题
--bg-primary:      #FAFAFA    // 主背景 - 近白色
--bg-secondary:    #F5F5F5    // 次级背景
--bg-elevated:     #FFFFFF    // 卡片/弹层背景
--text-primary:    #1A1A1A    // 主文字
--text-secondary:  #6B7280    // 次级文字
--text-tertiary:   #9CA3AF    // 辅助文字
--accent:          #2563EB    // 强调色 - 克制的蓝
--accent-soft:     #EFF6FF    // 强调色浅底
--border:          #E5E7EB    // 边框
--shadow:          0 1px 3px rgba(0,0,0,0.05)

// 深色主题
--bg-primary:      #0A0A0A    // 主背景 - 纯黑
--bg-secondary:    #141414    // 次级背景
--bg-elevated:     #1C1C1C    // 卡片/弹层背景
--text-primary:    #FAFAFA    // 主文字
--text-secondary:  #9CA3AF    // 次级文字
--accent:          #3B82F6    // 强调色
```

#### 字体

```
--font-heading:   'Inter', 'Noto Sans SC', sans-serif    // 标题
--font-body:      'Inter', 'Noto Sans SC', sans-serif    // 正文
--font-writing:   'Merriweather', 'Noto Serif SC', serif // 写作区域
--font-mono:      'JetBrains Mono', monospace            // 代码
```

#### 间距规范

```
4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px / 96px
```

### 5.2 布局结构

```
┌──────────────────────────────────────────────────────┐
│  Logo    搜索栏              通知  设置  头像         │  ← 顶栏 (56px)
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│  日记  │                                             │
│  随笔  │            主内容区域                        │
│  小记  │        (编辑器 / 列表 / 时间线)              │
│  小说  │                                             │
│        │                                             │
│  ───── │                                             │
│  时间线│                                             │
│  统计  │                                             │
│        │                                             │
│        ├──────────────────────────┬──────────────────┤
│        │                          │  AI 助手面板     │
│        │                          │  (可收起)        │
│        │                          │  ──────────      │
│        │                          │  迷你播放器      │
├────────┴──────────────────────────┴──────────────────┤
│                     状态栏                            │  ← 底栏 (32px)
└──────────────────────────────────────────────────────┘
      ↑                    ↑                   ↑
  侧边栏 (240px)      编辑区域            右侧面板 (320px)
  可折叠              自适应宽度            可折叠
```

### 5.3 交互细节

- **过渡动画：** 所有页面切换使用 200ms ease-out 过渡
- **微交互：** 按钮 hover 有微妙缩放 (1.02)，点击有轻微下沉感
- **骨架屏：** 内容加载时显示优雅的骨架占位
- **空状态：** 每个空列表都有精心设计的插画和引导文案
- **Toast 通知：** 轻量级操作反馈，3秒自动消失
- **暗色模式：** 支持系统跟随 / 手动切换，过渡丝滑

---

## 6. 数据库设计 (PostgreSQL via Supabase)

### 核心表结构

```sql
-- 用户
users
├── id (UUID, PK)
├── email
├── display_name
├── avatar_url
├── preferences (JSONB)  -- 主题、字体、编辑器偏好等
├── created_at
└── updated_at

-- 写作内容 (统一表，type 区分类型)
writings
├── id (UUID, PK)
├── user_id (FK → users)
├── type (ENUM: diary, essay, note, novel_chapter)
├── title
├── content (TEXT)  -- Tiptap JSON 或 Markdown
├── content_format (ENUM: tiptap, markdown)
├── cover_image_url
├── mood (VARCHAR)  -- 心情标记 (diary)
├── weather (VARCHAR)  -- 天气 (diary)
├── color (VARCHAR)  -- 卡片颜色 (note)
├── word_count (INT)
├── is_draft (BOOLEAN)
├── is_public (BOOLEAN)
├── published_at
├── created_at
└── updated_at

-- 小说项目
novels
├── id (UUID, PK)
├── user_id (FK → users)
├── title
├── description
├── cover_image_url
├── target_word_count (INT)
├── status (ENUM: planning, writing, completed, paused)
├── created_at
└── updated_at

-- 章节
chapters
├── id (UUID, PK)
├── novel_id (FK → novels)
├── writing_id (FK → writings)  -- 关联到写作内容
├── chapter_number (INT)
├── sort_order (INT)
├── parent_chapter_id (FK, 自引用)  -- 支持嵌套结构
├── created_at
└── updated_at

-- 角色
characters
├── id (UUID, PK)
├── novel_id (FK → novels)
├── name
├── avatar_url
├── profile (JSONB)  -- 外貌、性格、背景等
├── created_at
└── updated_at

-- 角色关系
character_relations
├── id (UUID, PK)
├── character_a_id (FK → characters)
├── character_b_id (FK → characters)
├── relation_type (VARCHAR)  -- 朋友、敌人、恋人、师徒...
├── description
└── created_at

-- 世界观设定
world_settings
├── id (UUID, PK)
├── novel_id (FK → novels)
├── category (VARCHAR)  -- 地理、历史、势力、魔法体系...
├── title
├── content (TEXT)
├── sort_order (INT)
├── created_at
└── updated_at

-- 标签
tags
├── id (UUID, PK)
├── user_id (FK → users)
├── name
├── color
└── created_at

-- 写作-标签关联
writing_tags
├── writing_id (FK → writings)
├── tag_id (FK → tags)
└── (复合主键)

-- 情绪记录
mood_logs
├── id (UUID, PK)
├── user_id (FK → users)
├── writing_id (FK → writings, nullable)
├── mood_score (FLOAT)  -- -1 到 1
├── emotions (JSONB)  -- {joy: 0.8, sadness: 0.1, ...}
├── ai_summary (TEXT)
├── logged_at
└── created_at

-- 版本历史
writing_versions
├── id (UUID, PK)
├── writing_id (FK → writings)
├── content (TEXT)
├── word_count (INT)
├── created_at
└── (自动触发器每次保存时创建)

-- 音乐记录
music_logs
├── id (UUID, PK)
├── user_id (FK → users)
├── writing_id (FK → writings, nullable)
├── track_name
├── artist
├── platform (ENUM: spotify, netease)
├── track_url
├── played_at
└── created_at
```

---

## 7. 开发路线图

### Phase 1 - MVP (4~6 周)

**目标：** 核心写作体验 + 云端同步

- [ ] 项目初始化 (Next.js + Tailwind + Supabase)
- [ ] 用户认证系统 (邮箱 + 社交登录)
- [ ] Tiptap 编辑器集成 (沉浸式 + 富文本模式)
- [ ] 日记模块 (创建/编辑/列表/日历视图)
- [ ] 随笔模块 (创建/编辑/列表)
- [ ] 小记模块 (快速记录/卡片视图)
- [ ] 云端自动保存 + 手动发布
- [ ] 基础搜索功能
- [ ] 浅色/深色主题切换
- [ ] 响应式布局

### Phase 2 - 智能化 (3~4 周)

**目标：** AI 能力接入 + 音乐推荐

- [ ] AI 写作助手 (续写/润色/改写)
- [ ] 情绪分析引擎
- [ ] 音乐推荐系统
- [ ] 内嵌迷你播放器
- [ ] Spotify / 网易云音乐 API 集成
- [ ] 智能标签自动生成
- [ ] 情绪趋势可视化

### Phase 3 - 小说工坊 (3~4 周)

**目标：** 完整的长篇创作工具链

- [ ] 小说项目管理
- [ ] 章节树结构
- [ ] 大纲视图
- [ ] 角色卡片系统
- [ ] 世界观设定百科
- [ ] 角色关系图谱 (可视化)
- [ ] 写作统计与热力图
- [ ] 目标设定与进度追踪

### Phase 4 - 社交与回顾 (2~3 周)

**目标：** 分享、时间线、年度报告

- [ ] 时间线视图
- [ ] 分享卡片生成
- [ ] 公开文章发布 (生成独立链接)
- [ ] 年度回顾报告
- [ ] "那年今日" 回忆功能
- [ ] 版本历史浏览与回溯

### Phase 5 - 跨平台 (持续)

**目标：** 桌面端与移动端

- [ ] Tauri 桌面端封装
- [ ] PWA 支持 (离线写作)
- [ ] React Native 移动端 (可选)
- [ ] 多设备同步优化

---

## 8. 项目结构 (参考)

```
mylife/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证相关页面
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/             # 主应用布局
│   │   │   ├── diary/          # 日记模块
│   │   │   ├── essays/         # 随笔模块
│   │   │   ├── notes/          # 小记模块
│   │   │   ├── novels/         # 小说模块
│   │   │   ├── timeline/       # 时间线
│   │   │   ├── stats/          # 统计面板
│   │   │   └── settings/       # 设置
│   │   ├── api/                # API Routes
│   │   │   ├── ai/             # AI 相关接口
│   │   │   └── music/          # 音乐推荐接口
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── editor/             # Tiptap 编辑器组件
│   │   │   ├── Editor.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── BubbleMenu.tsx
│   │   │   └── extensions/     # 自定义 Tiptap 扩展
│   │   ├── layout/             # 布局组件
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── AIPanel.tsx
│   │   ├── music/              # 音乐播放器
│   │   │   ├── MiniPlayer.tsx
│   │   │   └── Recommendations.tsx
│   │   ├── novel/              # 小说专属组件
│   │   │   ├── ChapterTree.tsx
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── RelationGraph.tsx
│   │   │   └── WorldSetting.tsx
│   │   ├── timeline/           # 时间线组件
│   │   ├── charts/             # 统计图表
│   │   └── ui/                 # shadcn/ui 组件
│   ├── lib/
│   │   ├── supabase/           # Supabase 客户端与工具
│   │   ├── ai/                 # AI 服务封装
│   │   │   ├── claude.ts       # Claude API 调用
│   │   │   ├── emotion.ts      # 情绪分析
│   │   │   └── writing.ts      # 写作助手
│   │   ├── music/              # 音乐服务
│   │   │   ├── spotify.ts
│   │   │   ├── netease.ts
│   │   │   └── recommender.ts  # 推荐算法
│   │   └── utils/              # 通用工具
│   ├── hooks/                  # React Hooks
│   │   ├── useEditor.ts
│   │   ├── useAutoSave.ts
│   │   ├── useMusic.ts
│   │   └── useMoodAnalysis.ts
│   ├── stores/                 # 状态管理 (Zustand)
│   │   ├── editorStore.ts
│   │   ├── musicStore.ts
│   │   └── uiStore.ts
│   └── styles/
│       └── globals.css         # Tailwind + 自定义样式
├── public/
│   ├── fonts/
│   └── illustrations/          # 空状态插画等
├── supabase/
│   ├── migrations/             # 数据库迁移
│   └── functions/              # Edge Functions
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. 安全与隐私

- **认证：** Supabase Auth (支持邮箱、Google、GitHub 登录)
- **数据传输：** 全程 HTTPS 加密
- **行级安全：** Supabase RLS 策略确保用户只能访问自己的数据
- **敏感内容：** 日记等私密内容在传输和存储时加密
- **AI 隐私：** 发送给 AI 的内容不用于模型训练 (Claude API 默认政策)
- **数据导出：** 支持用户导出所有数据 (JSON / Markdown 格式)
- **账户删除：** 支持完整的账户与数据删除

---

## 10. 性能目标

| 指标 | 目标 |
|------|------|
| 首屏加载 (LCP) | < 1.5s |
| 编辑器输入延迟 | < 50ms |
| 自动保存延迟 | < 3s |
| 云端同步延迟 | < 5s |
| AI 响应首 token | < 1s |
| Lighthouse 得分 | > 90 |

---

*文档版本: v1.0*
*最后更新: 2026-05-14*
*作者: MyLife 产品团队*
