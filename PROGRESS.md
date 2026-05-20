# 浮生记 (MyLife) — 项目进度表

> 最后更新: 2026-05-20 (Phase 7 管理员后台上线)

## Phase 1: MVP 核心写作体验 ✅ 已完成

| 模块 | 功能 | 状态 |
|------|------|------|
| 项目基础 | Next.js 16 + Tailwind CSS v4 + TypeScript | ✅ |
| 设计系统 | 中国风色彩/字体/纹理/印章/水墨元素 | ✅ |
| 布局框架 | 侧边栏 + 顶栏 + 主内容区 | ✅ |
| 主题切换 | 浅色/深色模式 | ✅ |
| Tiptap 编辑器 | 沉浸式/富文本/Markdown 三模式 | ✅ |
| 首页仪表盘 | 诗意问候 + 统计卡片 + 快速入口 + 近作列表 | ✅ |
| 日记模块 | 日历/列表双视图 + 心情天气选择 + 手动保存 | ✅ |
| 随笔模块 | 卡片网格 + 标签系统 + 手动保存 | ✅ |
| 小记模块 | 瀑布流 + 快速记录 + 颜色标记 + 一键转换 | ✅ |
| 小说模块 | 章节树 + 角色卡片 + 世界观百科 + 关系图谱 + 写作统计 | ✅ |
| 数据持久化 | Zustand + localStorage | ✅ |
| Bug 修复 | Zustand selector 无限循环修复 (2026-05-15) | ✅ |

## Phase 2: 多主题系统 ✅ 已完成 (2026-05-15)

| 模块 | 功能 | 状态 |
|------|------|------|
| 主题架构 | CSS `data-theme` 属性 + `.dark` class 双层切换 | ✅ |
| 水墨主题 | 黑白极简禅意风 (浅/深) — 默认主题 | ✅ |
| 青花主题 | 蓝白典雅清新风 (浅/深) | ✅ |
| 朱砂主题 | 红黑热烈大气风 (浅/深) | ✅ |
| 竹韵主题 | 青绿自然宁静风 (浅/深) | ✅ |
| 主题选择器 | 顶栏可视化主题切换面板 (配色预览+选中标记) | ✅ |
| 数据迁移 | 旧 `theme` 字段自动迁移至 `themeName` + `themeMode` | ✅ |

## Phase 3: 智能化 ✅ 已完成 (2026-05-15)

| 模块 | 功能 | 状态 |
|------|------|------|
| 多提供商 AI 架构 | Claude / OpenAI / DeepSeek / 自定义 四选一 | ✅ |
| AI 配置管理 | aiConfigStore (localStorage 持久化) | ✅ |
| AI 写作助手 | 续写/风格改写/润色优化 三个功能 Tab | ✅ |
| AI 面板 | 右侧滑入面板 (320px) + Sparkles 触发按钮 | ✅ |
| 情绪分析 API | POST /api/ai/emotion-analysis (Claude JSON 输出) | ✅ |
| 情绪数据存储 | emotionStore (Zustand + localStorage 持久化) | ✅ |
| 情绪趋势图 | 周/月双模式柱状图 (纯 SVG) | ✅ |
| 情绪日报 | 首页/情绪页展示今日心绪卡片 | ✅ |
| 情绪页面 | /emotion 完整心情分析页 | ✅ |
| 音乐推荐 API | GET /api/music/recommendations (情绪→标签映射) | ✅ |
| 迷你播放器 | 侧边栏底部 MiniPlayer (点击打开音乐面板) | ✅ |
| 音乐控制面板 | 右侧滑入面板 (320px) — TopBar 音符按钮或 MiniPlayer 打开 | ✅ |
| 网易云音乐集成 | 二维码登录 + 中文搜索 + 情绪推荐 + 每日推荐 | ✅ |
| Spotify 集成 | OAuth 登录 + 搜索 (仅配置后显示) | ✅ |
| 本地音乐播放 | 本地文件夹扫描 + HTML5 Audio 播放 + 播放列表搜索 | ✅ |
| 音乐三标签 | ☁️ 网易云 / 📁 本地 / 🟢 Spotify(条件) 面板内切换 | ✅ |

## Phase 4: 社交与回顾 ✅ 已完成 (2026-05-15)

