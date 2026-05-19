/**
 * Platform abstraction layer.
 *
 * Detects Tauri vs browser and provides a unified API for file system
 * operations. In Tauri, we use native Rust commands (faster, no
 * browser restrictions). In browser, we fall back to File System
 * Access API with IndexedDB handle persistence.
 */

// ── Detection ──

export const isTauri: boolean =
  typeof window !== 'undefined' && '__TAURI__' in window;

// ── Types ──

export interface FileEntry {
  name: string;
  size: number;
  ext: string;
  /** File handle for browser File System Access API */
  handle?: FileSystemFileHandle;
}

// ── Tauri native operations (lazy imports to avoid bundling in browser) ──

async function tauriInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(cmd, args);
}

async function tauriPickDirectory(): Promise<{ name: string; path: string }> {
  const { open } = await import('@tauri-apps/plugin-dialog');
  const result = await open({ directory: true, multiple: false, title: '选择文件夹' });
  if (!result) throw new Error('User cancelled');
  const path = result as string;
  const name = path.split(/[/\\]/).pop() || path;
  return { name, path };
}

async function tauriSaveFile(filepath: string, content: string): Promise<void> {
  await tauriInvoke('write_text_file', { path: filepath, content });
}

async function tauriReadFile(filepath: string): Promise<string> {
  return tauriInvoke('read_text_file', { path: filepath });
}

async function tauriDeleteFile(filepath: string): Promise<void> {
  await tauriInvoke('delete_file', { path: filepath });
}

async function tauriListDir(dirPath: string, exts: string[]): Promise<FileEntry[]> {
  const files: string[] = await tauriInvoke('list_dir', { path: dirPath });
  return files
    .filter((f) => {
      const dot = f.lastIndexOf('.');
      if (dot < 0) return false;
      return exts.includes(f.slice(dot).toLowerCase());
    })
    .map((f) => ({
      name: f,
      size: 0,
      ext: f.slice(f.lastIndexOf('.')),
    }));
}

async function tauriCheckDir(dirPath: string): Promise<boolean> {
  return tauriInvoke('dir_exists', { path: dirPath });
}

// ── Browser File System Access API operations ──

async function browserPickDirectory(): Promise<{ name: string; path: string }> {
  const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
  // Store handle in IndexedDB for later use
  const { dbPut } = await import('@/lib/indexedDB');
  await dbPut('workspaceDir', handle);
  return { name: handle.name, path: handle.name };
}

async function browserSaveFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string
): Promise<void> {
  const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

async function browserReadFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string
): Promise<string | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

async function browserDeleteFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string
): Promise<void> {
  await dirHandle.removeEntry(filename);
}

async function browserListDir(
  dirHandle: FileSystemDirectoryHandle,
  exts: Set<string>
): Promise<FileEntry[]> {
  const result: FileEntry[] = [];
  const iter = (dirHandle as any).values();
  for await (const entry of iter) {
    if (entry.kind !== 'file') continue;
    const name: string = entry.name;
    const dot = name.lastIndexOf('.');
    const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
    if (!exts.has(ext)) continue;
    result.push({ name, size: 0, ext, handle: entry as FileSystemFileHandle });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

// ── Unified public API ──

export const platform = {
  /** Open native directory picker, return name + identifier */
  pickDirectory: isTauri ? tauriPickDirectory : browserPickDirectory,

  /** Save text content to a file */
  async saveFile(
    dirId: string,
    filename: string,
    content: string,
    browserHandle?: FileSystemDirectoryHandle
  ): Promise<void> {
    if (isTauri) {
      const sep = dirId.includes('\\') ? '\\' : '/';
      await tauriSaveFile(`${dirId}${sep}${filename}`, content);
    } else if (browserHandle) {
      await browserSaveFile(browserHandle, filename, content);
    }
  },

  /** Read binary file as Blob (for audio etc.) */
  async readBinaryFile(
    dirId: string,
    filename: string,
    browserHandle?: FileSystemDirectoryHandle
  ): Promise<Blob | null> {
    if (isTauri) {
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const sep = dirId.includes('\\') ? '\\' : '/';
      const data = await readFile(`${dirId}${sep}${filename}`);
      const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.wav': 'audio/wav',
        '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
        '.wma': 'audio/x-ms-wma', '.ape': 'audio/ape',
      };
      return new Blob([data], { type: mimeMap[ext] || 'audio/mpeg' });
    } else if (browserHandle) {
      try {
        const fileHandle = await browserHandle.getFileHandle(filename);
        return await fileHandle.getFile();
      } catch {
        return null;
      }
    }
    return null;
  },

  /** Read text content from a file */
  async readFile(
    dirId: string,
    filename: string,
    browserHandle?: FileSystemDirectoryHandle
  ): Promise<string | null> {
    if (isTauri) {
      const sep = dirId.includes('\\') ? '\\' : '/';
      return tauriReadFile(`${dirId}${sep}${filename}`);
    } else if (browserHandle) {
      return browserReadFile(browserHandle, filename);
    }
    return null;
  },

  /** Delete a file */
  async deleteFile(
    dirId: string,
    filename: string,
    browserHandle?: FileSystemDirectoryHandle
  ): Promise<void> {
    if (isTauri) {
      const sep = dirId.includes('\\') ? '\\' : '/';
      await tauriDeleteFile(`${dirId}${sep}${filename}`);
    } else if (browserHandle) {
      await browserDeleteFile(browserHandle, filename);
    }
  },

  /** List files in directory matching given extensions */
  async listFiles(
    dirId: string,
    exts: Set<string>,
    browserHandle?: FileSystemDirectoryHandle
  ): Promise<FileEntry[]> {
    if (isTauri) {
      return tauriListDir(dirId, [...exts]);
    } else if (browserHandle) {
      return browserListDir(browserHandle, exts);
    }
    return [];
  },

  /** Check if directory exists */
  async dirExists(dirId: string): Promise<boolean> {
    if (isTauri) {
      return tauriCheckDir(dirId);
    }
    // Browser: check by trying to restore handle
    const { dbGet } = await import('@/lib/indexedDB');
    const handle = await dbGet(dirId);
    return !!handle;
  },
};
