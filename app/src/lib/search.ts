import { useWritingStore } from '@/stores/writingStore';
import { useExcerptStore } from '@/stores/excerptStore';
import { useNovelStore } from '@/stores/novelStore';
import { stripHtml } from './utils';
import poemsData from '@/data/poems.json';

export interface SearchResult {
  type: 'diary' | 'essay' | 'note' | 'novel' | 'chapter' | 'character' | 'world-setting' | 'excerpt' | 'poem';
  id: string;
  title: string;
  excerpt: string;
  url: string;
  updatedAt: string;
}

/** Bigram tokenize a Chinese string (simple but fast, works client-side). */
function tokenize(text: string): string[] {
  const cleaned = text.replace(/[，。！？、；：""''（）【】《》\s\n\r]+/g, '').trim();
  if (cleaned.length === 0) return [];
  const tokens: string[] = [];
  for (let i = 0; i < cleaned.length - 1; i++) {
    tokens.push(cleaned.slice(i, i + 2));
  }
  tokens.push(cleaned);
  return tokens;
}

function matchScore(query: string, text: string): { score: number; snippet: string } {
  const lowerQ = query.toLowerCase();
  const lowerT = text.toLowerCase();
  let score = 0;

  // Exact match bonus
  const exactIdx = lowerT.indexOf(lowerQ);
  if (exactIdx !== -1) {
    score += 100;
  }

  // Bigram overlap
  const qTokens = tokenize(lowerQ);
  const tTokens = tokenize(lowerT);
  const tSet = new Set(tTokens);
  let overlap = 0;
  for (const t of qTokens) {
    if (tSet.has(t)) overlap++;
  }
  score += overlap * 10;

  // Recency bias (handled later)

  // Generate snippet
  let snippet = '';
  if (exactIdx !== -1) {
    const start = Math.max(0, exactIdx - 20);
    const end = Math.min(text.length, exactIdx + lowerQ.length + 30);
    snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
  } else {
    snippet = text.slice(0, 80) + (text.length > 80 ? '...' : '');
  }

  return { score, snippet };
}

function highlightKeyword(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="search-highlight">$1</mark>');
}

export function searchAll(query: string): SearchResult[] {
  if (!query.trim() || query.trim().length < 1) return [];

  const results: SearchResult[] = [];

  // Writings
  const writings = useWritingStore.getState().writings;
  for (const w of writings) {
    const plainContent = stripHtml(w.content);
    const titleResult = matchScore(query, w.title);
    const contentResult = matchScore(query, plainContent);
    const score = Math.max(titleResult.score, contentResult.score);

    if (score > 0) {
      results.push({
        type: w.type,
        id: w.id,
        title: w.title || '无标题',
        excerpt: contentResult.score > titleResult.score ? contentResult.snippet : titleResult.snippet,
        url: `/${w.type === 'note' ? 'notes' : w.type === 'essay' ? 'essays' : 'diary'}/${w.id}`,
        updatedAt: w.updatedAt,
      });
    }
  }

  // Excerpts
  const excerpts = useExcerptStore.getState().excerpts;
  for (const e of excerpts) {
    const text = `${e.content} ${e.author} ${e.sourceTitle || ''}`;
    const result = matchScore(query, text);
    if (result.score > 0) {
      results.push({
        type: 'excerpt',
        id: e.id,
        title: `${e.author} — ${e.sourceTitle || '摘录'}`,
        excerpt: result.snippet,
        url: `/excerpts`,
        updatedAt: e.updatedAt,
      });
    }
  }

  // Novels
  const novels = useNovelStore.getState().novels;
  for (const n of novels) {
    const result = matchScore(query, `${n.title} ${n.description}`);
    if (result.score > 0) {
      results.push({
        type: 'novel',
        id: n.id,
        title: n.title || '无标题小说',
        excerpt: result.snippet,
        url: `/novels/${n.id}`,
        updatedAt: n.updatedAt,
      });
    }
  }

  // Chapters
  const chapters = useNovelStore.getState().chapters;
  for (const ch of chapters) {
    const plainContent = stripHtml((ch as unknown as Record<string, string>).content || '');
    const result = matchScore(query, `${ch.title} ${plainContent}`);
    if (result.score > 0) {
      const novel = novels.find((n) => n.id === ch.novelId);
      results.push({
        type: 'chapter',
        id: ch.id,
        title: `${novel?.title || '未知小说'} / ${ch.title || '无标题章节'}`,
        excerpt: result.snippet,
        url: `/novels/${ch.novelId}/chapters/${ch.id}`,
        updatedAt: (ch as unknown as Record<string, string>).updatedAt || '',
      });
    }
  }

  // Characters
  const characters = useNovelStore.getState().characters;
  for (const ch of characters) {
    const text = `${ch.name} ${ch.personality} ${ch.background}`;
    const result = matchScore(query, text);
    if (result.score > 0) {
      const novel = novels.find((n) => n.id === ch.novelId);
      results.push({
        type: 'character',
        id: ch.id,
        title: `${ch.name} (${novel?.title || '未知小说'})`,
        excerpt: result.snippet,
        url: `/novels/${ch.novelId}`,
        updatedAt: (ch as unknown as Record<string, string>).createdAt || '',
      });
    }
  }

  // World Settings
  const worldSettings = useNovelStore.getState().worldSettings;
  for (const ws of worldSettings) {
    const result = matchScore(query, `${ws.title} ${ws.content}`);
    if (result.score > 0) {
      const novel = novels.find((n) => n.id === ws.novelId);
      results.push({
        type: 'world-setting',
        id: ws.id,
        title: `${novel?.title || '未知小说'} / ${ws.title}`,
        excerpt: result.snippet,
        url: `/novels/${ws.novelId}`,
        updatedAt: (ws as unknown as Record<string, string>).createdAt || '',
      });
    }
  }

  // Poems
  const poems = poemsData as Array<{
    id: string; title: string; author: string; dynasty: string; content: string[];
    type: string; tags: Record<string, string[]>;
  }>;
  for (const p of poems) {
    const fullText = `${p.title} ${p.author} ${p.content.join('')}`;
    const result = matchScore(query, fullText);
    if (result.score > 0) {
      results.push({
        type: 'poem',
        id: p.id,
        title: `《${p.title}》— ${p.author}`,
        excerpt: result.snippet,
        url: '/poetry',
        updatedAt: '',
      });
    }
  }

  // Sort by relevance (desc) then date (desc)
  results.sort((a, b) => {
    const scoreA = matchScore(query, `${a.title} ${a.excerpt}`).score;
    const scoreB = matchScore(query, `${b.title} ${b.excerpt}`).score;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Add highlighted excerpt
  return results.map((r) => ({
    ...r,
    excerpt: highlightKeyword(r.excerpt, query),
  }));
}

export const TYPE_LABELS: Record<string, string> = {
  diary: '日记',
  essay: '随笔',
  note: '笔记',
  novel: '小说',
  chapter: '章节',
  character: '人物',
  'world-setting': '世界观',
  excerpt: '摘录',
  poem: '诗词',
};

export const TYPE_ICONS: Record<string, string> = {
  diary: '📔',
  essay: '✍️',
  note: '📝',
  novel: '📖',
  chapter: '📄',
  character: '👤',
  'world-setting': '🌍',
  excerpt: '💎',
  poem: '📜',
};
