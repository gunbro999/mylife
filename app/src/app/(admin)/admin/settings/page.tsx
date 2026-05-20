'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, Trash2, Check, X } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { useAuthStore } from '@/stores/authStore';

interface SettingsData {
  settings: Record<string, unknown>;
  announcements: Array<{
    id: string;
    content: string;
    is_active: boolean;
    created_at: string;
  }>;
}

const DEFAULT_SETTINGS: Record<string, unknown> = {
  ai_provider: 'claude',
  ai_model: 'claude-sonnet-4-6',
  enable_registration: true,
  enable_public_share: true,
  enable_ai_assistant: true,
  enable_music: true,
  maintenance_mode: false,
};

const tabs = [
  { key: 'ai', label: 'AI 配置' },
  { key: 'features', label: '功能开关' },
  { key: 'announcements', label: '平台公告' },
];

export default function AdminSettingsPage() {
  const { settingsTab, setSettingsTab } = useAdminStore();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [aiProvider, setAiProvider] = useState('claude');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-6');
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enablePublicShare, setEnablePublicShare] = useState(true);
  const [enableAiAssistant, setEnableAiAssistant] = useState(true);
  const [enableMusic, setEnableMusic] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d: SettingsData) => {
        setData(d);
        const s = d.settings;
        if (s.ai_provider) setAiProvider(String(s.ai_provider));
        if (s.ai_model) setAiModel(String(s.ai_model));
        if (s.enable_registration !== undefined) setEnableRegistration(Boolean(s.enable_registration));
        if (s.enable_public_share !== undefined) setEnablePublicShare(Boolean(s.enable_public_share));
        if (s.enable_ai_assistant !== undefined) setEnableAiAssistant(Boolean(s.enable_ai_assistant));
        if (s.enable_music !== undefined) setEnableMusic(Boolean(s.enable_music));
        if (s.maintenance_mode !== undefined) setMaintenanceMode(Boolean(s.maintenance_mode));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ai_provider: aiProvider,
          ai_model: aiModel,
          enable_registration: enableRegistration,
          enable_public_share: enablePublicShare,
          enable_ai_assistant: enableAiAssistant,
          enable_music: enableMusic,
          maintenance_mode: maintenanceMode,
        },
      }),
    });
    setSaving(false);
    setSavedMsg('保存成功');
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementText.trim()) return;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_announcement',
        content: announcementText.trim(),
        userId: user?.id,
      }),
    });
    setAnnouncementText('');
    // Refresh
    const res = await fetch('/api/admin/settings');
    const d = await res.json();
    setData(d);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_announcement', id }),
    });
    const res = await fetch('/api/admin/settings');
    const d = await res.json();
    setData(d);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-display font-bold text-text-primary mb-6">系统设置</h1>
        <div className="h-64 rounded-xl bg-bg-secondary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-display font-bold text-text-primary mb-6">系统设置</h1>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-40 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSettingsTab(tab.key)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                settingsTab === tab.key
                  ? 'bg-accent text-white font-medium'
                  : 'text-text-secondary hover:bg-bg-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-lg space-y-4">
          {settingsTab === 'ai' && (
            <div className="rounded-xl border border-border bg-bg-elevated p-5 space-y-4">
              <h2 className="text-sm font-medium text-text-primary">AI 服务商配置</h2>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">默认提供商</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary outline-none focus:border-accent/40"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-tertiary mb-1 block">默认模型</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary outline-none focus:border-accent/40"
                >
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                  <option value="claude-opus-4-7">Claude Opus 4.7</option>
                  <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? '保存中...' : '保存配置'}
                </button>
                {savedMsg && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Check size={12} /> {savedMsg}
                  </span>
                )}
              </div>
            </div>
          )}

          {settingsTab === 'features' && (
            <div className="rounded-xl border border-border bg-bg-elevated p-5 space-y-4">
              <h2 className="text-sm font-medium text-text-primary">功能开关</h2>
              {[
                { label: '开放注册', desc: '允许新用户注册', value: enableRegistration, set: setEnableRegistration },
                { label: '公开分享', desc: '允许用户创建公开分享链接', value: enablePublicShare, set: setEnablePublicShare },
                { label: 'AI 写作助手', desc: '启用 AI 续写/润色/改写功能', value: enableAiAssistant, set: setEnableAiAssistant },
                { label: '音乐推荐', desc: '启用音乐推荐功能', value: enableMusic, set: setEnableMusic },
                { label: '维护模式', desc: '开启后仅管理员可访问', value: maintenanceMode, set: setMaintenanceMode },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-tertiary">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => { item.set(!item.value); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.value ? 'bg-accent' : 'bg-bg-secondary border border-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        item.value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
              <div className="pt-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? '保存中...' : '保存设置'}
                </button>
                {savedMsg && (
                  <span className="text-xs text-green-500 flex items-center gap-1 ml-3">
                    <Check size={12} /> {savedMsg}
                  </span>
                )}
              </div>
            </div>
          )}

          {settingsTab === 'announcements' && (
            <div className="rounded-xl border border-border bg-bg-elevated p-5 space-y-4">
              <h2 className="text-sm font-medium text-text-primary">平台公告</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="输入公告内容..."
                  className="h-9 flex-1 rounded-lg border border-border bg-bg-elevated px-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/40"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateAnnouncement()}
                />
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={!announcementText.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Plus size={14} />
                  发布
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {(data?.announcements ?? []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-bg-secondary/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-text-primary">{a.content}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {new Date(a.created_at).toLocaleDateString('zh-CN')}
                        {!a.is_active && ' · 已下线'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="rounded-lg p-1.5 text-text-tertiary hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(data?.announcements ?? []).length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-8">暂无公告</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
