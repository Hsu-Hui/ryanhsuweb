## Context

文章頁 `src/pages/[slug].astro` 目前是一張圓角卡片，依序放麵包屑、標頭（標題、日期、標籤）、內文、上一篇／下一篇，卡片下方是留言卡片。整頁外框來自 `BaseLayout`：最寬 `max-w-7xl`（1280px），1024px 以上左邊有 72px 側欄。

Astro 會自動幫 Markdown 的每個標題加上 `id`（例如 `## Spectra 是什麼` → `id="spectra-是什麼"`），`render(post)` 也會回傳 `headings`（`depth`、`slug`、`text`），所以不需要另外解析內文。

目前唯一需要目錄的文章 `build-blog-with-spectra.md` 是在內文手寫目錄，這篇文章還在另一個分支，尚未合併到 `main`。

## Goals / Non-Goals

**Goals:**

- 目錄完全從標題自動產生，作者不用維護。
- 寬螢幕（1280px 以上）在右側懸浮，捲動時固定，並標出目前讀到的段落。
- 窄螢幕（1280px 以下）在標頭和內文之間，預設收合，可以展開。
- 標題太少的文章不顯示目錄，不多佔版面。

**Non-Goals:**

- h4 以下的標題不列入目錄（層級太深，面板會太長）。
- 窄螢幕版不做「目前段落」標示（收合的目錄大部分時間看不到，做了也沒用）。
- 不提供讓單篇文章關閉目錄的 frontmatter 欄位，等有需要再加。
- 不在這個變更移除 `build-blog-with-spectra.md` 的手寫目錄：那篇文章不在 `main`，合併文章時一起刪掉。
- 不做閱讀進度條、回到頂端按鈕。

## Decisions

### 目錄資料使用 render() 回傳的 headings

直接用 `render(post)` 回傳的 `headings`，篩出 `depth` 為 2 和 3 的項目，連結到 `#<slug>`。

- 不用 remark／rehype plugin 自己產生：Astro 已經提供同一份資料，`id` 也保證和內文一致。
- 不在瀏覽器端用 JavaScript 掃描 DOM 產生：沒有 JavaScript 時就沒有目錄，對爬蟲也不友善。

### 目錄的階層與顯示門檻

- h2 是第一層，h3 掛在它前面最近的 h2 底下成為第二層。
- 第一個 h2 之前出現的 h3 直接放在第一層，不會被丟掉。
- h2 和 h3 加起來少於 2 個時，完全不輸出目錄，寬螢幕版面也維持單欄。只有一個標題的目錄沒有導覽價值。

### 寬螢幕右側懸浮面板

文章頁在 `xl`（1280px）以上改成兩欄 grid：左欄是文章卡片加留言卡片，右欄寬 240px 放目錄。目錄面板用 `sticky top-8`，和左側導覽側欄的 `sticky top-8` 對齊。

- 選 1280px 是使用者決定的：在這個寬度，扣掉左側欄和右側面板，內文還有大約 800px，閱讀舒適。1024px 時內文會被擠到大約 600px。
- 面板只放在文章頁，不改 `BaseLayout`，其他頁面不受影響。
- 目錄很長、超過視窗高度時，面板本身可以捲動（`max-height` 為視窗高度扣掉上下留白，`overflow-y: auto`）。

### 窄螢幕收合目錄使用 details 元素

1280px 以下，目錄放在標頭和內文之間，用原生 `<details>`／`<summary>`，預設收合，summary 文字是「目錄」。

- 不用自己寫 JavaScript 的展開按鈕：`<details>` 不需要 JavaScript、鍵盤和螢幕閱讀器原生就支援。
- 寬窄兩份目錄是同一個元件的兩種外觀，用 `xl:hidden` 和 `hidden xl:block` 切換。被 `display: none` 隱藏的那份不會出現在無障礙樹，所以不會讀到兩次。

### 目前段落標示以捲動位置判定

只在寬螢幕面板標示目前段落。規則：

