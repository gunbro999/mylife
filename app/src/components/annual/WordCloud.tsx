"use client";

import { useMemo } from "react";

interface Word {
  text: string;
  weight: number;
}

interface WordCloudProps {
  words: Word[];
  width?: number;
  height?: number;
}

// Chinese stop words
const STOP_WORDS = new Set([
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人", "都", "一",
  "一个", "上", "也", "很", "到", "说", "要", "去", "你", "会", "着",
  "没有", "看", "好", "自己", "这", "他", "她", "它", "们", "那", "些",
  "所", "可以", "因为", "所以", "但是", "如果", "虽然", "而且", "还是",
  "这个", "那个", "什么", "怎么", "为什么", "这么", "那么", "只是",
  "觉得", "知道", "可能", "应该", "已经", "还", "又", "再", "才", "就",
  "便", "却", "只", "把", "被", "让", "给", "对", "从", "以", "为",
  "能", "会", "想", "做", "来", "去", "过", "时", "时候", "时候",
  "然后", "之后", "之前", "以后", "一下", "一点", "一些", "有点",
  "真的", "比较", "非常", "最", "更", "越", "也", "啊", "吧", "呢",
  "吗", "嘛", "哦", "嗯", "呀", "哈", "哇", "嗨",
]);

function extractWords(writingsContent: string[]): Word[] {
  // Join all text and extract Chinese character bigrams
  const allText = writingsContent.join(" ");
  // Remove HTML tags
  const plainText = allText.replace(/<[^>]*>/g, "");
  // Remove non-Chinese characters
  const chineseOnly = plainText.replace(/[^一-鿿]/g, "");

  // Count bigrams (2-char sequences)
  const bigrams = new Map<string, number>();
  for (let i = 0; i < chineseOnly.length - 1; i++) {
    const bigram = chineseOnly.slice(i, i + 2);
    if (STOP_WORDS.has(bigram)) continue;
    // Skip if either char is a single-char stop word
    if (STOP_WORDS.has(bigram[0]) || STOP_WORDS.has(bigram[1])) continue;
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }

  // Also count single characters (as fallback if not enough bigrams)
  if (bigrams.size < 10) {
    const singleChars = new Map<string, number>();
    for (const ch of chineseOnly) {
      if (STOP_WORDS.has(ch)) continue;
      singleChars.set(ch, (singleChars.get(ch) || 0) + 1);
    }
    singleChars.forEach((count, text) => {
      bigrams.set(text, count);
    });
  }

  // Sort by frequency, take top 50
  const sorted = [...bigrams.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

  if (sorted.length === 0) return [];

  const maxWeight = sorted[0][1];
  return sorted.map(([text, count]) => ({
    text,
    weight: count / maxWeight,
  }));
}

// Simple spiral placement
function placeWords(
  words: Word[],
  width: number,
  height: number
): Array<Word & { x: number; y: number; size: number }> {
  const result: Array<Word & { x: number; y: number; size: number }> = [];
  const occupied: { x: number; y: number; w: number; h: number }[] = [];

  for (const word of words) {
    const size = 10 + word.weight * 28; // font size: 10-38px
    const charWidth = size * word.text.length;
    const charHeight = size;

    // Spiral search for non-overlapping position
    let placed = false;
    const cx = width / 2;
    const cy = height / 2;

    for (let angle = 0; angle < 2000 && !placed; angle += 0.3) {
      const r = angle * 1.2;
      const x = cx + r * Math.cos(angle) - charWidth / 2;
      const y = cy + r * Math.sin(angle) - charHeight / 2;

      if (x < 2 || y < 2 || x + charWidth > width - 2 || y + charHeight > height - 2) {
        continue;
      }

      // Check collision
      let collision = false;
      for (const o of occupied) {
        if (
          x < o.x + o.w + 3 &&
          x + charWidth + 3 > o.x &&
          y < o.y + o.h + 3 &&
          y + charHeight + 3 > o.y
        ) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        result.push({ ...word, x, y: y + charHeight, size });
        occupied.push({ x, y, w: charWidth, h: charHeight });
        placed = true;
      }
    }
  }

  return result;
}

export function WordCloud({ words: inputWords, width = 600, height = 350 }: WordCloudProps) {
  const placed = useMemo(() => placeWords(inputWords, width, height), [inputWords, width, height]);

  if (placed.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-xs text-text-tertiary font-display tracking-wider">
        暂无内容，写点文字吧
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {placed.map((word, i) => (
        <text
          key={word.text + i}
          x={word.x}
          y={word.y}
          fontSize={word.size}
          fill={`color-mix(in srgb, var(--accent) ${30 + word.weight * 70}%, var(--text-secondary))`}
          fontFamily="serif"
          fontWeight={word.weight > 0.6 ? "bold" : "normal"}
          textAnchor="start"
        >
          {word.text}
        </text>
      ))}
    </svg>
  );
}

// Hook to compute words from writings
export function useWordCloudWords(writingsContent: string[]): Word[] {
  return useMemo(() => extractWords(writingsContent), [writingsContent]);
}