| 模块 | 功能 | 状态 |
|------|------|------|
| 时间线视图 | 纵向时间轴，按月分组，类型筛选，中国风设计 | ✅ |
| 侧边栏扩展 | 新增「时间线」「年报」导航项 | ✅ |
| 分享卡片 | 14种中国风背景图 + 白色内容覆盖层，html-to-image 下载 PNG | ✅ |
| 公开分享页 | `/share/[id]` 独立页面，精美排版，localStorage 读取 | ✅ |
| 分享按钮 | 日记/随笔编辑页顶部栏 Share2 入口 | ✅ |
| 年度报告 | 年份选择器 + 概览统计卡片 | ✅ |
| 写作热力图 | SVG 实现，52周×7天，深色方格表示字数密度 | ✅ |
| 情绪月度图 | 12个月情绪徽章展示 | ✅ |
| 词云 | 中文2-gram 分词，SVG 螺旋排列 | ✅ |
| 月度趋势图 | 每月写作数量柱状图 | ✅ |
| 写作时段分布 | 24小时写作频率统计 | ✅ |

## Phase 5: 云基础 ✅ 已完成 (2026-05-17)

| 模块 | 功能 | 状态 |
|------|------|------|
| Supabase 客户端 | 浏览器端 `createClient()` + 服务端 `createServerSupabase()` | ✅ |
| 数据库 Schema | 12 张表完整定义 (writings/novels/chapters/characters/relations/world_settings/excerpts/emotion_logs/created_poems) | ✅ |
| 认证系统 | 邮箱登录/注册页面 + 微信扫码登录入口 + OAuth callback | ✅ |
| AuthProvider | 根布局包裹，自动检测 session 状态，loading 动画 | ✅ |
| 路由保护 | Next.js middleware 拦截未登录请求，share 页面和 API 路由公开 | ✅ |
| 用户菜单 | TopBar 用户头像/邮箱显示 + 退出登录按钮 | ✅ |
| 数据同步层 | `lib/sync.ts` — 所有实体的 CRUD 云端同步函数 + localStorage→Supabase 迁移 + 云端→本地拉取 | ✅ |
| authStore | Zustand store 管理 session/user/loading 状态 | ✅ |
| 环境变量 | NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY / WECHAT_APP_ID | ✅ |

### 已完成 (2026-05-18)
| 模块 | 功能 | 状态 |
|------|------|------|
| Supabase 项目 | 在 supabase.com 创建项目，获取 URL 和 keys | ✅ |
| 数据库建表 | 在 Supabase SQL Editor 执行 schema.sql (9张表+RPC+触发器+索引) | ✅ |
| Storage Bucket | 在 Supabase Dashboard 创建 writing-images bucket + RLS策略 | ✅ |
| 微信开放平台 | 注册网站应用获取 AppID/AppSecret，配置 Supabase Auth wechat provider | ⏳ 待完成 |
| Tauri 桌面端 | 原生桌面应用 | ⏳ 待开发 |

---

## Phase 6: 容器化部署 ✅ 已完成 (2026-05-18)

| 模块 | 功能 | 状态 |
|------|------|------|
| Docker 镜像 | 多阶段构建 Dockerfile (node:20-alpine)，Next.js standalone 输出模式 | ✅ |
| .dockerignore | 排除 node_modules/.next/.env.local 等构建无关文件 | ✅ |
| next.config.ts | `output: 'standalone'` + `typescript.ignoreBuildErrors: true` | ✅ |
| 微信云托管 | 代码库关联 GitHub → 自动构建 Docker 镜像 → 部署上线 | ✅ |
| 公网访问 | 微信云托管默认域名 + 自动 HTTPS | ✅ |
| Git 仓库 | GitHub: `gunbro999/mylife`，master 分支 | ✅ |
| 环境变量 | Web: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, DEEPSEEK_API_KEY | ✅ |
| 环境变量 | Cloud: 额外添加 SUPABASE_URL/SUPABASE_ANON_KEY (非NEXT_PUBLIC_前缀，供服务端运行时读取) | ✅ |
| 运行时配置 | layout.tsx 动态渲染 + `window.__MYLIFE_CONFIG__` 注入，解决 NEXT_PUBLIC_* 构建时内联问题 | ✅ |
| 中间件修复 | middleware.ts 使用 SUPABASE_URL/SUPABASE_ANON_KEY 做运行时离线检测 | ✅ |
| Bug 修复 | PWAProvider BeforeInstallPromptEvent 类型定义 | ✅ |
| Bug 修复 | search.ts Chapter/Character/WorldSetting 类型转换 | ✅ |
| Bug 修复 | package.json 缺失依赖补全 (@supabase/ssr, jszip, turndown等) | ✅ |

