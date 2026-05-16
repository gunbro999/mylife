import { NextRequest, NextResponse } from "next/server";
import { getUserPlaylists, checkLoginStatus } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const cookie = req.nextUrl.searchParams.get("cookie");

  if (!cookie) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }

  try {
    // 先获取用户信息
    const status = await checkLoginStatus(cookie);
    if (status.code !== 200 || !status.profile) {
      return NextResponse.json({ success: false, error: "登录已过期" }, { status: 401 });
    }

    const uid = status.profile.userId;
    const result = await getUserPlaylists(uid, cookie);

    if (result.code !== 200) {
      return NextResponse.json({ success: false, error: "获取歌单失败" }, { status: 500 });
    }

    const playlists = (result.playlist || []).map((pl) => ({
      id: pl.id,
      name: pl.name,
      coverImgUrl: pl.coverImgUrl,
      trackCount: pl.trackCount,
    }));

    return NextResponse.json({ success: true, playlists });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
