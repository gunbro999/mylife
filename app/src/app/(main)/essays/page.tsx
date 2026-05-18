"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWritingStore } from "@/stores/writingStore";
import { EssayCard } from "@/components/essays/EssayCard";
import { TemplateModal } from "@/components/template/TemplateModal";

export default function EssaysPage() {
  const router = useRouter();
  const [templateOpen, setTemplateOpen] = useState(false);
  const writings = useWritingStore((s) => s.writings);
  const addWriting = useWritingStore((s) => s.addWriting);

  const essays = useMemo(
    () =>
      writings
        .filter((w) => w.type === "essay")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [writings]
  );

  const handleNewEssay = () => {
    setTemplateOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">随 笔</h1>
          <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
            闲笔偶得，不拘一格
          </p>
        </div>
        <button
          onClick={handleNewEssay}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 hover:shadow-md"
        >
          <Plus size={14} />
          写随笔
        </button>
      </div>

      <AnimatePresence mode="wait">
        {essays.length > 0 ? (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {essays.map((essay) => (
              <EssayCard key={essay.id} writing={essay} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
              笔未落纸
            </p>
            <p className="text-xs text-text-tertiary mb-6">
              用文字记录你的所思所想
            </p>
            <button
              onClick={handleNewEssay}
              className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-medium text-white transition-all hover:bg-accent/90"
            >
              <Plus size={14} />
              写第一篇
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <TemplateModal open={templateOpen} onClose={() => setTemplateOpen(false)} type="essay" />
    </div>
  );
}