### 关键技术决策

**环境变量架构 (2026-05-18)**
- `NEXT_PUBLIC_*` 变量在 Next.js 构建时被内联到客户端 JS bundle 中，docker build 阶段拿不到
- 解决方案：服务端用非 `NEXT_PUBLIC_` 前缀变量（`SUPABASE_URL`/`SUPABASE_ANON_KEY`）在运行时读取
- 客户端通过 layout.tsx（强制动态渲染）注入 `window.__MYLIFE_CONFIG__` 全局变量
- 微信云托管需同时配置两套变量（NEXT_PUBLIC_ 用于编译时，普通变量用于运行时）

### 当前微信云托管环境变量清单

```
NEXT_PUBLIC_SUPABASE_URL    = (Supabase 项目 URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (Supabase anon publishable key)
SUPABASE_URL                = (同上，供服务端运行时读取)
SUPABASE_ANON_KEY           = (同上，供服务端运行时读取)
SUPABASE_SERVICE_ROLE_KEY   = (Supabase service_role secret)
DEEPSEEK_API_KEY            = (DeepSeek API Key)
```

---

## Phase 7: 管理员后台 ✅ 已完成 (2026-05-20)

| 模块 | 功能 | 状态 |
|------|------|------|
| 管理员识别 | Supabase `app_metadata.is_admin` 字段标记管理员身份 | ✅ |
| 路由保护 | Middleware 拦截 `/admin/*`，非管理员重定向首页 | ✅ |
| API 鉴权 | `/api/admin/*` 使用 `SUPABASE_SERVICE_ROLE_KEY`，绕过 RLS | ✅ |
| 后台入口 | TopBar 用户菜单新增「管理后台」入口（仅管理员可见） | ✅ |
| 仪表盘 | 4 统计卡片 + 用户增长柱状图 + 写作类型分布 + 最近用户/文章 | ✅ |
| 用户管理 | 列表/邮箱搜索/排序/分页 + 详情面板 + 禁用/启用/删除账号 + 查看用户内容 | ✅ |
| 内容管理 | 类型筛选/作者筛选/关键词搜索/排序/分页 + 只读预览 + 删除内容 | ✅ |
| 数据统计 | 时间范围选择 + 每日新增/写作量柱状图 + 类型分布 + 活跃时段热力图 + Top10排行榜 + CSV导出 | ✅ |
| 系统设置 | AI配置(提供商+模型) + 功能开关(开放注册/公开分享/AI助手/音乐/维护模式) + 平台公告管理 | ✅ |
| 个人账号管理 | 设置页新增修改密码 + 删除账号（二次确认弹窗） | ✅ |
| 数据库新增 | `app_settings` 键值配置表 + `announcements` 公告表 | ✅ |
| 部署上线 | GitHub Push → 微信云托管自动构建部署 → 公网可访问 | ✅ |

### 新增文件 (16个)

```
app/src/app/(admin)/layout.tsx              # 管理后台独立布局
app/src/app/(admin)/admin/page.tsx          # 仪表盘页面
app/src/app/(admin)/admin/users/page.tsx    # 用户管理页面
app/src/app/(admin)/admin/content/page.tsx  # 内容管理页面
app/src/app/(admin)/admin/stats/page.tsx    # 数据统计页面
app/src/app/(admin)/admin/settings/page.tsx # 系统设置页面
app/src/app/api/admin/overview/route.ts     # 仪表盘数据 API
app/src/app/api/admin/users/route.ts        # 用户管理 API
app/src/app/api/admin/content/route.ts      # 内容管理 API
app/src/app/api/admin/stats/route.ts        # 数据统计 API
app/src/app/api/admin/settings/route.ts     # 系统配置 API
app/src/components/admin/AdminSidebar.tsx   # 后台侧边栏
app/src/components/admin/StatsCard.tsx      # 统计卡片
app/src/components/admin/DataTable.tsx      # 数据表格
app/src/components/admin/UserDetailPanel.tsx # 用户详情面板
app/src/components/admin/ContentPreview.tsx  # 内容预览面板
app/src/stores/adminStore.ts               # 管理员状态管理
app/src/lib/supabase/admin.ts              # service_role 客户端
```

