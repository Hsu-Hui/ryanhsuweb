## Why

網站上線後完全不知道有沒有人看文章：Firebase Hosting 不提供每頁瀏覽數，Search Console 只記錄從 Google 搜尋進來的流量。需要一個能統計所有來源（搜尋、社群分享、直接輸入網址）瀏覽數的工具，而且之後要開 AdSense，選同屬 Google 的 GA4 最順。

## What Changes

- `src/site.config.ts` 新增 `ga4MeasurementId` 設定欄位（GA4 評估 ID，格式為 `G-` 加大寫英數字）。留空時不載入 GA；非空但格式錯誤時建置失敗，錯誤訊息指出 `ga4MeasurementId`。
- 設定 ID 後，每一頁的 `<head>` 載入一次 `https://www.googletagmanager.com/gtag/js?id=<ID>`，並以該 ID 呼叫 `gtag('config', …)`，送出預設的 page_view。
- 隱私權政策 `/privacy` 在 GA 啟用時新增「流量分析」段落，說明使用 Google Analytics 與 cookie，並連到 Google Analytics 停用外掛 `https://tools.google.com/dlpage/gaoptout`。GA 停用時不出現這段文字。

## Non-Goals

- 不做網站自己的 cookie 同意橫幅；沿用 adsense-readiness 規格「只依賴 AdSense 隱私權與訊息功能」的決定。
- 不送自訂事件（例如點擊、捲動深度），只用 GA4 預設的 page_view 與加強型評估。
- 不改用 Cloudflare Web Analytics 等無 cookie 方案；選 GA4 是為了之後與 AdSense、Search Console 連結。

## Capabilities

### New Capabilities

- `site-analytics`: 由單一設定值控制 GA4 流量統計的載入、設定驗證，以及隱私權政策中的對應說明。

### Modified Capabilities

(none)

## Impact

- Affected specs: site-analytics（新增）
- Affected code:
  - src/site.config.ts
  - src/layouts/BaseLayout.astro
  - src/pages/privacy.astro
  - tests/helpers/build-site.mjs
  - tests/config.test.mjs
  - tests/site.test.mjs
- 外部服務：瀏覽器會向 www.googletagmanager.com 與 www.google-analytics.com 發出請求。
