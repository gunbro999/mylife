"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { useEditorBridgeStore } from "@/stores/editorBridgeStore";
import { AIResultDisplay } from "./AIResultDisplay";
import { getPlainText, truncateText } from "@/lib/utils";

export function ContinueWriting() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  const creativity = useAIConfigStore((s) => s.creativity);
  const setCreativity = useAIConfigStore((s) => s.setCreativity);
  const getActiveConfig = useAIConfigStore((s) => s.getActiveConfig);
  const content = useEditorBridgeStore((s) => s.content);
  const replaceSelection = useEditorBridgeStore((s) => s.replaceSelection);
  const insertAtCursor = useEditorBridgeStore((s) => s.insertAtCursor);

  const contextPreview = content
    ? truncateText(getPlainText(content.slice(-300)), 200)
    : "";

  const handleGenerate = async () => {
    if (content.length < 10) {
      setError("内容太少，请先写一些文字再续写");
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
          action: "continue",
          content,
          creativity,
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
      setError("网络请求失败，请检查网络连接");
      setErrorCode("API_ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Context preview */}
      <div>
        <label className="text-[10px] font-display text-text-tertiary tracking-wider">上文语境</label>
        <div className="mt-1 rounded-lg border border-border bg-bg-secondary/50 p-2.5 text-xs text-text-secondary leading-relaxed max-h-24 overflow-y-auto font-serif">
          {contextPreview || "尚未书写，请先在编辑器中写下开篇..."}
        </div>
      </div>

      {/* Creativity slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-display text-text-tertiary tracking-wider">创造力</label>
          <span className="text-[10px] text-text-tertiary tabular-nums">{Math.round(creativity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="1"
          step="0.05"
          value={creativity}
          onChange={(e) => setCreativity(parseFloat(e.target.value))}
          className="ai-slider w-full"
        />
        <div className="flex justify-between text-[8px] text-text-tertiary/60 mt-0.5">
          <span>紧扣前文</span>
          <span>天马行空</span>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 rounded-full bg-accent py-2 text-xs font-medium text-white hover:bg-accent/90 transition-all disabled:opacity-50"
      >
        <Wand2 size={13} />
        生成续写
      </button>

      {/* Result */}
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