### 修改文件 (4个)

| 文件 | 变更 |
|------|------|
| `src/middleware.ts` | 增加 `/admin` 路由 `is_admin` 检查 |
| `src/lib/supabase/types.ts` | 新增 `app_settings`、`announcements` 表类型 |
| `src/components/layout/TopBar.tsx` | 管理员用户菜单新增后台入口 |
| `src/app/(main)/settings/page.tsx` | 新增修改密码、删除账号功能 |

---

## 新增功能 (2026-05-17)

### 全局搜索 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| 搜索逻辑 | `lib/search.ts` — 中文 bigram 分词 + 相关度评分 | ✅ |
| 搜索范围 | writings (title+content) / excerpts / novels / chapters / characters / world_settings / poems | ✅ |
| 搜索面板 | `Ctrl+K` 唤起 Command Palette 风格面板，实时下拉结果，按类型分组，键盘导航 | ✅ |
| 结果高亮 | 匹配关键词黄色高亮 (`<mark class="search-highlight">`) | ✅ |
| 全页搜索 | `/search` 页面 — 输入框 + 类型筛选 tabs + 完整结果列表 | ✅ |
| TopBar 集成 | 搜索输入框可输入关键词，按 Enter 跳转到搜索结果页 | ✅ |

### 写作模板 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| 内置模板 | 8 个预设模板：日常记录/感恩日记/反思复盘/读书笔记/观影笔记/旅行日志/技术文章/灵感速记 | ✅ |
| 模板选择弹窗 | 点击「新建日记/随笔」时弹出网格选择对话框，「空白开始」选项 | ✅ |
| 自定义模板 | `templateStore` — 用户可创建/编辑/删除自定义模板（localStorage 持久化） | ✅ |
| 模板预填 | 选择模板后自动创建 writing 并填充结构化 HTML 内容 + 预设标签 | ✅ |
| 模板定义 | `lib/templates.ts` — WritingTemplate 接口 (name/description/icon/type/content/tags) | ✅ |

### 编辑器图片支持 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| Tiptap Image 扩展 | `@tiptap/extension-image` 已安装并配置 (allowBase64, inline: false) | ✅ |
| 图片上传 | 点击工具栏图片按钮 → 文件选择器 → 上传到 Supabase Storage (或 fallback base64) | ✅ |
| 粘贴图片 | 监听 paste 事件，自动提取剪贴板中的图片并上传 | ✅ |
| 拖拽图片 | 监听 drop 事件，支持拖拽图片文件到编辑器 | ✅ |
| 图片压缩 | Canvas 压缩 (最大宽度 1920px, 质量 0.85) | ✅ |
| 工具栏更新 | Toolbar 和 BubbleMenu 新增图片按钮 (Image 图标) | ✅ |
| CSS 样式 | `.editor-image` 样式 (max-width 100%, border-radius, margin) | ✅ |
| 上传工具 | `lib/upload.ts` — 先尝试 Supabase Storage，失败则 fallback base64 内嵌 | ✅ |

### 数据导出 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| Markdown 导出 (单篇) | 日记/随笔编辑器顶部栏 Download 按钮，导出带 frontmatter 的 .md 文件 | ✅ |
| Markdown 导出 (批量) | 设置页：全部/仅日记/仅随笔 导出为 ZIP (使用 jszip) | ✅ |
| JSON 备份 | 设置页：导出完整 localStorage 数据为 JSON 文件 | ✅ |
| PDF 打印 | `lib/export.ts` — `printWriting()` 生成打印友好的 HTML 并调用 `window.print()` | ✅ |
| 设置页面 | `/settings` 页面 — 数据导出选项 + 写作统计 (各类型篇数/总字数) | ✅ |
| 侧边栏 | 新增「设置」导航项 (Settings 图标) | ✅ |
| 导出库 | `lib/export.ts` — turndown HTML→Markdown 转换 + 文件下载工具 | ✅ |

