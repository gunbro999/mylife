import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { isOfflineMode } from '@/lib/utils';
import type { User, Session } from '@supabase/supabase-js';

const MOCK_USER = {
  id: 'offline-user',
  email: 'offline@mylife.local',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: { display_name: '离线用户' },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
} as User;

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithWechat: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    if (isOfflineMode()) {
      set({
        user: MOCK_USER,
        session: null,
        loading: false,
        initialized: true,
      });
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      set({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
      });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, session, loading: false });
      });
    } catch {
      // Supabase unreachable — fall back to showing login form
      set({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  },

  signInWithEmail: async (email, password) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: '邮箱或密码错误' };
        }
        return { error: error.message };
      }
      return {};
    } catch (e: any) {
      const msg = e.message || String(e);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return { error: '无法连接服务器，请检查网络后重试' };
      }
      return { error: msg };
    }
  },

  signUpWithEmail: async (email, password) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (e: any) {
      const msg = e.message || String(e);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return { error: '无法连接服务器，请检查网络后重试' };
      }
      return { error: msg };
    }
  },

  signInWithWechat: async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'wechat',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  resetPassword: async (email) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return {};
  },
}));
