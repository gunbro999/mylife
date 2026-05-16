// 14 种分享卡片背景图定义
// 所有背景图均为 2732×1536 (约 16:9)

export interface ShareCardStyle {
  id: number;
  name: string;
  src: string;
}

export const SHARE_CARD_STYLES: ShareCardStyle[] = [
  { id: 1, name: "墨韵", src: "/share-cards/微信图片_20260515173854.webp" },
  { id: 2, name: "青岚", src: "/share-cards/微信图片_20260515173902.webp" },
  { id: 3, name: "烟雨", src: "/share-cards/微信图片_20260515173915.webp" },
  { id: 4, name: "霜华", src: "/share-cards/微信图片_20260515173916.webp" },
  { id: 5, name: "竹影", src: "/share-cards/微信图片_20260515173917.webp" },
  { id: 6, name: "云裳", src: "/share-cards/微信图片_20260515173918.webp" },
  { id: 7, name: "荷风", src: "/share-cards/微信图片_202605151739181.webp" },
  { id: 8, name: "松涛", src: "/share-cards/微信图片_20260515173920.webp" },
  { id: 9, name: "梅雪", src: "/share-cards/微信图片_202605151739201.webp" },
  { id: 10, name: "幽兰", src: "/share-cards/微信图片_20260515173921.webp" },
  { id: 11, name: "秋月", src: "/share-cards/微信图片_20260515173922.webp" },
  { id: 12, name: "晨露", src: "/share-cards/微信图片_202605151739221.webp" },
  { id: 13, name: "晚钟", src: "/share-cards/微信图片_20260515173923.webp" },
  { id: 14, name: "流萤", src: "/share-cards/微信图片_20260515173929.webp" },
];
