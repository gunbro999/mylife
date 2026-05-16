"use client";

import { useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Toolbar } from "./Toolbar";
import { EditorModeSwitch } from "./EditorModeSwitch";
import { useUIStore } from "@/stores/uiStore";
import { useEditorBridgeStore } from "@/stores/editorBridgeStore";
import { cn } from "@/lib/utils";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function Editor({
  content,
  onChange,
  placeholder = "落笔之处，皆是生活...",
  autoFocus = true,
}: EditorProps) {
  const editorMode = useUIStore((s) => s.editorMode);
  const focusMode = useUIStore((s) => s.focusModeEnabled);
  const typewriterMode = useUIStore((s) => s.typewriterModeEnabled);
  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const setAIPanelOpen = useUIStore((s) => s.setAIPanelOpen);
  const setEditor = useEditorBridgeStore((s) => s.setEditor);
  const updateContent = useEditorBridgeStore((s) => s.updateContent);
  const updateSelection = useEditorBridgeStore((s) => s.updateSelection);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && autoFocus) {
      setTimeout(() => editor.commands.focus("end"), 100);
    }
  }, [editor, autoFocus]);

  // Register editor with bridge store
  useEffect(() => {
    setEditor(editor);
    return () => setEditor(null);
  }, [editor, setEditor]);

  // Keep bridge store in sync with content and selection
  useEffect(() => {
    if (editor) {
      updateContent(editor.getHTML());
    }
  }, [editor, editor?.state.doc.content.size, updateContent]);

  const handleSelectionUpdate = useCallback(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        updateSelection(editor.state.doc.textBetween(from, to));
      } else {
        updateSelection("");
      }
    }
  }, [editor, updateSelection]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => { editor.off("selectionUpdate", handleSelectionUpdate); };
  }, [editor, handleSelectionUpdate]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleAIClick = () => {
    setAIPanelOpen(true);
    // Update bridge store with latest content/selection
    if (editor) {
      updateContent(editor.getHTML());
      const { from, to } = editor.state.selection;
      updateSelection(from !== to ? editor.state.doc.textBetween(from, to) : "");
    }
  };

  const wordCount = editor?.storage.characterCount?.characters() ?? 0;
  const chineseAndEnglish = editor
    ? (editor.getText().match(/[一-鿿]/g)?.length ?? 0) +
      (editor
        .getText()
        .replace(/[一-鿿]/g, " ")
        .split(/\s+/)
        .filter(Boolean).length)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar strip */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-border bg-bg-elevated/50">
        <EditorModeSwitch />
        <div className="flex items-center gap-3 text-[11px] text-text-tertiary font-display">
          <span>{chineseAndEnglish} 字</span>
          <span className="text-border">|</span>
          <span>{wordCount} 符</span>
        </div>
      </div>

      {/* Editor area with rice-paper feel */}
      <div
        className={cn(
          "flex-1 overflow-auto paper-texture",
          focusMode && "editor-focus-mode",
          typewriterMode && "editor-typewriter"
        )}
      >
        <div
          className={cn(
            "mx-auto w-full px-8 py-10",
            editorMode === "immersive" ? "max-w-2xl" : "max-w-3xl"
          )}
        >
          {editor && editorMode === "richtext" && (
            <BubbleMenu editor={editor}>
              <Toolbar editor={editor} onAIClick={handleAIClick} />
            </BubbleMenu>
          )}

          {editorMode === "richtext" && (
            <div className="mb-6">
              <Toolbar editor={editor} onAIClick={handleAIClick} />
            </div>
          )}

          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[60vh]",
              editorMode === "immersive" && "font-serif text-base leading-[2.2] tracking-wide"
            )}
          />
        </div>
      </div>
    </div>
  );
}
