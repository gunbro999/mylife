import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '1');

    const allUsers: Array<{
      id: string;
      email: string;
      created_at: string;
      last_sign_in_at: string | null;
      banned: boolean;
      user_metadata: Record<string, unknown>;
    }> = [];
    let currentPage = 1;
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 100, page: currentPage });
      if (!data?.users?.length) break;
      for (const u of data.users) {
        allUsers.push({
          id: u.id,
          email: u.email ?? '',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null,
          banned: !!u.banned_until,
          user_metadata: u.user_metadata as Record<string, unknown>,
        });
      }
      if (data.users.length < 100) break;
      currentPage++;
    }

    let filtered = allUsers;
    if (search) {
      const q = search.toLowerCase();
      filtered = allUsers.filter((u) => u.email?.toLowerCase().includes(q));
    }

    if (sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const { data: writingCounts } = await db
      .from('writings')
      .select('user_id');

    const countMap: Record<string, number> = {};
    for (const w of writingCounts ?? []) {
      countMap[w.user_id] = (countMap[w.user_id] || 0) + 1;
    }

    const perPage = 20;
    const totalPages = Math.ceil(filtered.length / perPage);
    const start = (page - 1) * perPage;
    const paged = filtered.slice(start, start + perPage);

    return NextResponse.json({
      users: paged.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        banned: u.banned,
        writingCount: countMap[u.id] || 0,
      })),
      total: filtered.length,
      totalPages,
      page,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    const body = await req.json();
    const { userId, action, banDuration } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    if (action === 'ban') {
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: banDuration || '876600h',
      });
    } else if (action === 'unban') {
      await supabase.auth.admin.updateUserById(userId, {
        ban_duration: '0s',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: writings } = await db
      .from('writings')
      .select('id')
      .eq('user_id', userId);

    if (writings?.length) {
      await db.from('writings').delete().eq('user_id', userId);
    }

    const { data: novels } = await db
      .from('novels')
      .select('id')
      .eq('user_id', userId);

    if (novels?.length) {
      const novelIds = novels.map((n: { id: string }) => n.id);
      await db.from('chapters').delete().in('novel_id', novelIds);
      await db.from('characters').delete().in('novel_id', novelIds);
      await db.from('character_relations').delete().in('novel_id', novelIds);
      await db.from('world_settings').delete().in('novel_id', novelIds);
      await db.from('novels').delete().eq('user_id', userId);
    }

    await db.from('excerpts').delete().eq('user_id', userId);
    await db.from('emotion_logs').delete().eq('user_id', userId);
    await db.from('created_poems').delete().eq('user_id', userId);

    await supabase.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
