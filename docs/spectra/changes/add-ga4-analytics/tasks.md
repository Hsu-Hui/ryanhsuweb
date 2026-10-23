## 1. 設定與驗證

- [ ] 1.1 在 `src/site.config.ts` 新增 `ga4MeasurementId` 並匯出 `ga4Enabled`，依「評估 ID 格式驗證為 `^G-[A-Z0-9]+$`」：空字串時 `ga4Enabled` 為 false，非空但格式錯誤時拋出包含 `ga4MeasurementId` 的錯誤。驗證：`tests/config.test.mjs` 的「ga4MeasurementId 格式錯誤時建置失敗並指出欄位」通過。

## 2. 載入 GA4

- [ ] 2.1 [after: 1.1] 實作 Analytics script loading from configuration：依「直接嵌入 gtag.js，而不是用 Partytown 或 GTM 容器」與「用 `define:vars` 傳入評估 ID」，在 `src/layouts/BaseLayout.astro` 的 `<head>` 於 `ga4Enabled` 時輸出 async 的 gtag.js script 與初始化 inline script，讓每一頁剛好載入一次。驗證：`tests/site.test.mjs` 的「每一頁剛好載入一次 GA4 script，並以評估 ID 設定」與 `tests/config.test.mjs` 的「AdSense、GA4、giscus、GitHub 設定為空時都不輸出」通過；在瀏覽器預覽中，網路請求出現 `google-analytics.com/g/collect`，`tid` 等於評估 ID 且 `en=page_view`。

## 3. 隱私權政策

- [ ] 3.1 [after: 1.1] 實作 Privacy policy discloses analytics：`src/pages/privacy.astro` 在 `ga4Enabled` 時輸出「流量分析」段落，說明 Google Analytics 與 cookie，並連到 `https://tools.google.com/dlpage/gaoptout`；GA 停用時不出現 `Google Analytics` 字樣。驗證：`tests/site.test.mjs` 的「隱私權政策說明使用 Google Analytics」與 `tests/config.test.mjs` 的空設定測試通過。

## 4. 測試設定

- [ ] 4.1 [after: 2.1, 3.1] 在 `tests/helpers/build-site.mjs` 的 `FULL_CONFIG` 加入 `ga4MeasurementId: 'G-TEST123456'`，讓全功能建置涵蓋 GA4。驗證：`npm test` 全部通過。
