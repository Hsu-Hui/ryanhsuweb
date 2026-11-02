## 1. 測試先行

- [x] 1.1 新增 tests/related-posts.test.mjs，用 tests/helpers/build-site.mjs 建置 spec「Related articles」的範例文章組合，寫出以下會失敗的測試：排序範例（以相同 tag 數量計分，同分新文章優先、排除上一篇與下一篇）的相關文章 `data-post` 順序為 A、C、B；補位範例（不足 3 篇以最新文章補滿）為 A、D、C；三篇文章範例為 P→[R]、Q 頁面沒有 `aria-label="相關文章"` 區塊、R→[P]；`pubDate` 在未來的文章不出現在任何相關文章；卡片連到 `/<slug>` 並含該文章標題、引文、日期；「Article page content」順序中相關文章區塊位於 `data-nav` 連結之後、留言區之前。驗證：`npm test` 執行時這些新測試失敗，原因是頁面還沒有相關文章區塊，既有測試仍全部通過。

## 2. 挑選與顯示相關文章

- [x] 2.1 [after: 1.1] 新增 getRelatedPosts 函式並在 getStaticPaths 計算：在 src/lib/posts.ts 實作 `getRelatedPosts(post, posts, exclude, limit)`，排除本篇與 `exclude` 中的上一篇、下一篇，依相同 tag 數量由多到少穩定排序（輸入已由新到舊，同分新文章優先），有共同 tag 的不足 `limit` 篇時以沒有共同 tag 的最新文章補滿，不修改傳入陣列；src/pages/[slug].astro 的 `getStaticPaths` 以 `getRelatedPosts(post, posts, [newer, older], 3)` 算出 `related` 放進 props，`Props` 型別新增 `related: Post[]`。驗證：`npm run check` 沒有型別錯誤。
- [x] 2.2 [after: 2.1] 沿用 PostCard 並放在文章卡片內：在 src/pages/[slug].astro 的上一篇／下一篇 `<nav>` 之後、`</article>` 之前，`related` 有內容時輸出 `<section aria-label="相關文章">`，含上框線分隔、不帶 `id` 的 `<h2>` 小標「相關文章」，以及 `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` 的 `<ul>`，每篇用 `<PostCard post={...} />`；`related` 為空時不輸出區塊。驗證：`npm test` 全部通過，包含 1.1 的新測試與 tests/toc.test.mjs。

## 3. 確認實際網站

- [x] 3.1 [after: 2.2] 確認真實文章的建置結果符合 Related articles 需求：`npm run build` 成功，並用 `astro-preview` 開 /why-i-started-using-home-assistant，確認相關文章順序與依當下文章 tag 手算的結果一致（以 2026-10-29 的文章內容為例，應依序為（六）備份與復原、（三）儀表板、（五）CleanYourTV），且不含該頁的上一篇與下一篇；寬度 1440px 時為三欄、375px 時為一欄。驗證：瀏覽器預覽截圖，以及頁面上相關文章的 `data-post` 清單。
