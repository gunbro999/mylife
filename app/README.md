# 浮生记 (MyLife)

智能写作与生活记录平台 — 让每一次落笔，都成为一种享受。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS v4 + 中国风设计系统 (水墨/青花/朱砂/竹韵四主题)
- **编辑器**: Tiptap (沉浸式/富文本/Markdown 三模式)
- **状态管理**: Zustand + localStorage 持久化
- **后端**: Supabase (认证 + PostgreSQL + Storage)
- **AI**: 多提供商 (Claude / OpenAI / DeepSeek)
- **音乐**: 网易云音乐 / Spotify / 本地文件
- **容器化**: Docker (多阶段构建，node:20-alpine)

## 本地开发

```bash
# 安装依赖
npm ci

# 配置环境变量 (复制模板后填入你的 Key)
cp .env.local.example .env.local

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务端密钥 | 可选 |
| `DEEPSEEK_API_KEY` | DeepSeek AI (至少配一个AI) | 可选 |
| `ANTHROPIC_API_KEY` | Claude AI | 可选 |
| `OPENAI_API_KEY` | OpenAI | 可选 |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录 | 可选 |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Spotify 音乐 | 可选 |

不配置 Supabase 时，应用自动进入离线模式（数据存 localStorage）。

## Docker 构建

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  -t mylife .
docker run -p 3000:3000 mylife
```

## 部署

生产环境部署于**微信云托管**，通过 GitHub 仓库 `gunbro999/mylife` 自动构建。

详细部署方案见项目根目录 `PROGRESS.md` Phase 6。
