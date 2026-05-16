# 诗歌赏析功能 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在浮生记中新增诗歌赏析模块，支持时辰/节气/地点三维度诗词推荐 + AI 赏析 + SVG 中国地图

**Architecture:** 本地 JSON 数据层 → Zustand store → 组件树（PoetryCard/PoetryDetail/ChinaMap/SolarTermBadge → TimeTab/TermTab/PlaceTab → page.tsx）。AI 赏析走现有 executeCall 通道，解析后缓存至 localStorage。纯 SVG 实现中国地图，无外部依赖。

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, lucide-react

---

### Task 1: 诗词类型定义 + 数据文件骨架

**Files:**
- Modify: `src/lib/types.ts` (追加 Poetry 类型)
- Create: `src/data/poems.json`

- [ ] **Step 1: 在 types.ts 末尾追加诗词相关类型**

在 `src/lib/types.ts` 末尾追加：

```typescript
// ── Poetry types ──

export type Dynasty = "先秦" | "两汉" | "魏晋" | "南北朝" | "唐" | "五代" | "宋" | "元" | "明" | "清";

export type PoemType = "诗" | "词" | "曲" | "文";

export type TimeTag = "清晨" | "上午" | "正午" | "午后" | "黄昏" | "入夜" | "深夜" | "通用";

export type TermTag =
  | "立春" | "雨水" | "惊蛰" | "春分" | "清明" | "谷雨"
  | "立夏" | "小满" | "芒种" | "夏至" | "小暑" | "大暑"
  | "立秋" | "处暑" | "白露" | "秋分" | "寒露" | "霜降"
  | "立冬" | "小雪" | "大雪" | "冬至" | "小寒" | "大寒"
  | "春" | "夏" | "秋" | "冬";

export type PlaceTag = string;

export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: Dynasty;
  type: PoemType;
  content: string[];
  background?: string;
  notes?: Record<string, string>;
  tags: {
    time: TimeTag[];
    terms: TermTag[];
    places: PlaceTag[];
    moods: string[];
    objects: string[];
  };
}

export interface PoemAnalysis {
  appreciation: string;
  themes: string[];
  beauty: string;
}
```

- [ ] **Step 2: 创建 poems.json 种子数据**

创建 `src/data/poems.json`，含 50 首精选诗词覆盖所有标签维度：

```json
[
  {
    "id": "poem-001",
    "title": "春晓",
    "author": "孟浩然",
    "dynasty": "唐",
    "type": "诗",
    "content": ["春眠不觉晓", "处处闻啼鸟", "夜来风雨声", "花落知多少"],
    "background": "孟浩然隐居鹿门山时所作，描绘春日清晨的生机与诗人的闲适。",
    "notes": { "晓": "天亮", "闻": "听到" },
    "tags": {
      "time": ["清晨", "通用"],
      "terms": ["春", "惊蛰", "春分"],
      "places": ["湖北", "襄阳"],
      "moods": ["闲适", "惜春"],
      "objects": ["鸟", "花", "风", "雨"]
    }
  },
  {
    "id": "poem-002",
    "title": "静夜思",
    "author": "李白",
    "dynasty": "唐",
    "type": "诗",
    "content": ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
    "background": "李白客居扬州时所作，以明月寄乡愁。",
    "notes": { "疑": "好像", "举头": "抬头" },
    "tags": {
      "time": ["入夜", "深夜"],
      "terms": ["秋", "白露", "秋分"],
      "places": ["江苏", "扬州", "江南"],
      "moods": ["思乡", "孤独"],
      "objects": ["月", "霜"]
    }
  },
  {
    "id": "poem-003",
    "title": "登鹳雀楼",
    "author": "王之涣",
    "dynasty": "唐",
    "type": "诗",
    "content": ["白日依山尽", "黄河入海流", "欲穷千里目", "更上一层楼"],
    "background": "王之涣登临鹳雀楼时所作，气势磅礴。",
    "tags": {
      "time": ["午后", "黄昏", "通用"],
      "terms": ["通用"],
      "places": ["山西", "永济", "黄河"],
      "moods": ["豪放", "进取"],
      "objects": ["日", "山", "河", "楼"]
    }
  }
]
```

> 注：以上仅 3 首示例，实际计划执行时需写入至少 50 首，覆盖所有时辰标签、24 节气、主要省份。

- [ ] **Step 3: 验证 TypeScript 编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: 无新增类型错误

- [ ] **Step 4: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/lib/types.ts app/src/data/poems.json
git commit -m "feat: add poetry types and seed data (50 poems)"
```

---

### Task 2: 中国地图 SVG 数据 + 省份标签映射

**Files:**
- Create: `src/data/china-map.ts`

- [ ] **Step 1: 创建 china-map.ts**

```typescript
// SVG path data for each province (simplified outlines)
// Each province maps to search tags

export interface ProvinceData {
  name: string;       // 省份名，如 "河南"
  path: string;       // SVG path d attribute
  tags: string[];     // 搜索标签：省份名 + 历史地名/城市
  center: [number, number]; // [x, y] 标注文字位置
}

