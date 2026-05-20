import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    let authUserCount = 0;
    let page = 1;
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 100, page });
      if (!data?.users?.length) break;
      authUserCount += data.users.length;
      if (data.users.length < 100) break;
      page++;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    let todayNewUsers = 0;
    page = 1;
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 100, page });
      if (!data?.users?.length) break;
      todayNewUsers += data.users.filter(
        (u) => new Date(u.created_at) >= todayStart
      ).length;
      if (data.users.length < 100) break;
      page++;
    }

    const { count: totalWritings } = await db
      .from('writings')
      .select('id', { count: 'exact', head: true });

    const { data: todayActive } = await db
      .from('writings')
      .select('user_id')
      .gte('updated_at', todayStart.toISOString());

    const todayActiveUsers = new Set((todayActive ?? []).map((w: { user_id: string }) => w.user_id)).size;

    const { data: recentUsers } = await supabase.auth.admin.listUsers({ perPage: 5 });

    const { data: recentPublic } = await db
      .from('writings')
      .select('id, title, user_id, type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: writingsByType } = await db
      .from('writings')
      .select('type');

    const typeCounts: Record<string, number> = {};
    for (const w of writingsByType ?? []) {
      typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyGrowth: Record<string, number> = {};
    page = 1;
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 100, page });
      if (!data?.users?.length) break;
      for (const u of data.users) {
        const d = new Date(u.created_at).toISOString().slice(0, 10);
        if (new Date(u.created_at) >= thirtyDaysAgo) {
          dailyGrowth[d] = (dailyGrowth[d] || 0) + 1;
        }
      }
      if (data.users.length < 100) break;
      page++;
    }

    return NextResponse.json({
      totalUsers: authUserCount,
      todayNewUsers,
      totalWritings: totalWritings ?? 0,
      todayActiveUsers,
      recentUsers: (recentUsers?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
      })),
      recentPublic: recentPublic ?? [],
      typeCounts,
      dailyGrowth,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
