## Context

這個專案目前只有 Spectra 設定，還沒有任何網站程式碼，所以沒有既有程式碼要相容。使用者的發布流程是：把文章內容交給 Claude，Claude 產生一個新的內容檔，push 後自動上線。版面參考 kaochenlong.com，那個網站本身用 Rails、Tailwind、Turbo 和 giscus。我們只參考它的版面，不沿用它的技術。網站要能通過 Google AdSense 審核並顯示廣告。

## Goals / Non-Goals

**Goals:**

- 新增一篇文章只需要新增一個內容檔，不必修改其他檔案。
- 共用外框只有一份，改版時只改一個地方。
- 首頁、標籤頁、sitemap、RSS、`ads.txt` 都在建置時自動產生。
- 符合 AdSense 審核的頁面與技術要求。
- 輸出純靜態檔案，可以放在 Firebase Hosting 免費方案（Spark）。
- 讓搜尋引擎和 AI 搜尋都能讀到並理解文章（SEO／GEO）。
- 部署教學寫得夠完整，讓沒用過 Firebase 的人也能照著做完。之後使用者會把這個建站過程寫成文章。

**Non-Goals:**

- 網頁後台或 CMS（不採用：會多一個要維護的服務）。
- 站內搜尋、電子報訂閱、多語系。
- 文章頁 `/posts` 與標籤頁分頁。依年份分組的單頁列表在文章數量到數百篇前都還好讀。
- HUD／科幻介面那種全等寬字體、掃描線、發光動畫的風格（不採用：長篇中文難讀，無障礙風險高）。
- 控制 AdSense 廣告本身的配色。廣告外觀由 Google 決定。
- 手動指定廣告欄位位置。第一版只用自動廣告。
- 草稿機制。尚未完成的文章不要放進 `src/content/posts/`。
- 自動購買網域、申請 AdSense、建立 Firebase 專案、登入 Firebase 或 GitHub 帳號。這些由使用者自己完成，Claude 依 README 教學陪同操作。
- `llms.txt`。這是新提案，還沒成為正式標準，效果不確定，先不做。

## Decisions

### 採用 Astro 靜態輸出

用 Astro，`output: 'static'`，建置成純 HTML。

- 不用 Rails 或 WordPress：需要伺服器和資料庫，維護成本高。
- 不用「每篇一個完整 HTML 檔」：共用外框和廣告程式碼會在每個檔案裡重複，首頁和 sitemap 也要手動維護。
- Astro 內建 content collections、sitemap 和 RSS 整合，正好對應這次的需求。

### 文章使用 content collection 並以 schema 驗證 frontmatter

`src/content.config.ts` 定義名為 `posts` 的 collection，用 glob loader 讀取 `src/content/posts/*.md`。frontmatter 欄位如下：

| 欄位 | 型別 | 必填 | 用途 |
| --- | --- | --- | --- |
| `title` | string | 是 | 文章標題、`<title>`、RSS 標題 |
| `description` | string | 是 | 摘要、meta description、RSS 描述、首頁卡片 |
| `pubDate` | date | 是 | 發布日期，用來排序 |
| `updatedDate` | date | 否 | 最後更新日期 |
| `tags` | string[] | 否，預設 `[]` | 標籤 |
| `cover` | string | 否 | 社群分享圖（og:image）的網址 |

frontmatter 不符合 schema 時建置失敗，錯誤訊息會指出是哪個檔案。Markdown 內文可以直接混用 HTML。

### 文章網址直接放在根路徑

文章頁由 `src/pages/[slug].astro` 產生，slug 取自檔名（不含副檔名），網址是 `/<slug>`。

固定頁面使用保留 slug：`about`、`privacy`、`contact`、`tags`、`page`、`posts`、`rss.xml`、`sitemap-index.xml`、`ads.txt`、`robots.txt`、`404`。文章檔名如果和保留 slug 相同，建置失敗並列出衝突的檔名，不會默默覆蓋。

### 網站設定集中在 site.config.ts

`src/site.config.ts` 匯出單一設定物件：`siteUrl`、`siteTitle`、`author`、`adsenseClientId`（格式 `ca-pub-` 加數字）、`giscus`（`repo`、`repoId`、`category`、`categoryId`）。外框、`ads.txt`、留言區都從這裡讀設定，不在其他檔案寫死。

### AdSense 自動廣告搭配內建同意訊息

