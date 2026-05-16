"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, CalendarDays, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWritingStore } from "@/stores/writingStore";
import { DiaryCalendar } from "@/components/diary/DiaryCalendar";
import { DiaryCard } from "@/components/diary/DiaryCard";

export default function DiaryPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const writings = useWritingStore((s) => s.writings);
  const addWriting = useWritingStore((s) => s.addWriting);

  const diaries = useMemo(
    () =>
      writings
        .filter((w) => w.type === "diary")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [writings]
  );

  const filteredDiaries = useMemo(() => {
    if (viewMode === "list") return diaries;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return diaries.filter((d) => d.createdAt.startsWith(dateStr));
  }, [diaries, selectedDate, viewMode]);

  const handleNewDiary = () => {
    const writing = addWriting("diary", {
      title: format(new Date(), "yyyy年M月d日"),
    });
    router.push(`/diary/${writing.id}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">日 记</h1>
          <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
            岁月留痕，笔墨生香
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border bg-bg-secondary/50 p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                viewMode === "calendar"
                  ? "bg-bg-elevated text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <CalendarDays size={13} />
              历
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all",
                viewMode === "list"
                  ? "bg-bg-elevated text-text-primary shadow-sm"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <List size={13} />
              列
            </button>
          </div>
          <button
            onClick={handleNewDiary}
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md"
          >
            <Plus size={14} />
            写日记
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={cn("gap-8", viewMode === "calendar" ? "grid grid-cols-1 lg:grid-cols-[300px_1fr]" : "")}>
        {viewMode === "calendar" && (
          <div>
            <DiaryCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        )}

        <div>
          {viewMode === "calendar" && (
            <div className="cn-divider text-[11px] font-display tracking-[0.2em] mb-4">
              {format(selectedDate, "M月d日")}
              {filteredDiaries.length > 0 && ` · ${filteredDiaries.length}篇`}
            </div>
          )}

          <AnimatePresence mode="wait">
            {filteredDiaries.length > 0 ? (
              <motion.div
                key="list"
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredDiaries.map((diary) => (
                  <DiaryCard key={diary.id} writing={diary} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
                  此日无记
                </p>
                <p className="text-xs text-text-tertiary mb-6">
                  点击按钮，记录今天的故事
                </p>
                <button
                  onClick={handleNewDiary}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90"
                >
                  <Plus size={14} />
                  开始记录
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
