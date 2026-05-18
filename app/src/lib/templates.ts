import type { WritingType } from './types';

export interface WritingTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: WritingType;
  content: string;
  tags: string[];
  builtin: boolean;
}

export const BUILTIN_TEMPLATES: WritingTemplate[] = [
  {
    id: 'tpl-daily',
    name: '日常记录',
    description: '记录今天发生的事情',
    icon: 'Calendar',
    type: 'diary',
    tags: ['日常'],
    builtin: true,
    content: `<h2>今天做了什么</h2><p></p><h2>感受</h2><p></p><h2>明日计划</h2><p></p>`,
  },
  {
    id: 'tpl-gratitude',
    name: '感恩日记',
    description: '记录三件值得感恩的事',
    icon: 'Heart',
    type: 'diary',
    tags: ['感恩'],
    builtin: true,
    content: `<h2>今天的三件感恩小事</h2><h3>1.</h3><p></p><h3>2.</h3><p></p><h3>3.</h3><p></p><h2>为什么感恩</h2><p></p>`,
  },
  {
    id: 'tpl-reflect',
    name: '反思复盘',
    description: '回顾做得好的和可以改进的',
    icon: 'RefreshCcw',
    type: 'diary',
    tags: ['复盘'],
    builtin: true,
    content: `<h2>今天做得好的</h2><p></p><h2>可以改进的</h2><p></p><h2>学到的</h2><p></p><h2>下一步行动</h2><p></p>`,
  },
  {
    id: 'tpl-book-review',
    name: '读书笔记',
    description: '记录阅读感悟和摘录',
    icon: 'BookOpen',
    type: 'essay',
    tags: ['阅读', '读书笔记'],
    builtin: true,
    content: `<h2>书籍信息</h2><p>书名：<br>作者：<br>阅读日期：</p><h2>精彩摘录</h2><blockquote><p></p></blockquote><h2>读后感</h2><p></p><h2>评分</h2><p>⭐</p>`,
  },
  {
    id: 'tpl-movie-review',
    name: '观影笔记',
    description: '记录观影感受和评分',
    icon: 'Film',
    type: 'essay',
    tags: ['电影', '观影'],
    builtin: true,
    content: `<h2>影片信息</h2><p>片名：<br>导演：<br>年份：<br>观看日期：</p><h2>印象最深的场景</h2><p></p><h2>感想</h2><p></p><h2>评分</h2><p>⭐⭐⭐</p>`,
  },
  {
    id: 'tpl-travel',
    name: '旅行日志',
    description: '记录旅途中的美好',
    icon: 'Map',
    type: 'essay',
    tags: ['旅行', '游记'],
    builtin: true,
    content: `<h2>目的地</h2><p></p><h2>行程安排</h2><p></p><h2>美食记录</h2><p></p><h2>难忘瞬间</h2><p></p>`,
  },
  {
    id: 'tpl-tech',
    name: '技术文章',
    description: '记录技术问题和解决方案',
    icon: 'Code',
    type: 'essay',
    tags: ['技术', '编程'],
    builtin: true,
    content: `<h2>问题背景</h2><p></p><h2>解决方案</h2><p></p><h2>核心代码</h2><pre><code></code></pre><h2>总结</h2><p></p>`,
  },
  {
    id: 'tpl-inspiration',
    name: '灵感速记',
    description: '快速记录一闪而过的想法',
    icon: 'Zap',
    type: 'note',
    tags: [],
    builtin: true,
    content: `<p>灵感：</p><p></p><p>展开：</p>`,
  },
];