基礎外框的 `<head>` 只放一次 AdSense 的 `adsbygoogle.js` script，並帶入 `client=<adsenseClientId>`。廣告位置交給 AdSense 後台的自動廣告決定。Cookie 同意使用 AdSense 後台的「隱私權與訊息」，由 Google 的 script 自己顯示，網站不需要另外寫程式。

`adsenseClientId` 是空字串時，不輸出 AdSense script 也不產生 `ads.txt`。這樣在通過審核前也能正常開發和部署。

### ads.txt 由設定產生

`src/pages/ads.txt.ts` 在建置時輸出 `google.com, pub-<數字>, DIRECT, f08c47fec0942fa0`，發布商 ID 取自 `adsenseClientId`，和 head 裡的 script 用同一個來源。

### giscus 留言使用官方 script

文章頁底部嵌入 `https://giscus.app/client.js`，設定 `data-mapping="pathname"`、`data-loading="lazy"`、`data-lang="zh-TW"`。`giscus` 設定任一欄位為空字串時，不輸出留言區。

### 外框版面參考 kaochenlong.com

以下 Tailwind 數值是讀取參考網站 HTML 得到的：

| 元素 | 數值 |
| --- | --- |
| 桌機側欄 | `lg` 斷點（1024px）以上顯示，寬 72px（`w-[72px]`），內部導覽 `sticky top-8` |
| 頁面容器 | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| 文章卡片 | `rounded-2xl border`，背景和邊框顏色改用下方「高科技視覺系統以 CSS 變數定義」的 token |
| 手機底部導覽列 | `lg` 以下顯示，`fixed bottom-0 left-0 right-0`，頁面底部留 `pb-20` 避免被擋住 |

側欄和底部導覽列的項目都是：首頁、標籤、關於我、RSS、主題切換，共 5 項。圖示使用 SVG（Tabler 或 Lucide），不用 emoji。只有圖示的按鈕都要有 `aria-label`，觸控區域至少 44×44px。

### 高科技視覺系統以 CSS 變數定義

風格方向由 ui-ux-pro-max skill 查詢後綜合決定：開發者工具感，科技元素只用在點綴，內文以好讀為優先。顏色全部定義成 `src/styles/global.css` 裡的 CSS 變數，再透過 Tailwind v4 的 `@theme` 對應成 utility class，元件裡不寫死 hex 值。

| Token | 淺色 | 深色 |
| --- | --- | --- |
| `--color-bg` | `#F8FAFC` | `#0F172A` |
| `--color-card` | `#FFFFFF` | `#1B2336` |
| `--color-fg` | `#0F172A` | `#F8FAFC` |
| `--color-muted-fg` | `#475569` | `#94A3B8` |
| `--color-border` | `#E2E8F0` | `#334155` |
| `--color-accent` | `#0E7490` | `#22D3EE` |
| `--color-grid` | `#E2E8F0` 透明度 50% | `#1E293B` 透明度 33% |

用 WCAG 公式實際算出的文字對比度：

| 組合 | 淺色 | 深色 |
| --- | --- | --- |
| fg 在 card 上 | 17.85:1 | 14.98:1 |
| muted-fg 在 card 上 | 7.58:1 | 6.11:1 |
| muted-fg 在 bg 上 | 7.24:1 | 6.96:1 |
| accent 在 card 上 | 5.36:1 | 8.67:1 |
| accent 在 bg 上 | 5.12:1 | 9.88:1 |

全部都高於 4.5:1。

**字體**

- 內文與標題：`"IBM Plex Sans", "Noto Sans TC", sans-serif`。
- 等寬字體：`"JetBrains Mono", monospace`，用於日期、標籤、麵包屑、程式碼。
- 從 Google Fonts 載入，帶 `display=swap`。
- 內文 16px 起跳，行高 1.7。

**科技元素**

- 頁面背景是 20px 間距的淡格線。
- 麵包屑顯示成 `~/ 文章 / <文章標題>`，文章頁的標題顯示成 `~/ 文章`。
- 文章列表的整張卡片都可以點擊進入文章：標題連結用 `::after` 撐滿整張卡片（`relative` 卡片加上 `after:absolute after:inset-0`），標籤連結疊在上層（`relative z-10`），點標籤仍然進入標籤頁。這樣每張卡片只有一個文章連結，螢幕閱讀器讀到的連結名稱就是文章標題，不會把整段摘要都念成連結文字。
- 標籤顯示成 `#tag`，加上 accent 色細框。
- 卡片和連結在 hover、focus 時出現 accent 色細框。

**動畫**

