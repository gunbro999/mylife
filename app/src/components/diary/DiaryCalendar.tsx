"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWritingStore } from "@/stores/writingStore";
import { type Mood } from "@/lib/types";

interface DiaryCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export function DiaryCalendar({ selectedDate, onSelectDate }: DiaryCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const writings = useWritingStore((s) => s.writings);

  const diaryMap = useMemo(() => {
    const map = new Map<string, { count: number; mood?: Mood }>();
    writings
      .filter((w) => w.type === "diary")
      .forEach((w) => {
        const dateKey = w.createdAt.slice(0, 10);
        const existing = map.get(dateKey);
        map.set(dateKey, {
          count: (existing?.count ?? 0) + 1,
          mood: w.mood ?? existing?.mood,
        });
      });
    return map;
  }, [writings]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  return (
    <div className="rounded-2xl border border-border bg-bg-elevated/80 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all"
        >
          <ChevronLeft size={15} />
        </button>
        <h3 className="text-sm font-display font-semibold text-text-primary tracking-widest">
          {format(currentMonth, "yyyy · M月", { locale: zhCN })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-all"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center h-8 text-[10px] font-display text-text-tertiary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const diary = diaryMap.get(dateKey);
          const inMonth = isSameMonth(day, currentMonth);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all duration-200",
                !inMonth && "text-text-tertiary/30",
                inMonth && !selected && "text-text-primary hover:bg-bg-secondary",
                selected && "bg-accent text-white font-medium",
                today && !selected && "font-bold text-accent"
              )}
            >
              {format(day, "d")}
              {diary && inMonth && (
                <span
                  className={cn(
                    "absolute bottom-0 h-1 w-1 rounded-full",
                    selected ? "bg-white/70" : "bg-vermillion"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
