// 文章分類：網址參數用的代號 → 顯示名稱。順序就是導覽列的順序。
export const CATEGORIES = {
  'smart-home': '智能家居',
  ai: 'AI 技術',
  'life-lab': '生活實驗室',
} as const;

export type Category = keyof typeof CATEGORIES;
