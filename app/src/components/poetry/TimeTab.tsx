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