- 只有 hover 和 focus 有 150–300ms 的顏色與邊框過渡。
- `prefers-reduced-motion: reduce` 時全部關閉。
- 不使用掃描線、閃爍、發光這類效果。
- 鍵盤 focus 一律顯示可見的 focus ring。

### 深色模式跟隨系統並可手動切換

- `<html>` 上的 `data-theme` 屬性決定主題，值是 `light` 或 `dark`。
- 判斷順序：先看 `localStorage` 的 `theme`；沒有存過的話，看 `prefers-color-scheme`。
- `<head>` 最前面放一段 `is:inline` 的小 script，在畫面繪製前就設定好 `data-theme`，避免先閃一下錯誤的主題。
- 切換按鈕會反轉 `data-theme`，並寫入 `localStorage`。按鈕的 `aria-label` 會依目前主題顯示「切換為深色模式」或「切換為淺色模式」。
- 使用者沒有手動切換過的話，系統設定改變時網站跟著切換。手動切換過之後，就以手動選擇為準。
- 瀏覽器不允許存取 `localStorage` 時（例如隱私模式），仍然依系統設定顯示，切換按鈕只在當下這一頁有效，不會出錯。

### 程式碼區塊使用 Shiki 雙主題

在 `astro.config.mjs` 的 `markdown.shikiConfig` 設定 `themes: { light: 'github-light', dark: 'github-dark' }`。在 `[data-theme="dark"]` 底下改用 Shiki 輸出的 `--shiki-dark` 變數，這樣切換主題時程式碼區塊不用重新產生 HTML。

### 首頁改為精選內容，完整列表移到文章頁

取代本 change 先前的「首頁分頁每頁 10 篇」。原因是使用者要求首頁改版：加上跑馬燈與最新文章，完整列表移到獨立的文章頁。設計參考 leerob.com、antfu.me、joshwcomeau.com 這類工程師個人網站的共通做法：不放大橫幅，用名字和一兩句介紹開場，最新文章用一行一篇的精簡列表，文章總表依年份分組並可依主題篩選。

- 首頁（`src/pages/index.astro`）由上到下：終端機風格的開場（`$ whoami`、作者名稱、`siteDescription`、三個連結）、跑馬燈、`~/ 最新文章`（最新 5 篇）、`~/ 依主題瀏覽`（所有標籤與篇數）。
- 移除 `src/pages/page/[page].astro`、`Pagination.astro` 與 `PAGE_SIZE`。舊的 `/page/<n>` 由 `firebase.json` 的 `redirects` 以 301 轉到 `/posts`，避免外部舊連結失效。
- 導覽列的「標籤」改成「文章」，連到 `/posts`。`/tags` 與 `/tags/<tag>` 保留，給文章頁上的標籤連結與搜尋引擎使用。

### 跑馬燈以 CSS 動畫無限循環

- 內容是最新 8 篇文章的標題。為了無縫循環，標題清單會重複一份接在後面，用 CSS `@keyframes` 把整條往左移動 50%。
- 複製出來的那一份加上 `aria-hidden="true"`，裡面的連結加上 `tabindex="-1"`，讓螢幕閱讀器和鍵盤只會遇到每個標題一次。
- 文章很少時，標題寬度可能不到畫面寬度，循環會出現空白。所以在建置時先把清單重複到至少 8 個項目，再複製一份做循環。
- 滑鼠移上去或裡面的連結取得焦點時，用 `animation-play-state: paused` 暫停。
- `prefers-reduced-motion: reduce` 時不播放動畫，隱藏複製的那一份，標題改成會換行的靜態列表。
- 速度依項目數量計算，大約每個標題 5 秒，讓不同文章數量時的移動速度看起來差不多。

### 文章頁依年份分組並以標籤篩選

- `src/pages/posts.astro` 在建置時輸出所有文章，依年份分組，每一列有 `data-tags` 屬性。
- 篩選列的每個標籤是 `<a href="/tags/<tag>">`，沒有 JavaScript 時就是普通的標籤頁連結。有 JavaScript 時攔截點擊，在頁面內篩選，並用 `history.replaceState` 更新成 `/posts?tag=<tag>`，所以篩選結果可以分享、重新整理後也會保留。
- 篩選後沒有文章的年份整組隱藏。選中的按鈕加上 `aria-pressed="true"`。
- `?tag=` 是不存在的標籤時，回到「全部」，不顯示空白頁面。

### Tailwind CSS v4 經由 Vite plugin 載入

