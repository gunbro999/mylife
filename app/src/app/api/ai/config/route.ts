import { NextResponse } from "next/server";
import type { AIProviderId } from "@/lib/ai-types";
import { AI_PROVIDERS } from "@/lib/ai-types";

export async function GET() {
  const providers = Object.entries(AI_PROVIDERS).map(([id, config]) => {
    const envKey = getEnvKeyForProvider(id as AIProviderId);
    return {
      id,
      name: config.name,
      icon: config.icon,
      description: config.description,
      defaultModel: config.defaultModel,
      models: config.models,
      hasEnvKey: !!envKey,
      // Never expose the actual key, just whether it's configured
    };
  });

  return NextResponse.json({ providers });
}

function getEnvKeyForProvider(id: AIProviderId): string | undefined {
  switch (id) {
    case "claude": return process.env.ANTHROPIC_API_KEY;
    case "openai": return process.env.OPENAI_API_KEY;
    case "deepseek": return process.env.DEEPSEEK_API_KEY;
    default: return undefined;
  }
}
