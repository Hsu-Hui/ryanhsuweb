## Why

目前只要文章檔進入 `src/content/posts/` 並推送到 `main`，正式建置就會立即產生文章頁、列表、RSS 與 sitemap，無法安全地提前準備完成稿。網站需要依文章的 `pubDate` 控制正式公開時間，並在每天台灣時間 08:00 後自動重建；補跑只能在有到期文章且尚未成功部署時執行，避免沒有新文章或第一次已成功時仍重複部署。

## What Changes

- 正式建置只收錄 `pubDate` 小於或等於建置時間的文章；未到時間的文章不得產生公開文章頁，也不得出現在首頁、文章列表、標籤、RSS 或 sitemap。
- 本機開發模式保留預覽未來文章的能力，讓作者能在發布前檢查內容。
- 正式部署 workflow 除了既有的 `main` push 觸發，也在台灣時間每日 08:01、08:11、08:21 檢查排程發布。
- 每次排程先確認當天是否有已到 `pubDate` 的文章；沒有文章時不建置也不部署。
- 若已有一個在最新到期文章的發布時間之後開始且成功的正式部署，後續補跑直接跳過；先前失敗或尚未成功時才部署。
- 文件說明完成稿的排程方式、草稿留在本機的方式，以及靜態網站必須先將排程完成稿推送到 GitHub 才能全自動發布的限制。

## Capabilities

### New Capabilities

- `scheduled-publishing`: 完成稿可設定未來發布時間，正式站會在每日發布窗口檢查是否需要重建，並只在尚未成功發布時補跑。

### Modified Capabilities

- `blog-posts`: 文章是否被正式建置，除了 frontmatter 合法外，還要符合發布時間已到的條件；本機開發可預覽未來文章。
- `site-discovery`: 首頁、文章列表、標籤頁、RSS 與 sitemap 只能包含已到發布時間的文章。

## Impact

- `src/lib/posts.ts`：集中套用發布時間篩選。
- `src/pages/[slug].astro`、首頁、文章列表、標籤頁、RSS 與 sitemap：透過共用文章查詢取得一致的公開集合。
- `scripts/check-scheduled-publish.mjs`：判斷今天是否有到期文章，以及是否已有涵蓋它的成功部署。
- `.github/workflows/firebase-hosting-merge.yml`：加入每日排程、手動觸發、唯讀 Actions 權限、序列化與跳過重複部署的條件。
- `tests/`：驗證未來文章不會出現在正式輸出，以及沒有文章、已有成功部署、先前失敗和查詢失敗等補跑分支。
- `README.md`：補充草稿、排程完成稿、發布時間格式與補跑判斷的操作說明。
