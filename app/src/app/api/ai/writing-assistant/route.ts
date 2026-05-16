import { NextRequest, NextResponse } from "next/server";
import { callWritingAssistant } from "@/lib/ai/claude";
import {
  CONTINUE_WRITING_PROMPT,
  REWRITE_WRITING_PROMPT,
  POLISH_WRITING_PROMPT,
} from "@/lib/ai/prompts";
import type { AIWritingRequest, AIErrorResponse } from "@/lib/ai-types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AIWritingRequest;

    if (!body.action || !body.content) {
      return NextResponse.json(
        { error: "缺少必要参数", code: "CONTENT_TOO_SHORT" } satisfies AIErrorResponse,
        { status: 400 }
      );
    }

    if ((body.action === "rewrite" || body.action === "polish") && !body.selection) {
      return NextResponse.json(
        { error: "请先选中需要处理的文本", code: "CONTENT_TOO_SHORT" } satisfies AIErrorResponse,
        { status: 400 }
      );
    }

    const systemPrompt =
      body.action === "continue"
        ? CONTINUE_WRITING_PROMPT
        : body.action === "rewrite"
          ? REWRITE_WRITING_PROMPT
          : POLISH_WRITING_PROMPT;

    const result = await callWritingAssistant(body, systemPrompt);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知错误";
    const code = mapErrorCode(message);
    const status = code === "NOT_CONFIGURED" ? 401 : code === "RATE_LIMITED" ? 429 : 500;

    return NextResponse.json(
      { error: message, code } satisfies AIErrorResponse,
      { status }
    );
  }
}

function mapErrorCode(message: string): AIErrorResponse["code"] {
  if (message === "NOT_CONFIGURED") return "NOT_CONFIGURED";
  if (message === "RATE_LIMITED") return "RATE_LIMITED";
  if (message === "INVALID_KEY") return "INVALID_KEY";
  return "API_ERROR";
}
