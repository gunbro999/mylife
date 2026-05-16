/**
 * 本地音乐路径处理
 * 支持 Windows 路径 (D:\music) 在 WSL 环境下自动转换为 /mnt/d/music
 */

export function resolveLocalMusicPath(rawPath: string): string {
  // 检测 Windows 绝对路径: C:\... 或 D:\... 等
  const winMatch = rawPath.match(/^([A-Za-z]):[\\\/](.*)$/);
  if (winMatch) {
    const drive = winMatch[1].toLowerCase();
    const rest = winMatch[2].replace(/\\/g, "/");
    return `/mnt/${drive}/${rest}`;
  }

  return rawPath;
}
