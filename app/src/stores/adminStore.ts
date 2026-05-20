import { create } from 'zustand';

interface AdminState {
  // User management
  userSearch: string;
  userSort: string;
  userPage: number;
  userDetailId: string | null;
  setUserSearch: (s: string) => void;
  setUserSort: (s: string) => void;
  setUserPage: (p: number) => void;
  setUserDetailId: (id: string | null) => void;

  // Content management
  contentType: string;
  contentAuthor: string;
  contentSearch: string;
  contentSort: string;
  contentPage: number;
  contentPreviewId: string | null;
  setContentType: (t: string) => void;
  setContentAuthor: (a: string) => void;
  setContentSearch: (s: string) => void;
  setContentSort: (s: string) => void;
  setContentPage: (p: number) => void;
  setContentPreviewId: (id: string | null) => void;

  // Stats
  statsRange: string;
  setStatsRange: (r: string) => void;

  // Settings
  settingsTab: string;
  setSettingsTab: (t: string) => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  userSearch: '',
  userSort: 'newest',
  userPage: 1,
  userDetailId: null,
  setUserSearch: (s) => set({ userSearch: s, userPage: 1 }),
  setUserSort: (s) => set({ userSort: s, userPage: 1 }),
  setUserPage: (p) => set({ userPage: p }),
  setUserDetailId: (id) => set({ userDetailId: id }),

  contentType: 'all',
  contentAuthor: '',
  contentSearch: '',
  contentSort: 'newest',
  contentPage: 1,
  contentPreviewId: null,
  setContentType: (t) => set({ contentType: t, contentPage: 1 }),
  setContentAuthor: (a) => set({ contentAuthor: a, contentPage: 1 }),
  setContentSearch: (s) => set({ contentSearch: s, contentPage: 1 }),
  setContentSort: (s) => set({ contentSort: s, contentPage: 1 }),
  setContentPage: (p) => set({ contentPage: p }),
  setContentPreviewId: (id) => set({ contentPreviewId: id }),

  statsRange: '30',
  setStatsRange: (r) => set({ statsRange: r }),

  settingsTab: 'ai',
  setSettingsTab: (t) => set({ settingsTab: t }),
}));
