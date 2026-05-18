'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, FileJson, Archive } from 'lucide-react';
import Link from 'next/link';
import { useWritingStore } from '@/stores/writingStore';
import { exportJSONBackup, exportToZip } from '@/lib/export';

export default function SettingsPage() {
  const writings = useWritingStore((s) => s.writings);
  const [exporting, setExporting] = useState(false);

  const handleExportJSON = () => {
    exportJSONBackup();
  };

  const handleExportAllMarkdown = async () => {
    if (writings.length === 0) return;
    setExporting(true);
    const timestamp = new Date().toISOString().slice(0, 10);
    await exportToZip(writings, `mylife-全部写作-${timestamp}.zip`);
    setExporting(false);
  };

  const handleExportDiaries = async () => {
    const diaries = writings.filter((w) => w.type === 'diary');
    if (diaries.length === 0) return;
    setExporting(true);
    const timestamp = new Date().toISOString().slice(0, 10);
    await exportToZip(diaries, `mylife-日记-${timestamp}.zip`);
    setExporting(false);
  };

  const handleExportEssays = async () => {
    const essays = writings.filter((w) => w.type === 'essay');
    if (essays.length === 0) return;
    setExporting(true);
    const timestamp = new Date().toISOString().slice(0, 10);
    await exportToZip(essays, `mylife-随笔-${timestamp}.zip`);
    setExporting(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary mb-8"
      >
        <ArrowLeft size={14} />
        返回首页
      </Link>

      <h1 className="text-2xl font-display font-bold text-text-primary tracking-widest mb-2">
        设置与数据管理
      </h1>
      <p className="text-xs text-text-tertiary mb-8">管理你的写作数据</p>

      {/* Export Section */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <Download size={15} />
          数据导出
        </h2>

        <div className="space-y-3">
          {/* All writings as Markdown ZIP */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">导出全部写作为 Markdown</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                所有日记、随笔、笔记打包为 ZIP 下载 ({writings.length} 篇)
              </p>
            </div>
            <button
              onClick={handleExportAllMarkdown}
              disabled={exporting || writings.length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Archive size={13} />
              {exporting ? '导出中...' : '导出 ZIP'}
            </button>
          </div>

          {/* Only diaries */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">导出日记为 Markdown</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                仅导出日记 ({writings.filter((w) => w.type === 'diary').length} 篇)
              </p>
            </div>
            <button
              onClick={handleExportDiaries}
              disabled={exporting || writings.filter((w) => w.type === 'diary').length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Archive size={13} />
              导出 ZIP
            </button>
          </div>

          {/* Only essays */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">导出随笔为 Markdown</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                仅导出随笔 ({writings.filter((w) => w.type === 'essay').length} 篇)
              </p>
            </div>
            <button
              onClick={handleExportEssays}
              disabled={exporting || writings.filter((w) => w.type === 'essay').length === 0}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Archive size={13} />
              导出 ZIP
            </button>
          </div>

          {/* JSON Backup */}
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">导出完整数据备份 (JSON)</p>
              <p className="text-xs text-text-tertiary mt-0.5">
                包含所有写作、小说、摘录、情绪、诗歌等数据的完整备份
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary transition-colors shrink-0"
            >
              <FileJson size={13} />
              导出 JSON
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <FileText size={15} />
          写作统计
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '日记', count: writings.filter((w) => w.type === 'diary').length },
            { label: '随笔', count: writings.filter((w) => w.type === 'essay').length },
            { label: '笔记', count: writings.filter((w) => w.type === 'note').length },
            {
              label: '总字数',
              count: writings.reduce((sum, w) => sum + w.wordCount, 0).toLocaleString(),
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-lg font-bold text-text-primary">{stat.count}</p>
              <p className="text-[11px] text-text-tertiary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
