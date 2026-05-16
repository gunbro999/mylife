"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Trash2, Plus,
  ChevronDown, ChevronRight, Edit3, BookOpen,
  User, Globe, BarChart3, FileText, Info,
} from "lucide-react";
import { useNovelStore } from "@/stores/novelStore";
import { useWritingStore } from "@/stores/writingStore";
import { NOVEL_STATUS_CONFIG, WORLD_CATEGORIES, RELATION_TYPES } from "@/lib/types";
import type { Novel, NovelStatus, Chapter, Character, CharacterRelation, WorldSetting } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Tab type ──
type Tab = "overview" | "chapters" | "characters" | "world" | "relations" | "stats";
const TABS: { key: Tab; label: string; icon: typeof Info }[] = [
  { key: "overview", label: "总览", icon: Info },
  { key: "chapters", label: "章节", icon: BookOpen },
  { key: "characters", label: "角色", icon: User },
  { key: "world", label: "世界观", icon: Globe },
  { key: "relations", label: "关系", icon: Globe },
  { key: "stats", label: "统计", icon: BarChart3 },
];

// ── Chapter Tree ──
function ChapterTreeItem({
  chapter,
  chapters,
  depth,
  onSelect,
  selectedId,
  onDelete,
  onToggleVolume,
}: {
  chapter: Chapter;
  chapters: Chapter[];
  depth: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
  onDelete: (id: string) => void;
  onToggleVolume: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = chapters.filter((c) => c.parentChapterId === chapter.id);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors group cursor-pointer",
          selectedId === chapter.id
            ? "bg-accent-soft text-accent"
            : "hover:bg-bg-secondary text-text-primary"
        )}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => !chapter.isVolume && onSelect(chapter.id)}
      >
        {children.length > 0 ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="shrink-0 text-text-tertiary"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {chapter.isVolume ? (
          <BookOpen size={14} className="text-text-tertiary shrink-0" />
        ) : (
          <FileText size={14} className="text-text-tertiary shrink-0" />
        )}

        <span className={cn("truncate", chapter.isVolume && "font-display font-semibold text-xs")}>
          {chapter.title || (chapter.isVolume ? "新分卷" : "未命名章节")}
        </span>

        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleVolume(chapter.id); }}
            className="p-0.5 text-text-tertiary hover:text-text-primary text-[10px] rounded"
            title={chapter.isVolume ? "转为章节" : "转为分卷"}
          >
            {chapter.isVolume ? <FileText size={12} /> : <BookOpen size={12} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(chapter.id); }}
            className="p-0.5 text-text-tertiary hover:text-vermillion rounded"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && children.map((child) => (
        <ChapterTreeItem
          key={child.id}
          chapter={child}
          chapters={chapters}
          depth={depth + 1}
          onSelect={onSelect}
          selectedId={selectedId}
          onDelete={onDelete}
          onToggleVolume={onToggleVolume}
        />
      ))}
    </div>
  );
}

