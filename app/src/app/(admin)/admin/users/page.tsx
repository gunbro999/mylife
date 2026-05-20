'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldBan, ShieldCheck } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { UserDetailPanel } from '@/components/admin/UserDetailPanel';

interface UserItem {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
  banned: boolean;
  writingCount: number;
}

interface UserListResponse {
  users: UserItem[];
  total: number;
  totalPages: number;
  page: number;
}

export default function AdminUsersPage() {
  const {
    userSearch,
    userSort,
    userPage,
    setUserSearch,
    setUserSort,
    setUserPage,
  } = useAdminStore();

  const [data, setData] = useState<UserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [searchInput, setSearchInput] = useState(userSearch);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search: userSearch, sort: userSort, page: String(userPage) });
    const res = await fetch(`/api/admin/users?${params}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [userSearch, userSort, userPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setUserSearch(searchInput);
  };

  const handleBan = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'ban' }),
    });
    setDetailUser(null);
    fetchUsers();
  };

  const handleUnban = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action: 'unban' }),
    });
    setDetailUser(null);
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
    setDetailUser(null);
    fetchUsers();
  };

  const handleViewContent = (userId: string) => {
    const { setContentAuthor } = useAdminStore.getState();
    setContentAuthor(userId);
    window.location.href = '/admin/content';
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-display font-bold text-text-primary mb-6">用户管理</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索邮箱..."
            className="h-9 w-full rounded-lg border border-border bg-bg-elevated pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/40"
          />
        </div>
        <select
          value={userSort}
          onChange={(e) => setUserSort(e.target.value)}
          className="h-9 rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary outline-none focus:border-accent/40"
        >
          <option value="newest">最新注册</option>
          <option value="oldest">最早注册</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">注册时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">写作数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary">操作</th>
                </tr>
              </thead>
              <tbody>
                {(data?.users ?? []).map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent text-xs font-bold">
                          {u.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-text-primary">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{u.writingCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.banned
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                        }`}
                      >
                        {u.banned ? <ShieldBan size={12} /> : <ShieldCheck size={12} />}
                        {u.banned ? '已禁用' : '正常'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailUser(u)}
                        className="rounded-lg border border-border px-3 py-1 text-xs text-text-secondary hover:bg-bg-secondary transition-colors"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                ))}
                {(data?.users?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center text-text-tertiary text-sm">
                      暂无用户
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-text-tertiary">
                  共 {data.total} 个用户，第 {data.page}/{data.totalPages} 页
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserPage(Math.max(1, userPage - 1))}
                    disabled={userPage <= 1}
                    className="rounded-lg border border-border p-1.5 text-text-tertiary hover:bg-bg-secondary disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setUserPage(Math.min(data.totalPages, userPage + 1))}
                    disabled={userPage >= data.totalPages}
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

      {/* User Detail Panel */}
      {detailUser && (
        <UserDetailPanel
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onBan={handleBan}
          onUnban={handleUnban}
          onDelete={handleDelete}
          onViewContent={handleViewContent}
        />
      )}
    </div>
  );
}
