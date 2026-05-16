import { NextRequest, NextResponse } from "next/server";
import { getDailyRecommend, getTopPlaylists, searchTracks, getSongUrl } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const cookie = req.nextUrl.searchParams.get("cookie") || undefined;
  const mood = req.nextUrl.searchParams.get("mood") || "";
  const searchQuery = req.nextUrl.searchParams.get("query") || "";
  const type = req.nextUrl.searchParams.get("type") || "search"; // search | daily | popular

  try {
    // 模式1: 基于情绪搜索
    if (type === "search" && searchQuery) {
      const result = await searchTracks(searchQuery, 6, cookie);
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
      return NextResponse.json({ success: true, tracks });
    }

    // 模式2: 每日推荐 (需登录)
    if (type === "daily" && cookie) {
      const result = await getDailyRecommend(cookie);
      if (result.code !== 200 || !result.data?.dailySongs) {
        return NextResponse.json({ success: false, error: "获取每日推荐失败，请先登录" }, { status: 401 });
      }
      const tracks = result.data.dailySongs.slice(0, 10).map((song) => ({
        id: String(song.id),
        name: song.name,
        artist: song.ar.map((a) => a.name).join(" / "),
        album: song.al.name,
        albumArt: song.al.picUrl,
        platform: "netease" as const,
      }));
      return NextResponse.json({ success: true, tracks });
    }

    // 模式3: 热门歌单 (基于情绪标签选择分类)
    if (type === "popular") {
      const catMap: Record<string, string> = {
        happy: "流行",
        calm: "轻音乐",
        sad: "民谣",
        anxious: "安静",
        angry: "摇滚",
        grateful: "古典",
        excited: "电子",
        tired: "爵士",
      };
      const cat = catMap[mood] || "轻音乐";
      const result = await getTopPlaylists(cat, 5, cookie);
      if (result.code !== 200 || !result.playlists) {
        return NextResponse.json({ success: false, error: "获取歌单失败" }, { status: 500 });
      }
      const playlists = result.playlists.map((pl) => ({
        id: String(pl.id),
        name: pl.name,
        trackCount: pl.trackCount,
        coverImgUrl: pl.coverImgUrl,
        playCount: pl.playCount,
      }));
      return NextResponse.json({ success: true, playlists });
    }

    // 默认: 无搜索词时返回提示
    return NextResponse.json({ success: false, error: "请提供搜索词 (query 参数)" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
