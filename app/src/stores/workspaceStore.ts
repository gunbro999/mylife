import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbGet, dbPut, dbDelete } from '@/lib/indexedDB';
import { isTauri, platform } from '@/lib/platform';

// Tauri mode: dirPath is a native filesystem path (e.g., C:\Users\...\Documents)
// Browser mode: liveHandle is the FileSystemDirectoryHandle (stored in IndexedDB)

let liveHandle: FileSystemDirectoryHandle | null = null;

interface WorkspaceState {
  isReady: boolean;
  directoryName: string | null;
  /** Native file path (Tauri only) */
  dirPath: string | null;

  pickDirectory: () => Promise<void>;
  restore: () => Promise<void>;
  clear: () => Promise<void>;

  saveToFile: (filename: string, content: string) => Promise<void>;
  deleteFile: (filename: string) => Promise<void>;
  readFile: (filename: string) => Promise<string | null>;
  listFiles: () => Promise<string[]>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      isReady: false,
      directoryName: null,
      dirPath: null,

      pickDirectory: async () => {
        try {
          if (isTauri) {
            const { name, path } = await platform.pickDirectory();
            set({ isReady: true, directoryName: name, dirPath: path });
            // Persist path to IndexedDB
            await dbPut('workspaceDir', { tauriPath: path, name });
          } else {
            const { name } = await platform.pickDirectory();
            const stored = await dbGet('workspaceDir');
            if (stored && typeof stored === 'object' && 'handle' in (stored as any)) {
              liveHandle = (stored as any).handle as FileSystemDirectoryHandle;
            }
            set({ isReady: true, directoryName: name, dirPath: name });
          }
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            console.error('pickDirectory failed:', e);
          }
        }
      },

      restore: async () => {
        if (get().isReady) return;
        try {
          const stored = (await dbGet('workspaceDir')) as any;
          if (!stored) return;

          if (isTauri) {
            const path = stored.tauriPath || stored;
            if (typeof path === 'string') {
              const exists = await platform.dirExists(path);
              if (exists) {
                const name = stored.name || path.split(/[/\\]/).pop() || path;
                set({ isReady: true, directoryName: name, dirPath: path });
              }
            }
          } else {
            // Browser: stored should be FileSystemDirectoryHandle
            const handle = stored.handle || stored;
            if (handle && typeof handle === 'object' && 'requestPermission' in handle) {
              const perm =
                (await (handle as any).queryPermission({ mode: 'readwrite' })) === 'granted' ||
                (await (handle as any).requestPermission({ mode: 'readwrite' })) === 'granted';
              if (perm) {
                liveHandle = handle as FileSystemDirectoryHandle;
                set({
                  isReady: true,
                  directoryName: handle.name,
                  dirPath: handle.name,
                });
              }
            }
          }
        } catch {
          // IndexedDB not available or permission denied
        }
      },

      clear: async () => {
        liveHandle = null;
        await dbDelete('workspaceDir');
        set({ isReady: false, directoryName: null, dirPath: null });
      },

      saveToFile: async (filename: string, content: string) => {
        const state = get();
        if (!state.isReady) throw new Error('No workspace directory selected');
        await platform.saveFile(state.dirPath || state.directoryName!, filename, content, liveHandle || undefined);
      },

      deleteFile: async (filename: string) => {
        const state = get();
        if (!state.isReady) throw new Error('No workspace directory selected');
        await platform.deleteFile(state.dirPath || state.directoryName!, filename, liveHandle || undefined);
      },

      readFile: async (filename: string): Promise<string | null> => {
        const state = get();
        if (!state.isReady) return null;
        return platform.readFile(state.dirPath || state.directoryName!, filename, liveHandle || undefined);
      },

      listFiles: async (): Promise<string[]> => {
        const state = get();
        if (!state.isReady) return [];
        const files = await platform.listFiles(
          state.dirPath || state.directoryName!,
          new Set(['.md']),
          liveHandle || undefined
        );
        return files.map((f) => f.name).sort();
      },
    }),
    {
      name: 'mylife-workspace',
      partialize: (state) => ({
        isReady: state.isReady,
        directoryName: state.directoryName,
        dirPath: state.dirPath,
      }),
    }
  )
);
