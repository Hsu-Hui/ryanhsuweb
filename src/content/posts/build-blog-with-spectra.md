---
title: 用 Spectra 從零做出這個部落格：先寫規格，再讓 AI 寫程式
description: 我用高見龍老師的 Spectra 搭配 Claude Code，兩天內把這個網站從空資料夾做到上線。這篇記錄每個步驟產生了什麼文件、需求中途改變時怎麼處理，以及我覺得值得和不值得的地方。
pubDate: 2026-10-22
tags: [spectra, SDD, claude-code, astro, firebase]
cover: https://ryan-hsu.com/images/build-blog-with-spectra/cover.png
---

<figure>
  <img src="/images/build-blog-with-spectra/cover.png" alt="用 Spectra 打造部落格的流程：discuss、propose、apply、ingest、verify、archive" width="1200" height="630" />
</figure>

這是這個網站的第一篇文章，就從這個網站本身怎麼做出來的開始寫。

我想要一個放技術筆記的地方，順便試試看能不能用 Google AdSense 賺一點收入。需求不複雜：寫一篇文章就是新增一個檔案，push 之後自動上線。但「不複雜」的需求，交給 AI 寫的時候反而最容易失控，因為一路上會冒出一堆沒想清楚的小決定。所以這次我試了高見龍老師開發的 [Spectra](https://github.com/kaochenlong/spectra-app)，用規格驅動開發（Spec-Driven Development，SDD）的方式來做。

從巨人的肩膀上眺望當然是最快的，當然如果大家有其他更好用的工具也可以分享給我。

## Spectra 是什麼

簡單說，Spectra 讓你在寫程式之前，先把「要做什麼、為什麼、怎麼驗證」寫成文件，再讓 AI 照著文件實作。規格放在 `docs/spectra/specs/`，每一次的變更提案放在 `docs/spectra/changes/`。

它以一組 skill 的形式裝進 Claude Code，流程大概是這樣：

```text
discuss? → propose → apply ⇄ ingest → verify / review → archive
```

| 步驟 | 做什麼 |
| --- | --- |
| `/spectra-discuss` | 選用。需求還很模糊、有幾種做法要比較時先討論 |
| `/spectra-propose` | 產生一份完整的變更提案 |
| `/spectra-apply` | 照著工作清單一項一項實作 |
| `/spectra-ingest` | 實作到一半需求變了，把新需求寫回提案 |
| `/spectra-verify`、`/spectra-review` | 檢查實作有沒有符合規格、程式品質 |
| `/spectra-archive` | 全部完成後封存，把規格合併進正式的 specs |

## 第一步：propose，先把網站想清楚

我把需求丟給 `/spectra-propose`，它產生了一個叫 `personal-tech-blog` 的變更，裡面有四種文件：

```text
docs/spectra/changes/personal-tech-blog/
├── proposal.md   為什麼要做、要改什麼
├── design.md     技術決策和取捨
├── specs/        7 個能力的規格
└── tasks.md      工作清單
```

### proposal.md：為什麼、做什麼

proposal 回答兩件事。**Why** 是我想要一個能放 AdSense 的技術部落格，而且發布流程要簡單。**What Changes** 則把網站拆成具體的項目：Astro 靜態網站、Markdown 文章、參考 kaochenlong.com 的版面、深色模式、AdSense 審核需要的頁面、giscus 留言、SEO，最後部署到 Firebase Hosting。

整個網站被切成 7 個能力（capability），每個能力各有一份規格：

- `blog-posts`：文章格式與文章頁
- `site-layout`：共用外框、側欄、手機底部導覽列
- `site-theme`：深色／淺色主題
- `site-discovery`：首頁、標籤頁、sitemap、RSS
- `adsense-readiness`：AdSense 審核需要的頁面和 `ads.txt`
- `post-comments`：giscus 留言
- `search-visibility`：`robots.txt`、結構化資料、網址規則

### design.md：把「為什麼這樣選」留下來

我覺得 design.md 是整套流程裡最有價值的文件。它記錄每個技術決策，以及沒選的方案為什麼不選。例如：

- **為什麼用 Astro，不用 Rails 或 WordPress？** 那兩個都需要伺服器和資料庫，對一個個人部落格來說維護成本太高。
- **為什麼不是每篇文章一個 HTML 檔？** 共用外框和廣告程式碼會在每個檔案裡重複，首頁和 sitemap 也要手動維護。
- **為什麼不做後台或 CMS？** 會多一個要維護的服務。
- **為什麼不做 `llms.txt`？** 還不是正式標準，效果不確定，先不做。

最後還有一段 Risks / Trade-offs，把已知的限制先寫下來。像是深色模式下 AdSense 廣告可能是白底、和頁面不協調，這是 Google 控制的，網站沒辦法調，那就寫明「接受」。以後有人（通常是未來的我）問「這裡為什麼長這樣」，答案就在這裡。

### specs：用範例表定義「做對」是什麼樣子

每份 spec 都是一條條 Requirement，很多 Requirement 會附上範例表。舉主題判定為例，與其寫「深色模式要跟隨系統，也能手動切換」這種一句話，規格會列出 `localStorage` 有沒有存過選擇、系統是深色還是淺色，各種組合下 `data-theme` 應該是什麼。

這種寫法的好處是，AI 實作完之後，驗證方式也已經寫好了，照著表格一列一列測就好。

### tasks.md：每一項都有驗證條件

工作清單分成 8 個區塊、20 多個項目，從專案骨架、視覺系統、文章、列表、AdSense、留言一路到部署。每一項都寫了**怎麼驗證**，而且標了相依關係，例如 `[after: 1.1]` 代表要等 1.1 做完。

舉一個例子，AdSense 發布商 ID 的設定：

> `adsenseClientId` 不是空字串、也不符合 `ca-pub-` 加數字時，建置失敗並指出 `adsenseClientId`。驗證：暫時設成 `pub-1234` 執行 `npm run build` 會失敗且訊息含 `adsenseClientId`；設成空字串則建置成功。

實作出來就是 `src/site.config.ts` 裡的這段：

```ts
const ADSENSE_CLIENT_ID = /^ca-pub-\d+$/;

if (siteConfig.adsenseClientId !== '' && !ADSENSE_CLIENT_ID.test(siteConfig.adsenseClientId)) {
  throw new Error(
    `site.config.ts: adsenseClientId "${siteConfig.adsenseClientId}" 格式錯誤，必須是 ca-pub- 加數字，或留空字串。`,
  );
}
```

ID 打錯的話根本建置不過，不會帶著錯的設定上線。這種細節如果沒先寫在規格裡，我自己大概不會想到要做。

## 第二步：apply，照清單實作

提案確認之後，就用 `/spectra-apply` 開始實作。Claude Code 會照 tasks.md 的順序做，每做完一項就跑該項的驗證，通過了才打勾。

因為每一項的範圍和驗收條件都很明確，AI 比較不會自己加料，也不太會漏東漏西。我要做的事主要是看它的驗證結果，和處理只有我能做的部分：買網域、建立 Firebase 專案、登入 Firebase CLI、到 GitHub 安裝 giscus。這些在 design.md 裡也寫明了是 Non-Goal，由我自己照 README 的教學操作。

## 需求改了怎麼辦：ingest

實際做下去，一定會有原本沒想到的地方。這個網站就改了好幾次：

- **麵包屑**：原本文章頁的麵包屑是 `~/ posts / <slug>`，後來改成中文的 `~/ 文章 / <slug>`，最後又改成顯示文章標題，而且長標題要能換行（tasks 4.4、4.5）。
- **留言區**：giscus 原本直接接在文章下面，後來改成獨立的「留言討論」卡片，而且切換深淺色時，留言區的主題要跟著變（task 6.2）。
- **首頁改版**：原本首頁是每頁 10 篇的分頁列表。做完之後覺得太像一般的文章列表，就改成開場介紹、最新文章跑馬燈、最新 5 篇和依主題瀏覽，完整列表移到新的 `/posts` 頁，依年份分組、可以用標籤篩選（section 8）。

遇到這種情況，不是直接叫 AI 改程式，而是先用 `/spectra-ingest` 把新需求寫回 proposal、design、specs 和 tasks，再繼續 apply。

首頁改版的那次最明顯。tasks.md 裡原本的 4.1 首頁分頁已經做完打勾了，新的 8.2 寫明「取代了 4.1 的首頁分頁」，要移除分頁元件，並且把舊的 `/page/2` 這類網址 301 轉址到 `/posts`。舊的勾選紀錄保留下來當歷史，所以回頭看還知道當初為什麼有分頁、又為什麼拿掉。如果只是口頭叫 AI 改掉，這些舊網址的轉址很可能就被忘了。

## 第三步：部署上線

部署用 Firebase Hosting 加 GitHub Actions：push 到 `main` 就自動建置部署，開 Pull Request 會自動產生一個預覽網址。

`firebase.json` 裡設定了網址規則，讓每一頁只有一個正式網址：`/about/` 和 `/about.html` 都會 301 轉址到 `/about`，避免搜尋排名被分散。部署教學也寫在 README 裡，從建立 GitHub repo、Firebase 專案、綁定網域到申請 AdSense，照順序做就能完成。

## 第四步：verify，對照規格檢查

工作清單全部打勾，不代表網站真的符合規格。`/spectra-verify` 會拿 proposal、design、specs、tasks 回頭比對實際的程式碼，這次就抓到幾個漏網之魚：

- giscus 設定沒填完整時，留言區雖然不會顯示，但頁面還是會載入 giscus 的程式。
- 標籤頁的連結沒有對標籤名稱做網址編碼，標籤裡如果有空白或特殊字元，連結就會壞掉。
- 聯絡頁合併進「關於我」之後，design.md 和程式註解還留著舊的說明。

這些都不是一眼看得出來的問題，但規格寫得很清楚，對照之後就無所遁形。修完之後，我又補了一套自動化測試：用測試用的文章和設定實際建置一次網站，再逐一檢查產生的 HTML、XML 和文字檔是不是符合規格，並讓 GitHub Actions 在部署前先跑 `npm test`。規格裡的範例表，剛好就是現成的測試案例。

## 第五步：archive，規格正式入庫

確認都沒問題之後，用 `/spectra-archive` 封存這個變更。它會把 7 個能力、共 33 條 Requirement 合併進 `docs/spectra/specs/`，變更本身則移到 `docs/spectra/changes/archive/2026-10-22-personal-tech-blog/`。

從這一刻起，`docs/spectra/specs/` 就是這個網站「現在應該長什麼樣子」的正式說明。以後要加新功能，就不是從零開始提案，而是在既有的規格上修改。

## 再跑一輪：新功能也從規格開始

archive 之後，我馬上就用這套流程加了兩個功能。

**文章目錄。** 你現在看到的目錄就是這樣來的。寫這篇文章的時候，我發現章節一多就很難找，一開始是在文章裡手寫目錄，但每次改標題都要跟著改。於是我開了一個新的變更 `post-table-of-contents`，在 `blog-posts` 規格裡新增「文章目錄」：

- 目錄從文章的 h2、h3 標題自動產生，標題少於 2 個就不顯示。
- 螢幕寬度 1280px 以上，目錄放在右側，捲動時固定在畫面上，並標出目前讀到的段落。
- 1280px 以下（手機、平板），目錄放在文章開頭，預設收合，點一下展開。

「目前讀到的段落」怎麼判斷，規格裡也寫成範例表：標題捲到距離視窗頂端 96px 以內，就算讀到那一段；捲到頁面最底部時，標出最後一段。實作時用瀏覽器照表驗證，結果發現標題的位置會有小數（例如 96.48px），但捲動只能一次移動 1px，標題永遠停不到剛好 96px 的位置。最後在比較前先把小數捨去才解決。如果沒有把規則寫成精確的數字，這種問題大概要等到哪天看起來怪怪的才會發現。

**手機版文章列表。** 在手機上看首頁，日期、標題、標籤擠在同一行，標題被壓得很窄。所以又開了一個變更 `mobile-post-list`：768px 以下改成由上到下顯示日期、標題、兩行摘要和標籤，比較寬的螢幕則維持原本的一行排版。這個變更做完也已經 archive 了。

兩個功能都照一樣的節奏走：propose 寫規格、apply 照清單實作、verify 對照檢查，最後 archive。規格和設計文件都在，以後回頭看，也知道當初為什麼這樣決定。

## 心得

**值得的地方：**

- **決策有紀錄。** 為什麼選 Astro、為什麼不做 CMS、哪些限制是已知且接受的，全都寫在 design.md。
- **AI 比較不會亂做。** 有明確的範圍和驗收條件，Claude Code 照清單走，我只要檢查結果。
- **需求變更有軌跡。** 用 ingest 改規格，比在對話裡口頭交代可靠，也不會忘記像舊網址轉址這種周邊的事。

**要付出的成本：**

- **前期要花時間讀文件。** propose 產生的文件不短，design.md 就有快 20KB。如果不認真看，規格寫錯了，AI 也會照著錯的規格做。
- **小改動顯得有點重。** 改個文字也要走一遍流程的話，會覺得囉唆。我的做法是小修正直接改，會影響規格的才走 ingest。

整體來說，對「從零開始做一個完整網站」這種範圍的事，先寫規格很划算。規格 archive 之後，加新功能也變得很順手：文章目錄和手機版列表，都是在既有的規格上加幾條 Requirement 就開工了。

接下來就是持續寫文章，累積到足夠的數量再去申請 AdSense。有問題或想法，歡迎在下面留言。
