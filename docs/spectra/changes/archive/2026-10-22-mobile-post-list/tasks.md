## 1. 文章列排版

- [x] 1.1 依 Article list row layout 調整 `src/components/PostRow.astro`：768px 以下由上到下顯示日期、標題、引文（最多兩行）、標籤，768px 以上維持一行一篇且不顯示引文；`tests/site.test.mjs` 新增首頁與 `/posts` 的文章列含有引文的檢查。驗證：`npm test` 全部通過；用無頭 Chrome 截取 390px 與 1280px 的首頁「最新文章」與 `/posts`，排版符合 spec 範例表。
