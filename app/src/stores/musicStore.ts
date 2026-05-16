import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MusicPlatform = "spotify" | "netease";

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  url?: string;
  previewUrl?: string;
  platform: MusicPlatform | "none";
}

export interface NeteaseUser {
  id: number;
  nickname: string;
  avatarUrl: string;
  signature?: string;
}

export interface NeteasePlaylist {
  id: number;
  name: string;
  coverImgUrl: string;
  trackCount: number;
  playCount?: number;
}

export interface NeteaseTrack {
  id: number;
  name: string;
  ar: Array<{ id: number; name: string }>;
  al: { id: number; name: string; picUrl: string };
  dt: number;
}

interface MusicState {
  // 平台选择
  platform: MusicPlatform;

  // Spotify
  spotifyToken: string | null;
  spotifyTokenExpiry: number | null;

  // NetEase
  neteaseCookie: string | null;
  neteaseUser: NeteaseUser | null;
  neteaseQRKey: string | null;
  neteaseQRUrl: string | null;

  // 播放器
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  recommendations: MusicTrack[];
  searchQuery: string;
  playerExpanded: boolean;

  // 网易云歌单
  neteasePlaylists: NeteasePlaylist[];
  neteasePlaylistTracks: MusicTrack[];
  neteasePlaylistView: "list" | "songs";

  // 平台切换
  setPlatform: (p: MusicPlatform) => void;

  // Spotify actions
  setSpotifyToken: (token: string, expiresIn: number) => void;
  clearSpotifyToken: () => void;

  // NetEase actions
  setNeteaseCookie: (cookie: string) => void;
  setNeteaseUser: (user: NeteaseUser | null) => void;
  setNeteaseQRKey: (key: string | null) => void;
  setNeteaseQRUrl: (url: string | null) => void;
  clearNeteaseAuth: () => void;
  isNeteaseLoggedIn: () => boolean;

  // 播放器 actions
  setCurrentTrack: (track: MusicTrack | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (v: number) => void;
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  setRecommendations: (tracks: MusicTrack[]) => void;
  setSearchQuery: (q: string) => void;
  setPlayerExpanded: (expanded: boolean) => void;
  togglePlayer: () => void;

  // 网易云歌单 actions
  setNeteasePlaylists: (playlists: NeteasePlaylist[]) => void;
  setNeteasePlaylistTracks: (tracks: MusicTrack[]) => void;
  setNeteasePlaylistView: (view: "list" | "songs") => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      platform: "netease",

      spotifyToken: null,
      spotifyTokenExpiry: null,

      neteaseCookie: null,
      neteaseUser: null,
      neteaseQRKey: null,
      neteaseQRUrl: null,

      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      recommendations: [],
      searchQuery: "",
      playerExpanded: false,

      neteasePlaylists: [],
      neteasePlaylistTracks: [],
      neteasePlaylistView: "list",

      setPlatform: (p) => set({ platform: p }),

      setSpotifyToken: (token, expiresIn) =>
        set({
          spotifyToken: token,
          spotifyTokenExpiry: Date.now() + expiresIn * 1000,
        }),

      clearSpotifyToken: () =>
        set({ spotifyToken: null, spotifyTokenExpiry: null }),

      setNeteaseCookie: (cookie) => set({ neteaseCookie: cookie }),

      setNeteaseUser: (user) => set({ neteaseUser: user }),

      setNeteaseQRKey: (key) => set({ neteaseQRKey: key }),

      setNeteaseQRUrl: (url) => set({ neteaseQRUrl: url }),

      clearNeteaseAuth: () =>
        set({
          neteaseCookie: null,
          neteaseUser: null,
          neteaseQRKey: null,
          neteaseQRUrl: null,
        }),

      isNeteaseLoggedIn: () => {
        const state = get();
        return !!(state.neteaseCookie && state.neteaseUser);
      },

      setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: !!track }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

      setCurrentTime: (t) => set({ currentTime: t }),
      setDuration: (d) => set({ duration: d }),

      setRecommendations: (tracks) => set({ recommendations: tracks }),

      setSearchQuery: (q) => set({ searchQuery: q }),

      setPlayerExpanded: (expanded) => set({ playerExpanded: expanded }),

      togglePlayer: () => set((s) => ({ playerExpanded: !s.playerExpanded })),

      setNeteasePlaylists: (playlists) => set({ neteasePlaylists: playlists }),
      setNeteasePlaylistTracks: (tracks) => set({ neteasePlaylistTracks: tracks, neteasePlaylistView: "songs" }),
      setNeteasePlaylistView: (view) => set({ neteasePlaylistView: view }),
    }),
    {
      name: "mylife-music",
      partialize: (state) => ({
        platform: state.platform,
        spotifyToken: state.spotifyToken,
        spotifyTokenExpiry: state.spotifyTokenExpiry,
        neteaseCookie: state.neteaseCookie,
        neteaseUser: state.neteaseUser,
        volume: state.volume,
      }),
    }
  )
);
