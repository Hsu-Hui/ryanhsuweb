## Context

網站是 Astro 靜態網站，部署在 Firebase Hosting。目前沒有任何流量統計：Firebase Hosting 不提供每頁瀏覽數，Search Console 只看得到 Google 搜尋流量。外部服務（AdSense、giscus）都由 `src/site.config.ts` 的單一設定值控制，空字串代表關閉，格式錯誤時建置失敗。

## Goals / Non-Goals

**Goals:**

- 用一個設定值 `ga4MeasurementId` 開關 GA4，行為和 `adsenseClientId` 一致（空字串關閉、格式錯誤建置失敗）。
- 隱私權政策只在 GA 啟用時說明 GA。

**Non-Goals:**

- 網站自己的 cookie 同意橫幅（沿用 adsense-readiness 的決定）。
- 自訂事件追蹤。
- Google Tag Manager 容器或伺服器端追蹤。

## Decisions

### 直接嵌入 gtag.js，而不是用 Partytown 或 GTM 容器

gtag.js 是 GA4 官方最簡單的安裝方式，不需要額外套件。Partytown 會多一個依賴，而且 GA4 在 web worker 中有已知的相容性問題；GTM 容器對只送 page_view 的部落格來說太重。

### 用 `define:vars` 傳入評估 ID

Astro 的 `define:vars` 會把值序列化成 JSON 字串注入 inline script，避免手動拼接字串造成跳脫問題。代價是 `gtag` 函式被包在 IIFE 中，不會掛在 `window` 上；目前不送自訂事件，所以不影響。之後若要送自訂事件，需要把 `gtag` 掛到 `window`。

### 評估 ID 格式驗證為 `^G-[A-Z0-9]+$`

GA4 評估 ID 一律是 `G-` 開頭加大寫英數字。最常見的錯誤是貼成舊版 Universal Analytics 的 `UA-` ID，這個格式可以擋下來。

### 隱私權政策的第三方服務說明一律依設定值出現

AdSense 段落和 GA 段落採同一規則：對應的設定值有填才輸出。另一個做法是保留 AdSense 段落、等申請時再手動刪改，但那會讓隱私權政策在申請前描述不存在的廣告，而且容易忘記同步。申請 AdSense 時本來就要先填發布商 ID 讓網站載入驗證程式碼，所以審核人員看到的頁面一定包含 AdSense 說明。

## Implementation Contract

**In scope:**

- `siteConfig.ga4MeasurementId` 欄位，以及匯出的 `ga4Enabled` 布林值。
- 格式錯誤時 `site.config.ts` 在載入時拋出錯誤，訊息包含 `ga4MeasurementId`，讓 `astro build` 失敗。
- 共用外框 `BaseLayout` 在 `ga4Enabled` 時輸出 gtag.js 外部 script（`async`）與初始化 inline script，所以每一頁剛好一次。
- 隱私權政策頁在 `ga4Enabled` 時輸出「流量分析」段落，含 Google Analytics、cookie 說明與 `https://tools.google.com/dlpage/gaoptout` 連結。
- 隱私權政策頁的「廣告與 cookie」段落（AdSense、廣告設定連結、歐洲同意訊息說明）只在 `adsenseEnabled` 時輸出；其他段落（留言、Google Fonts、Firebase、瀏覽器儲存、聯絡方式）不受影響。
- 測試工具的 `FULL_CONFIG` 啟用 GA（`G-TEST123456`），讓全功能建置涵蓋 GA。

**Out of scope:** 同意橫幅、自訂事件、Firebase 安全標頭（目前 CSP 只設 `frame-ancestors`，不擋外部 script）。

**Acceptance:**

- `npm test` 全部通過，包含：每頁一次 GA script、ID 為空時不輸出 GA 程式碼與文字、ID 為 `UA-1234` 時建置失敗並指出欄位、隱私權頁有停用外掛連結、AdSense ID 為空時隱私權頁不提到 AdSense、AdSense ID 有設定時隱私權頁有廣告設定連結。
- 在瀏覽器開啟建置後的頁面，網路請求中出現 `google-analytics.com/g/collect`，`tid` 等於設定的評估 ID、`en=page_view`。

## Risks / Trade-offs

- [本機預覽也會送出 page_view，污染統計] → 影響很小，可在 GA4 設定內部流量篩選器排除；本次不處理。
- [GA 使用 cookie，歐洲訪客理論上需要同意] → 讀者主要在台灣；等開 AdSense 時由 AdSense 的同意訊息一併處理。
