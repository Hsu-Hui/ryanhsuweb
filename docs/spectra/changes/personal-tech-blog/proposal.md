## Why

我想要一個放自己技術文章的個人網站，並用 Google AdSense 賺取收入。目前這個專案還沒有任何網站程式碼。發布流程要很簡單：每篇文章新增一個內容檔、push 之後自動上線。共用版面只維護一份，首頁、標籤頁、sitemap、RSS 自動更新。網站也要符合 AdSense 的審核條件。

## What Changes

- 在專案根目錄建立 Astro 靜態網站，樣式使用 Tailwind CSS。
- 每篇文章是一個 Markdown 內容檔，放在 `src/content/posts/<slug>.md`。檔案開頭（frontmatter）記錄標題、發布日期、標籤、摘要，內文可以直接寫 HTML。
- 文章網址為 `https://<網域>/<slug>`。
- 共用外框參考 kaochenlong.com 的版面：
  - 桌機版左側是窄圖示側欄。
  - 文章放在圓角卡片裡，有麵包屑、標題與日期、內文、上一篇／下一篇。
  - 手機版改成固定在畫面底部的導覽列。
- 高科技風格的視覺設計：
  - 深藍灰色系搭配青色強調色。
  - 內文用 IBM Plex Sans 和 Noto Sans TC，日期、標籤、麵包屑、程式碼用 JetBrains Mono。
  - 背景有淡淡的格線，麵包屑採終端機路徑風格（`~/ 文章 / <slug>`）。
  - 程式碼區塊的語法上色會跟著深色／淺色切換。
- 深色模式：預設跟隨系統設定，側欄和手機底部導覽列都有切換按鈕，切換後的選擇會記住。
- 依照文章內容檔自動產生：首頁文章列表（每頁 10 篇，第 2 頁起是 `/page/<n>`）、各標籤的文章列表頁、`sitemap.xml`、RSS feed。
- AdSense 審核必備：
  - 隱私權政策、關於我、聯絡方式三個頁面。
  - 網站根目錄放 `ads.txt`。
  - 每頁載入 AdSense 程式碼，第一版使用自動廣告。
  - Cookie 同意機制採用 AdSense 後台的「隱私權與訊息」。
- 文章頁下方用 giscus 留言（留言存在 GitHub Discussions）。
- 搜尋引擎與 AI 搜尋（SEO／GEO）：
  - 產生 `robots.txt`，允許所有爬蟲（包含 AI 爬蟲），並指向 sitemap。
  - 每篇文章頁輸出 JSON-LD `BlogPosting` 結構化資料。
  - 網址一律不帶結尾斜線（`/about`，不是 `/about/`），帶斜線或 `.html` 的網址會 301 轉址到正式網址。
- 部署到 Firebase Hosting（GCP），綁定自有網域，並寫一份從零開始的中文部署教學。

## Non-Goals (optional)

範圍排除與不採用的做法記錄在 design.md 的 Goals / Non-Goals。

## Capabilities

### New Capabilities

- `blog-posts`: 文章內容檔的格式、驗證規則，以及每篇文章頁的網址與內容呈現（含上一篇／下一篇）
- `site-layout`: 所有頁面共用的外框，包括桌機側欄、手機底部導覽列、麵包屑、頁尾
- `site-theme`: 深色／淺色主題的判定、切換與記憶，以及程式碼區塊上色和減少動態效果的處理
- `site-discovery`: 從文章內容檔自動產生的首頁分頁列表、標籤頁、sitemap、RSS
- `adsense-readiness`: AdSense 審核需要的頁面、`ads.txt`、廣告程式碼載入與 Cookie 同意機制
- `post-comments`: 文章頁的 giscus 留言區
- `search-visibility`: `robots.txt`、文章結構化資料，以及不帶結尾斜線的網址規則與轉址

### Modified Capabilities

(none)

## Impact

- 新增程式碼：專案根目錄下整個 Astro 專案，包括 `package.json`、`astro.config.mjs`、`src/content.config.ts`、`src/layouts/`、`src/pages/`、`src/content/posts/`、`public/ads.txt`。
- 新增依賴：astro、@astrojs/sitemap、@astrojs/rss、tailwindcss、@tailwindcss/vite、@tailwindcss/typography。
- 外部資源：從 Google Fonts 載入 IBM Plex Sans、Noto Sans TC、JetBrains Mono。
- 新增設定檔：`firebase.json`（Firebase Hosting 的網址與轉址規則）。
- 外部服務：Firebase Hosting（主機）、GitHub（放程式碼並透過 GitHub Actions 自動部署）、Google AdSense、giscus（需要一個開啟 Discussions 的公開 GitHub repo）、網域註冊商。
- 需要使用者自行完成的事（依 README 教學操作）：購買網域、申請 AdSense 帳號取得發布商 ID（`ca-pub-…`）、在 GitHub 安裝 giscus app 並取得 repo 和分類 ID、建立 Firebase 專案並登入 Firebase CLI。