// SVG viewBox: "0 0 800 600"
export const PROVINCES: ProvinceData[] = [
  {
    name: "河南",
    path: "M 480 280 L 500 275 L 520 280 L 525 300 L 515 320 L 495 325 L 475 315 Z",
    tags: ["河南", "洛阳", "开封", "中原", "商丘", "郑州"],
    center: [500, 300],
  },
  {
    name: "陕西",
    path: "M 400 260 L 430 250 L 460 255 L 465 275 L 450 300 L 420 310 L 395 295 Z",
    tags: ["陕西", "长安", "西安", "咸阳", "秦岭", "终南山"],
    center: [425, 275],
  },
  {
    name: "江苏",
    path: "M 560 290 L 580 285 L 595 290 L 590 310 L 575 315 L 560 310 Z",
    tags: ["江苏", "南京", "苏州", "扬州", "江南", "金陵", "姑苏"],
    center: [578, 300],
  },
  {
    name: "浙江",
    path: "M 570 330 L 590 325 L 600 335 L 595 355 L 580 360 L 565 350 Z",
    tags: ["浙江", "杭州", "临安", "西湖", "钱塘", "江南", "绍兴"],
    center: [582, 342],
  },
  {
    name: "湖北",
    path: "M 480 320 L 505 315 L 525 320 L 520 345 L 500 355 L 480 350 Z",
    tags: ["湖北", "武汉", "襄阳", "荆州", "江夏", "楚地"],
    center: [502, 335],
  },
  {
    name: "湖南",
    path: "M 460 360 L 485 350 L 510 355 L 505 380 L 485 390 L 465 385 Z",
    tags: ["湖南", "长沙", "洞庭湖", "岳阳", "潇湘", "湘江"],
    center: [485, 370],
  },
  {
    name: "四川",
    path: "M 350 320 L 380 310 L 410 315 L 415 340 L 400 360 L 370 365 L 345 350 Z",
    tags: ["四川", "成都", "蜀地", "锦官城", "剑门关", "峨眉"],
    center: [380, 338],
  },
  {
    name: "广东",
    path: "M 490 430 L 520 420 L 545 425 L 540 450 L 515 455 L 490 450 Z",
    tags: ["广东", "广州", "岭南", "惠州", "潮州"],
    center: [515, 438],
  },
  {
    name: "山东",
    path: "M 540 240 L 565 235 L 580 240 L 575 265 L 555 270 L 535 260 Z",
    tags: ["山东", "济南", "泰山", "齐鲁", "青岛"],
    center: [558, 252],
  },
  {
    name: "河北",
    path: "M 500 200 L 530 195 L 555 200 L 560 220 L 540 235 L 510 230 Z",
    tags: ["河北", "北京", "燕赵", "幽州", "邯郸"],
    center: [525, 215],
  },
  {
    name: "山西",
    path: "M 440 230 L 470 220 L 500 225 L 495 250 L 470 260 L 445 255 Z",
    tags: ["山西", "太原", "并州", "恒山", "五台山"],
    center: [470, 242],
  },
  {
    name: "江西",
    path: "M 525 360 L 550 350 L 565 355 L 560 378 L 540 385 L 520 378 Z",
    tags: ["江西", "南昌", "庐山", "滕王阁", "浔阳", "江州"],
    center: [543, 368],
  },
  {
    name: "安徽",
    path: "M 530 300 L 555 295 L 570 300 L 565 320 L 545 328 L 525 320 Z",
    tags: ["安徽", "合肥", "黄山", "徽州", "宣城"],
    center: [548, 312],
  },
  {
    name: "福建",
    path: "M 565 370 L 585 365 L 595 375 L 590 398 L 570 405 L 560 390 Z",
    tags: ["福建", "福州", "泉州", "武夷山", "闽地"],
    center: [578, 385],
  },
  {
    name: "甘肃",
    path: "M 320 220 L 355 210 L 390 215 L 395 240 L 370 255 L 335 260 L 315 248 Z",
    tags: ["甘肃", "兰州", "凉州", "河西走廊", "玉门关", "敦煌", "塞外"],
    center: [355, 235],
  },
  {
    name: "云南",
    path: "M 330 400 L 365 390 L 395 395 L 400 420 L 375 435 L 340 430 Z",
    tags: ["云南", "昆明", "大理", "滇池", "南诏"],
    center: [365, 412],
  },
  {
    name: "新疆",
    path: "M 150 180 L 230 150 L 300 160 L 300 200 L 240 230 L 150 230 Z",
    tags: ["新疆", "西域", "天山", "轮台", "楼兰", "塞外"],
    center: [220, 195],
  },
  {
    name: "西藏",
    path: "M 150 280 L 240 260 L 320 280 L 310 340 L 220 370 L 150 350 Z",
    tags: ["西藏", "吐蕃", "雪域", "拉萨"],
    center: [230, 315],
  },
  {
    name: "内蒙古",
    path: "M 350 130 L 440 120 L 520 140 L 540 170 L 500 190 L 400 195 L 330 175 Z",
    tags: ["内蒙古", "塞外", "敕勒川", "阴山", "草原"],
    center: [435, 158],
  },
  {
    name: "黑龙江",
    path: "M 580 80 L 630 70 L 680 80 L 700 110 L 670 140 L 610 150 L 570 130 Z",
    tags: ["黑龙江", "哈尔滨", "松花江", "塞北"],
    center: [635, 108],
  },
  {
    name: "吉林",
    path: "M 620 130 L 660 120 L 700 130 L 690 160 L 650 175 L 610 165 Z",
    tags: ["吉林", "长春", "长白山"],
    center: [655, 148],
  },
  {
    name: "辽宁",
    path: "M 590 175 L 625 165 L 660 175 L 650 200 L 620 210 L 585 200 Z",
    tags: ["辽宁", "沈阳", "辽东", "大连"],
    center: [622, 190],
  },
  {
    name: "青海",
    path: "M 280 240 L 320 230 L 350 240 L 350 270 L 320 290 L 280 285 L 270 265 Z",
    tags: ["青海", "西宁", "青海湖", "河湟"],
    center: [312, 260],
  },
  {
    name: "宁夏",
    path: "M 380 220 L 400 212 L 430 218 L 425 238 L 405 245 L 380 240 Z",
    tags: ["宁夏", "银川", "西夏", "贺兰山"],
    center: [405, 228],
  },
  {
    name: "广西",
    path: "M 430 410 L 460 400 L 490 405 L 485 430 L 460 440 L 435 435 Z",
    tags: ["广西", "桂林", "南宁", "柳州", "岭南"],
    center: [460, 420],
  },
  {
    name: "贵州",
    path: "M 420 370 L 450 358 L 470 365 L 465 390 L 445 400 L 420 395 Z",
    tags: ["贵州", "贵阳", "黔地", "夜郎"],
    center: [445, 380],
  },
  {
    name: "海南",
    path: "M 480 470 L 515 460 L 535 465 L 530 485 L 500 490 L 480 485 Z",
    tags: ["海南", "琼州", "天涯海角", "儋州"],
    center: [508, 478],
  },
  {
    name: "台湾",
    path: "M 620 380 L 640 370 L 650 380 L 645 410 L 625 420 L 615 405 Z",
    tags: ["台湾", "台北", "台澎"],
    center: [633, 395],
  },
  {
    name: "重庆",
    path: "M 410 330 L 435 325 L 460 330 L 455 350 L 435 358 L 410 350 Z",
    tags: ["重庆", "巴渝", "渝州", "三峡"],
    center: [435, 342],
  },
  {
    name: "上海",
    path: "M 585 295 L 600 292 L 605 300 L 600 310 L 590 312 L 582 305 Z",
    tags: ["上海", "松江", "沪上"],
    center: [593, 302],
  },
  {
    name: "天津",
    path: "M 530 210 L 545 205 L 555 210 L 550 222 L 535 225 L 525 218 Z",
    tags: ["天津", "津门"],
    center: [540, 215],
  },
  {
    name: "北京",
    path: "M 515 195 L 535 188 L 545 195 L 540 210 L 525 215 L 512 205 Z",
    tags: ["北京", "燕京", "幽州", "京城"],
    center: [528, 202],
  },
];

export const CHINA_MAP_VIEWBOX = "0 0 800 600";

// Get province by name
export function getProvince(name: string): ProvinceData | undefined {
  return PROVINCES.find((p) => p.name === name);
}

