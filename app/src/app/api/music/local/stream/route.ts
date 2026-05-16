import { NextRequest, NextResponse } from "next/server";
import { stat, open } from "fs/promises";
import { join, extname } from "path";
import { createReadStream } from "fs";
import { resolveLocalMusicPath } from "@/lib/music/local-path";

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".flac": "audio/flac",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".wma": "audio/x-ms-wma",
  ".ape": "audio/ape",
  ".aiff": "audio/aiff",
  ".opus": "audio/opus",
};

export async function GET(req: NextRequest) {
  const fileParam = req.nextUrl.searchParams.get("file");
  const rawPath = process.env.LOCAL_MUSIC_PATH;

  if (!rawPath) {
    return NextResponse.json({ error: "未配置 LOCAL_MUSIC_PATH" }, { status: 500 });
  }

  const musicPath = resolveLocalMusicPath(rawPath);

  if (!fileParam) {
    return NextResponse.json({ error: "缺少 file 参数" }, { status: 400 });
  }

  // 安全检查：防止路径穿越
  const safeName = fileParam.replace(/\.\./g, "").replace(/[\/\\]/g, "");
  const fullPath = join(musicPath, safeName);

  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const ext = extname(safeName).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";

    // 支持 Range 请求（快进快退）
    const range = req.headers.get("range");
    const fileSize = fileStat.size;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fd = await open(fullPath, "r");
      const buffer = Buffer.alloc(chunkSize);
      await fd.read(buffer, 0, chunkSize, start);
      await fd.close();

      return new NextResponse(buffer, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": mimeType,
          "Cache-Control": "no-cache",
        },
      });
    }

    // 无 Range 请求：流式传输整个文件
    const stream = createReadStream(fullPath);
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => {
          const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
          controller.enqueue(new Uint8Array(buf));
        });
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(fileSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: `读取文件失败: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
