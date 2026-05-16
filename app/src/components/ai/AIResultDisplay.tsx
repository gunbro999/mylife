"use client";

import { Loader2, Check, Copy, RefreshCw, AlertCircle, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIResultDisplayProps {
  result: string | null;
  loading: boolean;
  error: string | null;
  errorCode?: string;
  onApply: () => void;
  onInsert?: () => void;
  onRetry: () => void;
  onCopy: () => void;
}

export function AIResultDisplay({
  result,
  loading,
  error,
  errorCode,
  onApply,
  onInsert,
  onRetry,
  onCopy,
}: AIResultDisplayProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
          <Loader2 size={20} className="absolute inset-0 m-auto text-accent animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-xs font-display text-text-secondary tracking-wider">文思酝酿中</p>
          <p className="text-[10px] text-text-tertiary mt-1">墨汁渐浓，佳句将成...</p>
        </div>
        {/* Ink spread dots */}
        <div className="flex gap-1.5">
          <span className="ink-dot w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
          <span className="ink-dot w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="ink-dot w-1.5 h-1.5 rounded-full bg-accent/80 animate-pulse" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    );
  }

  // Not configured
  if (errorCode === "NOT_CONFIGURED") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
        <div className="seal-stamp w-14 h-14 flex items-center justify-center">
          <Key size={20} className="text-vermillion" />
        </div>
        <div>
          <p className="text-sm font-display text-text-secondary tracking-wider">文思未启</p>
          <p className="text-[10px] text-text-tertiary mt-1.5 leading-relaxed">
            请配置 AI 服务的 API Key<br />
            在 AI 面板顶部选择提供商<br />
            或设置环境变量 .env.local
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
        <div className="seal-stamp w-14 h-14 flex items-center justify-center">
          <AlertCircle size={20} className="text-vermillion" />
        </div>
        <div>
          <p className="text-xs font-display text-text-secondary tracking-wider">文思受阻</p>
          <p className="text-[10px] text-text-tertiary mt-1.5 leading-relaxed max-w-[240px]">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[10px] text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
        >
          <RefreshCw size={11} />
          重试
        </button>
      </div>
    );
  }

  // No result yet
  if (!result) {
    return null;
  }

  // Result ready
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-bg-secondary/50 p-3">
        <div
          className={cn(
            "text-sm text-text-primary leading-relaxed whitespace-pre-wrap",
            "font-serif"
          )}
        >
          {result}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={onApply}
          className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[10px] font-medium text-white hover:bg-accent/90 transition-all"
        >
          <Check size={11} />
          替换原文
        </button>
        {onInsert && (
          <button
            onClick={onInsert}
            className="flex items-center gap-1 rounded-full border border-accent/30 px-3 py-1.5 text-[10px] font-medium text-accent hover:bg-accent-soft transition-all"
          >
            插入
          </button>
        )}
        <button
          onClick={onCopy}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary transition-all"
        >
          <Copy size={11} />
        </button>
        <button
          onClick={onRetry}
          className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary transition-all"
        >
          <RefreshCw size={11} />
        </button>
      </div>
    </div>
  );
}
