"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { useEditorBridgeStore } from "@/stores/editorBridgeStore";
import { AIResultDisplay } from "./AIResultDisplay";
import { POLISH_TYPES } from "@/lib/ai-types";
import type { PolishType } from "@/lib/ai-types";
import { cn } from "@/lib/utils";

export function PolishOptimize() {
  const [polishType, setPolishType] = useState<PolishType>("full");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const getActiveConfig = useAIConfigStore((s) => s.getActiveConfig);
  const content = useEditorBridgeStore((s) => s.content);
  const selectedText = useEditorBridgeStore((s) => s.selectedText);
  const replaceSelection = useEditorBridgeStore((s) => s.replaceSelection);
  const insertAtCursor = useEditorBridgeStore((s) => s.insertAtCursor);

  const handleGenerate = async () => {
    if (!selectedText || selectedText.length < 5) {
      setError("请先在编辑器中选中需要润色的文字");
      setErrorCode("CONTENT_TOO_SHORT");
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(undefined);
    setResult(null);

    try {
      const config = getActiveConfig();
      const resp = await fetch("/api/ai/writing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          endpoint: config.endpoint,
          model: config.model,
          action: "polish",
          content,
          selection: selectedText,
          polishType,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || "请求失败");
        setErrorCode(data.code);
      } else {
        setResult(data.text);
      }
    } catch {
      setError("网络请求失败");
      setErrorCode("API_ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Polish type selection */}
      <div>
        <label className="text-[10px] font-display text-text-tertiary tracking-wider block mb-2">润色方向</label>
        <div className="space-y-1.5">
          {POLISH_TYPES.map((p) => (
            <button
              key={p.value}
              onClick={() => setPolishType(p.value)}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-xl border px-3 py-2.5 text-left transition-all",
                polishType === p.value
                  ? "border-accent bg-accent-soft shadow-sm"
                  : "border-border/60 hover:border-accent/30 hover:bg-bg-secondary/50"
              )}
            >
              <span className="text-base shrink-0">{p.icon}</span>
              <div className="min-w-0">
                <span
                  className={cn(
                    "text-[11px] font-medium block",
                    polishType === p.value ? "text-accent" : "text-text-primary"
                  )}
                >
                  {p.label}
                </span>
                <span className="text-[9px] text-text-tertiary">{p.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection preview */}
      <div>
        <label className="text-[10px] font-display text-text-tertiary tracking-wider block mb-1">
          选中文字 {selectedText ? `(${selectedText.length} 字)` : ""}
        </label>
        <div className="rounded-lg border border-border bg-bg-secondary/50 p-2.5 text-xs text-text-secondary leading-relaxed max-h-20 overflow-y-auto font-serif">
          {selectedText || "未选中任何文字，请在编辑器中框选需要润色的文本"}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !selectedText}
        className="w-full flex items-center justify-center gap-1.5 rounded-full bg-accent py-2 text-xs font-medium text-white hover:bg-accent/90 transition-all disabled:opacity-50"
      >
        <Wand2 size={13} />
        开始润色
      </button>

      <AIResultDisplay
        result={result}
        loading={loading}
        error={error}
        errorCode={errorCode}
        onApply={() => { if (result) { replaceSelection(result); setResult(null); } }}
        onInsert={() => { if (result) { insertAtCursor(result); setResult(null); } }}
        onRetry={handleGenerate}
        onCopy={() => { if (result) navigator.clipboard.writeText(result); }}
      />
    </div>
  );
}
