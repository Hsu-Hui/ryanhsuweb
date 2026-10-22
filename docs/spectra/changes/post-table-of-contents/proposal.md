## Why

長文章（例如第一篇建站紀錄有 10 個章節）讀者很難掌握全貌，也很難跳到想看的段落。目前只能在文章裡手寫目錄，每次改標題都要同步更新，容易失效。

## What Changes

- 每篇文章頁從內文的 h2、h3 標題自動產生目錄，點選項目跳到對應段落，文章作者不需要手寫。
- 視窗寬度 1280px 以上：目錄放在文章右側的懸浮面板，捲動時固定在畫面上，並標出目前讀到的段落。
- 視窗寬度 1280px 以下（手機、平板、窄視窗）：目錄放在文章標頭和內文之間，預設收合，點選後展開。
- 文章的 h2、h3 標題少於 2 個時不顯示目錄，寬螢幕版面也不保留右側欄位。

## Non-Goals (optional)

範圍排除與不採用的做法記錄在 design.md 的 Goals / Non-Goals。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `blog-posts`: 新增「文章目錄」需求；「文章頁內容」的顯示順序加入目錄。

## Impact

- 修改程式碼：src/pages/[slug].astro（版面改成內文與右側目錄兩欄、加入收合目錄）、src/styles/global.css（標題跳轉位置與目錄樣式）。
- 新增程式碼：src/components/TableOfContents.astro（目錄元件與目前段落標示的 script）。
- 新增測試：tests/toc.test.mjs。
- 不新增任何依賴，標題資料使用 Astro `render()` 已提供的 `headings`。
