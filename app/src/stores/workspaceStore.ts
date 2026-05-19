import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dbGet, dbPut, dbDelete } from '@/lib/indexedDB';

// Module-level hold on the live handle so we don't round-trip IndexedDB on every save
let liveHandle: FileSystemDirectoryHandle | null = null;

interface WorkspaceState {
  isReady: boolean;
  directoryName: string | null;

  /** Open a directory picker and persist the handle */
  pickDirectory: () => Promise<void>;
  /** Restore handle from IndexedDB on app init */
  restore: () => Promise<void>;
  /** Clear the workspace */
  clear: () => Promise<void>;

  /** Save a file to the workspace directory */
  saveToFile: (filename: string, content: string) => Promise<void>;
  /** Delete a file from the workspace directory */
  deleteFile: (filename: string) => Promise<void>;
  /** Read a file from the workspace directory */
  readFile: (filename: string) => Promise<string | null>;
  /** List all .md files in the workspace directory */
  listFiles: () => Promise<string[]>;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      isReady: false,
      directoryName: null,

      pickDirectory: async () => {
        try {
          const handle = await (window as any).showDirectoryPicker({
            mode: 'readwrite',
          });
          liveHandle = handle;
          await dbPut('workspaceDir', handle);
          set({ isReady: true, directoryName: handle.name });
        } catch (e) {
          if ((e as Error).name !== 'AbortError') {
            console.error('pickDirectory failed:', e);
          }
        }
      },

      restore: async () => {
        if (get().isReady) return;
        try {
          const stored = (await dbGet('workspaceDir')) as FileSystemDirectoryHandle | undefined;
          if (!stored) return;
          const handle = stored as any;
          const perm =
            (await handle.queryPermission({ mode: 'readwrite' })) === 'granted' ||
            (await handle.requestPermission({ mode: 'readwrite' })) === 'granted';
          if (perm) {
            liveHandle = stored;
            set({ isReady: true, directoryName: stored.name });
          }
        } catch {
          // IndexedDB not available or permission denied
        }
      },

      clear: async () => {
        liveHandle = null;
        await dbDelete('workspaceDir');
        set({ isReady: false, directoryName: null });
      },

      saveToFile: async (filename: string, content: string) => {
        const handle = liveHandle;
        if (!handle) throw new Error('No workspace directory selected');
        const fileHandle = await handle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      },

      deleteFile: async (filename: string) => {
        const handle = liveHandle;
        if (!handle) throw new Error('No workspace directory selected');
        await handle.removeEntry(filename);
      },

      readFile: async (filename: string): Promise<string | null> => {
        const handle = liveHandle;
        if (!handle) return null;
        try {
          const fileHandle = await handle.getFileHandle(filename);
          const file = await fileHandle.getFile();
          return await file.text();
        } catch {
          return null;
        }
      },

      listFiles: async (): Promise<string[]> => {
        const handle = liveHandle;
        if (!handle) return [];
        const result: string[] = [];
        const iter = (handle as any).values();
        for await (const entry of iter) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            result.push(entry.name);
          }
        }
        return result.sort();
      },
    }),
    {
      name: 'mylife-workspace',
      partialize: (state) => ({
        isReady: state.isReady,
        directoryName: state.directoryName,
      }),
    }
  )
);
