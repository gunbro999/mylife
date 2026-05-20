'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/admin/StatsCard';
import { TrendingUp, Users, FileText, Activity } from 'lucide-react';

interface OverviewData {
  totalUsers: number;
  todayNewUsers: number;
  totalWritings: number;
  todayActiveUsers: number;
  recentUsers: Array<{ id: string; email: string; created_at: string }>;
  recentPublic: Array<{ id: string; title: string; user_id: string; type: string; created_at: string }>;
  typeCounts: Record<string, number>;
  dailyGrowth: Record<string, number>;
}

const typeLabels: Record<string, string> = {
  diary: '日记',
  essay: '随笔',
  note: '小记',
  novel_chapter: '小说章节',
};

export default function AdminDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-display font-bold text-text-primary mb-6">仪表盘</h1>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-text-tertiary">加载失败</div>;
  }

  const totalTypes = Object.values(data.typeCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="p-8">
      <h1 className="text-xl font-display font-bold text-text-primary mb-6">仪表盘</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="总用户数"
          value={data.totalUsers}
          subtitle={`今日 +${data.todayNewUsers}`}
        />
        <StatsCard
          label="今日新增"
          value={data.todayNewUsers}
          subtitle="注册用户"
        />
        <StatsCard
          label="总写作数"
          value={data.totalWritings}
          subtitle={`${data.todayActiveUsers} 人今日活跃`}
        />
        <StatsCard
          label="今日活跃"
          value={data.todayActiveUsers}
          subtitle="用户"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* User growth chart (simple bar chart) */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-accent" />
            用户增长趋势 (近30天)
          </h2>
          <div className="flex items-end gap-1 h-40">
            {Object.entries(data.dailyGrowth)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-30)
              .map(([date, count]) => {
                const maxCount = Math.max(...Object.values(data.dailyGrowth), 1);
                const height = (count / maxCount) * 140;
                return (
                  <div
                    key={date}
                    className="flex-1 rounded-t bg-accent/60 hover:bg-accent transition-colors"
                    style={{ height: `${Math.max(height, 2)}px` }}
                    title={`${date}: ${count} 人`}
                  />
                );
              })}
          </div>
          <p className="text-xs text-text-tertiary mt-2 text-right">每日注册人数</p>
        </div>

        {/* Type distribution (simple horizontal bar) */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <FileText size={14} className="text-accent" />
            写作类型分布
          </h2>
          <div className="space-y-3">
            {Object.entries(data.typeCounts).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{typeLabels[type] || type}</span>
                  <span className="text-text-primary font-medium">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${(count / totalTypes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent items */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <Users size={14} className="text-accent" />
            最近注册用户
          </h2>
          <div className="space-y-3">
            {(data.recentUsers ?? []).map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold">
                    {u.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">{u.email}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!data.recentUsers || data.recentUsers.length === 0) && (
              <p className="text-xs text-text-tertiary">暂无数据</p>
            )}
          </div>
        </div>

        {/* Recent writings */}
        <div className="rounded-xl border border-border bg-bg-elevated p-5">
          <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
            <Activity size={14} className="text-accent" />
            最近写作
          </h2>
          <div className="space-y-3">
            {(data.recentPublic ?? []).map((w) => (
              <div key={w.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary truncate max-w-[200px]">
                    {w.title || '无标题'}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {typeLabels[w.type] || w.type} · {new Date(w.created_at).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            ))}
            {(!data.recentPublic || data.recentPublic.length === 0) && (
              <p className="text-xs text-text-tertiary">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
