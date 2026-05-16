"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  Undo, Redo, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Btn({
  onClick, isActive, disabled, children, title, highlight,
}: {
  onClick: () => void; isActive?: boolean; disabled?: boolean; children: React.ReactNode; title?: string; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150",
        highlight && "text-accent",
        isActive
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
        disabled && "opacity-20 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-border/60" />;
}

export function Toolbar({ editor, onAIClick }: { editor: Editor | null; onAIClick?: () => void }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border bg-bg-elevated p-1 shadow-md">
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="标题一"><Heading1 size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="标题二"><Heading2 size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="标题三"><Heading3 size={14} /></Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="粗体"><Bold size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="斜体"><Italic size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="删除线"><Strikethrough size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="代码"><Code size={14} /></Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="无序列表"><List size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="有序列表"><ListOrdered size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="引用"><Quote size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线"><Minus size={14} /></Btn>
      <Sep />
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销"><Undo size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做"><Redo size={14} /></Btn>
      <Sep />
      <Btn onClick={() => onAIClick?.()} title="AI 写作助手" highlight>
        <Sparkles size={14} />
      </Btn>
    </div>
  );
}
