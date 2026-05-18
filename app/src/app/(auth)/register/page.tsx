'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signInWithWechat = useAuthStore((s) => s.signInWithWechat);
  const user = useAuthStore((s) => s.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    router.replace('/');
    return null;
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('注册成功！请检查邮箱确认链接。');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-theme-bg px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl text-accent-foreground shadow-lg">
            浮
          </div>
          <h1 className="font-serif text-2xl font-bold text-theme-text">加入浮生记</h1>
          <p className="mt-2 text-sm text-muted-foreground">开始记录你的生活</p>
        </div>

        <div className="rounded-2xl border border-theme-border bg-card p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-4">
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
                  placeholder="至少 6 位密码"
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
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-theme-border" />
            <span className="text-xs text-muted-foreground">或</span>
            <div className="h-px flex-1 bg-theme-border" />
          </div>

          <button
            onClick={() => signInWithWechat()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 py-2.5 text-sm font-medium text-green-700 transition-opacity hover:opacity-80 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          >
            微信注册
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            已有账号？{' '}
            <Link href="/login" className="font-medium text-accent hover:underline">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
