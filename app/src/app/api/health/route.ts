import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const hasConfig = !!(supabaseUrl && supabaseKey);

  let supabaseReachable = false;
  let supabaseError = '';

  if (hasConfig) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: supabaseKey },
        signal: AbortSignal.timeout(5000),
      });
      supabaseReachable = res.ok || res.status < 500;
      if (!supabaseReachable) {
        supabaseError = `HTTP ${res.status}`;
      }
    } catch (e: any) {
      supabaseError = e.message || 'Unknown error';
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    config: {
      supabaseUrl: supabaseUrl ? `${supabaseUrl.slice(0, 8)}...${supabaseUrl.slice(-14)}` : '(empty)',
      supabaseKey: supabaseKey ? `${supabaseKey.slice(0, 8)}...${supabaseKey.slice(-6)}` : '(empty)',
      hasConfig,
    },
    supabaseReachable,
    supabaseError: supabaseError || null,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'not set',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'set' : 'not set',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'set' : 'not set',
    },
  });
}
