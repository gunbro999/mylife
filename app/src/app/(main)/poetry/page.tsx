"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePoetryStore } from "@/stores/poetryStore";
import { TimeTab } from "@/components/poetry/TimeTab";
import { TermTab } from "@/components/poetry/TermTab";
import { PlaceTab } from "@/components/poetry/PlaceTab";
import { PoetryDetail } from "@/components/poetry/PoetryDetail";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "time" as const, label: "时辰", icon: "☀️" },
  { key: "term" as const, label: "节气", icon: "🌸" },
  { key: "place" as const, label: "地方", icon: "🗺️" },
];

export default function PoetryPage() {
  const activeTab = usePoetryStore((s) => s.activeTab);
  const setActiveTab = usePoetryStore((s) => s.setActiveTab);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-text mb-2">
          📜 诗歌赏析
        </h1>
        <p className="text-[14px] text-text-muted">
          按时辰、节气、地方，品读千年诗意
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center gap-1 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2 rounded-lg text-[14px] font-display transition-all duration-200",
              activeTab === tab.key
                ? "bg-vermillion text-white shadow-sm"
                : "bg-bg-elevated text-text-muted border border-border hover:border-vermillion/30"
            )}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "time" && <TimeTab />}
          {activeTab === "term" && <TermTab />}
          {activeTab === "place" && <PlaceTab />}
        </motion.div>
      </AnimatePresence>

      {/* Poetry detail panel */}
      <PoetryDetail />
    </div>
  );
}
