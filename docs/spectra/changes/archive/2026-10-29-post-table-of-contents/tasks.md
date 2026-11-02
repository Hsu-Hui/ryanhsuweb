## 1. 目錄產生與輸出

- [x] 1.1 先寫測試：新增 `tests/toc.test.mjs`，用 `tests/helpers/build-site.mjs` 的 `buildSite` 建置 spec「Heading hierarchy and threshold」範例表的 6 種標題組合，以及「Entries link to the matching headings」的 `## 安裝`／`## 設定` 文章，斷言：目錄連結的 `href` 等於內文對應標題的 `id`、文字等於標題文字；h3 在巢狀 `<ol>` 裡；第一個 h2 之前的 h3 在第一層；h4 不列入；標題少於 2 個時頁面沒有 `aria-label="目錄"` 也沒有右側 `<aside>`。驗證：此時執行 `npm test`，新測試失敗（功能還沒做），既有測試全部通過。
- [x] 1.2 依「目錄資料使用 render() 回傳的 headings」與「目錄的階層與顯示門檻」實作 Article table of contents 的資料與結構：新增 `src/components/TableOfContents.astro`，接收 `render(post)` 回傳的 `headings`，只取 `depth` 2、3，把 h3 掛到前面最近的 h2 底下，輸出 `<nav aria-label="目錄">` 內的巢狀 `<ol>` 連結；`src/pages/[slug].astro` 在 h2＋h3 少於 2 個時完全不輸出目錄。驗證：`npm test` 中 1.1 新增的測試全部通過。[after: 1.1]

## 2. 版面：寬螢幕懸浮面板與窄螢幕收合目錄

- [x] 2.1 依「寬螢幕右側懸浮面板」與「窄螢幕收合目錄使用 details 元素」完成 Article table of contents 的兩種外觀，並更新 Article page content 的顯示順序：`src/pages/[slug].astro` 在有目錄時於 `xl`（1280px）以上改成兩欄 grid，左欄是文章卡片加留言卡片、右欄 240px 的 `<aside>` 放 `sticky top-8` 的目錄面板（超過視窗高度時面板內可捲動）；1280px 以下在標籤連結和內文之間放預設收合的 `<details>`，summary 文字「目錄」；兩份用 `xl:hidden`／`hidden xl:block` 切換。在 `tests/toc.test.mjs` 加一個斷言：`<details>` 目錄出現在標籤連結之後、內文第一個元素之前。驗證：`npm test` 通過；用瀏覽器在 1440px 寬度捲到底，右側面板一直看得到、收合區塊看不到；在 375px 寬度只看到收合的「目錄」，點開後出現項目，頁面沒有水平捲軸；沒有目錄的文章在 1440px 仍是單欄。[after: 1.2]
- [x] 2.2 依「點目錄跳轉時標題不貼齊視窗頂端」在 `src/styles/global.css` 為文章內文的 h2、h3 加上 `scroll-margin-top: 2rem`，並設定目錄連結樣式（一般為 `text-muted-fg`、hover 與 `aria-current="true"` 時為 `text-accent`、長標題可換行）。驗證：用瀏覽器在 1440px 點目錄項目，網址變成 `#<id>`，該標題出現在視窗頂端下方約 2rem 的位置；用 `grep` 確認新增的樣式沒有寫死 hex 色碼。[after: 2.1]

## 3. 目前段落標示

- [x] 3.1 依「目前段落標示以捲動位置判定」實作 Current section highlight in the side panel：在 `src/components/TableOfContents.astro` 加一段 script，只作用在寬螢幕面板，監聽 `scroll` 並用 `requestAnimationFrame` 節流，依 spec 規則（頂端在視窗頂端 96px 以內的最後一個標題；還沒到第一個標題時不標示；捲到底時標示最後一個）讓最多一個連結有 `aria-current="true"`；收合目錄不標示。驗證：用瀏覽器在 1440px 開一篇有 A、B、C 三個 h2 的文章，逐一重現 spec「article with headings A, B, C」範例表的 4 種捲動位置，用 `javascript_tool` 讀出有 `aria-current="true"` 的連結，結果都和表格一致；同時確認 `<details>` 裡的連結都沒有 `aria-current`。[after: 2.2]

## 4. 收尾

- [x] 4.1 執行完整檢查：`npm run check`、`npm run build`、`npm test` 結束碼都是 0；在瀏覽器切換深色／淺色主題，目錄面板與收合區塊的文字和背景都使用主題 token、深色模式下看得清楚；模擬 `prefers-reduced-motion: reduce` 時點目錄是直接跳轉、沒有平滑捲動。驗證：三個指令的輸出與瀏覽器檢查結果記錄在 apply 的回報中。[after: 3.1]
