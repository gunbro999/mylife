'use client';

import { useEffect, useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

interface StatsData {
  dailyNewUsers: Record<string, number>;
  dailyWritingCounts: Record<string, number>;
  dailyWordCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  hourDistribution: Record<string, Record<number, number>>;
  topUsers: Array<{ userId: string; email: string; count: number }>;
}

const typeLabels: Record<string, string> = {
  diary: '日记',
  essay: '随笔',
  note: '小记',
  novel_chapter: '小说章节',
};

export default function AdminStatsPage() {
  const { statsRange, setStatsRange } = useAdminStore();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/stats?range=${statsRange}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [statsRange]);

  const handleExportCSV = () => {
    if (!data) return;
    let csv = 'Date,New Users,New Writings,Total Words\n';
    const allDates = [...new Set([
      ...Object.keys(data.dailyNewUsers),
      ...Object.keys(data.dailyWritingCounts),
    ])].sort();
    for (const d of allDates) {
      csv += `${d},${data.dailyNewUsers[d] || 0},${data.dailyWritingCounts[d] || 0},${data.dailyWordCounts[d] || 0}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mylife-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-display font-bold text-text-primary mb-6">数据统计</h1>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-text-tertiary">加载失败</div>;

  const maxNewUsers = Math.max(...Object.values(data.dailyNewUsers), 1);
  const maxWriting = Math.max(...Object.values(data.dailyWritingCounts), 1);
  const totalTypes = Object.values(data.typeCounts).reduce((a, b) => a + b, 0) || 1;
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
  const maxHour = Math.max(
    ...Object.values(data.hourDistribution).flatMap((d) => Object.values(d)),
    1
  );

  const sortedDates = [...new Set([
    ...Object.keys(data.dailyNewUsers),
    ...Object.keys(data.dailyWritingCounts),
  ])].sort();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold text-text-primary">数据统计</h1>
        <div className="flex items-center gap-3">
          <select
            value={statsRange}
            onChange={(e) => setStatsRange(e.target.value)}
            className="h-9 rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary outline-none focus:border-accent/40"
          >
            <option value="7">近7天</option>
            <option value="30">近30天</option>
            <option value="90">近90天</option>
            <option value="365">全部</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <Download size={13} />
            导出 CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Daily new users */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-accent" />
            每日新增用户
          </h2>
          <div className="flex items-end gap-1 h-40">
            {sortedDates.slice(-30).map((date) => {
              const count = data.dailyNewUsers[date] || 0;
              return (
                <div
                  key={date}
                  className="flex-1 rounded-t bg-blue-400/60 hover:bg-blue-400 transition-colors"
                  style={{ height: `${Math.max((count / maxNewUsers) * 140, 1)}px` }}
                  title={`${date}: ${count}`}
                />
              );
            })}
          </div>
        </div>

        {/* Daily writings */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-accent" />
            每日写作量
          </h2>
          <div className="flex items-end gap-1 h-40">
            {sortedDates.slice(-30).map((date) => {
              const count = data.dailyWritingCounts[date] || 0;
              return (
                <div
                  key={date}
                  className="flex-1 rounded-t bg-green-400/60 hover:bg-green-400 transition-colors"
                  style={{ height: `${Math.max((count / maxWriting) * 140, 1)}px` }}
                  title={`${date}: ${count}`}
                />
              );
            })}
          </div>
        </div>

        {/* Type distribution */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4">写作类型分布</h2>
          <div className="space-y-3">
            {Object.entries(data.typeCounts).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{typeLabels[type] || type}</span>
                  <span className="text-text-primary font-medium">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(count / totalTypes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hour heatmap */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4">用户活跃时段</h2>
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-2">
              {dayNames.map((d) => (
                <span key={d} className="text-[10px] text-text-tertiary h-5 flex items-center">
                  周{d}
                </span>
              ))}
            </div>
            <div className="flex-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h} className="flex-1 text-center text-[9px] text-text-tertiary mb-1">
                    {h}
                  </span>
                ))}
              </div>
              {dayNames.map((d) => (
                <div key={d} className="flex gap-0.5 mb-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const val = data.hourDistribution[d]?.[h] || 0;
                    const opacity = val / maxHour;
                    return (
                      <div
                        key={h}
                        className="flex-1 h-5 rounded-sm"
                        style={{
                          backgroundColor: `rgba(59, 130, 246, ${Math.max(opacity, 0.02)})`,
                        }}
                        title={`周${d} ${h}:00 - ${val} 篇`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top users */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5 col-span-2">
          <h2 className="text-sm font-medium text-text-primary mb-4">Top 活跃用户</h2>
          <div className="space-y-2">
            {data.topUsers.map((u, i) => (
              <div key={u.userId} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      i < 3 ? 'bg-accent text-white' : 'bg-bg-secondary text-text-tertiary'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-text-primary">{u.email}</span>
                </div>
                <span className="text-sm text-text-secondary font-medium">{u.count} 篇</span>
              </div>
            ))}
            {data.topUsers.length === 0 && (
              <p className="text-xs text-text-tertiary">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
