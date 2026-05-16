import { NextRequest, NextResponse } from "next/server";
import { getMusicRecommendations, NETEASE_MOOD_QUERIES } from "@/lib/music/recommender";

export async function GET(req: NextRequest) {
  const mood = req.nextUrl.searchParams.get("mood") || "";
  const tags = req.nextUrl.searchParams.get("tags") || "";
  const platform = req.nextUrl.searchParams.get("platform") || "";

  const tagList = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const recommendations = getMusicRecommendations(mood, tagList);

  // 网易云平台: 附加中文优化搜索词
  let neteaseQueries: string[] = [];
  if ((platform === "netease" || !platform) && mood) {
    neteaseQueries = NETEASE_MOOD_QUERIES[mood] || [];
  }

  return NextResponse.json({
    ...recommendations,
    neteaseQueries: neteaseQueries.slice(0, 5),
  });
}
