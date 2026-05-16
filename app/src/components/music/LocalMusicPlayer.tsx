"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  FolderOpen,
  Loader2,
  Search,
} from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";
import type { MusicTrack } from "@/stores/musicStore";
import { useGlobalAudio } from "./useGlobalAudio";
import { ProgressBar } from "./ProgressBar";

interface LocalFile {
  name: string;
  path: string;
  size: number;
  ext: string;
}

export function LocalMusicPlayer() {
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);
  const volume = useMusicStore((s) => s.volume);

  const { toggle, seek, setAudioVolume } = useGlobalAudio();

  const [tracks, setTracks] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<LocalFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [filter, setFilter] = useState("");
  const [folderPath, setFolderPath] = useState("");

  // 用 ref 保持最新的播放列表引用，避免 auto-next effect 闭包过期
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Load file list
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/music/local/list");
      const data = await resp.json();
      if (data.success) {
        setTracks(data.tracks);
        setPlaylist(data.tracks);
        setFolderPath(data.folder || "");
      } else {
        setError(data.error || "无法读取音乐文件夹");
      }
    } catch {
      setError("无法连接本地音乐服务");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Filter
  useEffect(() => {
    if (!filter.trim()) {
      setPlaylist(tracks);
    } else {
      const q = filter.toLowerCase();
      setPlaylist(tracks.filter((t) => t.name.toLowerCase().includes(q)));
    }
  }, [filter, tracks]);

  // Play a specific file
  const playFile = (file: LocalFile, index: number) => {
    const url = `/api/music/local/stream?file=${encodeURIComponent(file.path)}`;

    const track: MusicTrack = {
      id: `local-${file.path}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      artist: "本地音乐",
      platform: "none",
      url,
    };
    setCurrentTrack(track);
    setCurrentIndex(index);
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const next = (currentIndex + 1) % playlist.length;
    playFile(playlist[next], next);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    const prev = (currentIndex - 1 + playlist.length) % playlist.length;
    playFile(playlist[prev], prev);
  };

  // 当前播放的是否是本列表中的歌曲
  const isLocalTrackActive = currentTrack?.id?.startsWith("local-");
  const isCurrentlyPlaying = isLocalTrackActive && isPlaying;

  // 播放结束后自动切下一首
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const prevPlayingRef = useRef(isPlaying);
  useEffect(() => {
    const wasPlaying = prevPlayingRef.current;
    prevPlayingRef.current = isPlaying;

    if (!isLocalTrackActive) return;

    // 仅在歌曲自然结束时自动切歌（currentTime 接近 duration）
    const ct = currentTimeRef.current;
    const dur = durationRef.current;
    if (wasPlaying && !isPlaying && dur > 0 && ct >= dur - 1) {
      const pl = playlistRef.current;
      const idx = currentIndexRef.current;
      if (pl.length > 0) {
        const next = (idx + 1) % pl.length;
        const file = pl[next];
        const url = `/api/music/local/stream?file=${encodeURIComponent(file.path)}`;
        const track: MusicTrack = {
          id: `local-${file.path}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          artist: "本地音乐",
          platform: "none",
          url,
        };
        setCurrentTrack(track);
        setCurrentIndex(next);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isLocalTrackActive]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const displayName = (name: string): string => {
    return name.replace(/\.[^.]+$/, "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={16} className="animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-3">
        <FolderOpen size={24} className="mx-auto text-text-tertiary/40 mb-2" />
        <p className="text-[11px] text-text-tertiary mb-1">{error}</p>
        <p className="text-[9px] text-text-tertiary/60 mb-3">
          请在 .env.local 中设置 LOCAL_MUSIC_PATH 指向你的音乐文件夹
        </p>
        <button
          onClick={loadFiles}
          className="text-[10px] text-accent hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="筛选歌曲..."
            className="w-full h-7 rounded-lg border border-border bg-bg-secondary/60 pl-7 pr-2 text-[10px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/30"
          />
        </div>
        {folderPath && (
          <p className="text-[8px] text-text-tertiary/50 mt-1 truncate px-1">
            {folderPath}
          </p>
        )}
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto px-1">
        {playlist.length === 0 ? (
          <div className="text-center py-6">
            <Music size={20} className="mx-auto text-text-tertiary/30 mb-1" />
            <p className="text-[10px] text-text-tertiary">
              {filter ? "没有匹配的歌曲" : "文件夹中暂无音乐文件"}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {playlist.map((file, idx) => {
              const fileTrackId = `local-${file.path}`;
              const isActive = currentTrack?.id === fileTrackId;
              return (
                <button
                  key={file.path}
                  onClick={() => playFile(file, idx)}
                  className={`flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left transition-colors group ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "hover:bg-bg-secondary text-text-secondary"
                  }`}
                >
                  <span className="shrink-0">
                    {isActive && isPlaying ? (
                      <Pause size={12} />
                    ) : (
                      <Play size={12} className={isActive ? "" : "text-text-tertiary/50"} />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] truncate font-medium">
                      {displayName(file.name)}
                    </p>
                    <p className="text-[8px] text-text-tertiary/60">
                      {file.ext.replace(".", "").toUpperCase()} · {formatSize(file.size)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="border-t border-border/60 px-3 py-2 space-y-2">
        {/* Now playing */}
        <div className="text-center min-h-[16px]">
          {isLocalTrackActive && currentTrack ? (
            <p className="text-[9px] text-text-primary truncate font-medium">
              {currentTrack.name}
            </p>
          ) : (
            <p className="text-[9px] text-text-tertiary">选择一首歌曲播放</p>
          )}
        </div>

        {/* Progress bar */}
        {isLocalTrackActive && (
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            compact
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={playPrev}
            className="p-1 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <SkipForward size={14} className="rotate-180" />
          </button>
          <button
            onClick={toggle}
            disabled={!isLocalTrackActive}
            className="p-1.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-40"
          >
            {isCurrentlyPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={playNext}
            className="p-1 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-text-tertiary w-4 text-right">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none bg-bg-secondary accent-accent cursor-pointer"
          />
          <span className="text-[8px] text-text-tertiary w-4">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
