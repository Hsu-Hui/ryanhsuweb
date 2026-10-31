## Why

讀者看完一篇文章後，頁面底部只有依發布時間排的「上一篇／下一篇」，常常跟剛讀的主題無關，例如讀完智能家居系列（一），下一篇可能是寶可夢看板。主題相近的文章沒有入口，讀者很難繼續往下讀。

## What Changes

- 每篇文章頁在「上一篇／下一篇」下方、留言區上方，新增「相關文章」區塊，最多顯示 3 篇。
- 相關文章在建置時依 tag 自動挑選：排除本篇與已出現在上一篇／下一篇的文章，相同 tag 越多排越前面，同分時新文章優先；有相同 tag 的文章不足 3 篇時，用最新的文章補滿。
- 卡片沿用首頁最新文章的卡片樣式（封面、標籤、標題、引文、日期），寬螢幕三欄、中等寬度兩欄、手機一欄。
- 文章作者不需要新增或填寫任何 frontmatter 欄位。

## Non-Goals (optional)

範圍排除與不採用的做法記錄在 design.md 的 Goals / Non-Goals。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `blog-posts`: 新增「相關文章」需求；「文章頁內容」的顯示順序加入相關文章區塊。

## Impact

- 修改程式碼：src/lib/posts.ts（新增挑選相關文章的函式）、src/pages/[slug].astro（在 getStaticPaths 計算相關文章並在上一篇／下一篇下方顯示）。
- 沿用元件：src/components/PostCard.astro，不改動它的外觀。
- 新增測試：tests/related-posts.test.mjs。
- 不新增任何依賴，也不改變文章 frontmatter 格式。
