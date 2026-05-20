# MyLife 管理员模式 — 功能清单与说明文档

> 版本: v1.0  
> 日期: 2026-05-20  
> 状态: 已上线

---

## 一、更新功能清单

| # | 功能模块 | 功能点 | 说明 |
|---|---------|--------|------|
| 1 | **管理后台入口** | TopBar 用户菜单「管理后台」 | 管理员登录后，右上角用户菜单出现盾牌图标的「管理后台」入口 |
| 2 | **路由保护** | `/admin/*` 权限拦截 | 非管理员访问 `/admin` 自动重定向到首页，API 路由使用 service_role 鉴权 |
| 3 | **仪表盘** | 总览统计卡片 | 总用户数、今日新增、总写作数、今日活跃用户 |
| 4 | | 用户增长趋势图 | 近 30 天注册人数柱状图 |
| 5 | | 写作类型分布 | 日记/随笔/小记/小说占比横向条形图 |
| 6 | | 最近注册用户列表 | 最近 5 个注册用户信息 |
| 7 | | 最近写作列表 | 最近 5 篇写作内容 |
| 8 | **用户管理** | 用户列表 | 分页表格，显示头像、邮箱、注册时间、写作数、状态 |
| 9 | | 搜索/排序 | 按邮箱搜索，按最新/最早注册排序 |
| 10 | | 用户详情面板 | 右侧滑出面板，显示完整用户信息 |
| 11 | | 禁用/启用账号 | 管理员封禁或解封用户 |
| 12 | | 删除账号 | 删除用户及其所有关联数据（二次确认） |
| 13 | | 查看用户内容 | 跳转到内容管理页面，自动筛选该用户内容 |
| 14 | **内容管理** | 内容列表 | 分页表格，显示类型、标题、作者、字数、时间 |
| 15 | | 类型筛选 | 全部/日记/随笔/小记/小说标签切换 |
| 16 | | 搜索/排序 | 按标题/内容搜索，按最新/最早/最长排序 |
| 17 | | 内容预览 | 只读预览面板，显示文章标题、作者、字数、正文前 2000 字 |
| 18 | | 删除内容 | 删除违规内容（二次确认） |
| 19 | **数据统计** | 时间范围筛选 | 7天/30天/90天/全部 |
| 20 | | 每日新增用户柱状图 | 注册趋势可视化 |
| 21 | | 每日写作量柱状图 | 写作活跃度可视化 |
| 22 | | 写作类型分布图 | 饼图/横向条形图 |
| 23 | | 活跃时段热力图 | 7 天 × 24 小时热力图，显示用户写作高峰时段 |
| 24 | | Top 活跃用户排行榜 | 前 10 名写作量排行 |
| 25 | | CSV 报表导出 | 一键导出统计数据为 CSV 文件 |
| 26 | **系统设置** | AI 配置 | 设置默认 AI 提供商（Claude/OpenAI/DeepSeek）和默认模型 |
| 27 | | 功能开关 | 开放注册、公开分享、AI 助手、音乐推荐、维护模式的独立开关 |
| 28 | | 平台公告 | 发布/删除公告，列表展示，显示发布时间 |
| 29 | **个人账号管理** | 修改密码 | 设置页面新增密码修改卡片 |
| 30 | | 删除账号 | 用户自行删除账号及所有数据（二次确认弹窗） |

---

## 二、技术架构

### 管理员识别

通过 Supabase Auth 的 `app_metadata.is_admin` 字段识别管理员，普通用户无法修改此字段。

```
middleware → 读取 user.app_metadata.is_admin → 允许/拒绝 /admin 路由
```

### API 鉴权

- 所有 `/api/admin/*` 路由使用 `SUPABASE_SERVICE_ROLE_KEY` 创建 Supabase 客户端
- 绕过 RLS（Row-Level Security），可直接读取所有用户数据
- 核心封装文件：`src/lib/supabase/admin.ts`

### 数据库新增表

| 表名 | 用途 |
|------|------|
| `app_settings` | 系统配置键值存储（AI 提供商、功能开关等） |
| `announcements` | 平台公告列表 |

---

## 三、文件清单

### 新增文件 (16个)

**API 路由** (`src/app/api/admin/`)
- `overview/route.ts` — 仪表盘数据 GET
- `users/route.ts` — 用户列表 GET / 禁用启用 PATCH / 删除 DELETE
- `content/route.ts` — 内容列表 GET / 删除 DELETE
- `stats/route.ts` — 统计数据 GET
- `settings/route.ts` — 设置读写 GET/PUT/POST

**页面** (`src/app/(admin)/`)
- `layout.tsx` — 管理后台布局（侧边栏 + 内容区）
- `admin/page.tsx` — 仪表盘
- `admin/users/page.tsx` — 用户管理
- `admin/content/page.tsx` — 内容管理
- `admin/stats/page.tsx` — 数据统计
- `admin/settings/page.tsx` — 系统设置

**组件** (`src/components/admin/`)
- `AdminSidebar.tsx` — 后台侧边栏导航
- `StatsCard.tsx` — 通用统计卡片组件
- `DataTable.tsx` — 通用数据表格组件
- `UserDetailPanel.tsx` — 用户详情滑出面板
- `ContentPreview.tsx` — 内容只读预览面板

**其他**
- `src/stores/adminStore.ts` — 管理员页面状态管理（搜索、排序、分页）
- `src/lib/supabase/admin.ts` — 管理员 Supabase 客户端（service_role 模式）

### 修改文件 (4个)

| 文件 | 变更 |
|------|------|
| `src/middleware.ts` | 增加 `/admin` 路由的 `is_admin` 校验 |
| `src/lib/supabase/types.ts` | 新增 `app_settings`、`announcements` 数据库类型 |
| `src/components/layout/TopBar.tsx` | 用户菜单新增「管理后台」入口（对管理员可见） |
| `src/app/(main)/settings/page.tsx` | 新增「修改密码」和「删除账号」功能 |

---

## 四、部署步骤

### 1. 执行数据库建表

在 [Supabase SQL Editor](https://supabase.com/dashboard/project/cmadwcpoiaiglfyygsjh/sql/new) 执行：

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. 设置管理员

在 Supabase SQL Editor 执行（替换为实际邮箱）：

```sql
UPDATE auth.users SET raw_app_meta_data =
  raw_app_meta_data || '{"is_admin": true}'::jsonb
WHERE email = '1258884229@qq.com';
```

### 3. 确认环境变量

确保 `.env.local` 中存在：

```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

### 4. 重启应用

```bash
cd app && npm run dev
```