用 `@tailwindcss/vite`，在 `src/styles/global.css` 寫 `@import "tailwindcss";`，再加 `@tailwindcss/typography` 做文章內文排版（`prose`）。不使用已經停止維護的 `@astrojs/tailwind`。

### 日期以台北時區顯示

所有日期一律用 `Asia/Taipei` 時區、`YYYY-MM-DD` 格式顯示。不這樣做的話，在 UTC 的建置機器上，日期可能會差一天。

### 部署到 Firebase Hosting

取代原本規劃的 Cloudflare Pages。原因是使用者選擇使用 GCP。兩者對 SEO 的影響差不多，而 Firebase Hosting 不會預設封鎖 AI 爬蟲，對 GEO 較單純。

- `firebase.json` 設定 `hosting.public: "dist"`、`cleanUrls: true`、`trailingSlash: false`。404 頁面由 Firebase 自動使用 `dist/404.html`。
- 自動部署用 Firebase CLI 的 `firebase init hosting:github` 產生 GitHub Actions workflow：push 到 `main` 時建置並部署到正式站，開 PR 時部署到預覽頻道（preview channel）。這個指令需要使用者登入 Firebase 和 GitHub，所以在部署階段由使用者執行，Claude 依 README 教學陪同操作。
- 前提：`RyanHsuWeb` 需要是一個推到 GitHub 的 git repo。目前 `RyanHsuWeb/.git` 只有 Spectra 桌面版的資料，不是真正的 repo，部署前要先建立。
- 先用免費的 Spark 方案。如果之後升級成按用量計費的 Blaze 方案，要在 GCP 設定預算警示。
- Firebase 預設的 `<project>.web.app` 和 `<project>.firebaseapp.com` 網址也能看到網站。靠 canonical 指向 `siteUrl`，避免搜尋引擎把它們當成重複內容。

### 網址不帶結尾斜線並由 Firebase 轉址

- Astro 設定 `trailingSlash: 'never'`、`build.format: 'file'`，建置出 `dist/about.html`、`dist/<slug>.html`、`dist/posts.html`、`dist/tags/<tag>.html` 這種檔案。
- Firebase 的 `cleanUrls` 用 `/about` 提供 `about.html`，並把 `/about.html` 301 轉址到 `/about`。`trailingSlash: false` 把 `/about/` 301 轉址到 `/about`。
- canonical、sitemap、RSS、站內連結全部使用不帶斜線的網址。
- 不採用帶斜線的版本（`/about/`），因為提案一開始就訂了文章網址是 `網域/<slug>`。

### robots.txt 由設定產生

`src/pages/robots.txt.ts` 在建置時輸出以下內容，`siteUrl` 取自 `site.config.ts`：

```
User-agent: *
Allow: /

Sitemap: <siteUrl>/sitemap-index.xml
```

`User-agent: *` 已經包含 GPTBot、ClaudeBot、PerplexityBot、Google-Extended 等 AI 爬蟲，不需要逐一列出。

### 文章頁輸出 BlogPosting 結構化資料

每篇文章頁的 `<head>` 輸出一段 `<script type="application/ld+json">`，欄位如下：

| JSON-LD 欄位 | 來源 |
| --- | --- |
| `@type` | 固定 `BlogPosting` |
| `headline` | `title` |
| `description` | `description` |
| `datePublished` | `pubDate`，ISO 8601 格式 |
| `dateModified` | 有 `updatedDate` 就用它，沒有就用 `pubDate` |
| `author` | `{ "@type": "Person", "name": author, "url": siteUrl + "/about" }` |
| `image` | `cover`，沒有設定時省略這個欄位 |
| `mainEntityOfPage` | 文章的正式網址 |
| `inLanguage` | 固定 `zh-TW` |
| `keywords` | `tags`，用逗號串接 |

用 `JSON.stringify` 產生內容，並把 `<` 轉義成 `<`，避免標題裡出現 `</script>` 時把 HTML 弄壞。

## Implementation Contract

**行為**

- 在 `src/content/posts/` 新增 `hello-world.md` 並建置，會發生以下事情：
  - `/hello-world` 出現文章頁。
  - 首頁的 `~/ 最新文章` 和跑馬燈最前面出現這篇文章，`/posts` 的當年分組最上方也出現這篇。
  - 文章的每個標籤都有 `/tags/<tag>` 頁面，並列出這篇。
  - `sitemap-index.xml` 和 `rss.xml` 都包含 `/hello-world`。
