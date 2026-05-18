import TurndownService from 'turndown';
import type { Writing } from './types';
import { stripHtml } from './utils';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});

/** Export a single writing as Markdown with frontmatter */
export function exportWritingToMarkdown(writing: Writing): string {
  const frontmatter: Record<string, string | string[]> = {
    title: writing.title || '无标题',
    date: writing.createdAt.slice(0, 10),
    type: typeLabel(writing.type),
  };
  if (writing.mood) frontmatter.mood = writing.mood;
  if (writing.weather) frontmatter.weather = writing.weather;
  if (writing.tags.length > 0) frontmatter.tags = writing.tags;

  const fmLines = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      fmLines.push(`${key}: [${value.join(', ')}]`);
    } else {
      fmLines.push(`${key}: "${value}"`);
    }
  }
  fmLines.push('---');

  const markdownBody = turndown.turndown(writing.content);
  return [...fmLines, '', markdownBody].join('\n');
}

/** Export a single writing as plain text */
export function exportWritingToText(writing: Writing): string {
  const header = [
    `标题: ${writing.title || '无标题'}`,
    `日期: ${writing.createdAt.slice(0, 10)}`,
    `类型: ${typeLabel(writing.type)}`,
  ];
  if (writing.mood) header.push(`心情: ${writing.mood}`);
  if (writing.weather) header.push(`天气: ${writing.weather}`);
  header.push('', '---', '');

  return [...header, stripHtml(writing.content)].join('\n');
}

/** Download a string as a file */
export function downloadFile(content: string, filename: string, type = 'text/markdown') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Download a Blob as a file */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Print a writing (for PDF export) */
export function printWriting(writing: Writing) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${writing.title || '无标题'}</title>
      <style>
        body {
          font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 40px;
          color: #333;
          line-height: 2;
          font-size: 14px;
        }
        h1 { font-size: 24px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
        h2 { font-size: 18px; }
        h3 { font-size: 15px; }
        .meta { color: #999; font-size: 12px; margin-bottom: 30px; }
        img { max-width: 100%; height: auto; }
        blockquote { border-left: 3px solid #ddd; padding-left: 16px; color: #666; margin-left: 0; }
        pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 2px; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>${writing.title || '无标题'}</h1>
      <div class="meta">
        ${writing.createdAt.slice(0, 10)}
        ${writing.mood ? ' · ' + writing.mood : ''}
        ${writing.weather ? ' · ' + writing.weather : ''}
      </div>
      ${writing.content}
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}

/** Export all data as JSON backup */
export function exportJSONBackup() {
  const keys = [
    'mylife-writings',
    'mylife-novels',
    'mylife-excerpts',
    'mylife-emotions',
    'mylife-created-poems',
    'mylife-templates',
    'mylife-ui',
  ];

  const backup: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw) {
      backup[key] = JSON.parse(raw);
    }
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(JSON.stringify(backup, null, 2), `mylife-backup-${timestamp}.json`, 'application/json');
}

/** Export multiple writings as a ZIP of Markdown files */
export async function exportToZip(writings: Writing[], zipFilename: string) {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const w of writings) {
    const filename = `${typeLabel(w.type)}_${w.createdAt.slice(0, 10)}_${sanitizeFilename(w.title)}.md`;
    const markdown = exportWritingToMarkdown(w);
    zip.file(filename, markdown);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipFilename);
}

function typeLabel(type: string): string {
  const map: Record<string, string> = { diary: '日记', essay: '随笔', note: '笔记' };
  return map[type] || type;
}

function sanitizeFilename(name: string): string {
  return (name || '无标题').replace(/[<>:"/\\|?*]/g, '_').slice(0, 50);
}
