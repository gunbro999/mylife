"use client";

import { useRef, useCallback } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  compact?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ProgressBar({ currentTime, duration, onSeek, compact }: ProgressBarProps) {
  const sliderRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSeek(parseFloat(e.target.value));
    },
    [onSeek]
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-1.5 ${compact ? "px-0" : "px-1"}`}>
      {!compact && (
        <span className="text-[9px] text-text-tertiary w-8 text-right tabular-nums shrink-0">
          {formatTime(currentTime)}
        </span>
      )}
      <div className="relative flex-1 h-4 flex items-center">
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max={duration || 1}
          step="0.5"
          value={currentTime}
          onChange={handleChange}
          className="w-full h-1 rounded-full appearance-none cursor-pointer bg-bg-secondary accent-accent
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:opacity-0 [&:hover::-webkit-slider-thumb]:opacity-100
            [&::-webkit-slider-thumb]:transition-opacity"
          style={{
            background: `linear-gradient(to right, var(--color-accent, #3b82f6) ${progress}%, transparent ${progress}%)`,
          }}
        />
      </div>
      {!compact && (
        <span className="text-[9px] text-text-tertiary w-8 tabular-nums shrink-0">
          {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