// Get all tags for a province (for matching poems)
export function getProvinceTags(name: string): string[] {
  const p = getProvince(name);
  return p ? p.tags : [name];
}
```

> 注：以上 SVG path 为简化示意路径，实际执行时需替换为真实的中国省份轮廓 path 数据。

- [ ] **Step 2: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/data/china-map.ts
git commit -m "feat: add China map SVG data with province tag mappings"
```

---

### Task 3: poetryStore 状态管理

**Files:**
- Create: `src/stores/poetryStore.ts`

- [ ] **Step 1: 创建 poetryStore.ts**

```typescript
import { create } from "zustand";
import type { Poem, PoemAnalysis, TimeTag, TermTag } from "@/lib/types";

type PoetryTab = "time" | "term" | "place";

interface PoetryState {
  // Tab
  activeTab: PoetryTab;
  setActiveTab: (tab: PoetryTab) => void;

  // Time
  selectedTime: TimeTag | null; // null = auto-detect
  setSelectedTime: (time: TimeTag | null) => void;

  // Term
  selectedTerm: TermTag | null; // null = auto-detect
  setSelectedTerm: (term: TermTag | null) => void;

  // Place
  selectedProvince: string | null; // null = show all
  setSelectedProvince: (province: string | null) => void;

  // Detail modal
  selectedPoem: Poem | null;
  openDetail: (poem: Poem) => void;
  closeDetail: () => void;

  // AI analysis cache (in-memory, persisted to localStorage)
  analysisCache: Record<string, PoemAnalysis>;
  setCachedAnalysis: (poemId: string, analysis: PoemAnalysis) => void;
}

function loadCache(): Record<string, PoemAnalysis> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("poem-analysis-cache");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, PoemAnalysis>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("poem-analysis-cache", JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

export const usePoetryStore = create<PoetryState>()((set, get) => ({
  activeTab: "time",
  setActiveTab: (tab) => set({ activeTab: tab }),

  selectedTime: null,
  setSelectedTime: (time) => set({ selectedTime: time }),

  selectedTerm: null,
  setSelectedTerm: (term) => set({ selectedTerm: term }),

  selectedProvince: null,
  setSelectedProvince: (province) => set({ selectedProvince: province }),

  selectedPoem: null,
  openDetail: (poem) => set({ selectedPoem: poem }),
  closeDetail: () => set({ selectedPoem: null }),

  analysisCache: loadCache(),
  setCachedAnalysis: (poemId, analysis) => {
    const next = { ...get().analysisCache, [poemId]: analysis };
    saveCache(next);
    set({ analysisCache: next });
  },
}));
```

- [ ] **Step 2: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/stores/poetryStore.ts
git commit -m "feat: add poetryStore with tab/selection state and analysis cache"
```

---

### Task 4: AI 赏析 Prompt + API 路由

**Files:**
- Modify: `src/lib/ai/prompts.ts` (追加 POEM_ANALYSIS_PROMPT)
- Create: `src/app/api/ai/poem-analysis/route.ts`

- [ ] **Step 1: 在 prompts.ts 末尾追加诗词赏析 prompt**

在 `src/lib/ai/prompts.ts` 末尾追加：

```typescript
export const POEM_ANALYSIS_PROMPT = `你是一位精通中国古典诗词的文学鉴赏家。你的任务是对用户提供的诗词进行赏析，语言风格应优美典雅，兼具学术深度与情感共鸣。

要求：
- 赏析字数控制在 200-400 字
- 从意象运用、情感表达、艺术手法、历史背景等多个维度进行分析
- 语言具有中国传统文化韵味，但不可晦涩难懂
- themes 为主题关键词，2-5 个，用于关联推荐
- beauty 为一句精华点评（15字以内），点出此诗最动人之处

请严格按以下 JSON 格式返回（不要包含任何其他文字）：

{
  "appreciation": "赏析文字...",
  "themes": ["主题词1", "主题词2"],
  "beauty": "一句话精华点评"
}`;
```

- [ ] **Step 2: 创建 API 路由**

创建 `src/app/api/ai/poem-analysis/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { AIErrorResponse, AIProviderId } from "@/lib/ai-types";
import { POEM_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import { parseAIJsonResponse } from "@/lib/ai/claude";
import { AI_PROVIDER_ENDPOINTS, AI_PROVIDER_DEFAULT_MODELS } from "@/lib/ai/claude";

// Need to expose these from claude.ts — see Step 2b
// For now, inline a slim version of executeCall
import type { PoemAnalysis } from "@/lib/types";

interface PoemAnalysisRequest {
  provider: AIProviderId;
  apiKey: string;
  endpoint?: string;
  model?: string;
  title: string;
  author: string;
  dynasty: string;
  content: string[];
  background?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PoemAnalysisRequest;

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "缺少诗词信息", code: "API_ERROR" } satisfies AIErrorResponse,
        { status: 400 }
      );
    }

    const provider = body.provider;
    const apiKey = body.apiKey || getEnvKey(provider);
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 AI API Key", code: "NOT_CONFIGURED" } satisfies AIErrorResponse,
        { status: 401 }
      );
    }

    const endpoint = body.endpoint || AI_PROVIDER_ENDPOINTS[provider];
    const model = body.model || AI_PROVIDER_DEFAULT_MODELS[provider];

    const userContent = `请赏析以下诗词：

标题：《${body.title}》
作者：${body.author}
朝代：${body.dynasty}
${body.background ? `背景：${body.background}` : ""}

诗文：
${body.content.join("\n")}`;

    const rawText = await executePoemAnalysisCall(provider, apiKey, endpoint, model, userContent);

    const parsed = parseAIJsonResponse<PoemAnalysis>(rawText);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";

    if (message === "NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "未配置 AI API Key", code: "NOT_CONFIGURED" } satisfies AIErrorResponse,
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: message, code: "API_ERROR" } satisfies AIErrorResponse,
      { status: 500 }
    );
  }
}

function getEnvKey(provider: AIProviderId): string | undefined {
  switch (provider) {
    case "claude": return process.env.ANTHROPIC_API_KEY;
    case "openai": return process.env.OPENAI_API_KEY;
    case "deepseek": return process.env.DEEPSEEK_API_KEY;
    default: return undefined;
  }
}

