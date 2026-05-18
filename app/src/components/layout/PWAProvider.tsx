'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Non-critical
      });
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstall(false);
    }
    setInstallPrompt(null);
  };

  return (
    <>
      {children}
      {showInstall && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-elevated px-5 py-3 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent text-lg">
              浮
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">添加到主屏幕</p>
              <p className="text-xs text-text-tertiary">随时随地记录生活</p>
            </div>
            <button
              onClick={handleInstall}
              className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground hover:opacity-90"
            >
              安装
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="text-xs text-text-tertiary hover:text-text-primary"
            >
              稍后
            </button>
          </div>
        </div>
      )}
    </>
  );
}
