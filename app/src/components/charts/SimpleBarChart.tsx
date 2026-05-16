"use client";

interface BarData {
  label: string;
  value: number;
  color?: string;
  extra?: string;
}

interface SimpleBarChartProps {
  data: BarData[];
  height?: number;
  maxValue?: number;
  showLabels?: boolean;
  barRadius?: number;
}

export function SimpleBarChart({
  data,
  height = 120,
  maxValue: maxOverride,
  showLabels = true,
  barRadius = 2,
}: SimpleBarChartProps) {
  if (!data.length) return null;

  const maxValue = maxOverride ?? Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.max(4, Math.floor(100 / data.length) - 1);
  const chartWidth = data.length * (barWidth + 2) + 10;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${Math.max(chartWidth, 200)} ${height + 20}`}
        className="w-full"
        style={{ minWidth: "100%" }}
      >
        {data.map((d, i) => {
          const barH = Math.max(2, (d.value / maxValue) * height);
          const x = i * (barWidth + 2) + 5;
          const y = height - barH;
          const color = d.color || "var(--accent)";

          return (
            <g key={d.label + i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={barRadius}
                fill={color}
                opacity={d.value > 0 ? 1 : 0.15}
                className="transition-all duration-300 hover:opacity-80"
              >
                <title>{d.label}: {d.value.toFixed(2)}{d.extra || ""}</title>
              </rect>
              {/* Label */}
              {showLabels && (i % Math.ceil(data.length / 7) === 0 || data.length <= 7) && (
                <text
                  x={x + barWidth / 2}
                  y={height + 14}
                  textAnchor="middle"
                  className="fill-text-tertiary"
                  fontSize="9"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
