import type { Mood } from "@/lib/types";
import { MOOD_CONFIG } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EmotionBadgeProps {
  mood: Mood;
  score?: number;
  size?: "sm" | "md" | "lg";
}

export function EmotionBadge({ mood, score, size = "md" }: EmotionBadgeProps) {
  const config = MOOD_CONFIG[mood];
  if (!config) return null;

  const sizeClasses = {
    sm: "text-xs gap-0.5 px-1.5 py-0.5",
    md: "text-xs gap-1 px-2 py-1",
    lg: "text-sm gap-1.5 px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium font-display",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: config.color + "18",
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-70 text-[10px]">{Math.round(score * 100)}%</span>
      )}
    </span>
  );
}
