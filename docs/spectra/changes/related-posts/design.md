## Context

文章頁 src/pages/[slug].astro 在 `getStaticPaths` 用 `getPosts()`（已依 `pubDate` 由新到舊排序，正式建置排除未來文章）算出每篇的 `newer`／`older`，頁面底部只顯示這兩個連結。文章 frontmatter 只有 `tags` 能表示主題，目前站上 12 篇文章（實際計數）幾乎都有 3 到 5 個 tag，智能家居系列共用 `smart-home`、`home-assistant`，AI 工具文共用 `claude-code`。

首頁最新文章使用 src/components/PostCard.astro：輸出一個帶 `data-post` 的 `<li>`，裡面是整張可點的卡片（封面、最多 2 個 tag、標題 `<h3>`、引文、日期）。

變更 `post-table-of-contents` 已完成但尚未 archive，它也修改了 `blog-posts` 的「Article page content」需求；本變更的 MODIFIED 版本以它的文字為基礎，所以它必須先 archive。

## Goals / Non-Goals

**Goals:**

- 每篇文章頁底部顯示最多 3 篇相關文章，挑選規則只依 tag，建置時決定。
- 不與上一篇／下一篇重複，讓底部每個連結都指向不同文章。
- 卡片外觀與首頁一致，不另做一套樣式。

**Non-Goals:**

- 不新增 `series`、`related` 等 frontmatter 欄位，也不支援手動指定相關文章；目前 tag 已足以分群，手動欄位會讓每篇新文章多一項維護。
- 不做內文相似度（TF-IDF、embedding）比對：需要額外依賴或建置步驟，對十幾篇文章的站效益很低。
- 不在瀏覽器端用 JavaScript 計算或隨機挑選，避免每次載入結果不同與版面跳動。
- 手機版不另做精簡列表，維持完整卡片（使用者已確認）。
- 不改變 PostCard 本身的外觀或首頁的行為。

## Decisions

### 以相同 tag 數量計分，同分新文章優先

分數 = 候選文章與本篇共同的 tag 數；排序鍵為（分數由高到低、`pubDate` 由新到舊）。不採用 Jaccard 相似度：tag 多的文章會被稀釋，而本站 tag 數接近，簡單計數已能排出預期結果，也容易用 spec 的範例驗證。

### 排除上一篇與下一篇

候選清單先移除本篇、`older`、`newer`。替代方案是允許重複，但智能家居系列的相鄰文章常常就是最相關的文章，會讓同一篇在底部出現兩次、浪費一個推薦位。

### 不足 3 篇以最新文章補滿

有共同 tag 的候選不足 3 篇時，以沒有共同 tag 的候選依 `pubDate` 由新到舊補滿。候選總數不足 3 篇時有幾篇顯示幾篇，0 篇時整個區塊不輸出。替代方案「只顯示有共同 tag 的文章」會讓冷門主題的文章底部空掉。

### 新增 getRelatedPosts 函式並在 getStaticPaths 計算

在 src/lib/posts.ts 新增純函式 `getRelatedPosts(post, posts, exclude, limit)`：`posts` 是 `getPosts()` 的結果（已由新到舊），`exclude` 是要額外排除的文章（上一篇、下一篇），回傳最多 `limit` 篇。因為輸入已由新到舊，使用穩定排序只比分數即可保留「同分新文章優先」。`getStaticPaths` 把結果放進 props 的 `related`，與 `newer`／`older` 同一處計算，未來文章自然不會出現。

### 沿用 PostCard 並放在文章卡片內

相關文章區塊是 `<section aria-label="相關文章">`，放在 `<article>` 內、上一篇／下一篇 `<nav>` 之後，與它一樣用上框線分隔；內含小標「相關文章」與 `<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">`，每項直接使用 `<PostCard post={...} />`。預覽圖確認過這個排法在寬螢幕（含右側目錄）是三欄、手機一欄。小標使用不帶 `id` 的 `<h2>`：文章目錄只取 Markdown 內文的 headings，不會收進這個標題，而 tests/toc.test.mjs 的內文標題檢查只比對帶 `id` 的 h2～h4，也不受影響。

## Implementation Contract

**可觀察行為：**

- 每篇文章頁在上一篇／下一篇連結之後、留言區之前，出現 `aria-label="相關文章"` 的區塊，內含 `data-post="<slug>"` 的卡片，順序與數量依 spec「Related articles」的規則。
- 候選數為 0 時，頁面不含該區塊。
- 每張卡片連到 `/<slug>`，顯示該文章的標題、引文與日期。

**介面：**

- `getRelatedPosts(post: Post, posts: Post[], exclude: (Post | undefined)[], limit: number): Post[]`，`posts` 需已由新到舊排序；不修改傳入的陣列。
- `[slug].astro` 的 `Props` 新增 `related: Post[]`。

**驗收：**

- 新測試 tests/related-posts.test.mjs 以 tests/helpers/build-site.mjs 建置 spec 範例中的文章組合，檢查各頁相關文章的 `data-post` 順序：排序範例為 A、C、B；補位範例為 A、D、C；三篇文章範例為 P→[R]、Q 無區塊、R→[P]；未來文章不出現；區塊位置在 `data-nav` 連結之後、留言區之前。
- `npm test` 全部通過，`npm run build` 成功。

**範圍內：** src/lib/posts.ts、src/pages/[slug].astro、tests/related-posts.test.mjs。

**範圍外：** PostCard 外觀、首頁與標籤頁、frontmatter schema、文章內容檔。

## Risks / Trade-offs

- [tag 寫法不一致（例如 `homeassistant` 與 `home-assistant`）會讓相關文章失準] → 不在本變更處理；/tags 頁可看出重複的 tag，必要時手動統一。
- [每頁多 3 張封面圖，頁面變重] → PostCard 的圖片已是 `loading="lazy"`，位於頁面底部，不影響首屏。
- [手機上三張完整卡片使區塊變長] → 使用者看過預覽後選擇維持完整卡片。

## Migration Plan

無資料遷移。部署方式與平常相同，合併後由既有 GitHub Actions 建置上線；若要回復，還原這次的 commit 即可。需在 archive 本變更之前先 archive `post-table-of-contents`。

## Open Questions

無。
