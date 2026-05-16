import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join, extname } from "path";
import { resolveLocalMusicPath } from "@/lib/music/local-path";

const AUDIO_EXTENSIONS = new Set([
  ".mp3", ".flac", ".wav", ".ogg", ".m4a", ".aac", ".wma", ".ape", ".aiff", ".opus",
]);

export interface LocalTrack {
  name: string;
  path: string;
  size: number;
  ext: string;
}

export async function GET() {
  const rawPath = process.env.LOCAL_MUSIC_PATH;

  if (!rawPath) {
    return NextResponse.json(
      { success: false, error: "未配置 LOCAL_MUSIC_PATH 环境变量" },
      { status: 500 }
    );
  }

  const musicPath = resolveLocalMusicPath(rawPath);

  try {
    const dirStat = await stat(musicPath);
    if (!dirStat.isDirectory()) {
      return NextResponse.json(
        { success: false, error: "LOCAL_MUSIC_PATH 不是有效的文件夹路径" },
        { status: 500 }
      );
    }

    const entries = await readdir(musicPath, { withFileTypes: true });
    const tracks: LocalTrack[] = [];

    for (const entry of entries) {
      if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (AUDIO_EXTENSIONS.has(ext)) {
          const filePath = join(musicPath, entry.name);
          const fileStat = await stat(filePath);
          tracks.push({
            name: entry.name,
            path: entry.name, // 只存文件名，服务端拼接完整路径
            size: fileStat.size,
            ext,
          });
        }
      }
    }

    // Sort by name
    tracks.sort((a, b) => a.name.localeCompare(b.name, "zh"));

    return NextResponse.json({ success: true, tracks, folder: musicPath });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: `读取文件夹失败: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
