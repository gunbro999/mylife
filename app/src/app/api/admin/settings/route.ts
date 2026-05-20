import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: settings } = await db.from('app_settings').select('*');
    const { data: announcements } = await db
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    const settingsMap: Record<string, unknown> = {};
    for (const s of settings ?? []) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      settings: settingsMap,
      announcements: announcements ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const body = await req.json();

    if (body.settings) {
      for (const [key, value] of Object.entries(body.settings)) {
        await db.from('app_settings').upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const body = await req.json();

    if (body.action === 'create_announcement') {
      await db.from('announcements').insert({
        content: body.content,
        is_active: true,
        created_by: body.userId,
      });
    } else if (body.action === 'delete_announcement') {
      await db.from('announcements').delete().eq('id', body.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
