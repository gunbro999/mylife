import { createClient } from './supabase/client';

/** Compress image with canvas before upload */
function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, file.type, quality);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

function generateFileName(ext: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}.${ext}`;
}

/** Upload image to Supabase Storage. Falls back to base64 data URL if Supabase is not configured. */
export async function uploadImage(file: File, writingId: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Try Supabase upload if configured
  if (supabaseUrl && supabaseUrl !== 'https://xxxxxxxxxxxx.supabase.co') {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const compressed = await compressImage(file);
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${user.id}/${writingId}/${generateFileName(ext)}`;
        const { data, error } = await supabase.storage
          .from('writing-images')
          .upload(path, compressed, {
            contentType: file.type,
            upsert: false,
          });
        if (error) {
          console.error('Supabase upload failed, falling back to base64:', error);
        } else if (data) {
          const { data: urlData } = supabase.storage
            .from('writing-images')
            .getPublicUrl(path);
          return urlData.publicUrl;
        }
      }
    } catch (e) {
      console.error('Supabase upload error, falling back to base64:', e);
    }
  }

  // Fallback: base64 data URL (works offline, no Supabase needed)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Extract files from clipboard paste event */
export function getImagesFromClipboard(e: ClipboardEvent): File[] {
  const items = e.clipboardData?.items;
  if (!items) return [];
  const files: File[] = [];
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}
