/**
 * 网易云音乐 API 客户端
 *
 * 需要运行 NeteaseCloudMusicApi 服务作为后端代理。
 * 启动方式: docker run -d -p 3001:3000 binaryify/netease_cloud_music_api
 * 或: npx NeteaseCloudMusicApi (监听 3000 端口)
 *
 * 文档: https://github.com/Binaryify/NeteaseCloudMusicApi
 */

const DEFAULT_BASE = "http://localhost:3001";

function getBase(): string {
  return process.env.NETEASE_API_BASE || process.env.NEXT_PUBLIC_NETEASE_API_BASE || DEFAULT_BASE;
}

// ── 通用请求封装 ──

async function request<T = unknown>(
  endpoint: string,
  options: {
    method?: string;
    params?: Record<string, string | number | undefined>;
    body?: Record<string, unknown>;
    cookie?: string;
  } = {}
): Promise<T> {
  const base = getBase();
  const url = new URL(endpoint, base);

  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (options.cookie) {
    headers["Cookie"] = options.cookie;
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers,
  };

  if (options.body && options.method === "POST") {
    const formBody = new URLSearchParams();
    Object.entries(options.body).forEach(([k, v]) => {
      if (v !== undefined) formBody.set(k, String(v));
    });
    fetchOptions.body = formBody.toString();
  }

  const resp = await fetch(url.toString(), fetchOptions);

  if (!resp.ok) {
    throw new Error(`NetEase API error: ${resp.status} ${resp.statusText}`);
  }

  return resp.json() as Promise<T>;
}

// ── 二维码登录 ──

export interface QRKeyResult {
  code: number;
  data: { unikey: string };
}

export interface QRCheckResult {
  code: number;       // 800=待扫描, 801=待确认, 802=已授权, 803=已取消/过期
  message: string;
  cookie: string;
  nickname?: string;
  avatarUrl?: string;
}

/** 生成二维码登录 key */
export async function generateQRKey(): Promise<QRKeyResult> {
  return request<QRKeyResult>("/login/qr/key", {
    params: { timestamp: Date.now() },
    method: "GET",
  });
}

/** 根据 key 生成二维码链接 (前端用此链接渲染二维码图片) */
export function getQRImageUrl(key: string): string {
  const base = getBase();
  return `${base}/login/qr/create?key=${encodeURIComponent(key)}&qrimg=true&timestamp=${Date.now()}`;
}

/** 轮询二维码扫码状态 */
export async function checkQRStatus(key: string): Promise<QRCheckResult> {
  return request<QRCheckResult>("/login/qr/check", {
    params: { key, timestamp: Date.now() },
    method: "GET",
  });
}

// ── 登录状态 ──

export interface LoginStatusResult {
  code: number;
  account?: { id: number };
  profile?: {
    userId: number;
    nickname: string;
    avatarUrl: string;
    signature: string;
  };
}

/** 检查 cookie 是否有效 */
export async function checkLoginStatus(cookie: string): Promise<LoginStatusResult> {
  return request<LoginStatusResult>("/login/status", {
    method: "POST",
    cookie,
  });
}

// ── 搜索 ──

export interface NeteaseTrack {
  id: number;
  name: string;
  ar: Array<{ id: number; name: string }>;
  al: { id: number; name: string; picUrl: string };
  dt: number; // 时长 ms
  url?: string;
}

export interface SearchResult {
  code: number;
  result: {
    songs?: NeteaseTrack[];
    songCount?: number;
  };
}

/** 搜索歌曲 */
export async function searchTracks(
  keyword: string,
  limit = 10,
  cookie?: string
): Promise<SearchResult> {
  return request<SearchResult>("/search", {
    params: { keywords: keyword, limit, type: "1" },
    cookie,
  });
}

// ── 歌单 ──

export interface PlaylistResult {
  code: number;
  playlist?: {
    id: number;
    name: string;
    tracks: NeteaseTrack[];
    trackCount: number;
    coverImgUrl: string;
  };
}

/** 获取歌单详情 */
export async function getPlaylistDetail(
  id: number,
  cookie?: string
): Promise<PlaylistResult> {
  return request<PlaylistResult>("/playlist/detail", {
    params: { id },
    cookie,
  });
}

// ── 每日推荐 ──

export interface DailyRecommendResult {
  code: number;
  data?: {
    dailySongs?: NeteaseTrack[];
  };
}

/** 获取每日推荐歌曲 (需要登录) */
export async function getDailyRecommend(cookie: string): Promise<DailyRecommendResult> {
  return request<DailyRecommendResult>("/recommend/songs", {
    cookie,
  });
}

// ── 热门歌单 ──

export interface TopPlaylistResult {
  code: number;
  playlists?: Array<{
    id: number;
    name: string;
    coverImgUrl: string;
    trackCount: number;
    playCount: number;
  }>;
}

/** 获取热门歌单分类下的歌单 */
export async function getTopPlaylists(
  cat = "华语",
  limit = 20,
  cookie?: string
): Promise<TopPlaylistResult> {
  return request<TopPlaylistResult>("/top/playlist", {
    params: { cat, limit },
    cookie,
  });
}

// ── 获取歌曲 URL ──

export interface SongUrlResult {
  code: number;
  data: Array<{
    id: number;
    url: string;
    br: number; // 码率
    type: string;
  }>;
}

/** 获取歌曲播放地址 */
export async function getSongUrl(
  id: number,
  br = 320000,
  cookie?: string
): Promise<SongUrlResult> {
  return request<SongUrlResult>("/song/url/v1", {
    params: { id, level: "exhigh" },
    cookie,
  });
}

// ── 用户歌单 ──

export interface UserPlaylistResult {
  code: number;
  playlist: Array<{
    id: number;
    name: string;
    coverImgUrl: string;
    trackCount: number;
  }>;
}

/** 获取用户歌单 */
export async function getUserPlaylists(
  uid: number,
  cookie: string
): Promise<UserPlaylistResult> {
  return request<UserPlaylistResult>("/user/playlist", {
    params: { uid },
    cookie,
  });
}
