'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { ContentPreview } from '@/components/admin/ContentPreview';

interface WritingItem {
  id: string;
  type: string;
  title: string;
  userId: string;
  userEmail: string;
  wordCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContentResponse {
  writings: WritingItem[];
  total: number;
  totalPages: number;
  page: number;
}

const typeLabels: Record<string, string> = {
  diary: '日记',
  essay: '随笔',
  note: '小记',
  novel_chapter: '小说章节',
};

const typeEmojis: Record<string, string> = {
  diary: '📔',
  essay: '📝',
  note: '🟨',
  novel_chapter: '📚',
};

export default function AdminContentPage() {
  const {
    contentType,
    contentAuthor,
    contentSearch,
    contentSort,
    contentPage,
    setContentType,
    setContentSearch,
    setContentSort,
    setContentPage,
  } = useAdminStore();

  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewWriting, setPreviewWriting] = useState<WritingItem | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [searchInput, setSearchInput] = useState(contentSearch);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: contentType,
      author: contentAuthor,
      search: contentSearch,
      sort: contentSort,
      page: String(contentPage),
    });
    const res = await fetch(`/api/admin/content?${params}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [contentType, contentAuthor, contentSearch, contentSort, contentPage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Read author param from store once on mount (redirect from user detail)
  useEffect(() => {
    const author = new URLSearchParams(window.location.search).get('author');
    if (author) {
      const { setContentAuthor } = useAdminStore.getState();
      setContentAuthor(author);
    }
  }, []);

  const handlePreview = async (writing: WritingItem) => {
    setPreviewWriting(writing);
    const res = await fetch(`/api/admin/content?id=${writing.id}`);
    const d = await res.json();
    setPreviewContent(d.content || '');
  };

  const handleDelete = async (writingId: string) => {
    if (!window.confirm('确定删除这条内容？')) return;
    await fetch(`/api/admin/content?id=${writingId}`, { method: 'DELETE' });
    fetchContent();
  };

  const types = ['all', 'diary', 'essay', 'note', 'novel_chapter'];

  return (
    <div className="p-8">
      <h1 className="text-xl font-display font-bold text-text-primary mb-6">内容管理</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setContentType(t)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                contentType === t
                  ? 'bg-accent text-white'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {t === 'all' ? '全部' : typeLabels[t]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setContentSearch(searchInput)}
            placeholder="搜索标题/内容..."
            className="h-9 w-full rounded-lg border border-border bg-bg-elevated pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/40"
          />
        </div>
        <select
          value={contentSort}
          onChange={(e) => setContentSort(e.target.value)}
          className="h-9 rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary outline-none focus:border-accent/40"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="longest">最长</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-tertiary">加载中...</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">标题</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">作者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">字数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">操作</th>
                </tr>
              </thead>
              <tbody>
                {(data?.writings ?? []).map((w) => (
                  <tr key={w.id} className="border-b border-border/50 hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      {typeEmojis[w.type]} {typeLabels[w.type] || w.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary max-w-[200px] truncate">
                      {w.title || '无标题'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{w.userEmail}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{w.wordCount}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {new Date(w.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(w)}
                          className="rounded-lg border border-border p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-accent transition-colors"
                          title="查看"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="rounded-lg border border-border p-1.5 text-text-tertiary hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.writings?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-text-tertiary text-sm">
                      暂无内容
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-text-tertiary">
                  共 {data.total} 条，第 {data.page}/{data.totalPages} 页
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setContentPage(Math.max(1, contentPage - 1))}
                    disabled={contentPage <= 1}
                    className="rounded-lg border border-border p-1.5 text-text-tertiary hover:bg-bg-secondary disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setContentPage(Math.min(data.totalPages, contentPage + 1))}
                    disabled={contentPage >= data.totalPages}
                    className="rounded-lg border border-border p-1.5 text-text-tertiary hover:bg-bg-secondary disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content Preview */}
      {previewWriting && (
        <ContentPreview
          writing={previewWriting}
          content={previewContent}
          onClose={() => { setPreviewWriting(null); setPreviewContent(''); }}
        />
      )}
    </div>
  );
}
