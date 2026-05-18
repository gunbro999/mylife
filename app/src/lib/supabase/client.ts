'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Runtime config — can be set via setRuntimeConfig() as fallback
let runtimeUrl = '';
let runtimeKey = '';

export function setRuntimeConfig(url: string, key: string) {
  runtimeUrl = url;
  runtimeKey = key;
  // Force recreate client on next createClient() call
  supabaseClient = null;
}

function getConfig() {
  // 1) window.__MYLIFE_CONFIG__ (injected by layout at request time)
  if (typeof window !== 'undefined' && (window as any).__MYLIFE_CONFIG__) {
    const c = (window as any).__MYLIFE_CONFIG__ as { url: string; key: string };
    if (c.url && c.key) return c;
  }
  // 2) Runtime config (set by authStore after fetching /api/config)
  if (runtimeUrl && runtimeKey) {
    return { url: runtimeUrl, key: runtimeKey };
  }
  // 3) Env vars (works in dev, may be empty in production build)
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (supabaseClient) return supabaseClient;

  const config = getConfig();
  supabaseClient = createBrowserClient<Database>(config.url, config.key);
  return supabaseClient;
}
