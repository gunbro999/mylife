'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, FileJson, Archive, FolderOpen, FolderCheck, Key, Shield, Smartphone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useWritingStore } from '@/stores/writingStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { exportJSONBackup, exportToZip } from '@/lib/export';

export default function SettingsPage() {
  const writings = useWritingStore((s) => s.writings);
  const [exporting, setExporting] = useState(false);
  const workspaceReady = useWorkspaceStore((s) => s.isReady);
  const workspaceName = useWorkspaceStore((s) => s.directoryName);
  const pickDirectory = useWorkspaceStore((s) => s.pickDirectory);
  const restoreWorkspace = useWorkspaceStore((s) => s.restore);
  const clearWorkspace = useWorkspaceStore((s) => s.clear);
  const [workspaceSupported, setWorkspaceSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('showDirectoryPicker' in window)) {
      setWorkspaceSupported(false);
    } else {
      restoreWorkspace();
    }
  }, [restoreWorkspace]);

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

      {/* Workspace Section */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <FolderOpen size={15} />
          本地存储位置
        </h2>

        {!workspaceSupported ? (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-text-tertiary">
              你的浏览器不支持本地文件系统访问。请使用 Chromium 内核浏览器（Chrome / Edge / Opera）。
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                {workspaceReady ? (
                  <>
                    <div className="flex items-center gap-2">
                      <FolderCheck size={16} className="text-green-500 shrink-0" />
                      <p className="text-sm font-medium text-text-primary truncate">
                        {workspaceName}
                      </p>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      写作内容将保存到此文件夹，上传按钮可同步到云端
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-primary">未设置存储位置</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      选择一个本地文件夹用于存储写作文件（.md 格式）
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {workspaceReady && (
                  <button
                    onClick={clearWorkspace}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-tertiary hover:text-vermillion hover:border-vermillion/30 transition-colors"
                  >
                    清除
                  </button>
                )}
                <button
                  onClick={pickDirectory}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                >
                  {workspaceReady ? '更改' : '选择文件夹'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

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

      {/* Account Section */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
          <Shield size={15} />
          账号安全
        </h2>

        <div className="space-y-3">
          {/* Change Password */}
          <ChangePasswordCard />
          {/* Delete Account */}
          <DeleteAccountCard />
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

function ChangePasswordCard() {
  const [show, setShow] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const user = useAuthStore((s) => s.user);

  const handleChange = async () => {
    if (newPassword.length < 6) {
      setMsg('密码至少6位');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMsg(error.message);
      } else {
        setMsg('密码修改成功');
        setNewPassword('');
        setShow(false);
      }
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : '修改失败');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {!show ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">修改密码</p>
            <p className="text-xs text-text-tertiary mt-0.5">
              登录账号: {user?.email || '未知'}
            </p>
          </div>
          <button
            onClick={() => setShow(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <Key size={13} />
            修改
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary">设置新密码</p>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="输入新密码（至少6位）"
            className="h-9 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/40"
          />
          {msg && (
            <p className={`text-xs ${msg.includes('成功') ? 'text-green-500' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleChange}
              disabled={loading}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? '提交中...' : '确认修改'}
            </button>
            <button
              onClick={() => { setShow(false); setNewPassword(''); setMsg(''); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-tertiary hover:bg-bg-secondary transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DeleteAccountCard() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Delete user data via API
      await fetch(`/api/admin/users?userId=${user.id}`, { method: 'DELETE' });
      await signOut();
      window.location.href = '/login';
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '删除失败');
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-600">删除账号</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            永久删除你的账号及所有写作数据，此操作不可恢复
          </p>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          删除账号
        </button>
      </div>

      {confirming && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setConfirming(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-96 rounded-xl border border-border bg-bg-elevated shadow-lg p-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">确认删除账号</h3>
            <p className="text-sm text-text-secondary mb-4">
              确定要永久删除账号 <strong>{user?.email}</strong> 吗？此操作将删除你的所有日记、随笔、小记、小说以及其他数据，且无法恢复。
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
