import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return crypto.randomUUID();
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getWordCount(text: string): number {
  const cleaned = text.replace(/<[^>]*>/g, "").trim();
  if (!cleaned) return 0;
  const chinese = cleaned.match(/[一-鿿]/g)?.length ?? 0;
  const english = cleaned
    .replace(/[一-鿿]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return chinese + english;
}

export function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 400);
  return minutes < 1 ? "不到 1 分钟" : `${minutes} 分钟`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function getPlainText(html: string): string {
  return stripHtml(html);
}

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export function groupByDate<T>(items: T[], getDate: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const date = getDate(item).slice(0, 10);
    const arr = map.get(date) || [];
    arr.push(item);
    map.set(date, arr);
  });
  return map;
}

export function formatDate(date: Date | string, format: "full" | "short" | "relative" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (format === "relative") {
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days} 天前`;
    if (days < 30) return `${Math.floor(days / 7)} 周前`;
    return d.toLocaleDateString("zh-CN");
  }

  if (format === "full") {
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  });
}
