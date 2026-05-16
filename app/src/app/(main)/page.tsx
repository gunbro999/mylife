"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PenLine, StickyNote, Plus } from "lucide-react";
import { useWritingStore } from "@/stores/writingStore";
import { MoodDailyReport } from "@/components/emotion/MoodDailyReport";
import { formatDate, truncate } from "@/lib/utils";
import { MOOD_CONFIG } from "@/lib/types";
import type { Writing } from "@/lib/types";

const POETRY = [
  "人生如逆旅，我亦是行人",
  "此心安处是吾乡",
  "浮生若梦，为欢几何",
  "且将新火试新茶，诗酒趁年华",
  "一蓑烟雨任平生",
  "心有猛虎，细嗅蔷薇",
  "世事一场大梦，人生几度秋凉",
];

function RecentItem({ writing }: { writing: Writing }) {
  const typeMap = {
    diary: { label: "记", href: "/diary", color: "var(--vermillion)" },
    essay: { label: "文", href: "/essays", color: "var(--indigo-ink)" },
    note: { label: "念", href: "/notes", color: "var(--jade)" },
  };
  const typeInfo = typeMap[writing.type];
  const plainText = writing.content.replace(/<[^>]*>/g, "").trim();

  return (
    <Link
      href={writing.type === "note" ? "/notes" : `${typeInfo.href}/${writing.id}`}
      className="group flex items-start gap-4 py-4 transition-all duration-200 hover:pl-2"
    >
      <span
        className="shrink-0 mt-1 text-[10px] font-display font-bold w-5 h-5 flex items-center justify-center rounded border"
        style={{ borderColor: typeInfo.color, color: typeInfo.color }}
      >
        {typeInfo.label}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-1">
          {writing.title || truncate(plainText, 40) || "无题"}
        </span>
        <div className="flex items-center gap-2 mt-1">
          {writing.mood && (
            <span className="text-[10px]">{MOOD_CONFIG[writing.mood].emoji}</span>
          )}
          <span className="text-[10px] text-text-tertiary">
            {formatDate(writing.updatedAt, "relative")}
          </span>
          <span className="text-[10px] text-text-tertiary">
            {writing.wordCount} 字
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const router = useRouter();
  const writings = useWritingStore((s) => s.writings);
  const addWriting = useWritingStore((s) => s.addWriting);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const diaryCount = useMemo(() => writings.filter((w) => w.type === "diary").length, [writings]);
  const essayCount = useMemo(() => writings.filter((w) => w.type === "essay").length, [writings]);
  const noteCount = useMemo(() => writings.filter((w) => w.type === "note").length, [writings]);
  const totalWords = useMemo(() => writings.reduce((sum, w) => sum + w.wordCount, 0), [writings]);
  const recentWritings = useMemo(
    () =>
      [...writings]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6),
    [writings]
  );

  const { greeting, poetry } = useMemo(() => {
    if (!mounted) return { greeting: "", poetry: "" };
    const hour = new Date().getHours();
    const day = new Date().getDate();
    return {
      greeting:
        hour < 6 ? "夜阑人静" :
        hour < 12 ? "晨光熹微" :
        hour < 14 ? "日正当中" :
        hour < 18 ? "暮色渐浓" : "月上柳梢",
      poetry: POETRY[day % POETRY.length],
    };
  }, [mounted]);

  const handleQuickWrite = (type: "diary" | "essay") => {
    const writing = addWriting(type, {
      title: type === "diary" ? `${new Date().toLocaleDateString("zh-CN")} 日记` : "",
    });
    router.push(type === "diary" ? `/diary/${writing.id}` : `/essays/${writing.id}`);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-widest">
          {greeting || " "}
        </h1>
        <p className="text-sm text-text-tertiary mt-3 font-display tracking-wider italic">
          「{poetry || " "}」
        </p>
      </motion.div>

      {/* Stats in Chinese style */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-10"
      >
        {[
          { label: "日记", value: diaryCount, color: "var(--vermillion)", href: "/diary" },
          { label: "随笔", value: essayCount, color: "var(--indigo-ink)", href: "/essays" },
          { label: "小记", value: noteCount, color: "var(--jade)", href: "/notes" },
          { label: "总字", value: totalWords, color: "var(--gold)", href: "#" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col items-center py-5 rounded-2xl border border-border bg-bg-elevated/80 transition-all duration-200 hover:shadow-md hover:border-transparent hover:-translate-y-0.5"
          >
            <span
              className="text-3xl font-semibold tabular-nums transition-colors"
              style={{ color: stat.color }}
            >
              {stat.value.toLocaleString()}
            </span>
            <span className="text-[11px] text-text-tertiary mt-1 font-display tracking-widest">
              {stat.label}
            </span>
          </Link>
        ))}
      </motion.div>

      {/* Today's emotion */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mb-6"
      >
        <MoodDailyReport />
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex justify-center gap-4 mb-10"
      >
        <button
          onClick={() => handleQuickWrite("diary")}
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={15} />
          写日记
        </button>
        <button
          onClick={() => handleQuickWrite("essay")}
          className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-6 py-2.5 text-sm font-medium text-text-primary transition-all hover:shadow-md hover:border-accent/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <PenLine size={15} />
          写随笔
        </button>
        <Link
          href="/notes"
          className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-6 py-2.5 text-sm font-medium text-text-primary transition-all hover:shadow-md hover:border-accent/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <StickyNote size={15} />
          记一笔
        </Link>
      </motion.div>

      {/* Recent writings */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="cn-divider text-[11px] font-display tracking-[0.3em] mb-4">
          近作
        </div>

        {recentWritings.length > 0 ? (
          <div className="rounded-2xl border border-border bg-bg-elevated/80 px-5 divide-y divide-border/60">
            {recentWritings.map((w) => (
              <RecentItem key={w.id} writing={w} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border text-center">
            <p className="font-display text-2xl text-text-tertiary/40 mb-4 tracking-widest">
              落笔生花
            </p>
            <p className="text-xs text-text-tertiary">
              用文字记录生活的点滴，让每一笔都有意义
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
