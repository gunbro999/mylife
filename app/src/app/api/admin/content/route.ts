import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || '';
    const author = url.searchParams.get('author') || '';
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'newest';
    const page = parseInt(url.searchParams.get('page') || '1');
    const singleId = url.searchParams.get('id');

    // Fetch single writing content
    if (singleId) {
      const { data } = await db
        .from('writings')
        .select('content')
        .eq('id', singleId)
        .single();
      return NextResponse.json({ content: data?.content || '' });
    }

    let query = db.from('writings').select('*', { count: 'exact' });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (author) {
      query = query.eq('user_id', author);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'longest') {
      query = query.order('word_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const perPage = 20;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count } = await query;

    const userIds: string[] = [...new Set((data ?? []).map((w: Record<string, unknown>) => w.user_id))] as string[];
    const userEmails: Record<string, string> = {};

    for (const uid of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(uid);
        if (userData?.user?.email) {
          userEmails[uid] = userData.user.email;
        }
      } catch {
        // skip
      }
    }

    return NextResponse.json({
      writings: (data ?? []).map((w: Record<string, unknown>) => ({
        id: w.id,
        type: w.type,
        title: w.title,
        userId: w.user_id,
        userEmail: userEmails[w.user_id as string] || w.user_id,
        wordCount: w.word_count,
        isDraft: w.is_draft,
        tags: w.tags,
        createdAt: w.created_at,
        updatedAt: w.updated_at,
      })),
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / perPage),
      page,
    });
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
    const writingId = url.searchParams.get('id');

    if (!writingId) {
      return NextResponse.json({ error: 'Missing writing id' }, { status: 400 });
    }

    await db.from('writings').delete().eq('id', writingId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
