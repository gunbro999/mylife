"use client";

import { Eye, Type, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import type { EditorMode } from "@/lib/types";

const MODES: { mode: EditorMode; icon: typeof Eye; label: string }[] = [
  { mode: "immersive", icon: Eye, label: "沉浸" },
  { mode: "richtext", icon: Type, label: "富文" },
  { mode: "markdown", icon: Code2, label: "源码" },
];

export function EditorModeSwitch() {
  const editorMode = useUIStore((s) => s.editorMode);
  const setEditorMode = useUIStore((s) => s.setEditorMode);

  return (
    <div className="flex items-center rounded-full border border-border bg-bg-secondary/50 p-0.5">
      {MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setEditorMode(mode)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200",
            editorMode === mode
              ? "bg-bg-elevated text-text-primary shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          )}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
}
