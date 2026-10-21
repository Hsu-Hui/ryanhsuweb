## 1. 專案骨架與設定

- [x] 1.1 採用 Astro 靜態輸出在專案根目錄建立 Astro 專案：`output: 'static'`，`npm run dev`、`npm run build`、`npm run check` 三個 scripts 都能執行。依「Tailwind CSS v4 經由 Vite plugin 載入」設定 `@tailwindcss/vite`、`@tailwindcss/typography` 和 `src/styles/global.css`。依「網址不帶結尾斜線並由 Firebase 轉址」設定 `trailingSlash: 'never'` 和 `build.format: 'file'`。驗證：在專案根目錄執行 `npm run build` 結束碼為 0，`dist/index.html` 存在，且暫時加入的 `src/pages/about.astro` 會輸出成 `dist/about.html`，而不是 `dist/about/index.html`。
- [x] 1.2 網站設定集中在 site.config.ts：`src/site.config.ts` 匯出 `siteUrl`、`siteTitle`、`author`、`adsenseClientId`、`giscus`（`repo`、`repoId`、`category`、`categoryId`），`astro.config.mjs` 的 `site` 讀取 `siteUrl`。`adsenseClientId` 不是空字串、也不符合 `ca-pub-` 加數字時，建置失敗並指出 `adsenseClientId`。驗證：暫時設成 `pub-1234` 執行 `npm run build` 會失敗且訊息含 `adsenseClientId`；設成空字串則建置成功。[after: 1.1]

## 2. 視覺系統、共用外框與深色模式

- [x] 2.1 依「高科技視覺系統以 CSS 變數定義」實作 Theme color tokens meet contrast requirements 與 Reduced motion is respected：
  - 在 `src/styles/global.css` 定義 design.md 表格裡淺色和深色兩組 token（`[data-theme="dark"]` 覆蓋深色值），並用 `@theme` 對應成 Tailwind utility。
  - 從 Google Fonts 載入 IBM Plex Sans、Noto Sans TC、JetBrains Mono（`display=swap`）。
  - 加入 20px 淡格線背景。hover／focus 過渡設為 150–300ms，`prefers-reduced-motion: reduce` 時關閉，所有可聚焦元素都要有可見的 focus ring。
  - 驗證：用 WCAG 公式重算 spec 範例表中每組文字與背景的對比度，全部 ≥ 4.5:1；用 `grep` 檢查 `src/components/` 和 `src/layouts/` 沒有寫死的 hex 色碼；用瀏覽器模擬 `prefers-reduced-motion: reduce`，hover 卡片時沒有過渡效果。[after: 1.1]
- [x] 2.2 實作 Shared page frame、Responsive navigation 與 Not found page，外框版面參考 kaochenlong.com（數值見 design.md 的對照表）：
  - 基礎外框提供 head（title、meta description、指向 `siteUrl` 的 canonical、RSS alternate link）和頁尾連結 `/about`、`/privacy`、`/contact`。
  - 1024px 以上顯示 72px 左側欄，以下顯示固定在底部的導覽列。兩者都剛好 5 項：首頁、`/tags`、`/about`、`/rss.xml`、主題切換按鈕。圖示用 SVG，每個只有圖示的項目都有 `aria-label`，觸控區域至少 44×44px。
  - 404 頁面（`src/pages/404.astro`）使用共用外框，並連回首頁。
  - 驗證：建置後 `dist/404.html` 含首頁連結；用瀏覽器在 1280px 寬度只看到側欄，在 375px 寬度只看到底部導覽列，且捲到底時頁尾最後一行沒有被擋住；用 read_page 確認 5 個導覽項目都有可讀的名稱。[after: 1.2, 2.1]
