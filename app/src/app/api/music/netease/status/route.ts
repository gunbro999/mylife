import { NextRequest, NextResponse } from "next/server";
import { checkLoginStatus } from "@/lib/music/netease";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookie = body.cookie as string | undefined;

    if (!cookie) {
      return NextResponse.json({ success: false, error: "缺少 cookie" }, { status: 400 });
    }

    const result = await checkLoginStatus(cookie);

    if (result.code === 200 && result.profile) {
      return NextResponse.json({
        success: true,
        user: {
          id: result.profile.userId,
          nickname: result.profile.nickname,
          avatarUrl: result.profile.avatarUrl,
          signature: result.profile.signature,
        },
      });
    }

    return NextResponse.json({ success: false, error: "登录已过期，请重新登录" });
  } catch {
    return NextResponse.json(
      { success: false, error: "网易云 API 服务不可用" },
      { status: 503 }
    );
  }
}
