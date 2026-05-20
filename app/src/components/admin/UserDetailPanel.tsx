'use client';

import { X, Mail, Calendar, Clock, FileText } from 'lucide-react';

interface UserDetail {
  id: string;
  email: string;
  created_at: string;
  last_sign_in: string | null;
  banned: boolean;
  writingCount: number;
}

interface UserDetailPanelProps {
  user: UserDetail;
  onClose: () => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onDelete: (userId: string) => void;
  onViewContent: (userId: string) => void;
}

export function UserDetailPanel({
  user,
  onClose,
  onBan,
  onUnban,
  onDelete,
  onViewContent,
}: UserDetailPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-[400px] border-l border-border bg-bg-elevated shadow-lg overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-display font-bold text-text-primary">
            用户详情
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & Email */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent text-lg font-bold">
              {user.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user.email}</p>
              <p className="text-xs text-text-tertiary font-mono">{user.id.slice(0, 12)}...</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="rounded-xl border border-border bg-bg-secondary/50 p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={14} className="text-text-tertiary shrink-0" />
              <span className="text-text-tertiary">注册时间：</span>
              <span className="text-text-primary font-medium">
                {new Date(user.created_at).toLocaleString('zh-CN')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={14} className="text-text-tertiary shrink-0" />
              <span className="text-text-tertiary">最后登录：</span>
              <span className="text-text-primary font-medium">
                {user.last_sign_in
                  ? new Date(user.last_sign_in).toLocaleString('zh-CN')
                  : '从未登录'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FileText size={14} className="text-text-tertiary shrink-0" />
              <span className="text-text-tertiary">写作数量：</span>
              <span className="text-text-primary font-medium">{user.writingCount} 篇</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${user.banned ? 'bg-red-500' : 'bg-green-500'}`}
              />
              <span className="text-text-tertiary">状态：</span>
              <span className={`font-medium ${user.banned ? 'text-red-500' : 'text-green-500'}`}>
                {user.banned ? '已禁用' : '正常'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => onViewContent(user.id)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
            >
              查看该用户内容
            </button>
            {user.banned ? (
              <button
                onClick={() => onUnban(user.id)}
                className="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                启用账号
              </button>
            ) : (
              <button
                onClick={() => onBan(user.id)}
                className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                禁用账号
              </button>
            )}
            <button
              onClick={() => {
                if (window.confirm(`确定删除用户 ${user.email} 及其所有数据？此操作不可恢复。`)) {
                  onDelete(user.id);
                }
              }}
              className="w-full rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              删除账号及所有数据
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