- [x] 2.3 依「深色模式跟隨系統並可手動切換」與「程式碼區塊使用 Shiki 雙主題」實作 Initial theme follows stored choice then system preference、Manual theme toggle persists the choice 與 Code block highlighting follows the theme：
  - `<head>` 最前面的 `is:inline` script 依「`localStorage` 的 `theme` → `prefers-color-scheme`」的順序設定 `data-theme`，存取 `localStorage` 失敗時改用系統設定。
  - 切換按鈕會反轉主題、寫入 `localStorage`，並更新 `aria-label`。沒有存過選擇時，網站會跟著系統設定變化。
  - `markdown.shikiConfig` 設定 `github-light`／`github-dark` 雙主題，深色時套用 `--shiki-dark` 變數。
  - 驗證：用瀏覽器逐一重現 spec 主題判定範例表的 6 種情況，`data-theme` 都正確；切換後換頁，主題維持；把 `localStorage` 設成 `dark`、系統設成淺色後重新整理，第一個畫面就是深色；在有 `ts` 程式碼區塊的範例文章切換主題時，程式碼顏色跟著變，頁面沒有重新載入。[after: 2.2, 3.1]

## 3. 文章

- [x] 3.1 依 Article content file format 實作「文章使用 content collection 並以 schema 驗證 frontmatter」：`src/content.config.ts` 定義 `posts` collection，必填 `title`、`description`、`pubDate`，選填 `updatedDate`、`tags`（預設 `[]`）、`cover`。新增兩篇範例文章，其中一篇內文含 `<figure>` 和一段 `ts` 程式碼區塊。驗證：照 spec 中 frontmatter 驗證範例表的四種情況逐一建置，成功或失敗的結果與錯誤訊息裡的欄位名稱都和表格一致。[after: 1.1]
- [x] 3.2 依 Article URL is derived from the file name 實作「文章網址直接放在根路徑」：用 `src/pages/[slug].astro` 為每篇文章產生 `/<slug>`。slug 是保留 slug（`about`、`privacy`、`contact`、`tags`、`page`、`rss.xml`、`sitemap-index.xml`、`ads.txt`、`robots.txt`、`404`）時，建置失敗並列出檔名。驗證：建置後每篇範例文章都有 `dist/<slug>.html`；暫時新增 `src/content/posts/page.md` 時建置失敗，且訊息含 `page.md`。[after: 2.2, 3.1]
- [x] 3.3 實作 Article page content 與 Previous and next article navigation：
  - 依序顯示麵包屑 `~/ posts / <slug>`（`~` 連回首頁）、標題、發布日期、更新日期（有設定時）、`#tag` 標籤連結、內文、上一篇／下一篇。
  - 設定 `<title>`、meta description、og:image（有 `cover` 時）。
  - 依「日期以台北時區顯示」做一個共用的日期格式函式，輸出 `Asia/Taipei` 時區的 `YYYY-MM-DD`。
  - 上一篇／下一篇依 `pubDate` 由舊到新排序，沒有相鄰文章時不顯示該連結。
  - 驗證：`pubDate` 設成 `2026-10-20T20:00:00Z` 時頁面顯示 `2026-10-21`；`dist/<slug>.html` 含 title、description、`/tags/<tag>` 連結和 `<figure>`；準備日期分別為 2026-01-01、2026-02-01、2026-03-01 的三篇文章，三頁的上一篇／下一篇都和 spec 範例一致。[after: 3.2]
- [x] 3.4 依「文章頁輸出 BlogPosting 結構化資料」實作 Article structured data：每篇文章頁的 `<head>` 輸出唯一一段 `application/ld+json`，欄位對應 design.md 的表格，`<` 轉義成 `<`；非文章頁不輸出。驗證：解析 `dist/<slug>.html` 的 JSON-LD，逐一對照 spec 欄位對應範例表的 6 種情況都相符；`dist/about.html` 不含 `BlogPosting`；把一篇文章頁的 JSON-LD 貼到 Google Rich Results Test，沒有錯誤。[after: 3.3]

## 4. 列表與 feed

