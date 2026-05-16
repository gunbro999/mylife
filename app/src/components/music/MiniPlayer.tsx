"use client";

import { Music, Play, Pause, PanelRightOpen } from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";
import { useUIStore } from "@/stores/uiStore";
import { useGlobalAudio } from "./useGlobalAudio";
import { ProgressBar } from "./ProgressBar";

export function MiniPlayer() {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const currentTime = useMusicStore((s) => s.currentTime);
  const duration = useMusicStore((s) => s.duration);
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setMusicPanelOpen = useUIStore((s) => s.setMusicPanelOpen);

  const { toggle, seek } = useGlobalAudio();

  const platformEmoji: Record<string, string> = {
    netease: "☁️",
    spotify: "🟢",
  };

  return (
    <div className="border-t border-border bg-bg-elevated/80 backdrop-blur-sm">
      <button
        onClick={() => setMusicPanelOpen(true)}
        className="w-full flex flex-col px-3 py-2 text-text-tertiary hover:text-text-secondary transition-colors group"
      >
        {/* Track info row */}
        <div className="flex items-center gap-2 w-full">
          {currentTrack ? (
            <>
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-sm shrink-0">
                  {currentTrack.albumArt ? (
                    <img
                      src={currentTrack.albumArt}
                      alt=""
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <Music size={14} />
                  )}
                </span>
                <span className="text-[10px] truncate font-display">
                  {currentTrack.name}
                </span>
                <span className="text-[9px] text-text-tertiary/60 truncate hidden sm:block">
                  {currentTrack.artist}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggle();
                }}
                className="shrink-0 p-1 rounded-full hover:bg-bg-secondary"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </>
          ) : (
            <>
              <Music size={13} className="shrink-0" />
              {!collapsed && (
                <span className="text-[10px] font-display tracking-wider flex-1 text-left">
                  佳音
                </span>
              )}
            </>
          )}

          {/* Platform indicator */}
          {currentTrack && currentTrack.platform !== "none" && (
            <span className="text-[8px] shrink-0">
              {platformEmoji[currentTrack.platform] || ""}
            </span>
          )}

          {/* Open panel icon */}
          <PanelRightOpen
            size={11}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Progress bar - only show when track is playing */}
        {currentTrack && duration > 0 && (
          <div className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              compact
            />
          </div>
        )}
      </button>
    </div>
  );
}