// ── Overview Tab ──
function OverviewTab({ novel }: { novel: Novel }) {
  const updateNovel = useNovelStore((s) => s.updateNovel);
  const [title, setTitle] = useState(novel.title);
  const [desc, setDesc] = useState(novel.description);
  const [coverEmoji, setCoverEmoji] = useState(novel.coverEmoji);
  const [status, setStatus] = useState<NovelStatus>(novel.status);
  const [dailyGoal, setDailyGoal] = useState(novel.dailyGoal);
  const [targetWC, setTargetWC] = useState(novel.targetWordCount);
  const [saved, setSaved] = useState(false);

  const COVER_EMOJIS = ["📖","📚","📝","🖋️","📜","🗡️","🏰","🌌","🐉","🔮","⚔️","🛡️","💀","👑","🌟","🔥"];

  const handleSave = () => {
    updateNovel(novel.id, { title, description: desc, coverEmoji, status, dailyGoal, targetWordCount: targetWC });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Cover emoji */}
      <div>
        <label className="text-[11px] font-display text-text-tertiary block mb-2 tracking-wider">封面图标</label>
        <div className="flex flex-wrap gap-2">
          {COVER_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setCoverEmoji(e)}
              className={cn(
                "text-2xl p-1.5 rounded-lg transition-all",
                coverEmoji === e ? "bg-accent-soft scale-110" : "hover:bg-bg-secondary"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-[11px] font-display text-text-tertiary block mb-1 tracking-wider">作品名</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="未命名作品"
          className="w-full text-xl font-display font-semibold bg-transparent border-b border-border py-1 outline-none text-text-primary placeholder:text-text-tertiary/40 focus:border-accent transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[11px] font-display text-text-tertiary block mb-1 tracking-wider">简介</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="写一段简介..."
          className="w-full text-sm bg-transparent border border-border rounded-xl p-3 outline-none resize-none text-text-primary placeholder:text-text-tertiary/40 focus:border-accent/40 transition-colors"
        />
      </div>

      {/* Status & goals */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-display text-text-tertiary block mb-1 tracking-wider">状态</label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.entries(NOVEL_STATUS_CONFIG) as [NovelStatus, typeof NOVEL_STATUS_CONFIG[NovelStatus]][]).map(
              ([k, v]) => (
                <button
                  key={k}
                  onClick={() => setStatus(k)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium transition-all border",
                    status === k
                      ? "shadow-sm"
                      : "border-border/60 text-text-secondary hover:border-accent/30"
                  )}
                  style={status === k ? { borderColor: v.color, color: v.color, backgroundColor: v.color + "12" } : undefined}
                >
                  {v.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-display text-text-tertiary block mb-1 tracking-wider">每日目标 (字)</label>
          <input
            type="number"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full text-sm bg-transparent border border-border rounded-xl px-3 py-1.5 outline-none text-text-primary focus:border-accent/40"
          />
        </div>
        <div>
          <label className="text-[11px] font-display text-text-tertiary block mb-1 tracking-wider">目标总字数</label>
          <input
            type="number"
            value={targetWC}
            onChange={(e) => setTargetWC(Number(e.target.value))}
            className="w-full text-sm bg-transparent border border-border rounded-xl px-3 py-1.5 outline-none text-text-primary focus:border-accent/40"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-medium text-white hover:bg-accent/90 transition-all"
      >
        <Save size={13} />
        {saved ? "已保存" : "保存设置"}
      </button>
    </div>
  );
}

// ── Chapters Tab ──
function ChaptersTab({ novelId, onEditChapter }: { novelId: string; onEditChapter: (chapterId: string) => void }) {
  const allChapters = useNovelStore((s) => s.chapters);
  const chapters = useMemo(
    () => allChapters.filter((c) => c.novelId === novelId).sort((a, b) => a.sortOrder - b.sortOrder),
    [allChapters, novelId]
  );
  const addChapter = useNovelStore((s) => s.addChapter);
  const deleteChapter = useNovelStore((s) => s.deleteChapter);
  const updateChapter = useNovelStore((s) => s.updateChapter);

  const topLevel = chapters.filter((c) => !c.parentChapterId);

  const handleAddVolume = () => {
    addChapter(novelId, { isVolume: true, title: "新分卷" });
  };

  const handleAddChapter = (parentId: string | null) => {
    const ch = addChapter(novelId, { parentChapterId: parentId });
    onEditChapter(ch.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定删除？子章节也会一并删除。")) deleteChapter(id);
  };

  const handleToggleVolume = (id: string) => {
    const ch = chapters.find((c) => c.id === id);
    if (ch) updateChapter(id, { isVolume: !ch.isVolume });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleAddVolume}
          className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-text-secondary hover:border-accent/30 hover:text-accent transition-all"
        >
          <Plus size={12} /> 新分卷
        </button>
        <button
          onClick={() => handleAddChapter(null)}
          className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] text-white hover:bg-accent/90 transition-all"
        >
          <Plus size={12} /> 新章节
        </button>
      </div>

      {topLevel.length > 0 ? (
        <div className="rounded-xl border border-border bg-bg-elevated/50 p-2">
          {topLevel.map((ch) => (
              <ChapterTreeItem
                key={ch.id}
                chapter={ch}
                chapters={chapters}
                depth={0}
                onSelect={() => ch.isVolume ? null : onEditChapter(ch.id)}
                selectedId={null}
                onDelete={handleDelete}
                onToggleVolume={handleToggleVolume}
              />
            ))}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-text-tertiary">
          还没有章节，点击上方按钮开始创作
        </div>
      )}
    </div>
  );
}

// ── Characters Tab ──
function CharactersTab({ novelId }: { novelId: string }) {
  const allCharacters = useNovelStore((s) => s.characters);
  const characters = useMemo(
    () => allCharacters.filter((c) => c.novelId === novelId),
    [allCharacters, novelId]
  );
  const addCharacter = useNovelStore((s) => s.addCharacter);
  const updateCharacter = useNovelStore((s) => s.updateCharacter);
  const deleteCharacter = useNovelStore((s) => s.deleteCharacter);
  const [editingId, setEditingId] = useState<string | null>(null);

  const AVATARS = ["🧑","👨","👩","👴","👵","🧙","🧝","🧛","🧚","👸","🤴","🦸","🦹","👤","🗡️","🛡️"];

  const handleAdd = () => {
    const c = addCharacter(novelId, { avatar: AVATARS[0] });
    setEditingId(c.id);
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] text-white hover:bg-accent/90 transition-all mb-4"
      >
        <Plus size={12} /> 新角色
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {characters.map((ch) => (
          <div key={ch.id} className="rounded-xl border border-border bg-bg-elevated/50 p-4">
            {editingId === ch.id ? (
              <CharacterEditForm
                character={ch}
                avatars={AVATARS}
                onSave={(updates) => { updateCharacter(ch.id, updates); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{ch.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-display font-semibold text-text-primary">{ch.name || "未命名"}</h4>
                    {ch.role && <p className="text-[10px] text-text-tertiary">{ch.role}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingId(ch.id)} className="p-1 text-text-tertiary hover:text-text-primary">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={() => { if (confirm("删除角色？")) deleteCharacter(ch.id); }} className="p-1 text-text-tertiary hover:text-vermillion">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {ch.personality && (
                  <p className="text-xs text-text-secondary mb-2"><span className="font-medium text-text-tertiary">性格：</span>{ch.personality}</p>
                )}
                {ch.background && (
                  <p className="text-xs text-text-secondary line-clamp-3"><span className="font-medium text-text-tertiary">背景：</span>{ch.background}</p>
                )}
              </div>
            )}
          </div>
        ))}
        {characters.length === 0 && (
          <div className="col-span-2 text-center py-12 text-xs text-text-tertiary">还没有角色</div>
        )}
      </div>
    </div>
  );
}

function CharacterEditForm({
  character, avatars, onSave, onCancel,
}: {
  character: Character; avatars: string[];
  onSave: (updates: Partial<Character>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(character);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {avatars.map((a) => (
          <button
            key={a}
            onClick={() => setForm({ ...form, avatar: a })}
            className={cn("text-xl p-1 rounded transition-all", form.avatar === a ? "bg-accent-soft scale-110" : "hover:bg-bg-secondary")}
          >
            {a}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名" className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
        <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="角色定位 (主角/配角/反派)" className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
        <input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} placeholder="性别" className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
        <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="年龄" className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
      </div>
      <input value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} placeholder="性格特点" className="w-full text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
      <input value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} placeholder="外貌描述" className="w-full text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40" />
      <textarea value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} rows={2} placeholder="背景故事" className="w-full text-sm bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-accent/40" />
      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={1} placeholder="备注" className="w-full text-sm bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-accent/40" />
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="rounded-full bg-accent px-3 py-1 text-[11px] text-white">保存</button>
        <button onClick={onCancel} className="rounded-full border border-border px-3 py-1 text-[11px] text-text-secondary">取消</button>
      </div>
    </div>
  );
}

// ── World Settings Tab ──
function WorldTab({ novelId }: { novelId: string }) {
  const allWorldSettings = useNovelStore((s) => s.worldSettings);
  const settings = useMemo(
    () => allWorldSettings.filter((w) => w.novelId === novelId).sort((a, b) => a.sortOrder - b.sortOrder),
    [allWorldSettings, novelId]
  );
  const addWorldSetting = useNovelStore((s) => s.addWorldSetting);
  const updateWorldSetting = useNovelStore((s) => s.updateWorldSetting);
  const deleteWorldSetting = useNovelStore((s) => s.deleteWorldSetting);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorldSetting>>({});

  const grouped = useMemo(() => {
    const map = new Map<string, WorldSetting[]>();
    settings.forEach((s) => {
      const arr = map.get(s.category) || [];
      arr.push(s);
      map.set(s.category, arr);
    });
    return map;
  }, [settings]);

  const handleAdd = () => {
    const ws = addWorldSetting(novelId);
    setEditId(ws.id);
    setEditForm(ws);
  };

  const handleSave = (id: string) => {
    updateWorldSetting(id, editForm);
    setEditId(null);
  };

  return (
    <div>
      <button onClick={handleAdd} className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] text-white hover:bg-accent/90 transition-all mb-4">
        <Plus size={12} /> 新词条
      </button>

      {WORLD_CATEGORIES.map((cat) => {
        const items = grouped.get(cat) || [];
        const editingItemInCat = editId
          ? items.find((s) => s.id === editId) || (editForm.category === cat ? { id: editId, ...editForm } as WorldSetting : null)
          : null;
        const allItems = editingItemInCat && !items.find((s) => s.id === editingItemInCat.id)
          ? [...items, editingItemInCat]
          : items;
        if (!allItems.length) return null;

        return (
          <div key={cat} className="mb-4">
            <h4 className="text-xs font-display font-semibold text-text-secondary mb-2 tracking-wider">{cat}</h4>
            <div className="space-y-1.5">
              {allItems.map((s) => (
                <div key={s.id} className="rounded-lg border border-border/60 bg-bg-elevated/50">
                  {editId === s.id ? (
                    <div className="p-3 space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={editForm.category || s.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 outline-none"
                        >
                          {WORLD_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <input
                          value={editForm.title || s.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="词条标题"
                          className="flex-1 text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40"
                        />
                      </div>
                      <textarea
                        value={editForm.content || s.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        rows={4}
                        placeholder="词条正文"
                        className="w-full text-xs bg-transparent border border-border rounded-lg p-2 outline-none resize-none focus:border-accent/40 font-serif leading-relaxed"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(s.id)} className="rounded-full bg-accent px-3 py-1 text-[10px] text-white">保存</button>
                        <button onClick={() => setEditId(null)} className="rounded-full border border-border px-3 py-1 text-[10px] text-text-secondary">取消</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setExpandedId(expandedId === s.id ? null : s.id);
                          setEditForm({ category: s.category, title: s.title, content: s.content });
                        }}
                        className="flex items-center justify-between w-full p-2.5 text-left hover:bg-bg-secondary/50 rounded-lg transition-colors"
                      >
                        <span className="text-sm font-medium text-text-primary">{s.title || "未命名词条"}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); setEditId(s.id); setEditForm({ category: s.category, title: s.title, content: s.content }); }} className="p-0.5 text-text-tertiary hover:text-text-primary">
                            <Edit3 size={11} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm("删除？")) deleteWorldSetting(s.id); }} className="p-0.5 text-text-tertiary hover:text-vermillion">
                            <Trash2 size={11} />
                          </button>
                          <ChevronDown size={14} className={cn("text-text-tertiary transition-transform", expandedId === s.id && "rotate-180")} />
                        </div>
                      </button>
                      {expandedId === s.id && (
                        <div className="px-3 pb-3">
                          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-serif">
                            {s.content || "暂无内容"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {settings.length === 0 && !editId && (
        <div className="text-center py-12 text-xs text-text-tertiary">还没有世界观设定</div>
      )}
    </div>
  );
}

// ── Relations Tab (SVG graph) ──
function RelationsTab({ novelId, characters }: { novelId: string; characters: Character[] }) {
  const allRelations = useNovelStore((s) => s.relations);
  const relations = useMemo(
    () => allRelations.filter((r) => r.novelId === novelId),
    [allRelations, novelId]
  );
  const addRelation = useNovelStore((s) => s.addRelation);
  const updateRelation = useNovelStore((s) => s.updateRelation);
  const deleteRelation = useNovelStore((s) => s.deleteRelation);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);

  if (characters.length < 2) {
    return <p className="text-xs text-text-tertiary text-center py-12">至少需要两个角色才能建立关系</p>;
  }

  const getChar = (id: string) => characters.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      {/* Relations list */}
      <div className="space-y-2">
        {relations.map((rel) => {
          const a = getChar(rel.characterAId);
          const b = getChar(rel.characterBId);
          if (!a || !b) return null;
          return (
            <div key={rel.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-bg-elevated/50 p-2.5 text-sm">
              <span className="text-lg">{a.avatar}</span>
              <span className="font-medium text-text-primary">{a.name}</span>
              <span className="text-[10px] rounded-full px-2 py-0.5 bg-bg-secondary text-text-secondary font-display">{rel.type}</span>
              <span className="font-medium text-text-primary">{b.name}</span>
              <span className="text-lg">{b.avatar}</span>
              {rel.description && (
                <span className="text-xs text-text-tertiary">— {rel.description}</span>
              )}
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setEditingRelId(rel.id)}
                  className="p-0.5 text-text-tertiary hover:text-text-primary"
                >
                  <Edit3 size={11} />
                </button>
                <button
                  onClick={() => deleteRelation(rel.id)}
                  className="p-0.5 text-text-tertiary hover:text-vermillion"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit relation */}
      <RelationForm
        characters={characters}
        novelId={novelId}
        editingRel={editingRelId ? relations.find((r) => r.id === editingRelId) : undefined}
        onSave={(data) => {
          if (editingRelId) {
            updateRelation(editingRelId, data);
            setEditingRelId(null);
          } else {
            addRelation(novelId, data);
          }
        }}
        onCancel={() => setEditingRelId(null)}
      />
    </div>
  );
}

function RelationForm({
  characters, novelId, editingRel, onSave, onCancel,
}: {
  characters: Character[];
  novelId: string;
  editingRel?: CharacterRelation;
  onSave: (data: Partial<CharacterRelation>) => void;
  onCancel: () => void;
}) {
  const [aId, setAId] = useState(editingRel?.characterAId ?? "");
  const [bId, setBId] = useState(editingRel?.characterBId ?? "");
  const [type, setType] = useState(editingRel?.type ?? "挚友");
  const [desc, setDesc] = useState(editingRel?.description ?? "");

  return (
    <div className="rounded-xl border border-border bg-bg-elevated/30 p-4 space-y-3">
      <h4 className="text-xs font-display font-semibold text-text-secondary tracking-wider">
        {editingRel ? "编辑关系" : "添加关系"}
      </h4>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={aId} onChange={(e) => setAId(e.target.value)} className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none">
          <option value="">选择角色A</option>
          {characters.map((c) => <option key={c.id} value={c.id}>{c.avatar} {c.name || "未命名"}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none">
          {RELATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={bId} onChange={(e) => setBId(e.target.value)} className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 outline-none">
          <option value="">选择角色B</option>
          {characters.filter((c) => c.id !== aId).map((c) => <option key={c.id} value={c.id}>{c.avatar} {c.name || "未命名"}</option>)}
        </select>
      </div>
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="关系描述 (可选)"
        className="w-full text-xs bg-transparent border border-border rounded-lg px-2 py-1 outline-none focus:border-accent/40"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { if (aId && bId) onSave({ novelId, characterAId: aId, characterBId: bId, type, description: desc }); }}
          disabled={!aId || !bId}
          className="rounded-full bg-accent px-3 py-1 text-[11px] text-white disabled:opacity-30"
        >
          {editingRel ? "更新" : "添加"}
        </button>
        <button onClick={onCancel} className="rounded-full border border-border px-3 py-1 text-[11px] text-text-secondary">取消</button>
      </div>
    </div>
  );
}

// ── Stats Tab ──
function StatsTab({ novelId }: { novelId: string }) {
  const allChapters = useNovelStore((s) => s.chapters);
  const chapters = useMemo(
    () => allChapters.filter((c) => c.novelId === novelId && !c.isVolume).sort((a, b) => a.sortOrder - b.sortOrder),
    [allChapters, novelId]
  );
  const allWritings = useWritingStore((s) => s.writings);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    let totalWords = 0;
    const chapterCount = chapters.length;
    const dailyMap = new Map<string, number>();

    chapters.forEach((ch) => {
      const w = allWritings.find((writing) => writing.id === ch.writingId);
      if (w) {
        totalWords += w.wordCount;
        const date = w.createdAt.slice(0, 10);
        dailyMap.set(date, (dailyMap.get(date) || 0) + w.wordCount);
      }
    });

    // To prevent hydration errors, use a fixed date on server
    const today = mounted ? new Date() : new Date("2024-01-01T00:00:00Z");
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - 29 + i);
      return {
        date: d.toISOString().slice(0, 10),
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        words: dailyMap.get(d.toISOString().slice(0, 10)) || 0,
      };
    });

    return { totalWords, chapterCount, dailyData: last30 };
  }, [chapters, allWritings, mounted]);

  const maxWords = Math.max(...stats.dailyData.map((d) => d.words), 1);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5 text-center">
          <p className="text-3xl font-semibold text-vermillion">{stats.chapterCount}</p>
          <p className="text-xs text-text-tertiary mt-1 font-display tracking-wider">章节数</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5 text-center">
          <p className="text-3xl font-semibold text-jade">{stats.totalWords.toLocaleString()}</p>
          <p className="text-xs text-text-tertiary mt-1 font-display tracking-wider">总字数</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-elevated/50 p-5 text-center">
          <p className="text-3xl font-semibold text-gold">
            {stats.chapterCount > 0 ? Math.round(stats.totalWords / stats.chapterCount).toLocaleString() : 0}
          </p>
          <p className="text-xs text-text-tertiary mt-1 font-display tracking-wider">平均章字数</p>
        </div>
      </div>

      {/* Daily writing heatmap */}
      <div>
        <h4 className="text-xs font-display font-semibold text-text-secondary mb-3 tracking-wider">近30天写作热力图</h4>
        <div className="flex items-end gap-0.5 h-24">
          {stats.dailyData.map((d) => (
            <div
              key={d.date}
              className="flex-1 rounded-sm transition-all hover:opacity-80"
              title={`${d.label}: ${d.words} 字`}
              style={{
                height: `${Math.max((d.words / maxWords) * 100, 2)}%`,
                backgroundColor: d.words > 0 ? "var(--accent)" : "var(--border-color)",
                opacity: d.words > 0 ? 0.3 + (d.words / maxWords) * 0.7 : 1,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-text-tertiary">
          <span>30天前</span>
          <span>今天</span>
        </div>
      </div>

      {/* Chapter word list */}
      <div>
        <h4 className="text-xs font-display font-semibold text-text-secondary mb-3 tracking-wider">章字数分布</h4>
        <div className="space-y-1">
          {chapters.map((ch) => {
            const w = allWritings.find((writing) => writing.id === ch.writingId);
            return (
              <div key={ch.id} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg hover:bg-bg-secondary/50">
                <span className="text-text-primary truncate">{ch.title || "未命名"}</span>
                <span className="text-text-tertiary ml-2">{w?.wordCount ?? 0} 字</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export default function NovelDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;
  const allNovels = useNovelStore((s) => s.novels);
  const novel = useMemo(() => allNovels.find((n) => n.id === novelId), [allNovels, novelId]);
  const allChapters = useNovelStore((s) => s.chapters);
  const chapters = useMemo(
    () => allChapters.filter((c) => c.novelId === novelId).sort((a, b) => a.sortOrder - b.sortOrder),
    [allChapters, novelId]
  );
  const allCharacters = useNovelStore((s) => s.characters);
  const characters = useMemo(
    () => allCharacters.filter((c) => c.novelId === novelId),
    [allCharacters, novelId]
  );
  const allWritings = useWritingStore((s) => s.writings);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const addWriting = useWritingStore((s) => s.addWriting);
  const deleteNovel = useNovelStore((s) => s.deleteNovel);

  const totalWords = useMemo(
    () =>
      chapters
        .filter((c) => !c.isVolume)
        .reduce((sum, ch) => {
          const w = allWritings.find((writing) => writing.id === ch.writingId);
          return sum + (w?.wordCount ?? 0);
        }, 0),
    [chapters, allWritings]
  );

  if (!novel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-tertiary">作品不存在</p>
      </div>
    );
  }

  const handleEditChapter = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    if (!ch.writingId) {
      const w = addWriting("essay", { title: ch.title });
      useNovelStore.getState().updateChapter(chapterId, { writingId: w.id });
      router.push(`/novels/${novelId}/chapters/${chapterId}`);
    } else {
      router.push(`/novels/${novelId}/chapters/${chapterId}`);
    }
  };

  const handleDeleteNovel = () => {
    if (confirm(`确定删除「${novel.title || "未命名"}」及其所有内容？此操作不可撤销。`)) {
      deleteNovel(novelId);
      router.push("/novels");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-elevated/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/novels")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-all hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-lg">{novel.coverEmoji}</span>
          <div>
            <h2 className="text-sm font-display font-semibold text-text-primary tracking-wider">
              {novel.title || "未命名"}
            </h2>
            <p className="text-[10px] text-text-tertiary">
              {NOVEL_STATUS_CONFIG[novel.status].label} · {totalWords.toLocaleString()} 字
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteNovel}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary transition-all hover:bg-accent-soft hover:text-vermillion"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-bg-elevated/30 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-accent-soft text-accent"
                : "text-text-tertiary hover:text-text-secondary hover:bg-bg-secondary"
            )}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "overview" && (
          <OverviewTab novel={novel} />
        )}
        {activeTab === "chapters" && (
          <ChaptersTab novelId={novelId} onEditChapter={handleEditChapter} />
        )}
        {activeTab === "characters" && (
          <CharactersTab novelId={novelId} />
        )}
        {activeTab === "world" && (
          <WorldTab novelId={novelId} />
        )}
        {activeTab === "relations" && (
          <RelationsTab novelId={novelId} characters={characters} />
        )}
        {activeTab === "stats" && (
          <StatsTab novelId={novelId} />
        )}
      </div>
    </div>
  );
}