### PWA 支持 ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| manifest.json | 应用名称/图标/主题色/standalone 显示模式/中文 lang | ✅ |
| Service Worker | `public/sw.js` — 静态资源缓存优先，页面网络优先，离线回退缓存 | ✅ |
| PWA Meta 标签 | apple-mobile-web-app-capable / apple-touch-icon / theme-color | ✅ |
| 安装提示 | 监听 beforeinstallprompt，底部弹出安装卡片 (浮生记 logo + 安装按钮) | ✅ |
| PWAProvider | `components/layout/PWAProvider.tsx` — 注册 SW + 安装提示管理 | ✅ |
| Metadata | `layout.tsx` metadata 更新 (manifest/manifest.json/appleWebApp/themeColor) | ✅ |

### 微信小程序 (基础架构) ✅

| 模块 | 功能 | 状态 |
|------|------|------|
| 项目结构 | Taro + React 脚手架，package.json + project.config.json | ✅ |
| 页面路由 | 11 个页面：首页/日记/随笔/小说/心情/时间线/年报/诗词/摘录/设置/搜索 | ✅ |
| TabBar | 4 Tab：首页/写字/回顾/我的 | ✅ |
| API 层 | `lib/api.ts` — 15 个端点封装 (auth/writings/novels/excerpts/emotions/ai/search/upload) | ✅ |
| 微信登录 | `wx.login()` → API token 交换流程 | ✅ |
| 首页 | 诗意问候 + 统计卡片 + 快速操作 + 最近写作 | ✅ |
| 日记页 | 列表 + 新建表单 (心情/天气 Picker + Textarea) | ✅ |
| 随笔页 | 列表 + 新建表单 | ✅ |
| 时间线 | 类型筛选 tabs + 时间排序列表 | ✅ |
| 搜索 | 搜索输入 + 结果列表 | ✅ |
| 设置/我的 | 用户卡片 + 登录/退出 + 功能导航菜单 | ✅ |

### 待完成 (小程序)
| 模块 | 功能 | 状态 |
|------|------|------|
| 微信开发者工具 | 导入项目并配置 AppID | ⏳ 需用户操作 |
| 后端 API 对接 | 部署 Web 后端，配置 API_BASE 地址 | ⏳ 需用户操作 |

### 新增功能 (2026-05-18)

| 模块 | 功能 | 状态 |
|------|------|------|
| 微信登录页 | `/pages/login/index` — 微信/邮箱双模式登录 + mock开发模式 | ✅ |
| 富文本编辑器 | `components/editor/RichEditor.tsx` — `<Editor>` 原生组件 + 工具栏(粗体/斜体/标题/列表/图片/分割线/撤销) | ✅ |
| 编辑器模式切换 | 日记/随笔编辑页支持「纯文本」↔「富文本」一键切换 | ✅ |
| 分享卡片 | `lib/shareCard.ts` — Canvas 2D 绘制 8 种中国风配色 + 生成临时图片 + 分享/预览 | ✅ |
| 音乐播放 | `components/music/MusicPlayer.tsx` — `wx.getBackgroundAudioManager()` + 浮动按钮 + 播放面板(进度/暂停/拖动) | ✅ |
| AI 写作助手 | `components/ai/AiPanel.tsx` — 续写/改写/润色 三Tab + 风格选择 + 自定义指令 + 生成结果插入 | ✅ |
| 角色关系管理 | `pages/novels/relations` — 创建/删除角色关系 + 10 种关系类型 + 带颜色标签 | ✅ |
| 搜索增强 | 范围扩展至摘录/诗词 + 关键词黄色高亮 + 结果分类展示 | ✅ |
| 图表升级 | 年度报告 Canvas 热力图 + 写作类型分布条 + 时段渐变色 | ✅ |
| Auth Store | `stores/authStore.ts` — token/user/isLoggedIn 状态管理 + localStorage 持久化 | ✅ |
| 设置登录集成 | 设置页显示登录状态 + 登录/退出按钮 + 头像昵称 | ✅ |