- [x] 4.1 依「首頁分頁每頁 10 篇」實作 Home page article list 與 Home page pagination：
  - 用 `paginate()` 每頁 10 篇、由新到舊排列。第 1 頁在 `/`，第 2 頁起在 `/page/<n>`，不產生 `/page/1`。
  - 每篇顯示連到 `/<slug>` 的標題、日期、摘要和標籤。
  - 有多頁時顯示上一頁／下一頁和「第 N / M 頁」，只有一頁時不顯示。
  - 驗證：用 A、B、C 三篇建置，`dist/index.html` 的順序是 B、C、A，而且沒有分頁區塊；暫時產生 11 篇和 25 篇文章各建置一次，產生的頁面和分頁控制都和 spec 分頁範例表一致，且 `dist/page/1.html` 不存在。[after: 3.3]
- [x] 4.2 實作 Tag pages：`/tags` 列出每個有被使用的標籤和文章數，`/tags/<tag>` 依新到舊列出該標籤的所有文章（不分頁），沒人使用的標籤不產生頁面。驗證：用 spec 範例資料（A 有 astro 和 css，B 只有 astro）建置，`dist/tags.html` 顯示 `astro (2)` 和 `css (1)`，`dist/tags/css.html` 只列出 A。[after: 3.3]
- [x] 4.3 實作 Sitemap、RSS feed 和 Crawler policy file，並依「robots.txt 由設定產生」輸出 `robots.txt`：
  - 用 `@astrojs/sitemap` 產生 `sitemap-index.xml`，包含首頁、所有 `/page/<n>`、文章、標籤頁和三個固定頁面，排除 404。
  - 用 `@astrojs/rss` 產生 `/rss.xml`，依新到舊排列，每個 item 有標題、絕對網址、`pubDate`、description。
  - 用 `src/pages/robots.txt.ts` 產生允許所有爬蟲、並指向 sitemap 的 `robots.txt`。
  - 驗證：用 11 篇文章建置後，sitemap 檔案含 `<siteUrl>/<slug>` 和 `<siteUrl>/page/2`，且不含 `404`；`dist/rss.xml` 每篇文章都有一個 item，link 是絕對網址；`dist/robots.txt` 和 spec 範例完全一致，且沒有 `Disallow`。[after: 4.1, 4.2]

- [x] 4.4 依 Home page article list 的整卡點擊需求調整文章卡片與中文標示：首頁、分頁和標籤頁的文章卡片整張都可點擊進入 `/<slug>`，點 `#tag` 仍然進入 `/tags/<tag>`；列表標題改成 `~/ 文章`，文章頁麵包屑改成 `~/ 文章 / <slug>`（取代 3.3 原本的 `~/ posts / <slug>`）。驗證：在瀏覽器點擊卡片的標題、摘要、日期、卡片空白處，都進入文章頁，點標籤進入標籤頁；`dist/index.html` 每張卡片只有一個指向 `/<slug>` 的連結；`dist/hello-world.html` 的麵包屑顯示 `~/ 文章 / hello-world`。[after: 4.2]
- [x] 4.5 依 Article page content 把文章頁麵包屑的最後一段從 slug 改成文章標題（取代 4.4 的 `~/ 文章 / <slug>`），標題很長時要能換行、不撐破版面。驗證：`dist/hello-world.html` 的麵包屑文字為 `~ / 文章 / 用 Astro 打造技術部落格` 且不含 `hello-world`；在瀏覽器 375px 寬度下，長標題的麵包屑會換行，頁面沒有水平捲軸。[after: 4.4]

## 5. AdSense

- [x] 5.1 實作 Required informational pages：`/about`、`/privacy`、`/contact` 三頁都使用共用外框。隱私權政策要寫明使用 Google AdSense、Google 與合作夥伴會用 cookie 依先前造訪紀錄投放廣告，並附上 `https://adssettings.google.com` 讓訪客停用個人化廣告；聯絡頁至少要有一種聯絡方式。驗證：建置後 `dist/privacy.html` 含 `AdSense`、`cookie` 和 `https://adssettings.google.com`，`dist/contact.html` 含聯絡方式。[after: 2.2]
- [x] 5.2 依「AdSense 自動廣告搭配內建同意訊息」與「ads.txt 由設定產生」實作 Ad script loading from configuration、Consent handling through AdSense Privacy and messaging 與 Publisher authorization file：
  - `adsenseClientId` 有值時，基礎外框的 head 輸出唯一一個 `adsbygoogle.js?client=<id>` script，帶 `async` 和 `crossorigin="anonymous"`；`src/pages/ads.txt.ts` 產生 `google.com, pub-<digits>, DIRECT, f08c47fec0942fa0`。
  - 空字串時兩者都不輸出。
  - 網站不輸出任何自己的同意橫幅。
  - 驗證：設成 `ca-pub-1234567890123456` 建置後，`dist/` 每個 `.html` 都剛好含 1 次 `adsbygoogle.js`，`dist/ads.txt` 的內容剛好是 `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`；改成空字串重建後，`adsbygoogle.js` 出現 0 次，且 `dist/ads.txt` 不存在。[after: 2.3]

