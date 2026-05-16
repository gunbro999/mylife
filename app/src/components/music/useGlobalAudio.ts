"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMusicStore } from "@/stores/musicStore";

// 模块级单例 Audio
let globalAudio: HTMLAudioElement | null = null;
let listenerCount = 0;

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = "auto";
  }
  return globalAudio;
}

export function useGlobalAudio() {
  const currentTrack = useMusicStore((s) => s.currentTrack);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const setIsPlaying = useMusicStore((s) => s.setIsPlaying);
  const volume = useMusicStore((s) => s.volume);
  const setVolume = useMusicStore((s) => s.setVolume);
  const setCurrentTime = useMusicStore((s) => s.setCurrentTime);
  const setDuration = useMusicStore((s) => s.setDuration);

  // 全局事件监听（使用计数器避免重复注册/注销）
  useEffect(() => {
    const audio = getAudio();

    if (listenerCount === 0) {
      audio.volume = volume;
    }
    listenerCount++;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    // 只在第一个调用者时注册
    if (listenerCount === 1) {
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("durationchange", onDurationChange);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
    }

    return () => {
      listenerCount--;
      // 只在最后一个调用者卸载时移除
      if (listenerCount === 0) {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("durationchange", onDurationChange);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 同步音量
  useEffect(() => {
    getAudio().volume = volume;
  }, [volume]);

  // currentTrack 改变时加载新音频源
  const prevTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    const audio = getAudio();
    const trackId = currentTrack?.id ?? null;
    const url = currentTrack?.url;

    if (!url) return;

    // 同一首歌不重载
    if (trackId && trackId === prevTrackIdRef.current) return;

    prevTrackIdRef.current = trackId;

    // 先暂停当前播放，避免 onPause 事件竞态
    audio.pause();
    audio.src = url;
    setCurrentTime(0);
    setDuration(0);
    // 用 setTimeout 确保 src 变更和 load 完成后再 play
    setTimeout(() => {
      audio.play().catch(() => {});
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, currentTrack?.url]);

  const play = useCallback((url: string) => {
    const audio = getAudio();
    audio.src = url;
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    getAudio().pause();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const toggle = useCallback(() => {
    const audio = getAudio();
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    // play/pause 事件会自动同步 isPlaying
  }, []);

  const seek = useCallback((time: number) => {
    const audio = getAudio();
    audio.currentTime = time;
    setCurrentTime(time);
  }, [setCurrentTime]);

  const setAudioVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    getAudio().volume = clamped;
    setVolume(clamped);
  }, [setVolume]);

  return { play, pause, toggle, seek, setAudioVolume };
}
