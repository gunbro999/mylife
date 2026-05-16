import { NextRequest, NextResponse } from "next/server";
import { getSongUrl } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const cookie = req.nextUrl.searchParams.get("cookie") || undefined;

  if (!id) {
    return NextResponse.json({ success: false, error: "缺少歌曲 ID" }, { status: 400 });
  }

  try {
    const result = await getSongUrl(parseInt(id, 10), 320000, cookie);

    if (result.code !== 200 || !result.data || result.data.length === 0) {
      return NextResponse.json({ success: false, error: "获取播放地址失败" }, { status: 500 });
    }

    const songData = result.data[0];
    if (!songData.url) {
      return NextResponse.json({
        success: false,
        error: "该歌曲暂无播放地址（可能需要 VIP 或已下架）",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      url: songData.url,
      br: songData.br,
      type: songData.type,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
