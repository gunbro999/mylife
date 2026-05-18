/**
 * Cloud sync layer between Zustand stores (localStorage) and Supabase.
 *
 * Every CRUD operation writes through to both localStorage (via store) and
 * Supabase (via the helpers below). The stores remain the source of truth for
 * the UI; Supabase acts as the durable backing store.
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function supabase() {
  return createClient();
}

function userId(): string | null {
  // getUser() is cached in the client; fast enough for every call.
  return supabase().auth.getUser().then(({ data }) => data.user?.id ?? null) as unknown as string | null;
}

async function requireUserId(): Promise<string> {
  const { data } = await createClient().auth.getUser();
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

// ─── Writings ───────────────────────────────────────────────────────────────

export async function syncWritingSave(writing: {
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isDraft: boolean;
  tags: string[];
  mood?: string | null;
  weather?: string | null;
  coverImage?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('writings').upsert({
    id: writing.id,
    user_id: uid,
    type: writing.type,
    title: writing.title,
    content: writing.content,
    word_count: writing.wordCount,
    is_draft: writing.isDraft,
    tags: writing.tags,
    mood: writing.mood ?? null,
    weather: writing.weather ?? null,
    cover_image: writing.coverImage ?? null,
    color: writing.color ?? null,
    created_at: writing.createdAt,
    updated_at: writing.updatedAt,
  }, { onConflict: 'id' });
  if (error) console.error('syncWritingSave failed:', error);
}

// Keep legacy functions for migration compatibility
  id: string;
  type: string;
  title: string;
  content: string;
  wordCount: number;
  isDraft: boolean;
  tags: string[];
  mood?: string | null;
  weather?: string | null;
  coverImage?: string | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('writings').insert({
    id: writing.id,
    user_id: uid,
    type: writing.type,
    title: writing.title,
    content: writing.content,
    word_count: writing.wordCount,
    is_draft: writing.isDraft,
    tags: writing.tags,
    mood: writing.mood ?? null,
    weather: writing.weather ?? null,
    cover_image: writing.coverImage ?? null,
    color: writing.color ?? null,
    created_at: writing.createdAt,
    updated_at: writing.updatedAt,
  });
  if (error) console.error('syncWritingCreate failed:', error);
}

export async function syncWritingUpdate(id: string, updates: {
  title?: string;
  content?: string;
  wordCount?: number;
  isDraft?: boolean;
  tags?: string[];
  mood?: string | null;
  weather?: string | null;
  coverImage?: string | null;
  color?: string | null;
  updatedAt?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.wordCount !== undefined) payload.word_count = updates.wordCount;
  if (updates.isDraft !== undefined) payload.is_draft = updates.isDraft;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.mood !== undefined) payload.mood = updates.mood;
  if (updates.weather !== undefined) payload.weather = updates.weather;
  if (updates.coverImage !== undefined) payload.cover_image = updates.coverImage;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase().from('writings').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncWritingUpdate failed:', error);
}

export async function syncWritingDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('writings').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncWritingDelete failed:', error);
}

// ─── Novels ─────────────────────────────────────────────────────────────────

export async function syncNovelCreate(novel: {
  id: string;
  title: string;
  description: string;
  coverEmoji: string;
  status: string;
  targetWordCount: number;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('novels').insert({
    id: novel.id, user_id: uid, title: novel.title, description: novel.description,
    cover_emoji: novel.coverEmoji, status: novel.status,
    target_word_count: novel.targetWordCount, daily_goal: novel.dailyGoal,
    created_at: novel.createdAt, updated_at: novel.updatedAt,
  });
  if (error) console.error('syncNovelCreate failed:', error);
}

export async function syncNovelUpdate(id: string, updates: {
  title?: string; description?: string; coverEmoji?: string; status?: string;
  targetWordCount?: number; dailyGoal?: number; updatedAt?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.coverEmoji !== undefined) payload.cover_emoji = updates.coverEmoji;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.targetWordCount !== undefined) payload.target_word_count = updates.targetWordCount;
  if (updates.dailyGoal !== undefined) payload.daily_goal = updates.dailyGoal;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;
  const { error } = await supabase().from('novels').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncNovelUpdate failed:', error);
}

export async function syncNovelDelete(id: string) {
  const uid = await requireUserId();
  // Cascade: chapters, characters, relations, world_settings deleted via FK
  const { error } = await supabase().from('novels').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncNovelDelete failed:', error);
}

// ─── Chapters ───────────────────────────────────────────────────────────────

export async function syncChapterCreate(ch: {
  id: string; novelId: string; title: string; content: string; wordCount: number;
  sortOrder: number; parentChapterId: string | null; isVolume: boolean;
  createdAt: string; updatedAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('chapters').insert({
    id: ch.id, novel_id: ch.novelId, user_id: uid, title: ch.title,
    content: ch.content, word_count: ch.wordCount, sort_order: ch.sortOrder,
    parent_chapter_id: ch.parentChapterId, is_volume: ch.isVolume,
    created_at: ch.createdAt, updated_at: ch.updatedAt,
  });
  if (error) console.error('syncChapterCreate failed:', error);
}

export async function syncChapterUpdate(id: string, updates: {
  title?: string; content?: string; wordCount?: number; sortOrder?: number;
  parentChapterId?: string | null; isVolume?: boolean; updatedAt?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.wordCount !== undefined) payload.word_count = updates.wordCount;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
  if (updates.parentChapterId !== undefined) payload.parent_chapter_id = updates.parentChapterId;
  if (updates.isVolume !== undefined) payload.is_volume = updates.isVolume;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;
  const { error } = await supabase().from('chapters').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncChapterUpdate failed:', error);
}

export async function syncChapterDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('chapters').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncChapterDelete failed:', error);
}

// ─── Characters ─────────────────────────────────────────────────────────────

export async function syncCharacterCreate(ch: {
  id: string; novelId: string; name: string; avatar: string; role: string;
  gender: string; age: string; personality: string; appearance: string;
  background: string; notes: string; createdAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('characters').insert({
    id: ch.id, novel_id: ch.novelId, user_id: uid, name: ch.name,
    avatar: ch.avatar, role: ch.role, gender: ch.gender, age: ch.age,
    personality: ch.personality, appearance: ch.appearance,
    background: ch.background, notes: ch.notes, created_at: ch.createdAt,
  });
  if (error) console.error('syncCharacterCreate failed:', error);
}

export async function syncCharacterUpdate(id: string, updates: {
  name?: string; avatar?: string; role?: string; gender?: string;
  age?: string; personality?: string; appearance?: string; background?: string; notes?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.avatar !== undefined) payload.avatar = updates.avatar;
  if (updates.role !== undefined) payload.role = updates.role;
  if (updates.gender !== undefined) payload.gender = updates.gender;
  if (updates.age !== undefined) payload.age = updates.age;
  if (updates.personality !== undefined) payload.personality = updates.personality;
  if (updates.appearance !== undefined) payload.appearance = updates.appearance;
  if (updates.background !== undefined) payload.background = updates.background;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  const { error } = await supabase().from('characters').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncCharacterUpdate failed:', error);
}

export async function syncCharacterDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('characters').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncCharacterDelete failed:', error);
}

// ─── Character Relations ────────────────────────────────────────────────────

export async function syncRelationCreate(r: {
  id: string; novelId: string; characterAId: string; characterBId: string;
  type: string; description: string; createdAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('character_relations').insert({
    id: r.id, novel_id: r.novelId, user_id: uid,
    character_a_id: r.characterAId, character_b_id: r.characterBId,
    type: r.type, description: r.description, created_at: r.createdAt,
  });
  if (error) console.error('syncRelationCreate failed:', error);
}

export async function syncRelationUpdate(id: string, updates: {
  characterAId?: string; characterBId?: string; type?: string; description?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.characterAId !== undefined) payload.character_a_id = updates.characterAId;
  if (updates.characterBId !== undefined) payload.character_b_id = updates.characterBId;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.description !== undefined) payload.description = updates.description;
  const { error } = await supabase().from('character_relations').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncRelationUpdate failed:', error);
}

export async function syncRelationDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('character_relations').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncRelationDelete failed:', error);
}

// ─── World Settings ─────────────────────────────────────────────────────────

export async function syncWorldSettingCreate(ws: {
  id: string; novelId: string; category: string; title: string; content: string;
  sortOrder: number; createdAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('world_settings').insert({
    id: ws.id, novel_id: ws.novelId, user_id: uid, category: ws.category,
    title: ws.title, content: ws.content, sort_order: ws.sortOrder,
    created_at: ws.createdAt,
  });
  if (error) console.error('syncWorldSettingCreate failed:', error);
}

export async function syncWorldSettingUpdate(id: string, updates: {
  category?: string; title?: string; content?: string; sortOrder?: number;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;
  const { error } = await supabase().from('world_settings').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncWorldSettingUpdate failed:', error);
}

export async function syncWorldSettingDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('world_settings').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncWorldSettingDelete failed:', error);
}

// ─── Excerpts ───────────────────────────────────────────────────────────────

export async function syncExcerptCreate(e: {
  id: string; content: string; author: string; dynasty?: string | null;
  type: string; sourceTitle?: string | null; personalNote?: string | null;
  createdAt: string; updatedAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('excerpts').insert({
    id: e.id, user_id: uid, content: e.content, author: e.author,
    dynasty: e.dynasty ?? null, type: e.type,
    source_title: e.sourceTitle ?? null, personal_note: e.personalNote ?? null,
    created_at: e.createdAt, updated_at: e.updatedAt,
  });
  if (error) console.error('syncExcerptCreate failed:', error);
}

export async function syncExcerptUpdate(id: string, updates: {
  content?: string; author?: string; dynasty?: string | null; type?: string;
  sourceTitle?: string | null; personalNote?: string | null; updatedAt?: string;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.author !== undefined) payload.author = updates.author;
  if (updates.dynasty !== undefined) payload.dynasty = updates.dynasty;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.sourceTitle !== undefined) payload.source_title = updates.sourceTitle;
  if (updates.personalNote !== undefined) payload.personal_note = updates.personalNote;
  if (updates.updatedAt !== undefined) payload.updated_at = updates.updatedAt;
  const { error } = await supabase().from('excerpts').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncExcerptUpdate failed:', error);
}

export async function syncExcerptDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('excerpts').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncExcerptDelete failed:', error);
}

// ─── Emotion Logs ────────────────────────────────────────────────────────────

export async function syncEmotionLogCreate(log: {
  id: string; writingId: string; date: string; overallMood: string;
  scores: Array<{ mood: string; score: number; label: string }>; summary: string; createdAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('emotion_logs').insert({
    id: log.id, user_id: uid, writing_id: log.writingId,
    date: log.date, overall_mood: log.overallMood,
    scores: log.scores as unknown as Record<string, unknown>,
    summary: log.summary, created_at: log.createdAt,
  });
  if (error) console.error('syncEmotionLogCreate failed:', error);
}

export async function syncEmotionLogDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('emotion_logs').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncEmotionLogDelete failed:', error);
}

// ─── Created Poems ──────────────────────────────────────────────────────────

export async function syncCreatedPoemCreate(p: {
  id: string; title: string; content: string; genre: string; sourceIds: string[];
  aiProvider: string; aiModel: string; editedContent?: string | null; createdAt: string;
}) {
  const uid = await requireUserId();
  const { error } = await supabase().from('created_poems').insert({
    id: p.id, user_id: uid, title: p.title, content: p.content, genre: p.genre,
    source_ids: p.sourceIds, ai_provider: p.aiProvider, ai_model: p.aiModel,
    edited_content: p.editedContent ?? null, created_at: p.createdAt,
  });
  if (error) console.error('syncCreatedPoemCreate failed:', error);
}

export async function syncCreatedPoemUpdate(id: string, updates: {
  title?: string; content?: string; editedContent?: string | null;
}) {
  const uid = await requireUserId();
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.editedContent !== undefined) payload.edited_content = updates.editedContent;
  const { error } = await supabase().from('created_poems').update(payload).eq('id', id).eq('user_id', uid);
  if (error) console.error('syncCreatedPoemUpdate failed:', error);
}

export async function syncCreatedPoemDelete(id: string) {
  const uid = await requireUserId();
  const { error } = await supabase().from('created_poems').delete().eq('id', id).eq('user_id', uid);
  if (error) console.error('syncCreatedPoemDelete failed:', error);
}

// ─── Migration: localStorage → Supabase ─────────────────────────────────────

export async function migrateLocalToCloud() {
  const uid = await requireUserId();

  const BATCH_SIZE = 50;

  async function upsert(table: string, rows: Record<string, unknown>[]) {
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      // Use upsert so re-running migration is idempotent
      const { error } = await supabase().from(table).upsert(batch, { onConflict: 'id' });
      if (error) console.error(`migrate ${table} failed:`, error);
    }
  }

  // Migrate writings
  try {
    const rawWritings = localStorage.getItem('mylife-writings');
    if (rawWritings) {
      const data = JSON.parse(rawWritings);
      const writings = (data.state?.writings || []).map((w: Record<string, unknown>) => ({
        id: w.id, user_id: uid, type: w.type, title: w.title, content: w.content,
        word_count: w.wordCount, is_draft: w.isDraft, tags: w.tags,
        mood: w.mood ?? null, weather: w.weather ?? null,
        cover_image: w.coverImage ?? null, color: w.color ?? null,
        created_at: w.createdAt, updated_at: w.updatedAt,
      }));
      if (writings.length > 0) await upsert('writings', writings);
    }
  } catch (e) { console.error('migrate writings failed:', e); }

  // Migrate novels
  try {
    const rawNovels = localStorage.getItem('mylife-novels');
    if (rawNovels) {
      const data = JSON.parse(rawNovels);
      const novels = (data.state?.novels || []).map((n: Record<string, unknown>) => ({
        id: n.id, user_id: uid, title: n.title, description: n.description,
        cover_emoji: n.coverEmoji, status: n.status,
        target_word_count: n.targetWordCount, daily_goal: n.dailyGoal,
        created_at: n.createdAt, updated_at: n.updatedAt,
      }));
      if (novels.length > 0) await upsert('novels', novels);

      const chapters = (data.state?.chapters || []).map((c: Record<string, unknown>) => ({
        id: c.id, novel_id: c.novelId, user_id: uid, title: c.title, content: (c as Record<string, unknown>).content || '',
        word_count: (c as Record<string, unknown>).wordCount || 0, sort_order: c.sortOrder,
        parent_chapter_id: c.parentChapterId ?? null, is_volume: c.isVolume,
        created_at: c.createdAt, updated_at: (c as Record<string, unknown>).updatedAt || c.createdAt,
      }));
      if (chapters.length > 0) await upsert('chapters', chapters);

      const characters = (data.state?.characters || []).map((c: Record<string, unknown>) => ({
        id: c.id, novel_id: c.novelId, user_id: uid, name: c.name, avatar: c.avatar,
        role: c.role, gender: c.gender, age: c.age,
        personality: c.personality, appearance: c.appearance,
        background: c.background, notes: c.notes, created_at: c.createdAt,
      }));
      if (characters.length > 0) await upsert('characters', characters);

      const relations = (data.state?.relations || []).map((r: Record<string, unknown>) => ({
        id: r.id, novel_id: r.novelId, user_id: uid,
        character_a_id: r.characterAId, character_b_id: r.characterBId,
        type: r.type, description: r.description, created_at: r.createdAt,
      }));
      if (relations.length > 0) await upsert('character_relations', relations);

      const worldSettings = (data.state?.worldSettings || []).map((w: Record<string, unknown>) => ({
        id: w.id, novel_id: w.novelId, user_id: uid,
        category: w.category, title: w.title, content: w.content,
        sort_order: w.sortOrder, created_at: w.createdAt,
      }));
      if (worldSettings.length > 0) await upsert('world_settings', worldSettings);
    }
  } catch (e) { console.error('migrate novels failed:', e); }

  // Migrate excerpts
  try {
    const rawExcerpts = localStorage.getItem('mylife-excerpts');
    if (rawExcerpts) {
      const data = JSON.parse(rawExcerpts);
      const excerpts = (data.state?.excerpts || []).map((e: Record<string, unknown>) => ({
        id: e.id, user_id: uid, content: e.content, author: e.author,
        dynasty: e.dynasty ?? null, type: e.type,
        source_title: e.sourceTitle ?? null, personal_note: e.personalNote ?? null,
        created_at: e.createdAt, updated_at: e.updatedAt,
      }));
      if (excerpts.length > 0) await upsert('excerpts', excerpts);
    }
  } catch (e) { console.error('migrate excerpts failed:', e); }

  // Migrate emotion logs
  try {
    const rawEmotions = localStorage.getItem('mylife-emotions');
    if (rawEmotions) {
      const data = JSON.parse(rawEmotions);
      const logs = (data.state?.logs || []).map((l: Record<string, unknown>) => ({
        id: l.id, user_id: uid, writing_id: l.writingId,
        date: l.date, overall_mood: l.overallMood,
        scores: l.scores, summary: l.summary, created_at: l.createdAt,
      }));
      if (logs.length > 0) await upsert('emotion_logs', logs);
    }
  } catch (e) { console.error('migrate emotions failed:', e); }

  // Migrate created poems
  try {
    const rawPoems = localStorage.getItem('mylife-created-poems');
    if (rawPoems) {
      const data = JSON.parse(rawPoems);
      const poems = (data.state?.poems || []).map((p: Record<string, unknown>) => ({
        id: p.id, user_id: uid, title: p.title, content: p.content, genre: p.genre,
        source_ids: p.sourceIds, ai_provider: p.aiProvider, ai_model: p.aiModel,
        edited_content: p.editedContent ?? null, created_at: p.createdAt,
      }));
      if (poems.length > 0) await upsert('created_poems', poems);
    }
  } catch (e) { console.error('migrate poems failed:', e); }
}

// ─── Pull: Supabase → localStorage ──────────────────────────────────────────

export async function pullFromCloud() {
  const uid = await requireUserId();

  async function pullTable(table: string, columns: string): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let from = 0;
    const limit = 1000;
    while (true) {
      const { data, error } = await supabase().from(table).select(columns).eq('user_id', uid).range(from, from + limit - 1).order('created_at', { ascending: false });
      if (error) { console.error(`pull ${table} failed:`, error); break; }
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < limit) break;
      from += limit;
    }
    return all;
  }

  // Pull writings
  const cloudWritings = await pullTable('writings', '*');
  if (cloudWritings.length > 0) {
    const mapped = cloudWritings.map((w) => ({
      id: w.id, type: w.type, title: w.title, content: w.content,
      wordCount: w.word_count, isDraft: w.is_draft, tags: w.tags,
      mood: w.mood, weather: w.weather, coverImage: w.cover_image,
      color: w.color, createdAt: w.created_at, updatedAt: w.updated_at,
    }));
    // Merge with existing localStorage
    const existing = JSON.parse(localStorage.getItem('mylife-writings') || '{}');
    const existingWritings = existing.state?.writings || [];
    const existingMap = new Map(existingWritings.map((w: Record<string, unknown>) => [w.id, w]));
    for (const cw of mapped) {
      existingMap.set(cw.id, { ...existingMap.get(cw.id) || {}, ...cw });
    }
    const merged = Array.from(existingMap.values()).sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
      new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime()
    );
    const raw = localStorage.getItem('mylife-writings');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state.writings = merged;
      localStorage.setItem('mylife-writings', JSON.stringify(parsed));
    }
  }

  // Pull excerpts
  const cloudExcerpts = await pullTable('excerpts', '*');
  if (cloudExcerpts.length > 0) {
    const mapped = cloudExcerpts.map((e) => ({
      id: e.id, content: e.content, author: e.author, dynasty: e.dynasty,
      type: e.type, sourceTitle: e.source_title, personalNote: e.personal_note,
      createdAt: e.created_at, updatedAt: e.updated_at,
    }));
    const raw = localStorage.getItem('mylife-excerpts');
    if (raw) {
      const parsed = JSON.parse(raw);
      const existing = parsed.state?.excerpts || [];
      const existingMap = new Map(existing.map((e: Record<string, unknown>) => [e.id, e]));
      for (const ce of mapped) existingMap.set(ce.id, { ...existingMap.get(ce.id) || {}, ...ce });
      parsed.state.excerpts = Array.from(existingMap.values()).sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
      );
      localStorage.setItem('mylife-excerpts', JSON.stringify(parsed));
    }
  }

  // Pull emotion logs
  const cloudEmotions = await pullTable('emotion_logs', '*');
  if (cloudEmotions.length > 0) {
    const mapped = cloudEmotions.map((e) => ({
      id: e.id, writingId: e.writing_id, date: e.date, overallMood: e.overall_mood,
      scores: e.scores, summary: e.summary, createdAt: e.created_at,
    }));
    const raw = localStorage.getItem('mylife-emotions');
    if (raw) {
      const parsed = JSON.parse(raw);
      const existing = parsed.state?.logs || [];
      const existingMap = new Map(existing.map((l: Record<string, unknown>) => [l.id, l]));
      for (const ce of mapped) existingMap.set(ce.id, { ...existingMap.get(ce.id) || {}, ...ce });
      parsed.state.logs = Array.from(existingMap.values());
      localStorage.setItem('mylife-emotions', JSON.stringify(parsed));
    }
  }

  // Pull created poems
  const cloudPoems = await pullTable('created_poems', '*');
  if (cloudPoems.length > 0) {
    const mapped = cloudPoems.map((p) => ({
      id: p.id, title: p.title, content: p.content, genre: p.genre,
      sourceIds: p.source_ids, aiProvider: p.ai_provider, aiModel: p.ai_model,
      editedContent: p.edited_content, createdAt: p.created_at,
      updatedAt: p.created_at,
    }));
    const raw = localStorage.getItem('mylife-created-poems');
    if (raw) {
      const parsed = JSON.parse(raw);
      const existing = parsed.state?.poems || [];
      const existingMap = new Map(existing.map((p: Record<string, unknown>) => [p.id, p]));
      for (const cp of mapped) existingMap.set(cp.id, { ...existingMap.get(cp.id) || {}, ...cp });
      parsed.state.poems = Array.from(existingMap.values()).sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
        new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
      );
      localStorage.setItem('mylife-created-poems', JSON.stringify(parsed));
    }
  }
}
