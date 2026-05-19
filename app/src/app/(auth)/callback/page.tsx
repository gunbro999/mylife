'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError('会话验证失败: ' + sessionError.message);
        setTimeout(() => router.replace('/login'), 2000);
        return;
      }
      if (session) {
        router.replace('/');
      } else {
        // No session — the OAuth code exchange may need a moment
        // Retry once after a short delay
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            router.replace('/');
          } else {
            router.replace('/login');
          }
        }, 1500);
      }
    });
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-theme-bg">
      <div className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <div className="h-8 w-8 rounded-full border-2 border-red-400 flex items-center justify-center">
              <span className="text-red-400 text-sm">!</span>
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <p className="text-xs text-text-tertiary">即将跳转到登录页...</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted-foreground">验证中...</p>
          </>
        )}
      </div>
    </div>
  );
}
