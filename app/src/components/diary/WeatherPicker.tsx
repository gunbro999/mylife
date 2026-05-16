"use client";

import { cn } from "@/lib/utils";
import { WEATHER_CONFIG, type Weather } from "@/lib/types";

interface WeatherPickerProps {
  value?: Weather;
  onChange: (weather: Weather) => void;
}

export function WeatherPicker({ value, onChange }: WeatherPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {(
        Object.entries(WEATHER_CONFIG) as [Weather, (typeof WEATHER_CONFIG)[Weather]][]
      ).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-200 border font-display",
            value === key
              ? "border-accent bg-accent-soft text-accent shadow-sm scale-105"
              : "border-border/60 text-text-secondary hover:border-accent/30 hover:bg-bg-secondary/50"
          )}
        >
          <span className="text-sm">{config.emoji}</span>
          <span className="tracking-wider">{config.label}</span>
        </button>
      ))}
    </div>
  );
}
