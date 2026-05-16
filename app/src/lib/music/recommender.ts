import type { Mood } from "@/lib/types";

// ── Mood to music tag mapping ──

const MOOD_MUSIC_MAP: Record<Mood, { genres: string[]; bpm: string; desc: string }> = {
  happy:    { genres: ["pop", "upbeat", "indie pop", "bossa nova"], bpm: "fast", desc: "欢快节奏" },
  calm:     { genres: ["ambient", "peaceful piano", "chill", "lofi"], bpm: "slow", desc: "宁静舒缓" },
  sad:      { genres: ["indie folk", "piano ballad", "post-rock", "ambient"], bpm: "slow", desc: "深情低回" },
  anxious:  { genres: ["ambient", "white noise", "classical", "jazz"], bpm: "medium", desc: "安心定神" },
  angry:    { genres: ["rock", "post-rock", "instrumental", "classical"], bpm: "fast", desc: "释放张力" },
  grateful: { genres: ["acoustic", "folk", "classical", "jazz"], bpm: "medium", desc: "温暖感恩" },
  excited:  { genres: ["electronic", "pop", "dance", "funk"], bpm: "fast", desc: "活力四射" },
  tired:    { genres: ["lofi", "ambient", "jazz", "chill"], bpm: "slow", desc: "轻柔放松" },
};

// ── Genre to search queries (通用) ──

const GENRE_QUERIES: Record<string, string[]> = {
  "pop": ["轻快流行", "chill pop instrumental"],
  "upbeat": ["欢快纯音乐", "upbeat instrumental"],
  "indie pop": ["独立流行", "indie pop study"],
  "bossa nova": ["bossa nova instrumental", "巴西爵士"],
  "ambient": ["环境音乐", "ambient soundscape", "冥想音乐"],
  "peaceful piano": ["安静钢琴", "peaceful piano solo", "钢琴轻音乐"],
  "chill": ["放松音乐", "chill vibes", "轻音乐"],
  "lofi": ["lofi hip hop", "lo-fi study", "放松节拍"],
  "indie folk": ["独立民谣", "indie folk acoustic"],
  "piano ballad": ["钢琴叙事曲", "piano ballad instrumental"],
  "post-rock": ["后摇", "post-rock instrumental"],
  "white noise": ["白噪音", "natural soundscape"],
  "classical": ["古典音乐", "classical music focus"],
  "jazz": ["爵士乐", "jazz instrumental", "咖啡爵士"],
  "rock": ["摇滚纯音乐", "rock instrumental"],
  "instrumental": ["纯音乐", "instrumental music"],
  "acoustic": ["原声音乐", "acoustic guitar"],
  "folk": ["民谣", "folk music"],
  "electronic": ["电子音乐", "electronic instrumental"],
  "dance": ["舞曲", "dance instrumental"],
  "funk": ["放克", "funk instrumental"],
};

// ── 网易云音乐专属搜索词 (中文优化) ──

export const NETEASE_MOOD_QUERIES: Record<string, string[]> = {
  happy:    ["欢快流行", "轻松愉悦", "夏日元气", "快乐节奏", "华语流行"],
  calm:     ["安静纯音乐", "治愈轻音乐", "古风纯音", "禅意", "钢琴曲"],
  sad:      ["伤感流行", "民谣治愈", "深情", "慢歌", "失眠"],
  anxious:  ["放松治愈", "白噪音", "静心", "冥想", "大自然"],
  angry:    ["摇滚", "后摇", "释放", "热血", "史诗"],
  grateful: ["温暖民谣", "古典乐章", "治愈系", "感恩", "温情"],
  excited:  ["电子", "节奏", "活力", "派对", "说唱"],
  tired:    ["轻音乐", "爵士", "咖啡馆", "放松", "助眠"],
};

// ── 网易云热门歌单 ID (按情绪映射) ──

export const NETEASE_MOOD_PLAYLISTS: Record<string, string[]> = {
  happy:    ["3778678", "3136952023"],   // 华语流行 / 轻松欢快
  calm:     ["7135760519", "2829816398"], // 治愈轻音乐 / 古风
  sad:      ["6956481597", "2818723678"], // 伤感 / 民谣
  anxious:  ["7201064992", "2956138118"], // 放松 / 白噪音
  angry:    ["2858666635", "500000"],     // 摇滚 / 后摇
  grateful: ["7135760519", "6956481597"], // 温暖 / 走心
  excited:  ["2883807689", "3030028078"], // 电子 / 欧美流行
  tired:    ["2829816398", "2897005386"], // 轻音乐 / 咖啡馆
};

export interface MusicRecommendation {
  mood: string;
  description: string;
  searchQueries: string[];
  genres: string[];
}

export function getMusicRecommendations(mood: string, tags: string[]): MusicRecommendation {
  const moodConfig = MOOD_MUSIC_MAP[mood as Mood];

  let genres: string[];
  if (moodConfig) {
    genres = moodConfig.genres;
  } else if (tags.length > 0) {
    genres = tags;
  } else {
    genres = ["ambient", "chill", "lofi"];
  }

  // Generate search queries from genres
  const searchQueries: string[] = [];
  genres.forEach((genre) => {
    const queries = GENRE_QUERIES[genre.toLowerCase()];
    if (queries) {
      searchQueries.push(...queries.slice(0, 2));
    } else {
      searchQueries.push(`${genre} music`, `${genre} instrumental`);
    }
  });

  // Deduplicate and limit
  const unique = [...new Set(searchQueries)].slice(0, 8);

  return {
    mood: moodConfig?.desc || "中性",
    description: moodConfig
      ? `当前情绪适合${moodConfig.desc}的音乐`
      : "根据你的写作状态，推荐以下风格",
    searchQueries: unique,
    genres,
  };
}

// ── Spotify OAuth helpers ──

export function getSpotifyAuthUrl(clientId: string, redirectUri: string): string {
  const scopes = ["user-read-playback-state", "user-modify-playback-state", "streaming"];
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    show_dialog: "true",
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export function parseSpotifyCallback(hash: string): { token: string; expiresIn: number } | null {
  const params = new URLSearchParams(hash.replace("#", ""));
  const token = params.get("access_token");
  const expiresIn = parseInt(params.get("expires_in") || "3600", 10);
  return token ? { token, expiresIn } : null;
}

export async function searchSpotifyTracks(
  query: string,
  token: string
): Promise<Array<{ id: string; name: string; artist: string; album: string; albumArt: string; url: string }>> {
  const params = new URLSearchParams({ q: query, type: "track", limit: "5" });
  const resp = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) throw new Error("Spotify search failed");

  const data = await resp.json();
  const tracks = data.tracks?.items || [];

  return tracks.map((t: { id: string; name: string; artists: Array<{ name: string }>; album: { name: string; images: Array<{ url: string }> }; external_urls: { spotify: string } }) => ({
    id: t.id,
    name: t.name,
    artist: t.artists.map((a: { name: string }) => a.name).join(", "),
    album: t.album.name,
    albumArt: t.album.images[0]?.url || "",
    url: t.external_urls.spotify,
  }));
}
