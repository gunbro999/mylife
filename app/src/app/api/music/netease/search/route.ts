import { NextRequest, NextResponse } from "next/server";
import { searchTracks } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword") || "";
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
  const cookie = req.nextUrl.searchParams.get("cookie") || undefined;

  if (!keyword.trim()) {
    return NextResponse.json({ success: false, error: "缺少搜索关键词" }, { status: 400 });
  }

  try {
    const result = await searchTracks(keyword.trim(), limit, cookie);

    if (result.code !== 200) {
      return NextResponse.json({ success: false, error: "搜索失败" }, { status: 500 });
    }

    const tracks = (result.result?.songs || []).map((song) => ({
      id: String(song.id),
      name: song.name,
      artist: song.ar.map((a) => a.name).join(" / "),
      album: song.al.name,
      albumArt: song.al.picUrl,
      platform: "netease" as const,
    }));

    return NextResponse.json({ success: true, tracks, total: result.result?.songCount || 0 });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
