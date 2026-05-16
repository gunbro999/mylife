// ── AI Provider types ──

export type AIProviderId = "claude" | "openai" | "deepseek" | "custom";

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  icon: string;
  description: string;
  defaultEndpoint: string;
  defaultModel: string;
  models: { id: string; name: string }[];
  apiKeyLabel: string;
  apiKeyHelp: string;
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderConfig> = {
  claude: {
    id: "claude",
    name: "Claude",
    icon: "🧠",
    description: "Anthropic Claude 系列，擅长创意写作与深度分析",
    defaultEndpoint: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-sonnet-4-5",
    models: [
      { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
      { id: "claude-opus-4-7", name: "Claude Opus 4.7" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
    ],
    apiKeyLabel: "Anthropic API Key",
    apiKeyHelp: "在 console.anthropic.com 创建",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "🤖",
    description: "OpenAI GPT 系列，通用能力均衡",
    defaultEndpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    ],
    apiKeyLabel: "OpenAI API Key",
    apiKeyHelp: "在 platform.openai.com 创建",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    icon: "🔍",
    description: "DeepSeek 系列，性价比优秀，中文能力强",
    defaultEndpoint: "https://api.deepseek.com/v1/chat/completions",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3" },
      { id: "deepseek-reasoner", name: "DeepSeek R1" },
      { id: "v4-pro", name: "V4 Pro" },
    ],
    apiKeyLabel: "DeepSeek API Key",
    apiKeyHelp: "在 platform.deepseek.com 创建",
  },
  custom: {
    id: "custom",
    name: "自定义",
    icon: "⚙️",
    description: "兼容 OpenAI 接口格式的自定义端点",
    defaultEndpoint: "https://your-api.example.com/v1/chat/completions",
    defaultModel: "default",
    models: [
      { id: "default", name: "默认模型" },
    ],
    apiKeyLabel: "API Key (可选)",
    apiKeyHelp: "留空则不发送认证头",
  },
};

// ── AI Action types ──

export type AIActionType = "continue" | "rewrite" | "polish";

export type WritingStyle = "formal" | "casual" | "literary" | "humorous";

export type PolishType = "grammar" | "word-choice" | "sentence" | "full";

export const WRITING_STYLES: { value: WritingStyle; label: string; icon: string; desc: string }[] = [
  { value: "formal", label: "正式", icon: "📄", desc: "公文信函风格，措辞严谨" },
  { value: "casual", label: "口语", icon: "💬", desc: "轻松自然如朋友谈心" },
  { value: "literary", label: "文艺", icon: "🎨", desc: "诗意盎然，典雅细腻" },
  { value: "humorous", label: "幽默", icon: "😄", desc: "风趣诙谐，妙趣横生" },
];

export const POLISH_TYPES: { value: PolishType; label: string; icon: string; desc: string }[] = [
  { value: "grammar", label: "语法修正", icon: "✅", desc: "修正错别字和语法错误" },
  { value: "word-choice", label: "用词优化", icon: "💎", desc: "替换更精准优美的词汇" },
  { value: "sentence", label: "句式调整", icon: "📐", desc: "优化句子结构增强可读性" },
  { value: "full", label: "全面优化", icon: "✨", desc: "综合以上全部能力" },
];

// ── API request/response types ──

export interface AIWritingRequest {
  provider: AIProviderId;
  apiKey: string;
  endpoint?: string;
  model?: string;
  action: AIActionType;
  content: string;
  selection?: string;
  style?: WritingStyle;
  creativity?: number;
  polishType?: PolishType;
}

export interface AIWritingResponse {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface AIErrorResponse {
  error: string;
  code: "NOT_CONFIGURED" | "RATE_LIMITED" | "CONTENT_TOO_SHORT" | "API_ERROR" | "INVALID_KEY";
}

export interface EmotionAnalysisRequest {
  provider: AIProviderId;
  apiKey: string;
  endpoint?: string;
  model?: string;
  content: string;
  date: string;
}

export interface EmotionAnalysisResponse {
  overallMood: import("./types").Mood;
  scores: { mood: import("./types").Mood; score: number; label: string }[];
  summary: string;
  musicTags: string[];
}
