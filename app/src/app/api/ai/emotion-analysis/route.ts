import { NextRequest, NextResponse } from "next/server";
import { callEmotionAnalysis } from "@/lib/ai/claude";
import { EMOTION_ANALYSIS_PROMPT } from "@/lib/ai/prompts";
import type { EmotionAnalysisRequest, AIErrorResponse } from "@/lib/ai-types";
import { MOOD_CONFIG } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EmotionAnalysisRequest;

    if (!body.content || body.content.length < 50) {
      return NextResponse.json(
        { error: "内容不足，至少需要50字才能分析情绪", code: "CONTENT_TOO_SHORT" } satisfies AIErrorResponse,
        { status: 400 }
      );
    }

    const result = await callEmotionAnalysis(body, EMOTION_ANALYSIS_PROMPT);

    // Validate the returned mood
    if (!MOOD_CONFIG[result.overallMood]) {
      // Fallback: find the closest valid mood
      const validMoods = Object.keys(MOOD_CONFIG);
      result.overallMood = result.scores[0]?.mood && MOOD_CONFIG[result.scores[0].mood]
        ? result.scores[0].mood
        : "calm";
    }

    // Filter only valid mood scores
    result.scores = result.scores.filter((s) => MOOD_CONFIG[s.mood]);

    return NextResponse.json(result);
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
