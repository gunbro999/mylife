"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROVINCES, CHINA_MAP_VIEWBOX } from "@/data/china-map";

interface ChinaMapProps {
  selectedProvince: string | null;
  onSelectProvince: (name: string | null) => void;
}

export function ChinaMap({ selectedProvince, onSelectProvince }: ChinaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <svg
        viewBox={CHINA_MAP_VIEWBOX}
        className="w-full h-auto"
        role="img"
        aria-label="中国地图"
      >
        {PROVINCES.map((prov) => {
          const isSelected = selectedProvince === prov.name;
          const isHovered = hovered === prov.name;

          let fillColor: string;
          let fillOpacity: number;
          let strokeColor: string;
          let textFill: string;

          if (isSelected) {
            fillColor = "var(--vermillion)";
            fillOpacity = 0.3;
            strokeColor = "var(--vermillion)";
            textFill = "var(--vermillion)";
          } else if (isHovered) {
            fillColor = "var(--indigo-ink)";
            fillOpacity = 0.15;
            strokeColor = "var(--indigo-ink)";
            textFill = "var(--indigo-ink)";
          } else {
            fillColor = "var(--bg-elevated)";
            fillOpacity = 1;
            strokeColor = "var(--border-color)";
            textFill = "var(--text-tertiary)";
          }

          return (
            <g key={prov.name}>
              <path
                d={prov.path}
                style={{
                  fill: fillColor,
                  fillOpacity,
                  stroke: strokeColor,
                  strokeWidth: 1.5,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setHovered(prov.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  if (isSelected) {
                    onSelectProvince(null);
                  } else {
                    onSelectProvince(prov.name);
                  }
                }}
              />
              <text
                x={prov.center[0]}
                y={prov.center[1]}
                textAnchor="middle"
                style={{
                  fill: textFill,
                  fontSize: 10,
                  fontFamily: "var(--font-display)",
                  pointerEvents: "none",
                  userSelect: "none",
                  transition: "fill 0.2s ease",
                }}
              >
                {prov.name}
              </text>
            </g>
          );
        })}
      </svg>

      {hovered && selectedProvince !== hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded
                     bg-bg-elevated border border-border shadow-md text-[13px] text-text
                     font-display whitespace-nowrap"
        >
          点击查看{PROVINCES.find((p) => p.name === hovered)?.name}诗词
        </motion.div>
      )}

      {selectedProvince && (
        <div className="text-center mt-3">
          <button
            onClick={() => onSelectProvince(null)}
            className="text-[12px] text-text-muted/50 hover:text-text transition-colors"
          >
            清除选择，查看全部
          </button>
        </div>
      )}
    </div>
  );
}
