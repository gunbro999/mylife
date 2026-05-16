import type { AIProviderId, AIWritingRequest, AIWritingResponse, EmotionAnalysisRequest, EmotionAnalysisResponse } from "@/lib/ai-types";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ── Provider dispatch ──

function buildMessages(
  provider: AIProviderId,
  systemPrompt: string,
  userContent: string
): { body: unknown; headers: Record<string, string> } {
  const isClaude = provider === "claude";

  if (isClaude) {
    return {
      body: {
        model: "",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      },
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    };
  }

  // OpenAI-compatible
  return {
    body: {
      model: "",
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    },
    headers: { "content-type": "application/json" },
  };
}

function parseResponse(provider: AIProviderId, data: Record<string, unknown>): string {
  if (provider === "claude") {
    const content = (data as { content?: Array<{ type: string; text: string }> }).content;
    if (content && content.length > 0 && content[0].type === "text") {
      return content[0].text;
    }
    throw new Error("Unexpected Claude response format");
  }

  // OpenAI-compatible
  const choices = (data as { choices?: Array<{ message?: { content?: string } }> }).choices;
  if (choices && choices.length > 0 && choices[0].message?.content) {
    return choices[0].message.content;
  }
  throw new Error("Unexpected API response format");
}

function getAuthHeader(provider: AIProviderId, apiKey: string): string | null {
  if (!apiKey) return null;
  return provider === "claude" ? apiKey : `Bearer ${apiKey}`;
}

function getAuthHeaderName(provider: AIProviderId): string {
  return provider === "claude" ? "x-api-key" : "authorization";
}

// ── Execute API call ──

async function executeCall(
  provider: AIProviderId,
  apiKey: string,
  endpoint: string,
  model: string,
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const { body, headers } = buildMessages(provider, systemPrompt, userContent);
  const resolvedBody = { ...(body as Record<string, unknown>), model };

  const authHeaderName = getAuthHeaderName(provider);
  const authHeaderValue = getAuthHeader(provider, apiKey);

  const allHeaders: Record<string, string> = { ...headers };
  if (authHeaderValue) {
    allHeaders[authHeaderName] = authHeaderValue;
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: allHeaders,
    body: JSON.stringify(resolvedBody),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("INVALID_KEY");
    }
    if (resp.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`API_ERROR: ${resp.status} ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  return parseResponse(provider, data as Record<string, unknown>);
}

// ── Public API ──

export async function callWritingAssistant(
  req: AIWritingRequest,
  systemPrompt: string
): Promise<AIWritingResponse> {
  const provider = req.provider;
  const apiKey = req.apiKey || getEnvKey(provider);
  if (!apiKey) {
    throw new Error("NOT_CONFIGURED");
  }

  const endpoint = req.endpoint || AI_PROVIDER_ENDPOINTS[provider];
  const model = req.model || AI_PROVIDER_DEFAULT_MODELS[provider];

  // Build user content based on action
  let userContent = "";
  const context = req.content.slice(-2000); // last 2000 chars for context
  const selection = req.selection || "";

  switch (req.action) {
    case "continue":
      userContent = `请根据以下文本的语境和风格，续写接下来的内容。\n\n创造力程度: ${req.creativity ?? 0.7}\n\n---\n\n${context}${context ? "\n\n---\n\n请从上述文本结束处自然续写:" : ""}`;
      break;
    case "rewrite":
      userContent = `请将以下文本改写为「${req.style || "literary"}」风格。\n\n---\n\n${selection}\n\n---\n\n请输出改写后的文本:`;
      break;
    case "polish":
      userContent = `请对以下文本进行${POLISH_TYPE_MAP[req.polishType || "full"]}。\n\n---\n\n${selection}\n\n---\n\n请输出优化后的文本:`;
      break;
  }

  const text = await executeCall(provider, apiKey, endpoint, model, systemPrompt, userContent);
  return { text };
}

export async function callEmotionAnalysis(
  req: EmotionAnalysisRequest,
  systemPrompt: string
): Promise<EmotionAnalysisResponse> {
  const provider = req.provider;
  const apiKey = req.apiKey || getEnvKey(provider);
  if (!apiKey) {
    throw new Error("NOT_CONFIGURED");
  }

  const endpoint = req.endpoint || AI_PROVIDER_ENDPOINTS[provider];
  const model = req.model || AI_PROVIDER_DEFAULT_MODELS[provider];

  const userContent = `请分析以下文字的情绪。\n\n日期: ${req.date}\n\n---\n\n${req.content.slice(0, 3000)}\n\n---\n\n请以JSON格式返回分析结果。`;

  const rawText = await executeCall(provider, apiKey, endpoint, model, systemPrompt, userContent);

  // Parse JSON from response (may be wrapped in markdown code block)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse emotion analysis JSON");
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed as EmotionAnalysisResponse;
}

// ── Helpers ──

const POLISH_TYPE_MAP: Record<string, string> = {
  grammar: "语法修正（修正错别字和语法错误，保持原意不变）",
  "word-choice": "用词优化（替换更精准优美的词汇，提升表达质感）",
  sentence: "句式调整（优化句子结构，增强可读性和节奏感）",
  full: "全面优化（综合语法修正、用词优化、句式调整）",
};

const AI_PROVIDER_ENDPOINTS: Record<AIProviderId, string> = {
  claude: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  custom: "",
};

const AI_PROVIDER_DEFAULT_MODELS: Record<AIProviderId, string> = {
  claude: "claude-sonnet-4-5",
  openai: "gpt-4o",
  deepseek: "deepseek-chat",
  custom: "default",
};

function getEnvKey(provider: AIProviderId): string | undefined {
  switch (provider) {
    case "claude": return process.env.ANTHROPIC_API_KEY;
    case "openai": return process.env.OPENAI_API_KEY;
    case "deepseek": return process.env.DEEPSEEK_API_KEY;
    default: return undefined;
  }
}
