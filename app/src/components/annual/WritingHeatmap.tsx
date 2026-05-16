"use client";

interface WritingHeatmapProps {
  data: Map<string, number>; // "2026-05-15" -> word count
  year: number;
}

const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS = ["一", "三", "五", "日"];

// Color intensity based on word count (0-4)
function getColor(level: number): string {
  switch (level) {
    case 0: return "var(--bg-secondary)";
    case 1: return "color-mix(in srgb, var(--accent) 20%, var(--bg-secondary))";
    case 2: return "color-mix(in srgb, var(--accent) 50%, var(--bg-secondary))";
    case 3: return "color-mix(in srgb, var(--accent) 75%, var(--bg-secondary))";
    case 4: return "var(--accent)";
    default: return "var(--bg-secondary)";
  }
}

function getLevel(count: number, max: number): number {
  if (count === 0) return 0;
  if (max === 0) return 0;
  const ratio = count / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

function daysInYear(year: number): number {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeap ? 366 : 365;
}

export function WritingHeatmap({ data, year }: WritingHeatmapProps) {
  const firstDay = new Date(year, 0, 1);
  const startDayOfWeek = firstDay.getDay(); // 0=Sun
  const totalDays = daysInYear(year);
  const numWeeks = Math.ceil((startDayOfWeek + totalDays) / 7);

  // Find max word count for color scaling
  let maxCount = 0;
  data.forEach((v) => { if (v > maxCount) maxCount = v; });

  const cellSize = 10;
  const cellGap = 2;
  const step = cellSize + cellGap;
  const padLeft = 32;
  const padTop = 0;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${padLeft + numWeeks * step + 10} ${padTop + 7 * step + 20}`}
        className="w-full"
        style={{ minWidth: `${padLeft + numWeeks * step + 10}px`, maxHeight: "150px" }}
      >
        {/* Month labels */}
        {MONTH_LABELS.map((label, mi) => {
          const monthStart = new Date(year, mi, 1);
          const dayOfYear = Math.floor(
            (monthStart.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)
          );
          const weekCol = Math.floor((startDayOfWeek + dayOfYear) / 7);
          if (weekCol < 0 || weekCol >= numWeeks) return null;
          return (
            <text
              key={label}
              x={padLeft + weekCol * step + cellSize / 2}
              y={padTop + 7 * step + 16}
              textAnchor="middle"
              className="fill-text-tertiary"
              fontSize="9"
            >
              {label}
            </text>
          );
        })}

        {/* Cells */}
        {Array.from({ length: numWeeks }, (_, col) =>
          Array.from({ length: 7 }, (_, row) => {
            const dayIndex = col * 7 + row - startDayOfWeek;
            if (dayIndex < 0 || dayIndex >= totalDays) return null;

            const date = new Date(year, 0, 1 + dayIndex);
            const dateStr = date.toISOString().slice(0, 10);
            const count = data.get(dateStr) || 0;
            const level = getLevel(count, maxCount);
            const x = padLeft + col * step;
            const y = padTop + row * step;

            return (
              <rect
                key={`${col}-${row}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(level)}
              >
                <title>
                  {dateStr}: {count} 字
                </title>
              </rect>
            );
          })
        )}

        {/* Weekday labels (show on left for a few rows) */}
        {WEEKDAYS.map((label, i) => {
          const row = i === 0 ? 0 : i === 1 ? 2 : i === 2 ? 4 : 6;
          return (
            <text
              key={label}
              x={4}
              y={padTop + row * step + cellSize - 1}
              className="fill-text-tertiary"
              fontSize="8"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2 text-[9px] text-text-tertiary">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div
            key={lvl}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: getColor(lvl) }}
          />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
