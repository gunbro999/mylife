"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  LogIn,
  RefreshCw,
  Music,
  LogOut,
  Loader2,
  Cloud,
  FolderOpen,
  ChevronLeft,
  ListMusic,
  Play,
  Pause,
} from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";
import { useUIStore } from "@/stores/uiStore";
import { useEmotionStore } from "@/stores/emotionStore";
import type { MusicTrack, NeteasePlaylist } from "@/stores/musicStore";
import { MOOD_CONFIG } from "@/lib/types";
import { getSpotifyAuthUrl, searchSpotifyTracks } from "@/lib/music/recommender";
import type { Mood } from "@/lib/types";
import { LocalMusicPlayer } from "./LocalMusicPlayer";
import { useGlobalAudio } from "./useGlobalAudio";
import { ProgressBar } from "./ProgressBar";

const hasSpotifyConfig = !!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;

type TabId = "netease" | "local" | "spotify";

interface TabDef {
  id: TabId;
  label: string;
  icon: string;
  visible: boolean;
}

export function MusicRecommendations() {
  const musicPanelOpen = useUIStore((s) => s.musicPanelOpen);
  const setMusicPanelOpen = useUIStore((s) => s.setMusicPanelOpen);

  const recommendations = useMusicStore((s) => s.recommendations);
  const setRecommendations = useMusicStore((s) => s.setRecommendations);
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);

  const { toggle, seek } = useGlobalAudio();

  // Platform
  const platform = useMusicStore((s) => s.platform);
  const setPlatform = useMusicStore((s) => s.setPlatform);

  // Spotify
  const spotifyToken = useMusicStore((s) => s.spotifyToken);
  const setSpotifyToken = useMusicStore((s) => s.setSpotifyToken);
  const clearSpotifyToken = useMusicStore((s) => s.clearSpotifyToken);

  // NetEase
  const neteaseCookie = useMusicStore((s) => s.neteaseCookie);
  const neteaseUser = useMusicStore((s) => s.neteaseUser);
  const neteaseQRKey = useMusicStore((s) => s.neteaseQRKey);
  const setNeteaseCookie = useMusicStore((s) => s.setNeteaseCookie);
  const setNeteaseUser = useMusicStore((s) => s.setNeteaseUser);
  const setNeteaseQRKey = useMusicStore((s) => s.setNeteaseQRKey);
  const clearNeteaseAuth = useMusicStore((s) => s.clearNeteaseAuth);

  // 网易云歌单状态
  const neteasePlaylists = useMusicStore((s) => s.neteasePlaylists);
  const neteasePlaylistTracks = useMusicStore((s) => s.neteasePlaylistTracks);
  const neteasePlaylistView = useMusicStore((s) => s.neteasePlaylistView);
  const setNeteasePlaylists = useMusicStore((s) => s.setNeteasePlaylists);
  const setNeteasePlaylistTracks = useMusicStore((s) => s.setNeteasePlaylistTracks);
  const setNeteasePlaylistView = useMusicStore((s) => s.setNeteasePlaylistView);

  const [activeTab, setActiveTab] = useState<TabId>("netease");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [neteaseQRUrl, setNeteaseQRUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrStatus, setQrStatus] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [currentPlaylistName, setCurrentPlaylistName] = useState("");
  const [playingNeteaseId, setPlayingNeteaseId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get today's mood
  const today = new Date().toISOString().slice(0, 10);
  const getDailyMood = useEmotionStore((s) => s.getDailyMood);
  const todayMood = getDailyMood(today);

  // Tabs to show
  const tabs: TabDef[] = [
    { id: "netease", label: "网易云", icon: "☁️", visible: true },
    { id: "local", label: "本地", icon: "📁", visible: true },
    { id: "spotify", label: "Spotify", icon: "🟢", visible: hasSpotifyConfig },
  ];
  const visibleTabs = tabs.filter((t) => t.visible);

  // Sync activeTab when platform changes externally
  useEffect(() => {
    if (platform === "spotify" && hasSpotifyConfig) {
      setActiveTab("spotify");
    }
  }, [platform]);

  // Fetch playlists when panel opens and logged in
  useEffect(() => {
    if (musicPanelOpen && activeTab === "netease" && isNeteaseLoggedIn) {
      loadPlaylists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicPanelOpen, activeTab]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const isNeteaseLoggedIn = !!(neteaseCookie && neteaseUser);
  const isSpotifyLoggedIn = !!spotifyToken;
  const isNeteaseActive = currentTrack?.platform === "netease";

  // ── NetEase: load playlists ──

  const loadPlaylists = async () => {
    setPlaylistsLoading(true);
    setPlaylistsError(null);
    try {
      const resp = await fetch(
        `/api/music/netease/playlists?cookie=${encodeURIComponent(neteaseCookie || "")}`
      );
      const data = await resp.json();
      if (data.success && data.playlists) {
        setNeteasePlaylists(data.playlists);
      } else {
        setPlaylistsError(data.error || "获取歌单失败");
      }
    } catch {
      setPlaylistsError("无法连接网易云 API");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  // ── NetEase: load playlist tracks ──

  const loadPlaylistTracks = async (playlist: NeteasePlaylist) => {
    setTracksLoading(true);
    setCurrentPlaylistName(playlist.name);
    try {
      const params = new URLSearchParams({ id: String(playlist.id) });
      if (neteaseCookie) params.set("cookie", neteaseCookie);
      const resp = await fetch(`/api/music/netease/playlist-detail?${params}`);
      const data = await resp.json();
      if (data.success && data.tracks) {
        setNeteasePlaylistTracks(data.tracks);
      }
    } catch {
      // silent fail
    } finally {
      setTracksLoading(false);
    }
  };

  // ── NetEase: get song URL and play ──

  const playNeteaseSong = async (track: MusicTrack) => {
    setPlayingNeteaseId(track.id);

    // 如果已经有 URL，直接播放
    if (track.url) {
      setCurrentTrack(track);
      setPlayingNeteaseId(null);
      return;
    }

    // 获取播放地址
    try {
      const params = new URLSearchParams({ id: track.id });
      if (neteaseCookie) params.set("cookie", neteaseCookie);
      const resp = await fetch(`/api/music/netease/song-url?${params}`);
      const data = await resp.json();
      if (data.success && data.url) {
        const trackWithUrl: MusicTrack = { ...track, url: data.url };
        setCurrentTrack(trackWithUrl);
      } else {
        // 无播放地址时仍设置 track 信息
        setCurrentTrack(track);
      }
    } catch {
      setCurrentTrack(track);
    } finally {
      setPlayingNeteaseId(null);
    }
  };

  // ── NetEase: fetch mood-based recommendations ──

  const fetchNeteaseRecommendations = async () => {
    setLoading(true);
    try {
      const moodParam = todayMood || "";
      const resp = await fetch(
        `/api/music/recommendations?mood=${moodParam}&platform=netease`
      );
      if (resp.ok) {
        const data = await resp.json();
        const queries = data.neteaseQueries || data.searchQueries || [];

        // 无 mood 时用默认搜索词
        const searchQueries = queries.length > 0
          ? queries
          : ["热门华语", "经典老歌", "流行新歌"];

        const trackResults = await Promise.allSettled(
          searchQueries.slice(0, 3).map((q: string) => searchNeteaseAndGetTracks(q))
        );
        const allTracks: MusicTrack[] = [];
        trackResults.forEach((r) => {
          if (r.status === "fulfilled") {
            allTracks.push(...r.value);
          }
        });
        const unique = allTracks
          .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
          .slice(0, 10);
        if (unique.length > 0) {
          setSearchResults(unique);
          setRecommendations(unique);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  // ── NetEase search ──

  const searchNeteaseAndGetTracks = async (query: string): Promise<MusicTrack[]> => {
    try {
      const params = new URLSearchParams({ keyword: query, limit: "5" });
      if (neteaseCookie) params.set("cookie", neteaseCookie);
      const resp = await fetch(`/api/music/netease/search?${params}`);
      if (resp.ok) {
        const data = await resp.json();
        return data.tracks || [];
      }
    } catch {
      // ignore
    }
    return [];
  };

  // ── NetEase QR login ──

  const handleNeteaseQRLogin = async () => {
    setQrLoading(true);
    setQrError(null);
    setQrStatus("正在生成二维码...");
    try {
      const resp = await fetch("/api/music/netease/qr?action=create");
      const data = await resp.json();
      if (data.success && data.key) {
        setNeteaseQRKey(data.key);
        setNeteaseQRUrl(data.qrImage || null);
        setQrStatus("请使用网易云音乐 App 扫描二维码");
        setQrError(null);
        startQRPolling(data.key);
      } else {
        const msg = data.error || "生成二维码失败，请确保已启动网易云 API 服务";
        setQrError(msg);
        setNeteaseQRKey(null);
        setNeteaseQRUrl(null);
      }
    } catch {
      setQrError("无法连接网易云 API 服务，请确保 NeteaseCloudMusicApi 已启动");
      setNeteaseQRKey(null);
      setNeteaseQRUrl(null);
    } finally {
      setQrLoading(false);
    }
  };

  const startQRPolling = (key: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/music/netease/qr?action=check&key=${key}`);
        const data = await resp.json();
        if (data.code === 802 && data.cookie) {
          setNeteaseCookie(data.cookie);
          setNeteaseUser({
            id: 0,
            nickname: data.nickname || "网易云用户",
            avatarUrl: data.avatarUrl || "",
          });
          setNeteaseQRKey(null);
          setNeteaseQRUrl(null);
          setQrStatus("登录成功!");
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
          setTimeout(() => {
            loadPlaylists();
            fetchNeteaseRecommendations();
          }, 500);
        } else if (data.code === 800) {
          setQrStatus("请使用网易云音乐 App 扫描二维码");
        } else if (data.code === 801) {
          setQrStatus("请在手机上确认登录");
        } else if (data.code === 803 || data.code === 804) {
          setQrStatus("二维码已过期，请重新获取");
          setNeteaseQRKey(null);
          setNeteaseQRUrl(null);
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);
  };

  const cancelQRLogin = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setNeteaseQRKey(null);
    setNeteaseQRUrl(null);
    setQrStatus("");
    setQrError(null);
  };

  // ── Spotify login ──

  const handleSpotifyLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    if (!clientId) {
      alert("请先配置 NEXT_PUBLIC_SPOTIFY_CLIENT_ID 环境变量");
      return;
    }
    const redirectUri = window.location.origin + "/emotion";
    const authUrl = getSpotifyAuthUrl(clientId, redirectUri);
    window.location.href = authUrl;
  };

  // Handle Spotify OAuth callback
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      const expiresIn = parseInt(params.get("expires_in") || "3600", 10);
      if (token) {
        setSpotifyToken(token, expiresIn);
        window.location.hash = "";
      }
    }
  }, [setSpotifyToken]);

  const handleSearchSpotify = async (query: string) => {
    if (!spotifyToken) return;
    try {
      const tracks = await searchSpotifyTracks(query, spotifyToken);
      const musicTracks: MusicTrack[] = tracks.map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artist,
        album: t.album,
        albumArt: t.albumArt,
        url: t.url,
        platform: "spotify" as const,
      }));
      setSearchResults(musicTracks);
      setRecommendations(musicTracks);
    } catch {
      // Token may have expired
    }
  };

  // ── Shared: play from search results ──

  const handlePlayTrack = (track: MusicTrack) => {
    if (track.platform === "netease") {
      playNeteaseSong(track);
    } else {
      setCurrentTrack(track);
    }
  };

  return (
    <AnimatePresence>
      {musicPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setMusicPanelOpen(false)}
          />

          {/* Slide-in panel */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[320px] border-l border-border bg-bg-elevated shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-secondary/30 shrink-0">
              <div className="flex items-center gap-2">
                <Music size={15} className="text-accent" />
                <span className="text-sm font-display font-semibold text-text-primary tracking-wider">
                  佳音
                </span>
                {todayMood && (
                  <span
                    className="text-[9px] rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor: MOOD_CONFIG[todayMood as Mood]?.color + "18",
                      color: MOOD_CONFIG[todayMood as Mood]?.color,
                    }}
                  >
                    {MOOD_CONFIG[todayMood as Mood]?.label}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMusicPanelOpen(false)}
                className="p-1 text-text-tertiary hover:text-text-secondary rounded"
              >
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/40 shrink-0">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[10px] font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-accent"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="music-tab-indicator"
                      className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              {/* ── NetEase Tab ── */}
              {activeTab === "netease" && (
                <div className="flex flex-col h-full">
                  <div className="p-3 flex-1 overflow-y-auto">
                    {/* Not logged in: show QR login + mood recommendations */}
                    {!isNeteaseLoggedIn ? (
                      <>
                        {loading ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 size={16} className="animate-spin text-text-tertiary" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] text-text-tertiary">
                                共 {searchResults.length} 首推荐
                              </span>
                              <button
                                onClick={fetchNeteaseRecommendations}
                                className="p-1 text-text-tertiary hover:text-text-secondary rounded"
                              >
                                <RefreshCw size={11} />
                              </button>
                            </div>
                            <div className="space-y-1">
                              {searchResults.map((track) => (
                                <button
                                  key={track.id}
                                  onClick={() => handlePlayTrack(track)}
                                  className={`flex items-center gap-2.5 w-full rounded-lg p-2 text-left transition-colors group ${
                                    currentTrack?.id === track.id
                                      ? "bg-accent-soft"
                                      : "hover:bg-bg-secondary"
                                  }`}
                                >
                                  {track.albumArt ? (
                                    <img
                                      src={track.albumArt}
                                      alt=""
                                      className="w-9 h-9 rounded object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded bg-bg-secondary flex items-center justify-center shrink-0">
                                      <Music size={14} className="text-text-tertiary" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] text-text-primary truncate font-medium">
                                      {track.name}
                                    </p>
                                    <p className="text-[10px] text-text-tertiary truncate">
                                      {track.artist}
                                    </p>
                                  </div>
                                  {playingNeteaseId === track.id && (
                                    <Loader2 size={11} className="animate-spin text-text-tertiary shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-10">
                            <Cloud size={28} className="mx-auto text-text-tertiary/30 mb-2" />
                            <p className="text-[11px] text-text-tertiary font-display tracking-wider mb-1">
                              暂无推荐
                            </p>
                            <p className="text-[9px] text-text-tertiary/60 mb-3">
                              扫码登录后可查看歌单和个性化推荐
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Logged in: show playlists or playlist tracks */
                      <>
                        {neteasePlaylistView === "songs" ? (
                          /* ── Playlist tracks view ── */
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setNeteasePlaylistView("list");
                                setNeteasePlaylistTracks([]);
                              }}
                              className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
                            >
                              <ChevronLeft size={12} />
                              返回歌单列表
                            </button>

                            <p className="text-[11px] text-text-primary font-medium truncate">
                              {currentPlaylistName}
                            </p>

                            {tracksLoading ? (
                              <div className="flex items-center justify-center py-10">
                                <Loader2 size={16} className="animate-spin text-text-tertiary" />
                              </div>
                            ) : neteasePlaylistTracks.length === 0 ? (
                              <div className="text-center py-8">
                                <Music size={20} className="mx-auto text-text-tertiary/30 mb-1" />
                                <p className="text-[10px] text-text-tertiary">歌单中暂无歌曲</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {neteasePlaylistTracks.map((track) => (
                                  <button
                                    key={track.id}
                                    onClick={() => playNeteaseSong(track)}
                                    className={`flex items-center gap-2.5 w-full rounded-lg p-2 text-left transition-colors group ${
                                      currentTrack?.id === track.id && isNeteaseActive
                                        ? "bg-accent-soft text-accent"
                                        : "hover:bg-bg-secondary"
                                    }`}
                                  >
                                    <span className="shrink-0">
                                      {currentTrack?.id === track.id && isNeteaseActive && isPlaying ? (
                                        <Pause size={12} />
                                      ) : (
                                        <Play
                                          size={12}
                                          className={
                                            currentTrack?.id === track.id
                                              ? ""
                                              : "text-text-tertiary/50"
                                          }
                                        />
                                      )}
                                    </span>
                                    {track.albumArt ? (
                                      <img
                                        src={track.albumArt}
                                        alt=""
                                        className="w-8 h-8 rounded object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-bg-secondary flex items-center justify-center shrink-0">
                                        <Music size={12} className="text-text-tertiary" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] text-text-primary truncate font-medium">
                                        {track.name}
                                      </p>
                                      <p className="text-[9px] text-text-tertiary truncate">
                                        {track.artist}
                                      </p>
                                    </div>
                                    {playingNeteaseId === track.id && (
                                      <Loader2 size={11} className="animate-spin text-text-tertiary shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* ── Playlist list view ── */
                          <div className="space-y-3">
                            {/* 歌单区 */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                                  <ListMusic size={11} />
                                  我的歌单
                                </span>
                                <button
                                  onClick={loadPlaylists}
                                  className="p-1 text-text-tertiary hover:text-text-secondary rounded"
                                >
                                  <RefreshCw size={10} className={playlistsLoading ? "animate-spin" : ""} />
                                </button>
                              </div>

                              {playlistsLoading && neteasePlaylists.length === 0 ? (
                                <div className="flex justify-center py-6">
                                  <Loader2 size={14} className="animate-spin text-text-tertiary" />
                                </div>
                              ) : playlistsError ? (
                                <div className="text-center py-3">
                                  <p className="text-[10px] text-red-400/80 mb-1">{playlistsError}</p>
                                  <button
                                    onClick={loadPlaylists}
                                    className="text-[10px] text-accent hover:underline"
                                  >
                                    重试
                                  </button>
                                </div>
                              ) : neteasePlaylists.length === 0 ? (
                                <p className="text-[10px] text-text-tertiary/60 text-center py-4">
                                  暂无歌单
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {neteasePlaylists.map((pl) => (
                                    <button
                                      key={pl.id}
                                      onClick={() => loadPlaylistTracks(pl)}
                                      className="flex items-center gap-2.5 w-full rounded-lg p-2 text-left hover:bg-bg-secondary transition-colors group"
                                    >
                                      {pl.coverImgUrl ? (
                                        <img
                                          src={pl.coverImgUrl}
                                          alt=""
                                          className="w-9 h-9 rounded object-cover shrink-0"
                                        />
                                      ) : (
                                        <div className="w-9 h-9 rounded bg-bg-secondary flex items-center justify-center shrink-0">
                                          <ListMusic size={14} className="text-text-tertiary" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-text-primary truncate font-medium">
                                          {pl.name}
                                        </p>
                                        <p className="text-[9px] text-text-tertiary">
                                          {pl.trackCount} 首
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* 情绪推荐区 */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-text-tertiary">情绪推荐</span>
                                <button
                                  onClick={fetchNeteaseRecommendations}
                                  className="p-1 text-text-tertiary hover:text-text-secondary rounded"
                                >
                                  <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                                </button>
                              </div>

                              {loading ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 size={14} className="animate-spin text-text-tertiary" />
                                </div>
                              ) : searchResults.length === 0 ? (
                                <p className="text-[10px] text-text-tertiary/60 text-center py-4">
                                  点击刷新获取推荐
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {searchResults.slice(0, 6).map((track) => (
                                    <button
                                      key={track.id}
                                      onClick={() => playNeteaseSong(track)}
                                      className={`flex items-center gap-2.5 w-full rounded-lg p-2 text-left transition-colors group ${
                                        currentTrack?.id === track.id && isNeteaseActive
                                          ? "bg-accent-soft"
                                          : "hover:bg-bg-secondary"
                                      }`}
                                    >
                                      {track.albumArt ? (
                                        <img
                                          src={track.albumArt}
                                          alt=""
                                          className="w-8 h-8 rounded object-cover shrink-0"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded bg-bg-secondary flex items-center justify-center shrink-0">
                                          <Music size={12} className="text-text-tertiary" />
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-text-primary truncate font-medium">
                                          {track.name}
                                        </p>
                                        <p className="text-[9px] text-text-tertiary truncate">
                                          {track.artist}
                                        </p>
                                      </div>
                                      {playingNeteaseId === track.id && (
                                        <Loader2 size={11} className="animate-spin text-text-tertiary shrink-0" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* NetEase: 进度条 */}
                  {isNeteaseActive && duration > 0 && (
                    <div className="border-t border-border/60 px-3 py-2">
                      <div className="text-center mb-1">
                        <p className="text-[9px] text-text-primary truncate font-medium">
                          {currentTrack?.name}
                        </p>
                        <p className="text-[8px] text-text-tertiary truncate">
                          {currentTrack?.artist}
                        </p>
                      </div>
                      <ProgressBar
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={seek}
                        compact
                      />
                      <div className="flex items-center justify-center mt-1.5">
                        <button
                          onClick={toggle}
                          className="p-1.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* NetEase login section */}
                  <div className="border-t border-border/60 p-3 shrink-0">
                    {isNeteaseLoggedIn ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {neteaseUser?.avatarUrl ? (
                            <img
                              src={neteaseUser.avatarUrl}
                              alt=""
                              className="w-5 h-5 rounded-full shrink-0"
                            />
                          ) : (
                            <Music size={14} className="text-red-500 shrink-0" />
                          )}
                          <span className="text-[10px] text-text-secondary truncate">
                            {neteaseUser?.nickname || "已登录"}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            clearNeteaseAuth();
                            setSearchResults([]);
                            setRecommendations([]);
                            setNeteasePlaylists([]);
                            setNeteasePlaylistTracks([]);
                            setNeteasePlaylistView("list");
                          }}
                          className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-red-400 transition-colors shrink-0"
                        >
                          <LogOut size={10} />
                          退出
                        </button>
                      </div>
                    ) : neteaseQRKey ? (
                      <div className="space-y-2">
                        {neteaseQRUrl && (
                          <div className="flex justify-center">
                            <img
                              src={neteaseQRUrl}
                              alt="二维码"
                              className="w-36 h-36 rounded-lg border border-border"
                            />
                          </div>
                        )}
                        <p className="text-[10px] text-text-tertiary text-center">
                          {qrStatus}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelQRLogin}
                            className="flex-1 rounded-full border border-border px-3 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => {
                              cancelQRLogin();
                              handleNeteaseQRLogin();
                            }}
                            className="flex-1 rounded-full border border-border px-3 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
                          >
                            刷新
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleNeteaseQRLogin}
                          disabled={qrLoading}
                          className="flex items-center justify-center gap-1.5 w-full rounded-full border border-border px-3 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary hover:border-red-400/30 hover:text-red-500 transition-all disabled:opacity-50"
                        >
                          {qrLoading ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <LogIn size={11} />
                          )}
                          扫码登录网易云音乐
                        </button>
                        {qrError && (
                          <p className="text-[9px] text-red-400/80 text-center leading-relaxed">
                            {qrError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Local Tab ── */}
              {activeTab === "local" && <LocalMusicPlayer />}

              {/* ── Spotify Tab ── */}
              {activeTab === "spotify" && (
                <div className="flex flex-col h-full">
                  <div className="p-3 flex-1 overflow-y-auto">
                    {loading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 size={16} className="animate-spin text-text-tertiary" />
                      </div>
                    ) : searchResults.filter((t) => t.platform === "spotify").length > 0 ? (
                      <div className="space-y-1">
                        {searchResults
                          .filter((t) => t.platform === "spotify")
                          .map((track) => (
                            <button
                              key={track.id}
                              onClick={() => {
                                handlePlayTrack(track);
                                if (track.url) window.open(track.url, "_blank");
                              }}
                              className="flex items-center gap-2.5 w-full rounded-lg p-2 text-left hover:bg-bg-secondary transition-colors group"
                            >
                              {track.albumArt ? (
                                <img
                                  src={track.albumArt}
                                  alt=""
                                  className="w-9 h-9 rounded object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded bg-bg-secondary flex items-center justify-center shrink-0">
                                  <Music size={14} className="text-text-tertiary" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] text-text-primary truncate font-medium">
                                  {track.name}
                                </p>
                                <p className="text-[10px] text-text-tertiary truncate">
                                  {track.artist}
                                </p>
                              </div>
                              <ExternalLink
                                size={11}
                                className="text-text-tertiary/0 group-hover:text-text-tertiary shrink-0 transition-colors"
                              />
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-[11px] text-text-tertiary font-display tracking-wider mb-1">
                          连接 Spotify
                        </p>
                        <p className="text-[9px] text-text-tertiary/60">
                          连接 Spotify 账户后可在 Spotify 中搜索音乐
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Spotify login section */}
                  <div className="border-t border-border/60 p-3 shrink-0">
                    {isSpotifyLoggedIn ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#1DB954] font-medium">
                            已连接 Spotify
                          </span>
                          <button
                            onClick={() => {
                              clearSpotifyToken();
                              setSearchResults([]);
                              setRecommendations([]);
                            }}
                            className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-red-400 transition-colors"
                          >
                            <LogOut size={10} />
                            断开
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const q = searchResults[0]?.name || "chill";
                            handleSearchSpotify(q);
                          }}
                          className="flex items-center justify-center gap-1.5 w-full rounded-full bg-[#1DB954]/10 px-3 py-1.5 text-[10px] font-medium text-[#1DB954] hover:bg-[#1DB954]/20 transition-colors"
                        >
                          在 Spotify 中搜索
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleSpotifyLogin}
                        className="flex items-center justify-center gap-1.5 w-full rounded-full border border-border px-3 py-1.5 text-[10px] text-text-tertiary hover:text-text-secondary hover:border-[#1DB954]/30 hover:text-[#1DB954] transition-all"
                      >
                        <LogIn size={11} />
                        连接 Spotify
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
