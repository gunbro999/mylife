import { create } from "zustand";
import type { Editor } from "@tiptap/react";

interface EditorBridgeState {
  editor: Editor | null;
  content: string;
  selectedText: string;

  setEditor: (editor: Editor | null) => void;
  updateContent: (content: string) => void;
  updateSelection: (text: string) => void;
  replaceSelection: (text: string) => void;
  insertAtCursor: (text: string) => void;
  applyAIResult: (text: string, mode: "replace" | "insert") => void;
}

export const useEditorBridgeStore = create<EditorBridgeState>()((set, get) => ({
  editor: null,
  content: "",
  selectedText: "",

  setEditor: (editor) => set({ editor }),

  updateContent: (content) => set({ content }),

  updateSelection: (text) => set({ selectedText: text }),

  replaceSelection: (text) => {
    const { editor } = get();
    if (!editor) return;
    editor.chain().focus().deleteSelection().insertContent(text).run();
  },

  insertAtCursor: (text) => {
    const { editor } = get();
    if (!editor) return;
    editor.chain().focus().insertContent(text).run();
  },

  applyAIResult: (text, mode) => {
    const { editor } = get();
    if (!editor) return;
    if (mode === "replace") {
      editor.chain().focus().deleteSelection().insertContent(text).run();
    } else {
      editor.chain().focus().insertContent(text).run();
    }
  },
}));