// Inlined slim version — reuses the pattern from claude.ts
async function executePoemAnalysisCall(
  provider: AIProviderId,
  apiKey: string,
  endpoint: string,
  model: string,
  userContent: string
): Promise<string> {
  const isClaude = provider === "claude";

  const body: Record<string, unknown> = isClaude
    ? {
        model,
        max_tokens: 2048,
        system: POEM_ANALYSIS_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }
    : {
        model,
        max_tokens: 2048,
        messages: [
          { role: "system", content: POEM_ANALYSIS_PROMPT },
          { role: "user", content: userContent },
        ],
      };

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (isClaude) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["authorization"] = `Bearer ${apiKey}`;
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) throw new Error("INVALID_KEY");
    if (resp.status === 429) throw new Error("RATE_LIMITED");
    throw new Error(`API_ERROR: ${resp.status}`);
  }

  const data = await resp.json() as Record<string, unknown>;

  if (isClaude) {
    const content = (data as { content?: Array<{ type: string; text: string }> }).content;
    if (content && content.length > 0 && content[0].type === "text") {
      return content[0].text;
    }
  } else {
    const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
    if (choices && choices.length > 0 && choices[0].message?.content) {
      return choices[0].message.content;
    }
  }

  throw new Error("Unexpected API response format");
}
```

- [ ] **Step 3: 在 claude.ts 中导出 parseAIJsonResponse 和常量**

在 `src/lib/ai/claude.ts` 末尾追加：

```typescript
export function parseAIJsonResponse<T>(rawText: string): T {
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse JSON from AI response");
  return JSON.parse(jsonMatch[0]) as T;
}

export { AI_PROVIDER_ENDPOINTS, AI_PROVIDER_DEFAULT_MODELS };
```

- [ ] **Step 4: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: 无类型错误

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/lib/ai/prompts.ts app/src/lib/ai/claude.ts app/src/app/api/ai/poem-analysis/route.ts
git commit -m "feat: add poem-analysis API route with Claude-powered appreciation"
```

---

### Task 5: PoetryCard 组件

**Files:**
- Create: `src/components/poetry/PoetryCard.tsx`

- [ ] **Step 1: 创建 PoetryCard.tsx**

```typescript
"use client";

import { motion } from "framer-motion";
import type { Poem } from "@/lib/types";

interface PoetryCardProps {
  poem: Poem;
  beauty?: string; // AI 一句话精华（如有缓存则显示）
  onClick: () => void;
}

export function PoetryCard({ poem, beauty, onClick }: PoetryCardProps) {
  const previewLines = poem.content.slice(0, 4);
  const hasMore = poem.content.length > 4;

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left p-5 rounded-lg border border-border bg-bg-elevated
                 hover:border-vermillion/30 hover:shadow-md transition-all duration-200
                 group cursor-pointer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Top row: dynasty + type tags */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] px-2 py-0.5 rounded border border-border text-text-muted
                       font-display bg-bg-base">
          {poem.dynasty}
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded border border-vermillion/30
                       text-vermillion bg-vermillion/5 font-display">
          {poem.type}
        </span>
      </div>

      {/* Title & Author */}
      <h3 className="text-[17px] font-bold font-display text-text mb-1 group-hover:text-vermillion
                     transition-colors">
        《{poem.title}》
      </h3>
      <p className="text-[13px] text-text-muted mb-3">{poem.author}</p>

      {/* Content preview */}
      <div className="space-y-0.5 mb-3 text-[15px] text-text leading-relaxed font-serif">
        {previewLines.map((line, i) => (
          <p key={i}>{line}{i < previewLines.length - 1 && "，"}</p>
        ))}
        {hasMore && <p className="text-text-muted text-[13px]">...</p>}
      </div>

      {/* AI beauty line (if available) */}
      {beauty && (
        <p className="text-[13px] text-vermillion/80 italic border-t border-border pt-2 mt-2">
          {beauty}
        </p>
      )}

      {/* Hint */}
      <p className="text-[12px] text-text-muted/50 mt-2 group-hover:text-vermillion/60
                    transition-colors">
        点击展开赏析 →
      </p>
    </motion.button>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -30
```
Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/components/poetry/PoetryCard.tsx
git commit -m "feat: add PoetryCard component with preview and AI beauty line"
```

---

### Task 6: PoetryDetail 组件（展开详情 + AI 赏析）

**Files:**
- Create: `src/components/poetry/PoetryDetail.tsx`

- [ ] **Step 1: 创建 PoetryDetail.tsx**

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { usePoetryStore } from "@/stores/poetryStore";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import type { Poem, PoemAnalysis } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PoetryDetail() {
  const selectedPoem = usePoetryStore((s) => s.selectedPoem);
  const closeDetail = usePoetryStore((s) => s.closeDetail);
  const cache = usePoetryStore((s) => s.analysisCache);
  const setCachedAnalysis = usePoetryStore((s) => s.setCachedAnalysis);

  const selectedProvider = useAIConfigStore((s) => s.selectedProvider);
  const hasApiKey = useAIConfigStore((s) => !!s.apiKeys[s.selectedProvider]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PoemAnalysis | null>(null);

  const poem = selectedPoem;

  useEffect(() => {
    if (!poem) {
      setAnalysis(null);
      setError(null);
      return;
    }

    // Check cache
    const cached = cache[poem.id];
    if (cached) {
      setAnalysis(cached);
      setError(null);
      return;
    }

    // Try to generate
    if (hasApiKey) {
      generateAnalysis(poem);
    }
  }, [poem?.id]);

  async function generateAnalysis(poem: Poem) {
    setLoading(true);
    setError(null);
    const config = useAIConfigStore.getState().getActiveConfig();
    try {
      const resp = await fetch("/api/ai/poem-analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          endpoint: config.endpoint || undefined,
          model: config.model || undefined,
          title: poem.title,
          author: poem.author,
          dynasty: poem.dynasty,
          content: poem.content,
          background: poem.background,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "生成失败");
      }

      const data = (await resp.json()) as PoemAnalysis;
      setCachedAnalysis(poem.id, data);
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function handleRegenerate() {
    if (poem) generateAnalysis(poem);
  }

  return (
    <AnimatePresence>
      {poem && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
          />

          {/* Detail panel */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-[480px] max-w-[90vw]
                       bg-bg-base border-l border-border overflow-y-auto shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5
                          bg-bg-base/95 backdrop-blur-sm border-b border-border">
              <div>
                <span className="text-[11px] px-2 py-0.5 rounded border border-border
                               text-text-muted font-display mr-2">
                  {poem.dynasty}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded border border-vermillion/30
                               text-vermillion bg-vermillion/5 font-display">
                  {poem.type}
                </span>
              </div>
              <button
                onClick={closeDetail}
                className="w-8 h-8 flex items-center justify-center rounded
                         hover:bg-bg-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Title & Author */}
              <h2 className="text-2xl font-bold font-display text-text mb-1">
                《{poem.title}》
              </h2>
              <p className="text-[15px] text-text-muted mb-6">{poem.dynasty} · {poem.author}</p>

              {/* Full content */}
              <div className="space-y-2 mb-8 text-[18px] text-text leading-loose font-serif
                            text-center py-6 px-4 rounded-lg bg-bg-elevated border border-border">
                {poem.content.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {/* Background */}
              {poem.background && (
                <div className="mb-6">
                  <h4 className="text-[13px] font-bold font-display text-text-muted mb-2">
                    创作背景
                  </h4>
                  <p className="text-[14px] text-text-muted leading-relaxed">
                    {poem.background}
                  </p>
                </div>
              )}

              {/* Notes */}
              {poem.notes && Object.keys(poem.notes).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[13px] font-bold font-display text-text-muted mb-2">
                    注释
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(poem.notes).map(([word, note]) => (
                      <p key={word} className="text-[14px] text-text-muted">
                        <span className="font-bold text-text">{word}</span>：{note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {poem.tags.time.filter(t => t !== "通用").map((t) => (
                  <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-sky/10 text-sky
                                         font-display">{t}</span>
                ))}
                {poem.tags.moods.map((m) => (
                  <span key={m} className="text-[11px] px-2 py-0.5 rounded bg-amber/10 text-amber
                                         font-display">{m}</span>
                ))}
              </div>

              {/* AI Analysis */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold font-display text-text flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-vermillion" />
                    AI 赏析
                  </h3>
                  {analysis && (
                    <button
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="flex items-center gap-1 text-[12px] text-text-muted
                               hover:text-vermillion transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                      重新生成
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-text-muted py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[14px]">正在赏析...</span>
                  </div>
                )}

                {error && !analysis && (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-text-muted mb-2">
                      {error === "NOT_CONFIGURED"
                        ? "未配置 AI，无法生成赏析"
                        : `赏析生成失败：${error}`}
                    </p>
                    {error !== "NOT_CONFIGURED" && (
                      <button
                        onClick={handleRegenerate}
                        className="text-[13px] text-vermillion hover:underline"
                      >
                        重试
                      </button>
                    )}
                  </div>
                )}

                {analysis && !loading && (
                  <div>
                    <p className="text-[14px] text-text leading-relaxed whitespace-pre-line mb-4">
                      {analysis.appreciation}
                    </p>
                    {/* Beauty highlight */}
                    {analysis.beauty && (
                      <div className="px-4 py-3 rounded bg-vermillion/5 border border-vermillion/20
                                    text-center mb-4">
                        <p className="text-[14px] text-vermillion italic font-serif">
                          「{analysis.beauty}」
                        </p>
                      </div>
                    )}
                    {/* Themes */}
                    {analysis.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.themes.map((t) => (
                          <span key={t} className="text-[11px] px-2 py-0.5 rounded
                                          bg-bg-elevated border border-border text-text-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!analysis && !loading && !error && !hasApiKey && (
                  <p className="text-[14px] text-text-muted text-center py-8">
                    配置 AI 后可生成智能赏析
                  </p>
                )}
              </div>

              {/* Related poems */}
              {poem && <RelatedPoems poem={poem} onSelect={(p) => {/* handled by parent */}} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple related poems: match by same author, mood, or objects
function RelatedPoems({ poem, onSelect }: { poem: Poem; onSelect: (p: Poem) => void }) {
  const allPoems = useAllPoems();
  const openDetail = usePoetryStore((s) => s.openDetail);

  const related = allPoems
    .filter((p) => p.id !== poem.id)
    .map((p) => {
      let score = 0;
      if (p.author === poem.author) score += 3;
      p.tags.moods.forEach((m) => { if (poem.tags.moods.includes(m)) score += 2; });
      p.tags.objects.forEach((o) => { if (poem.tags.objects.includes(o)) score += 1; });
      return { poem: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((r) => r.poem);

  if (related.length === 0) return null;

  return (
    <div className="border-t border-border pt-6 mt-6">
      <h4 className="text-[13px] font-bold font-display text-text-muted mb-3">相关推荐</h4>
      <div className="space-y-2">
        {related.map((p) => (
          <button
            key={p.id}
            onClick={() => openDetail(p)}
            className="w-full text-left p-3 rounded border border-border hover:border-vermillion/30
                     hover:bg-bg-elevated transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-border
                             text-text-muted">{p.dynasty}</span>
              <span className="text-[14px] font-bold font-display text-text
                             group-hover:text-vermillion transition-colors">
                《{p.title}》
              </span>
            </div>
            <p className="text-[12px] text-text-muted">{p.author}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper hook: load all poems
function useAllPoems(): Poem[] {
  const [poems, setPoems] = useState<Poem[]>([]);
  useEffect(() => {
    import("@/data/poems.json").then((m) => setPoems(m.default as Poem[]));
  }, []);
  return poems;
}
```

