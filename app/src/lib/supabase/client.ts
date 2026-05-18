'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

function getConfig() {
  if (typeof window !== 'undefined' && (window as any).__MYLIFE_CONFIG__) {
    return (window as any).__MYLIFE_CONFIG__ as { url: string; key: string };
  }
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
