'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, MessageCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInWithWechat = useAuthStore((s) => s.signInWithWechat);
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in
  if (user) {
    router.replace(redirect);
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInWithEmail(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.replace(redirect);
    }
  };

  const handleWechatLogin = async () => {
    setError('');
    await signInWithWechat();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-bg px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl text-accent-foreground shadow-lg">
            浮
          </div>
          <h1 className="font-serif text-2xl font-bold text-theme-text">欢迎回到浮生记</h1>
          <p className="mt-2 text-sm text-muted-foreground">继续记录你的生活</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-theme-border bg-card p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Email Login */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-theme-text">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-theme-border bg-theme-bg py-2.5 pl-10 pr-3 text-sm text-theme-text placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-theme-text">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="输入密码"
                  required
                  className="w-full rounded-lg border border-theme-border bg-theme-bg py-2.5 pl-10 pr-10 text-sm text-theme-text placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-theme-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-theme-border" />
            <span className="text-xs text-muted-foreground">或</span>
            <div className="h-px flex-1 bg-theme-border" />
          </div>

          {/* WeChat Login */}
          <button
            onClick={handleWechatLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 py-2.5 text-sm font-medium text-green-700 transition-opacity hover:opacity-80 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          >
            <MessageCircle className="h-4 w-4" />
            微信扫码登录
          </button>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            还没有账号？{' '}
            <Link href="/register" className="font-medium text-accent hover:underline">
              注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
