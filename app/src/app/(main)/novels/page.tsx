"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, BookText } from "lucide-react";
import { useNovelStore } from "@/stores/novelStore";
import { useWritingStore } from "@/stores/writingStore";
import { NOVEL_STATUS_CONFIG, type Novel } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const COVER_EMOJIS = ["📖", "📚", "📝", "🖋️", "📜", "🗡️", "🏰", "🌌", "🐉", "🔮", "⚔️", "🛡️"];

function NovelCard({ novel, chapterCount, totalWords }: { novel: Novel; chapterCount: number; totalWords: number }) {
  const status = NOVEL_STATUS_CONFIG[novel.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={`/novels/${novel.id}`}
        className="group block rounded-2xl border border-border bg-bg-elevated/80 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-accent/15 hover:-translate-y-0.5"
      >
        {/* Cover */}
        <div className="h-36 bg-gradient-to-br from-bg-secondary to-border/20 flex items-center justify-center relative">
          <span className="text-5xl">{novel.coverEmoji || "📖"}</span>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-elevated/60 to-transparent" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span
              className="text-[10px] font-medium rounded-full px-2 py-0.5"
              style={{ backgroundColor: status.color + "18", color: status.color }}
            >
              {status.label}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-base font-display font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors tracking-wide">
            {novel.title || "未命名"}
          </h3>
          {novel.description && (
            <p className="text-xs text-text-secondary line-clamp-2 mb-3">{novel.description}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
            <span>{chapterCount} 章</span>
            <span>{totalWords.toLocaleString()} 字</span>
            <span>{formatDate(novel.updatedAt, "relative")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function NovelsPage() {
  const router = useRouter();
  const novels = useNovelStore((s) => s.novels);
  const chapters = useNovelStore((s) => s.chapters);
  const addNovel = useNovelStore((s) => s.addNovel);
  const getWritingById = useWritingStore((s) => s.getWritingById);

  const novelStats = useMemo(() => {
    return novels.map((n) => {
      const novelChapters = chapters.filter((c) => c.novelId === n.id && !c.isVolume);
      const totalWords = novelChapters.reduce((sum, ch) => {
        const w = getWritingById(ch.writingId);
        return sum + (w?.wordCount ?? 0);
      }, 0);
      return { novel: n, chapterCount: novelChapters.length, totalWords };
    });
  }, [novels, chapters, getWritingById]);

  const handleNewNovel = () => {
    const novel = addNovel({
      coverEmoji: COVER_EMOJIS[Math.floor(Math.random() * COVER_EMOJIS.length)],
    });
    router.push(`/novels/${novel.id}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">小 说</h1>
          <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
            鸿篇巨制，起于毫末
          </p>
        </div>
        <button
          onClick={handleNewNovel}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md"
        >
          <Plus size={14} />
          创建作品
        </button>
      </div>

      {novels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {novelStats.map(({ novel, chapterCount, totalWords }) => (
            <NovelCard
              key={novel.id}
              novel={novel}
              chapterCount={chapterCount}
              totalWords={totalWords}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookText size={40} className="text-text-tertiary/20 mb-4" />
          <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
            开卷有益
          </p>
          <p className="text-xs text-text-tertiary mb-6">
            创建你的第一部小说，开始创作之旅
          </p>
          <button
            onClick={handleNewNovel}
            className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90"
          >
            <Plus size={14} />
            创建作品
          </button>
        </div>
      )}
    </div>
  );
}
