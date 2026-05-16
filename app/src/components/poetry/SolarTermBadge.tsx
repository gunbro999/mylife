"use client";

import type { TermTag } from "@/lib/types";

// 24 solar terms with approximate dates and descriptions
export const SOLAR_TERMS: { term: TermTag; date: string; meaning: string; phenology: string }[] = [
  { term: "立春", date: "2.3-2.5", meaning: "春季开始", phenology: "东风解冻，蛰虫始振，鱼陉负冰" },
  { term: "雨水", date: "2.18-2.20", meaning: "降雨开始，雨量渐增", phenology: "獭祭鱼，鸿雁来，草木萌动" },
  { term: "惊蛰", date: "3.5-3.7", meaning: "春雷始鸣，惊醒蛰伏", phenology: "桃始华，鸧鹓鸣，鹰化为鸠" },
  { term: "春分", date: "3.20-3.22", meaning: "昼夜平分", phenology: "玄鸟至，雷乃发声，始电" },
  { term: "清明", date: "4.4-4.6", meaning: "气清景明，万物皆显", phenology: "桐始华，田鼠化为鴽，虹始见" },
  { term: "谷雨", date: "4.19-4.21", meaning: "雨生百谷", phenology: "萍始生，鸣鸠拂其羽，戴胜降于桑" },
  { term: "立夏", date: "5.5-5.7", meaning: "夏季开始", phenology: "蝼蠈鸣，蚯蚓出，王瓜生" },
  { term: "小满", date: "5.20-5.22", meaning: "麦类等夏熟作物籽粒渐满", phenology: "苦菜秀，靡草死，麦秋至" },
  { term: "芒种", date: "6.5-6.7", meaning: "有芒作物成熟", phenology: "螳螂生，鹃始鸣，反舌无声" },
  { term: "夏至", date: "6.21-6.22", meaning: "白昼最长", phenology: "鹿角解，蜩始鸣，半夏生" },
  { term: "小暑", date: "7.6-7.8", meaning: "暑为炎热，小暑即小热", phenology: "温风至，蟋蠐居宇，鹰始鸞" },
  { term: "大暑", date: "7.22-7.24", meaning: "一年中最热时期", phenology: "腐草为萤，土润潺暑，大雨时行" },
  { term: "立秋", date: "8.7-8.9", meaning: "秋季开始", phenology: "凉风至，白露降，寒蝉鸣" },
  { term: "处暑", date: "8.22-8.24", meaning: "暑气消退", phenology: "鹰乃祭鸟，天地始肃，禾乃登" },
  { term: "白露", date: "9.7-9.9", meaning: "天气转凉，露凝而白", phenology: "鸿雁来，玄鸟归，群鸟养羞" },
  { term: "秋分", date: "9.22-9.24", meaning: "昼夜平分", phenology: "雷始收声，蛰虫坯户，水始涸" },
  { term: "寒露", date: "10.7-10.9", meaning: "露水更冷，即将结冰", phenology: "鸿雁来宾，雀入大水为蛤，菊有黄华" },
  { term: "霜降", date: "10.23-10.24", meaning: "天气渐冷，开始有霜", phenology: "豺乃祭兽，草木黄落，蛰虫咸俯" },
  { term: "立冬", date: "11.7-11.8", meaning: "冬季开始", phenology: "水始冰，地始冻，雉入大水为蜃" },
  { term: "小雪", date: "11.22-11.23", meaning: "开始降雪", phenology: "虹藏不见，天气上升，闭塞而成冬" },
  { term: "大雪", date: "12.6-12.8", meaning: "降雪量增多", phenology: "鹖鴠不鸣，虎始交，荔挚出" },
  { term: "冬至", date: "12.21-12.23", meaning: "白昼最短", phenology: "蚯蚓结，麋角解，水泉动" },
  { term: "小寒", date: "1.5-1.7", meaning: "开始进入最冷时期", phenology: "雁北乡，鹊始巢，雉始鸲" },
  { term: "大寒", date: "1.20-1.21", meaning: "一年中最冷时期", phenology: "鸡始乳，征鸟厉疾，水泽腹坚" },
];

// Get current solar term based on date
export function getCurrentSolarTerm(): TermTag | null {
  const now = new Date();
  const monthDay = `${now.getMonth() + 1}.${now.getDate()}`;

  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const [start] = SOLAR_TERMS[i].date.split("-");
    if (monthDay >= start) return SOLAR_TERMS[i].term;
  }
  return "大寒";
}

// Get season from solar term
export function getSeasonFromTerm(term: TermTag): TermTag {
  const springTerms: TermTag[] = ["立春", "雨水", "惊蛰", "春分", "清明", "谷雨"];
  const summerTerms: TermTag[] = ["立夏", "小满", "芒种", "夏至", "小暑", "大暑"];
  const autumnTerms: TermTag[] = ["立秋", "处暑", "白露", "秋分", "寒露", "霜降"];
  const winterTerms: TermTag[] = ["立冬", "小雪", "大雪", "冬至", "小寒", "大寒"];

  if (springTerms.includes(term)) return "春";
  if (summerTerms.includes(term)) return "夏";
  if (autumnTerms.includes(term)) return "秋";
  if (winterTerms.includes(term)) return "冬";
  return "春";
}

interface SolarTermBadgeProps {
  term: TermTag;
  expanded?: boolean;
}

export function SolarTermBadge({ term, expanded = false }: SolarTermBadgeProps) {
  const info = SOLAR_TERMS.find((t) => t.term === term);
  if (!info) return null;

  return (
    <div className="text-center py-6 px-4 rounded-lg bg-bg-elevated border border-border">
      <div className="text-3xl mb-2">
        {"🌸"}
      </div>
      <h3 className="text-xl font-bold font-display text-text mb-1">{info.term}</h3>
      <p className="text-[13px] text-text-muted mb-1">{info.meaning}</p>
      {expanded && (
        <p className="text-[12px] text-text-muted mt-2 leading-relaxed">
          {"物候："}{info.phenology}
        </p>
      )}
    </div>
  );
}