- [ ] **Step 2: 检查 aiConfigStore 是否导出属性和方法**

检查 `src/stores/aiConfigStore.ts`，确认导出 `provider`、`apiKey`、`endpoint`、`model`。如缺少则补充 selector。

- [ ] **Step 3: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -40
```
Expected: 无类型错误（如 aiConfigStore 缺少导出则补充后重新编译）

- [ ] **Step 4: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/components/poetry/PoetryDetail.tsx
git commit -m "feat: add PoetryDetail slide-in panel with AI appreciation"
```

---

### Task 7: SolarTermBadge + ChinaMap 组件

**Files:**
- Create: `src/components/poetry/SolarTermBadge.tsx`
- Create: `src/components/poetry/ChinaMap.tsx`

- [ ] **Step 1: 创建 SolarTermBadge.tsx**

```typescript
"use client";

import type { TermTag } from "@/lib/types";

// 24 solar terms with approximate dates and descriptions
export const SOLAR_TERMS: { term: TermTag; date: string; meaning: string; phenology: string }[] = [
  { term: "立春", date: "2.3-2.5", meaning: "春季开始", phenology: "东风解冻，蛰虫始振，鱼陟负冰" },
  { term: "雨水", date: "2.18-2.20", meaning: "降雨开始，雨量渐增", phenology: "獭祭鱼，鸿雁来，草木萌动" },
  { term: "惊蛰", date: "3.5-3.7", meaning: "春雷始鸣，惊醒蛰伏", phenology: "桃始华，鸧鹒鸣，鹰化为鸠" },
  { term: "春分", date: "3.20-3.22", meaning: "昼夜平分", phenology: "玄鸟至，雷乃发声，始电" },
  { term: "清明", date: "4.4-4.6", meaning: "气清景明，万物皆显", phenology: "桐始华，田鼠化为鴽，虹始见" },
  { term: "谷雨", date: "4.19-4.21", meaning: "雨生百谷", phenology: "萍始生，鸣鸠拂其羽，戴胜降于桑" },
  { term: "立夏", date: "5.5-5.7", meaning: "夏季开始", phenology: "蝼蝈鸣，蚯蚓出，王瓜生" },
  { term: "小满", date: "5.20-5.22", meaning: "麦类等夏熟作物籽粒渐满", phenology: "苦菜秀，靡草死，麦秋至" },
  { term: "芒种", date: "6.5-6.7", meaning: "有芒作物成熟", phenology: "螳螂生，鹃始鸣，反舌无声" },
  { term: "夏至", date: "6.21-6.22", meaning: "白昼最长", phenology: "鹿角解，蜩始鸣，半夏生" },
  { term: "小暑", date: "7.6-7.8", meaning: "暑为炎热，小暑即小热", phenology: "温风至，蟋蟀居宇，鹰始鸷" },
  { term: "大暑", date: "7.22-7.24", meaning: "一年中最热时期", phenology: "腐草为萤，土润溽暑，大雨时行" },
  { term: "立秋", date: "8.7-8.9", meaning: "秋季开始", phenology: "凉风至，白露降，寒蝉鸣" },
  { term: "处暑", date: "8.22-8.24", meaning: "暑气消退", phenology: "鹰乃祭鸟，天地始肃，禾乃登" },
  { term: "白露", date: "9.7-9.9", meaning: "天气转凉，露凝而白", phenology: "鸿雁来，玄鸟归，群鸟养羞" },
  { term: "秋分", date: "9.22-9.24", meaning: "昼夜平分", phenology: "雷始收声，蛰虫坯户，水始涸" },
  { term: "寒露", date: "10.7-10.9", meaning: "露水更冷，即将结冰", phenology: "鸿雁来宾，雀入大水为蛤，菊有黄华" },
  { term: "霜降", date: "10.23-10.24", meaning: "天气渐冷，开始有霜", phenology: "豺乃祭兽，草木黄落，蛰虫咸俯" },
  { term: "立冬", date: "11.7-11.8", meaning: "冬季开始", phenology: "水始冰，地始冻，雉入大水为蜃" },
  { term: "小雪", date: "11.22-11.23", meaning: "开始降雪", phenology: "虹藏不见，天气上升，闭塞而成冬" },
  { term: "大雪", date: "12.6-12.8", meaning: "降雪量增多", phenology: "鹖鴠不鸣，虎始交，荔挺出" },
  { term: "冬至", date: "12.21-12.23", meaning: "白昼最短", phenology: "蚯蚓结，麋角解，水泉动" },
  { term: "小寒", date: "1.5-1.7", meaning: "开始进入最冷时期", phenology: "雁北乡，鹊始巢，雉始鸲" },
  { term: "大寒", date: "1.20-1.21", meaning: "一年中最冷时期", phenology: "鸡始乳，征鸟厉疾，水泽腹坚" },
];

// Get current solar term based on date
export function getCurrentSolarTerm(): TermTag | null {
  const now = new Date();
  const mmdd = `${now.getMonth() + 1}.${now.getDate()}`;

  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const [start] = SOLAR_TERMS[i].date.split("-");
    if (mmdd >= start) return SOLAR_TERMS[i].term;
  }
  // Before 立春: return 大寒
  return "大寒";
}

// Get season from solar term
export function getSeasonFromTerm(term: TermTag): TermTag {
  const springTerms: TermTag[] = ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨"];
  const summerTerms: TermTag[] = ["立夏", "小满", "芒种", "夏至", "小暑", "大暑"];
  const autumnTerms: TermTag[] = ["立秋", "处暑", "白露", "秋分", "寒露", "霜降"];
  const winterTerms: TermTag[] = ["立冬", "小雪", "大雪", "冬至", "小寒", "大寒"];

  if (springTerms.includes(term)) return "春";
  if (summerTerms.includes(term)) return "夏";
  if (autumnTerms.includes(term)) return "秋";
  if (winterTerms.includes(term)) return "冬";
  return "春";
}

interface SolarTermBadgeProps {
  term: TermTag;
  expanded?: boolean;
}

export function SolarTermBadge({ term, expanded = false }: SolarTermBadgeProps) {
  const info = SOLAR_TERMS.find((t) => t.term === term);
  if (!info) return null;

  return (
    <div className="text-center py-6 px-4 rounded-lg bg-bg-elevated border border-border">
      <div className="text-3xl mb-2">🌸</div>
      <h3 className="text-xl font-bold font-display text-text mb-1">{info.term}</h3>
      <p className="text-[13px] text-text-muted mb-1">{info.meaning}</p>
      {expanded && (
        <p className="text-[12px] text-text-muted/70 mt-2 leading-relaxed">
          物候：{info.phenology}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 ChinaMap.tsx**

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROVINCES, CHINA_MAP_VIEWBOX } from "@/data/china-map";
import { cn } from "@/lib/utils";

interface ChinaMapProps {
  selectedProvince: string | null;
  onSelectProvince: (name: string | null) => void;
}

export function ChinaMap({ selectedProvince, onSelectProvince }: ChinaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <svg
        viewBox={CHINA_MAP_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label="中国地图"
      >
        {PROVINCES.map((prov) => {
          const isSelected = selectedProvince === prov.name;
          const isHovered = hovered === prov.name;

          return (
            <g key={prov.name}>
              <path
                d={prov.path}
                className={cn(
                  "transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "fill-vermillion/30 stroke-vermillion"
                    : isHovered
                    ? "fill-indigo-ink/15 stroke-indigo-ink/50"
                    : "fill-bg-elevated stroke-border"
                )}
                strokeWidth="1.5"
                onMouseEnter={() => setHovered(prov.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (isSelected) {
                    onSelectProvince(null);
                  } else {
                    onSelectProvince(prov.name);
                  }
                }}
              />
              {/* Label */}
              <text
                x={prov.center[0]}
                y={prov.center[1]}
                textAnchor="middle"
                className={cn(
                  "text-[10px] font-display pointer-events-none select-none transition-colors",
                  isSelected
                    ? "fill-vermillion"
                    : isHovered
                    ? "fill-indigo-ink"
                    : "fill-text-muted"
                )}
              >
                {prov.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip on hover */}
      {hovered && selectedProvince !== hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded
                   bg-bg-elevated border border-border shadow text-[13px] text-text
                   font-display whitespace-nowrap"
        >
          点击查看{PROVINCES.find((p) => p.name === hovered)?.name}诗词
        </motion.div>
      )}

      {selectedProvince && (
        <div className="text-center mt-3">
          <button
            onClick={() => onSelectProvince(null)}
            className="text-[12px] text-text-muted hover:text-vermillion transition-colors"
          >
            清除选择，查看全部
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -40
```
Expected: 无类型错误

