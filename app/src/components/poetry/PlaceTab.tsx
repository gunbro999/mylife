"use client";

import { useState, useEffect, useMemo } from "react";
import type { Poem } from "@/lib/types";
import { PoetryCard } from "./PoetryCard";
import { ChinaMap } from "./ChinaMap";
import { getProvinceTags } from "@/data/china-map";
import { usePoetryStore } from "@/stores/poetryStore";

export function PlaceTab() {
  const selectedProvince = usePoetryStore((s) => s.selectedProvince);
  const setSelectedProvince = usePoetryStore((s) => s.setSelectedProvince);
  const openDetail = usePoetryStore((s) => s.openDetail);
  const cache = usePoetryStore((s) => s.analysisCache);

  const [allPoems, setAllPoems] = useState<Poem[]>([]);

  useEffect(() => {
    import("@/data/poems.json").then((m) => setAllPoems(m.default as Poem[]));
  }, []);

  const filteredPoems = useMemo(() => {
    if (!selectedProvince) return allPoems;
    const tags = getProvinceTags(selectedProvince);
    return allPoems.filter((p) =>
      p.tags.places.some((place) =>
        tags.some((tag) => place.includes(tag) || tag.includes(place))
      )
    );
  }, [allPoems, selectedProvince]);

  return (
    <div>
      {/* Map */}
      <ChinaMap
        selectedProvince={selectedProvince}
        onSelectProvince={setSelectedProvince}
      />

      {/* Poem grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold font-display text-text">
            {selectedProvince
              ? `${selectedProvince} · 相关诗词 (${filteredPoems.length})`
              : `全部诗词 (${filteredPoems.length})`}
          </h3>
        </div>

        {filteredPoems.length === 0 ? (
          <p className="text-center text-text-muted py-12">
            {selectedProvince
              ? `暂无${selectedProvince}相关诗词，欢迎贡献`
              : "暂无诗词数据"}
          </p>
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
    </div>
  );
}
