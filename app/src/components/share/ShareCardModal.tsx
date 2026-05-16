"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Link2, Check, Share2 } from "lucide-react";
import { SHARE_CARD_STYLES } from "@/lib/shareCards";
import { MOOD_CONFIG } from "@/lib/types";
import { formatDate, stripHtml } from "@/lib/utils";
import type { Writing } from "@/lib/types";

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  writing: Writing | null;
}

export function ShareCardModal({ open, onClose, writing }: ShareCardModalProps) {
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const snippet = writing ? stripHtml(writing.content).slice(0, 200) : "";
  const style = SHARE_CARD_STYLES[selectedStyle];

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `浮生记-${writing?.title || "分享"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [writing]);

  const handleCopyLink = useCallback(async () => {
    if (!writing) return;
    const url = `${window.location.origin}/share/${writing.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [writing]);

  return (
    <AnimatePresence>
      {open && writing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="relative flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl bg-bg-elevated border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-accent" />
                <span className="font-display text-sm font-semibold tracking-wider text-text-primary">
                  分享卡片
                </span>
                <span className="text-[10px] text-text-tertiary">
                  共 {SHARE_CARD_STYLES.length} 种样式
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Card Preview */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div
                ref={cardRef}
                className="relative w-full overflow-hidden rounded-xl shadow-lg"
                style={{ aspectRatio: "16/9" }}
              >
                {/* Background Image — opaque */}
                <img
                  src={style.src}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                {/* White content box overlay — opaque */}
                <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-5 sm:px-8 sm:py-6 max-w-[85%] max-h-[80%] overflow-hidden shadow-lg">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 leading-snug tracking-wide">
                      {writing.title || "无题"}
                    </h2>
                    <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-4 font-serif">
                      {snippet || "（正文为空）"}
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/80">
                      {writing.mood && (
                        <span className="text-xs">
                          {MOOD_CONFIG[writing.mood]?.emoji} {MOOD_CONFIG[writing.mood]?.label}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {formatDate(writing.createdAt, "full")}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {writing.wordCount} 字
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Selector */}
            <div className="px-5 py-3 border-t border-border">
              <p className="text-[10px] text-text-tertiary mb-2 font-display tracking-wider">
                选择底色
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SHARE_CARD_STYLES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(i)}
                    className={`shrink-0 relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      i === selectedStyle
                        ? "border-accent ring-2 ring-accent/30 scale-105"
                        : "border-transparent hover:border-text-tertiary/30"
                    }`}
                  >
                    <img
                      src={s.src}
                      alt={s.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <span className="absolute bottom-0 left-0 right-0 text-[8px] text-center bg-black/40 text-white py-0.5">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 px-5 py-3 border-t border-border">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-medium text-white transition-all hover:shadow-lg hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Download size={14} />
                {downloading ? "生成中..." : "下载图片"}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-5 py-2 text-xs font-medium text-text-primary transition-all hover:shadow-md hover:border-accent/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Link2 size={14} />}
                {copied ? "已复制" : "复制链接"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