## 6. 留言

- [x] 6.1 依「giscus 留言使用官方 script」實作 giscus comment section on article pages 與 Comments disabled when configuration is incomplete：
  - 四個 giscus 設定欄位都有值時，文章頁在上一篇／下一篇之後輸出 `https://giscus.app/client.js`，帶 `data-mapping="pathname"`、`data-loading="lazy"`、`data-lang="zh-TW"`。
  - 任一欄位為空，或不是文章頁時，不輸出這段 script。
  - 驗證：填入測試用的設定值建置後，`dist/<slug>.html` 含 `giscus.app/client.js`，`dist/about.html` 不含；清空 `categoryId` 重建後，所有頁面都不含，且建置成功。[after: 3.4]
- [x] 6.2 依 giscus comment section on article pages 與 Comment theme follows the site theme 調整留言區：留言區改成文章卡片下方獨立的卡片，標題「留言討論」；giscus 主題在載入時依 `data-theme` 選 `light` 或 `transparent_dark`，切換網站主題時用 `postMessage` 通知 giscus 同步。另外，關於我、隱私權政策、聯絡我三頁的麵包屑改成顯示頁面標題（例如 `~ / 隱私權政策`）。驗證：填入 giscus 設定後建置，文章頁有「留言討論」卡片且位於文章卡片之後；在瀏覽器依 spec 主題範例表切換兩次，giscus iframe 的主題都相符；`dist/privacy.html` 麵包屑為 `~ / 隱私權政策`。[after: 6.1]

## 7. 部署與收尾

- [x] 7.1 依「部署到 Firebase Hosting」實作 Canonical URLs without trailing slash，並撰寫從零開始的中文部署教學：
  - 新增 `firebase.json`：`hosting.public: "dist"`、`cleanUrls: true`、`trailingSlash: false`。
  - `README.md` 依照操作順序寫，每一步都附上要執行的指令和預期會看到的畫面或輸出，內容包括：
    - 新增文章的步驟和 frontmatter 範例。
    - `site.config.ts` 每個欄位要去哪裡取得。
    - 把專案建立成 git repo 並推到 GitHub。
    - 建立 Firebase 專案、安裝並登入 Firebase CLI。
    - 用 `firebase init hosting:github` 設定 push 到 `main` 自動部署、開 PR 時部署預覽版。
    - 綁定自有網域。
    - Spark 免費方案的額度，以及升級 Blaze 時要設定預算警示。
    - 必須在 AdSense「隱私權與訊息」開啟 GDPR 訊息，才能向歐盟和英國訪客投放廣告。
    - 深色模式下 AdSense 廣告外觀由 Google 控制的已知限制。
    - 累積足夠原創文章再申請 AdSense。
  - 驗證：
    - 在專案根目錄執行 `npm run check` 和 `npm run build`，兩者結束碼都是 0。
    - 執行 `npx firebase-tools emulators:start --only hosting`，用 `curl -I` 逐一請求 spec 請求處理範例表的 6 個路徑，狀態碼和轉址目標都相符。
    - 在 `dist/` 的 HTML、sitemap 和 RSS 裡搜尋站內網址，除了 `/` 以外，沒有任何網址以 `/` 或 `.html` 結尾。
    - 檢查 README 有涵蓋以上每一項。
    - [after: 3.4, 4.3, 5.1, 5.2, 6.1]
