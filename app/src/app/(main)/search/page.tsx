'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft } from 'lucide-react';
import { searchAll, TYPE_LABELS, TYPE_ICONS, type SearchResult } from '@/lib/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchAll(query);
  }, [query]);

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return results;
    return results.filter((r) => r.type === typeFilter);
  }, [results, typeFilter]);

  // Count by type
  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of results) {
      counts.set(r.type, (counts.get(r.type) || 0) + 1);
    }
    return counts;
  }, [results]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary mb-4"
        >
          <ArrowLeft size={14} />
          返回首页
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Search size={22} className="text-accent" />
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词搜索..."
              className="w-full bg-transparent text-xl font-serif font-bold text-text-primary placeholder:text-text-tertiary/50 outline-none"
              autoFocus
            />
          </div>
        </div>

        {query.trim() && (
          <p className="text-sm text-text-tertiary mt-1">
            找到 {results.length} 个结果
          </p>
        )}
      </div>

      {/* Type filter tabs */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              typeFilter === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-bg-secondary text-text-secondary hover:bg-accent/10'
            }`}
          >
            全部 ({results.length})
          </button>
          {Array.from(typeCounts.entries()).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                typeFilter === type
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-bg-secondary text-text-secondary hover:bg-accent/10'
              }`}
            >
              {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((result: SearchResult) => (
            <Link
              key={result.type + result.id}
              href={result.url}
              className="block rounded-xl border border-border bg-card p-4 hover:border-accent/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-tertiary">
                  {TYPE_ICONS[result.type]} {TYPE_LABELS[result.type]}
                </span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">{result.title}</h3>
              <p
                className="text-sm text-text-tertiary line-clamp-2"
                dangerouslySetInnerHTML={{ __html: result.excerpt }}
              />
            </Link>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-text-tertiary/30 mb-4" />
          <p className="text-text-tertiary">未找到与 &ldquo;{query}&rdquo; 相关的内容</p>
          <p className="text-xs text-text-tertiary/60 mt-1">试试其他关键词</p>
        </div>
      ) : null}
    </div>
  );
}
