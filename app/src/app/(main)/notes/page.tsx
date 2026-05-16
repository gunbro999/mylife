"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useWritingStore } from "@/stores/writingStore";
import { NoteCard } from "@/components/notes/NoteCard";
import { QuickNoteInput } from "@/components/notes/QuickNoteInput";

export default function NotesPage() {
  const writings = useWritingStore((s) => s.writings);
  const addWriting = useWritingStore((s) => s.addWriting);
  const deleteWriting = useWritingStore((s) => s.deleteWriting);
  const convertNote = useWritingStore((s) => s.convertNote);

  const notes = useMemo(
    () =>
      writings
        .filter((w) => w.type === "note")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [writings]
  );

  const handleAddNote = (content: string, color?: string) => {
    addWriting("note", {
      content: `<p>${content}</p>`,
      color,
      isDraft: false,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这条小记吗？")) {
      deleteWriting(id);
    }
  };

  const handleConvert = (id: string, type: "diary" | "essay") => {
    convertNote(id, type);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest">小 记</h1>
        <p className="text-xs text-text-tertiary mt-1.5 font-display tracking-wider italic">
          灵光一闪，拈笔即记
        </p>
      </div>

      {/* Quick input */}
      <div className="max-w-lg mb-8">
        <QuickNoteInput onSubmit={handleAddNote} />
      </div>

      {/* Notes */}
      <AnimatePresence>
        {notes.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                writing={note}
                onDelete={handleDelete}
                onConvert={handleConvert}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-xl text-text-tertiary/30 tracking-widest mb-3">
              念未起时
            </p>
            <p className="text-xs text-text-tertiary">
              在上方记下你的灵感闪念
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
