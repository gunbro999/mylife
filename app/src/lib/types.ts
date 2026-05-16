// ── Theme types ──

export type ThemeName = "ink" | "blue-porcelain" | "cinnabar" | "bamboo";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  description: string;
  emoji: string;
  previewColors: [string, string, string, string]; // [bg, text, accent, border]
}

export const THEME_CONFIG: Record<ThemeName, ThemeConfig> = {
  ink: {
    name: "ink",
    label: "水墨",
    description: "黑白极简，禅意留白",
    emoji: "🖌️",
    previewColors: ["#F8F5F0", "#2C2418", "#B84C3D", "#E0D5C5"],
  },
  "blue-porcelain": {
    name: "blue-porcelain",
    label: "青花",
    description: "蓝白相间，典雅清新",
    emoji: "🏺",
    previewColors: ["#F4F6FA", "#1B2435", "#3A5F8A", "#D3DCE8"],
  },
  cinnabar: {
    name: "cinnabar",
    label: "朱砂",
    description: "红黑辉映，热烈大气",
    emoji: "🧧",
    previewColors: ["#FBF5F2", "#2C1A1A", "#C34040", "#E6D2CE"],
  },
  bamboo: {
    name: "bamboo",
    label: "竹韵",
    description: "青绿盎然，自然宁静",
    emoji: "🎋",
    previewColors: ["#F3F6F1", "#1C2418", "#487A3E", "#D2DECC"],
  },
};

// ── Writing types ──

export type WritingType = "diary" | "essay" | "note";

export type EditorMode = "immersive" | "richtext" | "markdown";

export type Mood =
  | "happy"
  | "calm"
  | "sad"
  | "anxious"
  | "angry"
  | "grateful"
  | "excited"
  | "tired";

export const MOOD_CONFIG: Record<Mood, { emoji: string; label: string; color: string }> = {
  happy:    { emoji: "😊", label: "喜",  color: "#C9943E" },
  calm:     { emoji: "😌", label: "静",  color: "#5C8A6E" },
  sad:      { emoji: "😢", label: "哀",  color: "#3B4A6B" },
  anxious:  { emoji: "😰", label: "忧",  color: "#8B6E5A" },
  angry:    { emoji: "😤", label: "怒",  color: "#B84C3D" },
  grateful: { emoji: "🙏", label: "恩",  color: "#5C8A6E" },
  excited:  { emoji: "🤩", label: "兴",  color: "#D4956A" },
  tired:    { emoji: "😴", label: "倦",  color: "#9C8E7C" },
};

export type Weather = "sunny" | "cloudy" | "rainy" | "snowy" | "windy" | "foggy" | "stormy";

export const WEATHER_CONFIG: Record<Weather, { emoji: string; label: string }> = {
  sunny:  { emoji: "☀️", label: "晴" },
  cloudy: { emoji: "☁️", label: "云" },
  rainy:  { emoji: "🌧️", label: "雨" },
  snowy:  { emoji: "🌨️", label: "雪" },
  windy:  { emoji: "🌬️", label: "风" },
  foggy:  { emoji: "🌫️", label: "雾" },
  stormy: { emoji: "⛈️", label: "雷" },
};

export const NOTE_COLORS = [
  { name: "default", value: "var(--bg-elevated)" },
  { name: "vermillion", value: "#F9EEEC" },
  { name: "gold", value: "#F6F0E2" },
  { name: "jade", value: "#EAF2ED" },
  { name: "indigo", value: "#EBEEF4" },
  { name: "ink", value: "#F0EDEA" },
] as const;

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Writing {
  id: string;
  type: WritingType;
  title: string;
  content: string;
  wordCount: number;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  mood?: Mood;
  weather?: Weather;
  coverImage?: string;
  color?: string;
}

// ── Novel types ──

export type NovelStatus = "planning" | "writing" | "completed" | "paused";

export const NOVEL_STATUS_CONFIG: Record<NovelStatus, { label: string; color: string }> = {
  planning:   { label: "构思中", color: "#C9943E" },
  writing:    { label: "连载中", color: "#5C8A6E" },
  completed:  { label: "已完结", color: "#3B4A6B" },
  paused:     { label: "暂停中", color: "#9C8E7C" },
};

export interface Novel {
  id: string;
  title: string;
  description: string;
  coverEmoji: string;
  status: NovelStatus;
  targetWordCount: number;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  writingId: string;    // links to Writing for content
  title: string;
  sortOrder: number;
  parentChapterId: string | null;  // null = top-level, otherwise child of another chapter
  isVolume: boolean;    // true = volume/part header, not a writable chapter
  createdAt: string;
}

export interface Character {
  id: string;
  novelId: string;
  name: string;
  avatar: string;       // emoji
  role: string;         // e.g. 主角/配角/反派/路人
  gender: string;
  age: string;
  personality: string;
  appearance: string;
  background: string;
  notes: string;
}

export interface CharacterRelation {
  id: string;
  novelId: string;
  characterAId: string;
  characterBId: string;
  type: string;         // e.g. 挚友/恋人/仇敌/师徒/亲人/陌路
  description: string;
}

export const RELATION_TYPES = [
  "挚友", "恋人", "仇敌", "师徒", "亲人", "陌路", "盟友", "暗恋", "敬仰", "利用",
] as const;

export interface WorldSetting {
  id: string;
  novelId: string;
  category: string;     // e.g. 地理/历史/势力/种族/魔法/科技/文化
  title: string;
  content: string;
  sortOrder: number;
}

export const WORLD_CATEGORIES = [
  "地理", "历史", "势力", "种族", "魔法", "科技", "文化", "宗教", "政治", "其他",
] as const;

// ── Poetry types ──

export type Dynasty = "先秦" | "两汉" | "魏晋" | "南北朝" | "唐" | "五代" | "宋" | "元" | "明" | "清";

export type PoemType = "诗" | "词" | "曲" | "文";

export type TimeTag = "清晨" | "上午" | "正午" | "午后" | "黄昏" | "入夜" | "深夜" | "通用";

export type TermTag =
  | "立春" | "雨水" | "惊蛰" | "春分" | "清明" | "谷雨"
  | "立夏" | "小满" | "芒种" | "夏至" | "小暑" | "大暑"
  | "立秋" | "处暑" | "白露" | "秋分" | "寒露" | "霜降"
  | "立冬" | "小雪" | "大雪" | "冬至" | "小寒" | "大寒"
  | "春" | "夏" | "秋" | "冬" | "通用";

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
