import { NextRequest, NextResponse } from "next/server";
import { getPlaylistDetail } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const cookie = req.nextUrl.searchParams.get("cookie") || undefined;

  if (!id) {
    return NextResponse.json({ success: false, error: "缺少歌单 ID" }, { status: 400 });
  }

  try {
    const result = await getPlaylistDetail(parseInt(id, 10), cookie);

    if (result.code !== 200 || !result.playlist) {
      return NextResponse.json({ success: false, error: "获取歌单详情失败" }, { status: 500 });
    }

    const tracks = (result.playlist.tracks || []).map((song) => ({
      id: String(song.id),
      name: song.name,
      artist: (song.ar || []).map((a) => a.name).join(" / "),
      album: song.al?.name || "",
      albumArt: song.al?.picUrl || "",
      platform: "netease" as const,
    }));

    return NextResponse.json({
      success: true,
      playlist: {
        id: result.playlist.id,
        name: result.playlist.name,
        coverImgUrl: result.playlist.coverImgUrl,
      },
      tracks,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