- [ ] **Step 4: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/components/poetry/SolarTermBadge.tsx app/src/components/poetry/ChinaMap.tsx
git commit -m "feat: add SolarTermBadge and interactive SVG ChinaMap components"
```

---

### Task 8: 三个 Tab 组件（TimeTab / TermTab / PlaceTab）

**Files:**
- Create: `src/components/poetry/TimeTab.tsx`
- Create: `src/components/poetry/TermTab.tsx`
- Create: `src/components/poetry/PlaceTab.tsx`

- [ ] **Step 1: 创建 TimeTab.tsx**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Poem, TimeTag } from "@/lib/types";
import { PoetryCard } from "./PoetryCard";
import { usePoetryStore } from "@/stores/poetryStore";
import { cn } from "@/lib/utils";

const TIME_PERIODS: { tag: TimeTag; hours: [number, number]; label: string; greeting: string; emoji: string }[] = [
  { tag: "清晨", hours: [5, 7], label: "清晨", greeting: "晨光熹微，宜读此诗", emoji: "☀️" },
  { tag: "上午", hours: [8, 11], label: "上午", greeting: "朝气蓬勃，诗以咏志", emoji: "🌤️" },
  { tag: "正午", hours: [12, 13], label: "正午", greeting: "日正当午，静读片刻", emoji: "☀️" },
  { tag: "午后", hours: [14, 17], label: "午后", greeting: "午后慵懒，诗意相伴", emoji: "🌿" },
  { tag: "黄昏", hours: [18, 19], label: "黄昏", greeting: "夕阳无限，诗意黄昏", emoji: "🌅" },
  { tag: "入夜", hours: [20, 22], label: "入夜", greeting: "华灯初上，夜读诗书", emoji: "🌙" },
  { tag: "深夜", hours: [23, 4], label: "深夜", greeting: "夜深人静，诗心澄明", emoji: "✨" },
];

function getCurrentTimeTag(): TimeTag {
  const hour = new Date().getHours();
  for (const p of TIME_PERIODS) {
    const [start, end] = p.hours;
    if (end >= start) {
      if (hour >= start && hour <= end) return p.tag;
    } else {
      // Wraps midnight (e.g., 23-4)
      if (hour >= start || hour <= end) return p.tag;
    }
  }
  return "通用";
}

export function TimeTab() {
  const selectedTime = usePoetryStore((s) => s.selectedTime);
  const setSelectedTime = usePoetryStore((s) => s.setSelectedTime);
  const openDetail = usePoetryStore((s) => s.openDetail);
  const cache = usePoetryStore((s) => s.analysisCache);

  const [allPoems, setAllPoems] = useState<Poem[]>([]);

  useEffect(() => {
    import("@/data/poems.json").then((m) => setAllPoems(m.default as Poem[]));
  }, []);

  const effectiveTime = selectedTime || getCurrentTimeTag();
  const currentPeriod = TIME_PERIODS.find((p) => p.tag === getCurrentTimeTag());

  const filteredPoems = useMemo(() => {
    return allPoems.filter((p) =>
      p.tags.time.includes(effectiveTime) || p.tags.time.includes("通用")
    );
  }, [allPoems, effectiveTime]);

  return (
    <div>
      {/* Header */}
      <div className="text-center py-8">
        <div className="text-3xl mb-2">{currentPeriod?.emoji || "📜"}</div>
        <h2 className="text-xl font-bold font-display text-text mb-1">
          {currentPeriod?.greeting || "诗韵时光"}
        </h2>
        <p className="text-[13px] text-text-muted">
          当前时段：{currentPeriod?.label || effectiveTime}
        </p>
      </div>

      {/* Time period switcher */}
      <div className="flex justify-center gap-1.5 mb-6 overflow-x-auto pb-2">
        {TIME_PERIODS.map((p) => (
          <button
            key={p.tag}
            onClick={() => setSelectedTime(selectedTime === p.tag ? null : p.tag)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-display transition-all",
              effectiveTime === p.tag
                ? "bg-vermillion text-white"
                : "bg-bg-elevated text-text-muted border border-border hover:border-vermillion/30"
            )}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Poem grid */}
      {filteredPoems.length === 0 ? (
        <p className="text-center text-text-muted py-12">暂无此时辰的诗词</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPoems.map((poem) => (
            <PoetryCard
              key={poem.id}
              poem={poem}
              beauty={cache[poem.id]?.beauty}
              onClick={() => openDetail(poem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建 TermTab.tsx**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Poem, TermTag } from "@/lib/types";
import { PoetryCard } from "./PoetryCard";
import { SolarTermBadge, getCurrentSolarTerm, getSeasonFromTerm, SOLAR_TERMS } from "./SolarTermBadge";
import { usePoetryStore } from "@/stores/poetryStore";
import { cn } from "@/lib/utils";

export function TermTab() {
  const selectedTerm = usePoetryStore((s) => s.selectedTerm);
  const setSelectedTerm = usePoetryStore((s) => s.setSelectedTerm);
  const openDetail = usePoetryStore((s) => s.openDetail);
  const cache = usePoetryStore((s) => s.analysisCache);

  const [allPoems, setAllPoems] = useState<Poem[]>([]);

  useEffect(() => {
    import("@/data/poems.json").then((m) => setAllPoems(m.default as Poem[]));
  }, []);

  const currentTerm = getCurrentSolarTerm();
  const effectiveTerm = selectedTerm || currentTerm;

  const filteredPoems = useMemo(() => {
    if (!effectiveTerm) return [];
    const season = getSeasonFromTerm(effectiveTerm);
    return allPoems.filter((p) =>
      p.tags.terms.includes(effectiveTerm) || p.tags.terms.includes(season)
    );
  }, [allPoems, effectiveTerm]);

  const seasonalTerms = useMemo(() => {
    if (!currentTerm) return SOLAR_TERMS;
    const season = getSeasonFromTerm(currentTerm);
    const allTerms = SOLAR_TERMS.map((t) => t.term);
    const seasons: Record<TermTag, TermTag[]> = {
      "春": ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨"],
      "夏": ["立夏", "小满", "芒种", "夏至", "小暑", "大暑"],
      "秋": ["立秋", "处暑", "白露", "秋分", "寒露", "霜降"],
      "冬": ["立冬", "小雪", "大雪", "冬至", "小寒", "大寒"],
    };
    // Return terms, with current season's terms first
    const currentSeasonTerms = seasons[season] || [];
    const otherTerms = allTerms.filter((t) => !currentSeasonTerms.includes(t));
    return [...currentSeasonTerms, ...otherTerms].map(
      (t) => SOLAR_TERMS.find((st) => st.term === t)!
    ).filter(Boolean);
  }, [currentTerm]);

  return (
    <div>
      {/* Current term badge */}
      {effectiveTerm && <SolarTermBadge term={effectiveTerm} expanded />}

      {/* Term switcher */}
      <div className="flex flex-wrap justify-center gap-1.5 my-6">
        {seasonalTerms.slice(0, 12).map(({ term }) => (
          <button
            key={term}
            onClick={() => setSelectedTerm(selectedTerm === term ? null : term)}
            className={cn(
              "px-2.5 py-1 rounded text-[11px] font-display transition-all",
              effectiveTerm === term
                ? "bg-vermillion text-white"
                : "bg-bg-elevated text-text-muted border border-border hover:border-vermillion/30"
            )}
          >
            {term}
          </button>
        ))}
      </div>

      {/* Poem grid */}
      {filteredPoems.length === 0 ? (
        <p className="text-center text-text-muted py-12">暂无此节气的诗词</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPoems.map((poem) => (
            <PoetryCard
              key={poem.id}
              poem={poem}
              beauty={cache[poem.id]?.beauty}
              onClick={() => openDetail(poem)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建 PlaceTab.tsx**

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Poem } from "@/lib/types";
import { PoetryCard } from "./PoetryCard";
import { ChinaMap } from "./ChinaMap";
import { getProvinceTags } from "@/data/china-map";
import { usePoetryStore } from "@/stores/poetryStore";

export function PlaceTab() {
  const selectedProvince = usePoetryStore((s) => s.selectedProvince);
  const setSelectedProvince = usePoetryStore((s) => s.setSelectedProvince);
  const openDetail = usePoetryStore((s) => s.openDetail);
  const cache = usePoetryStore((s) => s.analysisCache);

  const [allPoems, setAllPoems] = useState<Poem[]>([]);

  useEffect(() => {
    import("@/data/poems.json").then((m) => setAllPoems(m.default as Poem[]));
  }, []);

  const filteredPoems = useMemo(() => {
    if (!selectedProvince) return allPoems;
    const tags = getProvinceTags(selectedProvince);
    return allPoems.filter((p) =>
      p.tags.places.some((place) =>
        tags.some((tag) => place.includes(tag) || tag.includes(place))
      )
    );
  }, [allPoems, selectedProvince]);

  return (
    <div>
      {/* Map */}
      <ChinaMap
        selectedProvince={selectedProvince}
        onSelectProvince={setSelectedProvince}
      />

      {/* Poem grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold font-display text-text">
            {selectedProvince
              ? `${selectedProvince} · 相关诗词 (${filteredPoems.length})`
              : `全部诗词 (${filteredPoems.length})`}
          </h3>
        </div>

        {filteredPoems.length === 0 ? (
          <p className="text-center text-text-muted py-12">
            {selectedProvince
              ? `暂无${selectedProvince}相关诗词，欢迎贡献`
              : "暂无诗词数据"}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPoems.map((poem) => (
              <PoetryCard
                key={poem.id}
                poem={poem}
                beauty={cache[poem.id]?.beauty}
                onClick={() => openDetail(poem)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -40
```
Expected: 无类型错误

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/components/poetry/TimeTab.tsx app/src/components/poetry/TermTab.tsx app/src/components/poetry/PlaceTab.tsx
git commit -m "feat: add TimeTab, TermTab, PlaceTab with filtering logic"
```

---

### Task 9: /poetry 页面 + 侧边栏导航修改

**Files:**
- Create: `src/app/(main)/poetry/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx` (新增导航项)

- [ ] **Step 1: 创建 /poetry 页面**

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePoetryStore } from "@/stores/poetryStore";
import { TimeTab } from "@/components/poetry/TimeTab";
import { TermTab } from "@/components/poetry/TermTab";
import { PlaceTab } from "@/components/poetry/PlaceTab";
import { PoetryDetail } from "@/components/poetry/PoetryDetail";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "time" as const, label: "时辰", icon: "☀️" },
  { key: "term" as const, label: "节气", icon: "🌸" },
  { key: "place" as const, label: "地方", icon: "🗺️" },
];

export default function PoetryPage() {
  const activeTab = usePoetryStore((s) => s.activeTab);
  const setActiveTab = usePoetryStore((s) => s.setActiveTab);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-text mb-2">
          📜 诗歌赏析
        </h1>
        <p className="text-[14px] text-text-muted">
          按时辰、节气、地方，品读千年诗意
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center gap-1 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2 rounded-lg text-[14px] font-display transition-all duration-200",
              activeTab === tab.key
                ? "bg-vermillion text-white shadow-sm"
                : "bg-bg-elevated text-text-muted border border-border hover:border-vermillion/30"
            )}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "time" && <TimeTab />}
          {activeTab === "term" && <TermTab />}
          {activeTab === "place" && <PlaceTab />}
        </motion.div>
      </AnimatePresence>

      {/* Poetry detail panel */}
      <PoetryDetail />
    </div>
  );
}
```