- 每個頁面共用同一個外框，包含 AdSense script（有設定時）、桌機側欄、手機底部導覽列和頁尾。頁尾連到 `/about`、`/privacy`、`/contact`。
- 文章頁依序顯示：麵包屑（`~/ 文章 / <文章標題>`）、標題、發布日期、標籤、內文、上一篇／下一篇、giscus 留言區（有設定時）。
- 第一次來訪時，主題跟隨系統設定。按下切換按鈕後，重新整理或換頁都會維持所選的主題，也不會先閃一下另一種主題。

**介面與資料格式**

- frontmatter 欄位見「文章使用 content collection 並以 schema 驗證 frontmatter」。
- 網站設定的欄位見「網站設定集中在 site.config.ts」。
- npm scripts：
  - `npm run dev`：本機開發。
  - `npm run build`：建置到 `dist/`。
  - `npm run check`：執行 `astro check`，做型別與內容檢查。

**失敗情況**

- frontmatter 缺少必填欄位或型別錯誤：建置失敗，錯誤訊息指出是哪個檔案的哪個欄位。
- 文章 slug 和保留 slug 相同：建置失敗，並列出衝突的檔名。
- `adsenseClientId` 為空：不輸出廣告 script，也沒有 `ads.txt`，建置仍然成功。
- giscus 設定不完整：不輸出留言區，建置仍然成功。
- 瀏覽器無法存取 `localStorage`：主題依系統設定顯示，切換只在當下這一頁有效，不會出錯。

**驗收方式**

- 在專案根目錄執行 `npm run check` 和 `npm run build`，兩者結束碼都是 0。
- 檢查 `dist/` 裡應有以下檔案：
  - 每篇範例文章的 `dist/<slug>.html`
  - `dist/tags/<tag>.html`
  - `dist/rss.xml`
  - `dist/sitemap-index.xml`、`dist/robots.txt`
  - `dist/about.html`、`dist/privacy.html`、`dist/contact.html`
  - 有設定發布商 ID 時，還要有 `dist/ads.txt`
- 用瀏覽器在 1280px 和 375px 兩種寬度檢查外框：前者顯示側欄、不顯示底部導覽列，後者相反。
- 用瀏覽器分別模擬系統深色和淺色，確認初始主題正確。切換後重新整理，主題要維持。
- 建置後 `dist/posts.html` 存在，`dist/page/` 不存在；在 Firebase 模擬器請求 `/page/2` 會 301 轉到 `/posts`。
- 在專案根目錄執行 `npx firebase-tools emulators:start --only hosting`，用 `curl -I` 確認：`/about` 回 200，`/about/` 和 `/about.html` 都回 301 並轉到 `/about`，不存在的路徑回 404。
- 用 Google 的 Rich Results Test（或 schema.org validator）檢查一篇文章頁的 JSON-LD，沒有錯誤。

**範圍內**

專案根目錄下的 Astro 專案、兩篇範例文章、三個 AdSense 必備頁面的內容初稿、`firebase.json`、Firebase Hosting 從零開始的中文部署教學（寫在 `README.md`）。

**範圍外**

見 Non-Goals。

## Risks / Trade-offs

- [AdSense 審核以內容為主，網站架好不代表能通過] → 在 README 註明：累積足夠的原創文章再申請。這是一般經驗值，Google 沒有公布具體篇數。
- [沒有發布商 ID 時無法在本機驗證廣告實際顯示] → 只驗證 script 和 `ads.txt` 的輸出格式。實際廣告顯示要等審核通過後在正式網域確認。
- [文章放在根路徑，未來新增固定頁面可能和既有文章撞名] → 用保留 slug 清單在建置時擋下。新增固定頁面時也要一併加入清單。
- [giscus 要求留言者有 GitHub 帳號] → 技術文章的讀者大多有 GitHub 帳號，可以接受。
- [深色模式下 AdSense 廣告可能是白底，和頁面不協調] → 廣告外觀由 Google 控制，網站無法調整。這是已知限制，接受。
- [Noto Sans TC 字檔很大，會拖慢首次載入] → Google Fonts 會依頁面實際用到的字分段下載，加上 `display=swap` 先用系統字體顯示。上線後用 Lighthouse 量測，如果 LCP 太慢，再改成只用系統中文字體。
- [文章頁和標籤頁不分頁，文章很多時頁面會變長] → 已列為 Non-Goal，真的有需要再處理。
- [跑馬燈會持續移動，可能干擾閱讀或造成不適] → 只放在首頁一條，滑鼠移上去會暫停，系統開啟減少動態效果時完全不動。
