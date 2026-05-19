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
  FolderSearch,
} from "lucide-react";
import { useMusicStore, getLiveMusicHandle } from "@/stores/musicStore";
import type { MusicTrack } from "@/stores/musicStore";
import { useGlobalAudio } from "./useGlobalAudio";
import { ProgressBar } from "./ProgressBar";

interface LocalFile {
  name: string;
  size: number;
  ext: string;
  handle: FileSystemFileHandle;
}

const AUDIO_EXTS = new Set(['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac', '.wma', '.ape']);

export function LocalMusicPlayer() {
  const setCurrentTrack = useMusicStore((s) => s.setCurrentTrack);
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);
  const volume = useMusicStore((s) => s.volume);
  const localMusicDirReady = useMusicStore((s) => s.localMusicDirReady);
  const localMusicDirName = useMusicStore((s) => s.localMusicDirName);
  const pickLocalMusicDir = useMusicStore((s) => s.pickLocalMusicDir);
  const restoreLocalMusicDir = useMusicStore((s) => s.restoreLocalMusicDir);

  const { toggle, seek, setAudioVolume } = useGlobalAudio();

  const [tracks, setTracks] = useState<LocalFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<LocalFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [filter, setFilter] = useState("");

  // Refs for auto-next
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Restore directory handle on mount
  useEffect(() => {
    restoreLocalMusicDir();
  }, [restoreLocalMusicDir]);

  // Load files from directory handle
  const loadFiles = useCallback(async () => {
    const handle = getLiveMusicHandle();
    if (!handle) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const files: LocalFile[] = [];
      const iter = (handle as any).values();
      for await (const entry of iter) {
        if (entry.kind !== 'file') continue;
        const name = entry.name as string;
        const dot = name.lastIndexOf('.');
        const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
        if (!AUDIO_EXTS.has(ext)) continue;
        files.push({
          name,
          size: 0, // size not available from handle entry
          ext,
          handle: entry as FileSystemFileHandle,
        });
      }
      files.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      setTracks(files);
      setPlaylist(files);
    } catch (e) {
      setError("无法读取音乐文件夹，请检查权限");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localMusicDirReady) {
      loadFiles();
    } else {
      setLoading(false);
    }
  }, [localMusicDirReady, loadFiles]);

  // Filter
  useEffect(() => {
    if (!filter.trim()) {
      setPlaylist(tracks);
    } else {
      const q = filter.toLowerCase();
      setPlaylist(tracks.filter((t) => t.name.toLowerCase().includes(q)));
    }
  }, [filter, tracks]);

  // Play a specific file — read via FileHandle and create blob URL
  const playFile = async (file: LocalFile, index: number) => {
    try {
      const blob = await file.handle.getFile();
      const url = URL.createObjectURL(blob);

      // Revoke previous blob URL for this player
      const prevUrl = currentTrack?.url;
      if (prevUrl && prevUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prevUrl);
      }

      const track: MusicTrack = {
        id: `local-${file.name}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        artist: "本地音乐",
        platform: "none",
        url,
      };
      setCurrentTrack(track);
      setCurrentIndex(index);
    } catch {
      // File read failed
    }
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

  const isLocalTrackActive = currentTrack?.id?.startsWith("local-");
  const isCurrentlyPlaying = isLocalTrackActive && isPlaying;

  // Auto-next on song end
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const prevPlayingRef = useRef(isPlaying);
  useEffect(() => {
    const wasPlaying = prevPlayingRef.current;
    prevPlayingRef.current = isPlaying;

    if (!isLocalTrackActive) return;

    const ct = currentTimeRef.current;
    const dur = durationRef.current;
    if (wasPlaying && !isPlaying && dur > 0 && ct >= dur - 1) {
      const pl = playlistRef.current;
      const idx = currentIndexRef.current;
      if (pl.length > 0) {
        const next = (idx + 1) % pl.length;
        playFile(pl[next], next);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isLocalTrackActive]);

  const displayName = (name: string): string => name.replace(/\.[^.]+$/, "");

  // No directory selected
  if (!localMusicDirReady) {
    return (
      <div className="text-center py-8 px-3">
        <FolderOpen size={24} className="mx-auto text-text-tertiary/40 mb-2" />
        <p className="text-[11px] text-text-tertiary mb-1">尚未选择本地音乐文件夹</p>
        <p className="text-[9px] text-text-tertiary/60 mb-3">
          选择一个文件夹来播放其中的音乐文件
        </p>
        <button
          onClick={pickLocalMusicDir}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
        >
          <FolderSearch size={13} />
          选择音乐文件夹
        </button>
      </div>
    );
  }

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
      {/* Search + folder info */}
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
        <div className="flex items-center justify-between mt-1 px-1">
          <p className="text-[8px] text-text-tertiary/50 truncate">
            {localMusicDirName} · {tracks.length} 首
          </p>
          <button
            onClick={pickLocalMusicDir}
            className="text-[8px] text-text-tertiary/50 hover:text-accent transition-colors"
            title="更换文件夹"
          >
            <FolderSearch size={10} />
          </button>
        </div>
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
              const fileTrackId = `local-${file.name}`;
              const isActive = currentTrack?.id === fileTrackId;
              return (
                <button
                  key={file.name}
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
                      {file.ext.replace(".", "").toUpperCase()}
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
        <div className="text-center min-h-[16px]">
          {isLocalTrackActive && currentTrack ? (
            <p className="text-[9px] text-text-primary truncate font-medium">
              {currentTrack.name}
            </p>
          ) : (
            <p className="text-[9px] text-text-tertiary">选择一首歌曲播放</p>
          )}
        </div>

        {isLocalTrackActive && (
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            compact
          />
        )}

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
