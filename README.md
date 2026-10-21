# RyanHsuWeb

個人技術部落格。用 [Astro](https://astro.build) 建置成純靜態網站，部署在 Firebase Hosting，並放 Google AdSense 廣告。

- 每篇文章是一個 Markdown 檔，push 之後自動上線。
- 首頁（最新文章跑馬燈、最新 5 篇）、文章頁 `/posts`（依年份分組、可用標籤篩選）、標籤頁、sitemap、RSS、`robots.txt`、`ads.txt` 都在建置時自動產生。
- 支援深色模式（跟隨系統，也可以手動切換）。

這份文件從「新增文章」開始，一路寫到「網站上線、開始放廣告」，照順序做就能完成。

---

## 1. 本機開發

需要 Node.js 22.12 以上。

```bash
npm install
npm run dev      # 本機預覽，預設在 http://localhost:4321
npm run build    # 建置到 dist/
npm run check    # 型別與內容檢查
```

## 2. 新增一篇文章

在 `src/content/posts/` 新增一個 `.md` 檔，**檔名就是網址**。例如 `my-first-post.md` 的網址是 `/my-first-post`。

```markdown
---
title: 文章標題
description: 一兩句摘要，會出現在首頁、搜尋結果和 RSS。
pubDate: 2026-10-21
updatedDate: 2026-11-01     # 選填：最後更新日期
tags: [astro, firebase]     # 選填
cover: https://example.com/cover.png   # 選填：社群分享圖
---

內文用 Markdown 寫，也可以直接寫 HTML。
```

注意事項：

- `title`、`description`、`pubDate` 必填。少填或格式錯誤時，`npm run build` 會失敗，並指出是哪個檔案的哪個欄位。
- 檔名不能用以下這些名字，因為已經被固定頁面佔用：`about`、`privacy`、`contact`、`tags`、`page`、`posts`、`rss.xml`、`sitemap-index.xml`、`ads.txt`、`robots.txt`、`404`。
- 文章用到的圖片放在 `public/images/<文章檔名>/`，在文章裡用 `/images/<文章檔名>/xxx.png` 引用。
- 還沒寫完的文章不要放進 `src/content/posts/`，放進去 push 就會上線。

## 3. 網站設定：`src/site.config.ts`

所有設定都集中在這個檔案。還沒拿到的值保持空字串，相關功能會自動關閉，網站照樣能建置和上線。

| 欄位 | 說明 | 去哪裡拿 |
| --- | --- | --- |
| `siteUrl` | 網站正式網址，不要加結尾斜線 | 你買的網域，例如 `https://ryanhsu.dev` |
| `siteTitle`、`siteDescription`、`author` | 網站名稱、描述、作者名字 | 自己決定 |
| `contactEmail` | 關於我頁面的信箱圖示，留空就不顯示 | 你想公開的信箱 |
| `githubUrl` | 關於我頁面的 GitHub 圖示，留空就不顯示 | 你的 GitHub 個人頁網址 |
| `adsenseClientId` | AdSense 發布商 ID，格式 `ca-pub-` 加數字 | AdSense 後台 → 帳戶 → 帳戶資訊（見第 9 節） |
| `giscus.repo`、`repoId`、`category`、`categoryId` | 留言區設定 | [giscus.app](https://giscus.app)（見第 8 節） |

`adsenseClientId` 格式錯誤時，建置會直接失敗，避免帶著錯的 ID 上線。

---

## 4. 把專案放上 GitHub

Firebase 會從 GitHub 拉程式碼自動部署，所以要先把專案變成一個 git repo，推到 GitHub。

1. 到 GitHub 建立一個新的 repository，例如 `ryanhsuweb`。可以設成 Private。
2. 在專案根目錄執行：

   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<你的帳號>/ryanhsuweb.git
   git push -u origin main
   ```

3. 回到 GitHub 重新整理，應該會看到所有檔案。`node_modules/` 和 `dist/` 不會被推上去，`.gitignore` 已經排除了。

## 5. 建立 Firebase 專案

1. 到 [Firebase Console](https://console.firebase.google.com)，用 Google 帳號登入。
2. 按「建立專案」（Create a project），輸入名稱，例如 `ryanhsuweb`。
   - Firebase 會給你一個**專案 ID**，例如 `ryanhsuweb-1a2b3`，記下來，後面會用到。
   - 要不要開 Google Analytics 都可以，部落格不一定需要。
3. 建好之後，在左側選單找到「Hosting」，按「開始使用」（Get started）。畫面上的步驟可以先跳過，我們用 CLI 設定。

### 方案與費用

- 預設是免費的 **Spark 方案**：10 GB 儲存空間，每天 360 MB 傳輸量。個人部落格前期通常用不完。
- 流量變大、超過免費額度時，網站會暫停服務，直到隔天額度重置。要避免這種情況，可以升級成按用量計費的 **Blaze 方案**。
- **升級 Blaze 前，一定要先設定預算警示：** 到 [Google Cloud Console](https://console.cloud.google.com) → 帳單 → 預算與快訊，設定一個金額（例如每月 5 美元），超過時寄信通知你。
- 以上額度以 [Firebase 定價頁](https://firebase.google.com/pricing) 為準。

## 6. 安裝 Firebase CLI 並設定自動部署

1. 安裝並登入 Firebase CLI：

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

   瀏覽器會打開 Google 登入頁，用剛剛建立 Firebase 專案的帳號登入。終端機出現 `Success! Logged in as ...` 就成功了。

2. 設定 GitHub 自動部署：

   ```bash
   firebase init hosting:github
   ```

   它會依序問你幾個問題：

   | 問題 | 怎麼回答 |
   | --- | --- |
   | 選擇 Firebase 專案 | 選第 5 節建立的專案 |
   | GitHub repository | 輸入 `<你的帳號>/ryanhsuweb` |
   | 建置前要不要先執行指令 | `Y`，指令輸入 `npm ci && npm run build` |
   | 合併到正式分支時要不要自動部署 | `Y`，分支輸入 `main` |

   - 過程中會開瀏覽器請你授權 Firebase 存取 GitHub，按同意。
   - 完成後會多出 `.firebaserc` 和 `.github/workflows/` 兩樣東西。
   - **不要覆蓋 `firebase.json`**。如果它問你要不要覆寫，選 No。這個檔案裡已經設定好網址規則（見下方）。

3. 把新產生的檔案推上去：

   ```bash
   git add .firebaserc .github
   git commit -m "Add Firebase deploy workflow"
   git push
   ```

4. 到 GitHub repo 的「Actions」分頁，會看到一個部署工作在跑。變成綠色勾勾後，網站就上線了。網址是 `https://<專案 ID>.web.app`。

之後的流程：

- **push 到 `main`：** 自動建置並部署到正式網站。
- **開 Pull Request：** 自動部署一個預覽版網址，留言在 PR 裡，確認沒問題再合併。

### `firebase.json` 的網址規則

```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": false,
    "redirects": [
      { "regex": "^/page/\\d+/?$", "destination": "/posts", "type": 301 }
    ]
  }
}
```

這個設定讓每一頁只有一個正式網址，避免搜尋排名被分散：

| 請求 | 結果 |
| --- | --- |
| `/about` | 正常顯示 |
| `/about/` | 301 轉址到 `/about` |
| `/about.html` | 301 轉址到 `/about` |
| `/page/2`（舊的首頁分頁網址） | 301 轉址到 `/posts` |
| 不存在的網址 | 顯示 404 頁面 |

部署前想在本機確認，可以用 Firebase 模擬器：

```bash
npm run build
npx firebase-tools emulators:start --only hosting --project demo-ryanhsuweb
```

然後打開 `http://localhost:5000`。

## 7. 綁定自己的網域

1. Firebase Console → Hosting → 「新增自訂網域」（Add custom domain），輸入你的網域，例如 `ryanhsu.dev`。
2. Firebase 會給你幾筆 DNS 記錄（通常是 `A` 記錄和一筆驗證用的 `TXT` 記錄）。
3. 到你買網域的地方（網域註冊商）的 DNS 設定頁，把這些記錄加進去。
4. 回到 Firebase 等待驗證，通常幾分鐘到幾小時。驗證完成後，Firebase 會自動幫你申請 HTTPS 憑證。
5. 把 `src/site.config.ts` 的 `siteUrl` 改成新網域，push 上去。canonical、sitemap、RSS、`robots.txt` 都會跟著更新。

Firebase 預設的 `*.web.app` 和 `*.firebaseapp.com` 網址仍然可以連，但每頁的 canonical 都指向你的網域，所以搜尋引擎不會把它們當成重複內容。

## 8. 留言（giscus）

1. 留言會存在一個**公開**的 GitHub repo 的 Discussions 裡。可以用這個網站的 repo（要設成 Public），也可以另外開一個專門放留言的 repo。
2. 在那個 repo 的 Settings → General → Features，勾選「Discussions」。
3. 到 [github.com/apps/giscus](https://github.com/apps/giscus) 安裝 giscus app，授權給那個 repo。
4. 打開 [giscus.app](https://giscus.app)，輸入 repo 名稱，「Discussion 分類」建議選 `Announcements`（只有你能開新討論，讀者只能回覆）。
5. 頁面下方會產生一段 script，把裡面的 `data-repo`、`data-repo-id`、`data-category`、`data-category-id` 四個值填進 `site.config.ts` 的 `giscus`。

四個值都填好之後，文章頁下方才會出現留言區。

## 9. Google AdSense

### 申請前

- **先累積足夠的原創文章再申請。** AdSense 審核主要看內容，網站架好不代表會通過。Google 沒有公布需要幾篇，一般經驗是十幾到三十篇有內容的文章。
- 網站已經有審核需要的頁面：[關於我](/about)（含聯絡方式）、[隱私權政策](/privacy)。舊的 `/contact` 網址會 301 轉到關於我。

### 申請與設定

1. 到 [Google AdSense](https://adsense.google.com) 申請，網站網址填你的正式網域。
2. 在 AdSense 後台 → 帳戶 → 帳戶資訊，找到「發布商 ID」（`pub-` 開頭的數字），在前面加上 `ca-`，填進 `site.config.ts` 的 `adsenseClientId`。例如 `ca-pub-1234567890123456`。
3. push 之後，每一頁都會載入 AdSense 程式碼，`/ads.txt` 也會自動產生。
4. 在 AdSense 後台 → 廣告 → 依網站，開啟「自動廣告」。廣告要放在哪裡由 Google 決定。

### 歐盟和英國訪客的同意訊息（必做）

AdSense 規定，要向歐洲經濟區、英國和瑞士的訪客顯示廣告，必須先取得他們同意使用 cookie。

1. AdSense 後台 → 隱私權與訊息（Privacy & messaging）。
2. 建立「歐洲法規」（GDPR）訊息，套用到你的網站並發布。

訊息由 AdSense 的程式碼自動顯示，網站本身不需要另外做 Cookie 橫幅。**沒有開啟這個訊息的話，這些地區的訪客不會看到廣告。**

### 已知限制

- 深色模式下，廣告的配色由 Google 決定，可能會出現白底的廣告。網站沒辦法調整。

---

## 專案結構

```
src/
├── site.config.ts        網站設定（唯一的設定來源）
├── content.config.ts     文章 frontmatter 的格式定義
├── content/posts/        文章（一篇一個 .md）
├── layouts/              共用外框
├── components/           導覽列、文章列表、跑馬燈、留言區等元件
├── lib/                  文章查詢、日期格式、結構化資料等工具
├── pages/                各頁面與自動產生的檔案（rss.xml、robots.txt、ads.txt）
└── styles/global.css     顏色 token、字體、深色模式
firebase.json             Firebase Hosting 的網址與轉址規則
```
