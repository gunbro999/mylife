import { NextRequest, NextResponse } from "next/server";
import { generateQRKey, checkQRStatus } from "@/lib/music/netease";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  // 生成二维码 key + base64 图片
  if (action === "create") {
    try {
      const keyResult = await generateQRKey();
      if (keyResult.code !== 200 || !keyResult.data?.unikey) {
        return NextResponse.json({ success: false, error: "生成二维码失败" }, { status: 500 });
      }

      const key = keyResult.data.unikey;

      // 同时获取二维码图片的 base64
      const base = process.env.NETEASE_API_BASE || "http://localhost:3001";
      const qrResp = await fetch(
        `${base}/login/qr/create?key=${encodeURIComponent(key)}&qrimg=true&timestamp=${Date.now()}`
      );
      const qrData = await qrResp.json();
      const qrImage = qrData?.data?.qrimg || "";

      return NextResponse.json({
        success: true,
        key,
        qrImage, // base64 data:image/png;base64,...
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "网易云 API 服务不可用，请确保已启动 NeteaseCloudMusicApi" },
        { status: 503 }
      );
    }
  }

  // 轮询扫码状态
  if (action === "check") {
    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ success: false, error: "缺少 key 参数" }, { status: 400 });
    }
    try {
      const result = await checkQRStatus(key);
      return NextResponse.json({
        success: true,
        code: result.code,
        message: result.message,
        cookie: result.cookie || null,
        nickname: result.nickname || null,
        avatarUrl: result.avatarUrl || null,
      });
    } catch {
      return NextResponse.json({ success: false, error: "检查扫码状态失败" }, { status: 503 });
    }
  }

  return NextResponse.json({ success: false, error: "无效的 action 参数" }, { status: 400 });
}
