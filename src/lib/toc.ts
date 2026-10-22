import type { MarkdownHeading } from 'astro';

export interface TocEntry {
  slug: string;
  text: string;
  children: TocEntry[];
}

/** 標題頂端到達視窗頂端這個距離以內，就算讀到這一段。 */
export const CURRENT_LINE_PX = 96;

/**
 * 依各標題頂端到視窗頂端的距離，決定目前段落的索引；沒有段落時回傳 -1。
 * 規則：頂端在 CURRENT_LINE_PX 以內的最後一個標題；捲到最底時一律是最後一個標題
 * （最後一段通常太短，頂端到不了那條線）。
 * 排版會產生小數位置（例如 96.48px），捲動卻只能以整數像素移動，所以先捨去小數再比較。
 */
export function currentSectionIndex(headingTops: number[], atBottom: boolean): number {
  if (headingTops.length === 0) return -1;
  if (atBottom) return headingTops.length - 1;
  let current = -1;
  headingTops.forEach((top, index) => {
    if (Math.floor(top) <= CURRENT_LINE_PX) current = index;
  });
  return current;
}

/** h2＋h3 少於這個數量時不顯示目錄：只有一個標題的目錄沒有導覽價值。 */
const MIN_ENTRIES = 2;

/**
 * 把 render() 回傳的 headings 整理成兩層目錄：h2 是第一層，h3 掛在前面最近的 h2 底下；
 * 第一個 h2 之前的 h3 放在第一層；h4 以下不列入。標題太少時回傳空陣列。
 */
export function buildToc(headings: MarkdownHeading[]): TocEntry[] {
  const listed = headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
  if (listed.length < MIN_ENTRIES) return [];

  const toc: TocEntry[] = [];
  let currentH2: TocEntry | undefined;
  for (const { depth, slug, text } of listed) {
    const entry = { slug, text, children: [] };
    if (depth === 3 && currentH2) {
      currentH2.children.push(entry);
    } else {
      toc.push(entry);
      if (depth === 2) currentH2 = entry;
    }
  }
  return toc;
}
