'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { searchAll, TYPE_LABELS, TYPE_ICONS, type SearchResult } from '@/lib/search';

export function SearchPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim().length >= 1) {
      setResults(searchAll(q));
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    router.push(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) return null;

  // Group results by type
  const grouped = new Map<string, SearchResult[]>();
  for (const r of results) {
    const existing = grouped.get(r.type) || [];
    existing.push(r);
    grouped.set(r.type, existing);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 top-[15vh] z-50 mx-auto max-w-xl">
        <div className="rounded-2xl border border-border bg-bg-elevated shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-text-tertiary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索日记、随笔、摘录、诗词..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <kbd className="text-[10px] text-text-tertiary bg-bg-secondary px-1.5 py-0.5 rounded font-mono">
              ESC
            </kbd>
            {query && (
              <button
                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {Array.from(grouped.entries()).map(([type, items]) => (
                <div key={type}>
                  <div className="px-4 py-1.5 text-[10px] font-medium text-text-tertiary uppercase bg-bg-secondary/50">
                    {TYPE_ICONS[type]} {TYPE_LABELS[type]} ({items.length})
                  </div>
                  {items.map((item, i) => {
                    const globalIndex = results.indexOf(item);
                    return (
                      <button
                        key={item.type + item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full text-left px-4 py-2.5 transition-colors ${
                          globalIndex === selectedIndex
                            ? 'bg-accent/10'
                            : 'hover:bg-bg-secondary'
                        }`}
                      >
                        <p className="text-sm font-medium text-text-primary truncate">
                          {item.title}
                        </p>
                        <p
                          className="text-xs text-text-tertiary mt-0.5 line-clamp-1"
                          dangerouslySetInnerHTML={{ __html: item.excerpt }}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {query.trim().length >= 1 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">
              没有找到相关结果
            </div>
          )}

          {/* Footer hint */}
          {query.trim().length >= 1 && (
            <div className="px-4 py-2 border-t border-border text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }}
                className="text-xs text-accent hover:underline"
              >
                查看全部结果 →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
