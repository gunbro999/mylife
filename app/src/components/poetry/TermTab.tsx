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

  const displayableTerms = useMemo(() => {
    if (!currentTerm) return SOLAR_TERMS;
    const season = getSeasonFromTerm(currentTerm);
    const seasons: Partial<Record<TermTag, TermTag[]>> = {
      "春": ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨"],
      "夏": ["立夏", "小满", "芒种", "夏至", "小暑", "大暑"],
      "秋": ["立秋", "处暑", "白露", "秋分", "寒露", "霜降"],
      "冬": ["立冬", "小雪", "大雪", "冬至", "小寒", "大寒"],
    };
    const currentSeasonTerms = seasons[season] || [];
    const otherTerms = SOLAR_TERMS.map((t) => t.term).filter(
      (t): t is TermTag => t !== "春" && t !== "夏" && t !== "秋" && t !== "冬" && !currentSeasonTerms.includes(t)
    );
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
        {displayableTerms.slice(0, 12).map(({ term }) => (
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
