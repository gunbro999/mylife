import { NextRequest, NextResponse } from "next/server";
import { POEM_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import type { AIErrorResponse, AIProviderId } from "@/lib/ai-types";
import type { PoemAnalysis } from "@/lib/types";
import { parseAIJsonResponse, AI_PROVIDER_ENDPOINTS, AI_PROVIDER_DEFAULT_MODELS } from "@/lib/ai/claude";

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
    const errText = await resp.text().catch(() => "");
    throw new Error(`API_ERROR: ${resp.status} ${errText.slice(0, 200)}`);
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