- [ ] **Step 2: 修改 Sidebar.tsx 新增「诗」导航项**

在 `src/components/layout/Sidebar.tsx` 中：

修改 import 添加 `ScrollText` 图标：
```typescript
import {
  BookOpen,
  PenLine,
  StickyNote,
  BookText,
  Home,
  Heart,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  BarChart3,
  ScrollText,   // ← 新增
} from "lucide-react";
```

修改 NAV_ITEMS 数组，在最后追加：
```typescript
const NAV_ITEMS = [
  // ... existing items ...
  { href: "/annual-report", icon: BarChart3, label: "览", sublabel: "年报" },
  { href: "/poetry", icon: ScrollText, label: "诗", sublabel: "赏诗" },  // ← 新增
];
```

- [ ] **Step 3: 验证编译**

```bash
cd /mnt/d/linux/mylife/app && npx tsc --noEmit --pretty 2>&1 | head -40
```
Expected: 无类型错误

- [ ] **Step 4: 启动开发服务器验证页面渲染**

```bash
cd /mnt/d/linux/mylife/app && npm run dev &
sleep 5
# 检查页面是否可以访问
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/poetry
```
Expected: 返回 200

- [ ] **Step 5: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/app/\(main\)/poetry/page.tsx app/src/components/layout/Sidebar.tsx
git commit -m "feat: add /poetry page with 3-tab layout and sidebar navigation"
```

---

### Task 10: 端到端验证 + 完整种子数据

**Files:**
- Modify: `src/data/poems.json` (补充至 200+ 首)

- [ ] **Step 1: 扩展 poems.json 至 200+ 首**

确保覆盖：
- 所有 7 个时辰标签各至少 5 首
- 所有 24 节气各至少 2 首
- 所有主要省份（25+）各至少 3 首
- 诗/词/曲/文 四种类型齐全
- 从先秦到清十个朝代都有覆盖

- [ ] **Step 2: 手动验证功能**

在浏览器中执行以下检查：
1. 访问 `/poetry`，确认三 Tab 切换正常
2. 时辰 Tab：当前时段自动检测正确，手动切换有效
3. 节气 Tab：当前节气显示正确，切换节气过滤有效
4. 地方 Tab：地图渲染正常，省份 hover/点击交互有效
5. 点击诗词卡片：详情 panel 滑入正常
6. 配置 AI 后：赏析生成正常，缓存生效
7. 未配置 AI：降级显示正常（仅显示背景和注释）
8. 中国风主题适配：切换水墨/青花/朱砂/竹韵主题，诗歌页面颜色跟随

- [ ] **Step 3: Commit**

```bash
cd /mnt/d/linux/mylife && git add app/src/data/poems.json
git commit -m "feat: expand poems seed data to 200+ entries covering all dimensions"
```
