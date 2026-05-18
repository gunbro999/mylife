import { NextResponse } from 'next/server';

export async function GET() {
  // Read non-NEXT_PUBLIC_ vars at runtime (never inlined)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return NextResponse.json({ supabaseUrl, supabaseKey });
}