- 目前段落是「頂端已經捲到距離視窗頂端 96px 以內（含已經捲過去）的最後一個標題」。
- 還沒捲到第一個標題時，不標示任何項目。
- 已經捲到頁面最底部時，標示最後一個標題（最後一段通常很短，頂端到不了 96px 的位置）。
- 標示方式：該連結加上 `aria-current="true"`，樣式用強調色；同一時間最多一個項目被標示。

實作用 `scroll` 事件加 `requestAnimationFrame` 節流，每次重新計算。判斷規則抽成 `src/lib/toc.ts` 的 `currentSectionIndex`，可以不靠瀏覽器直接測試。

- 標題頂端的位置會有小數（例如 96.48px），捲動卻只能以整數像素移動，標題永遠到不了剛好 96.0px。比較前先用 `Math.floor` 捨去小數，所以 96.48px 算到線、97px 還沒到。這是實作時用無頭 Chrome 驗證才發現的。

- 不用 IntersectionObserver：它只回報「進出某個範圍」，兩個標題之間的長段落沒有任何標題在範圍內時，還是要自己算，邏輯反而複雜。用捲動位置直接算比較好懂，也容易用上面的規則測試。

### 點目錄跳轉時標題不貼齊視窗頂端

文章內的 h2、h3 加上 `scroll-margin-top`（2rem），跳轉後標題上方留一點空間。全站已經在 `prefers-reduced-motion: reduce` 時把 `scroll-behavior` 設為 `auto`，這個變更不另外開啟平滑捲動。

## Implementation Contract

**可觀察的行為：**

- 文章的 h2＋h3 數量 ≥ 2 時，文章頁輸出兩個 `<nav aria-label="目錄">`：一個在 `<details>` 裡（窄螢幕用），一個在右側 `<aside>` 裡（寬螢幕用）。數量 < 2 時兩個都不輸出，頁面也沒有右側欄位。
- 每個目錄項目是 `<a href="#<slug>"><text></a>`，`<slug>` 和內文對應標題的 `id` 完全相同，`<text>` 是標題文字。
- h3 項目放在它前面最近的 h2 項目底下的巢狀 `<ol>` 裡。
- 視窗寬 ≥ 1280px：只看得到右側面板，捲動時面板固定在畫面上；< 1280px：只看得到標頭和內文之間的「目錄」收合區塊，預設收合。
- 寬螢幕面板依「目前段落標示以捲動位置判定」的規則，讓剛好一個連結有 `aria-current="true"`（還沒捲到第一個標題時為零個）。

**驗收：**

- `npm test` 的新測試 `tests/toc.test.mjs` 通過，涵蓋：輸出門檻、連結與 `id` 一致、h3 巢狀、h3 出現在第一個 h2 之前、h4 不列入。
- `npm run check`、`npm run build` 結束碼為 0，既有測試全部通過。
- 用瀏覽器在 1440px 和 375px 寬度手動確認版面、展開收合、目前段落標示（規則見上）。

**範圍內：** `src/pages/[slug].astro`、新的 `src/components/TableOfContents.astro`、`src/styles/global.css` 的標題跳轉位置與目錄樣式、新的 `tests/toc.test.mjs`。

**範圍外：** `BaseLayout` 與其他頁面、文章 frontmatter 格式、`build-blog-with-spectra.md` 的手寫目錄。

## Risks / Trade-offs

- [寬螢幕多一欄，文章內文變窄] → 只在 1280px 以上才顯示，內文仍約 800px；沒有目錄的文章維持單欄。
- [標題文字很長時，面板項目會換很多行] → 面板項目允許換行（`break-words`），不截斷，確保能讀到完整標題。
- [標題重複時 slug 會加上 `-1`] → 直接使用 `headings` 回傳的 slug，和 Astro 產生的 `id` 一致，不會連錯。
- [捲動事件頻繁觸發] → 用 `requestAnimationFrame` 每個畫面最多算一次，標題數量少（一般十幾個），計算成本可以忽略。這是估計，實作後用瀏覽器效能面板捲動長文確認沒有掉幀。

## Migration Plan

純前端顯示變更，沒有資料遷移。部署後如果有問題，revert 這個變更的 commit 即可。
