import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '30';

    const days = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startISO = startDate.toISOString();

    // Daily new users
    const dailyNewUsers: Record<string, number> = {};
    let page = 1;
    while (true) {
      const { data } = await supabase.auth.admin.listUsers({ perPage: 100, page });
      if (!data?.users?.length) break;
      for (const u of data.users) {
        if (new Date(u.created_at) >= startDate) {
          const d = new Date(u.created_at).toISOString().slice(0, 10);
          dailyNewUsers[d] = (dailyNewUsers[d] || 0) + 1;
        }
      }
      if (data.users.length < 100) break;
      page++;
    }

    // Daily writing data
    const { data: dailyWritings } = await db
      .from('writings')
      .select('created_at, word_count, user_id, type')
      .gte('created_at', startISO)
      .order('created_at', { ascending: true });

    const dailyWritingCounts: Record<string, number> = {};
    const dailyWordCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const userWritingCounts: Record<string, number> = {};

    for (const w of dailyWritings ?? []) {
      const d = new Date(w.created_at).toISOString().slice(0, 10);
      dailyWritingCounts[d] = (dailyWritingCounts[d] || 0) + 1;
      dailyWordCounts[d] = (dailyWordCounts[d] || 0) + (w.word_count || 0);
      typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
      userWritingCounts[w.user_id] = (userWritingCounts[w.user_id] || 0) + 1;
    }

    // Hour distribution for heatmap
    const dayNames = ['一', '二', '三', '四', '五', '六', '日'];
    const hourDistribution: Record<string, Record<number, number>> = {};
    for (const d of dayNames) {
      hourDistribution[d] = {};
      for (let h = 0; h < 24; h++) {
        hourDistribution[d][h] = 0;
      }
    }

    for (const w of dailyWritings ?? []) {
      const dt = new Date(w.created_at);
      const day = dayNames[(dt.getDay() + 6) % 7];
      const hour = dt.getHours();
      hourDistribution[day][hour] = (hourDistribution[day][hour] || 0) + 1;
    }

    // Top active users
    const topUsers = Object.entries(userWritingCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const userEmails: Record<string, string> = {};
    for (const [uid] of topUsers) {
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
      dailyNewUsers,
      dailyWritingCounts,
      dailyWordCounts,
      typeCounts,
      hourDistribution,
      topUsers: topUsers.map(([uid, count]) => ({
        userId: uid,
        email: userEmails[uid] || uid.slice(0, 8),
        count,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
