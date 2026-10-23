## 1. 發布邊界

- [x] 1.1 為 `Article content file format` 與 `Discovery outputs expose only published articles` 增加 production build 測試，證明未來文章不產生頁面、不進入首頁、文章列表、標籤、RSS、sitemap 或前後篇導覽，而已到時間文章維持正常輸出；以 `node --test tests/content.test.mjs tests/site.test.mjs` 驗證測試先能辨識缺少的行為。
- [x] 1.2 依「以共用文章查詢作為正式發布邊界」及 Implementation Contract 的 Behavior、Interface and data shape、Failure modes、Scope boundaries，在 `getPosts()` 集中實作 production 時間篩選並保留 dev 預覽；以 1.1 的測試與 `npm run build` 驗證公開集合、排序和 frontmatter 失敗行為。

## 2. 自動部署

- [x] 2.1 為 `Daily scheduled production deployment` 增加 workflow 靜態測試，檢查 `main` push、`workflow_dispatch`、`Asia/Taipei` 以及 08:01、08:11、08:21 三次執行機會；以指定的 Node 測試檔驗證排程契約。
- [x] 2.2 依「在發布時間後安排三次部署機會」及 Implementation Contract 的 Acceptance criteria 更新正式部署 workflow，讓三種觸發共用既有測試、建置與 Firebase 部署工作；以 2.1 的測試與 YAML 內容檢查驗證。

## 3. 作者工作流程與整體驗證

- [x] 3.1 依「區分本機草稿與排程完成稿」及「以帶時區的完整日期作為排程介面」實作 `Local drafts and scheduled completed articles are separate`：讓根目錄 `drafts/` 維持 gitignored，並在 README 說明本機草稿、`src/content/posts/` 完成稿、`+08:00` 日期格式與雲端無法讀取純本機檔案的限制；以 `git check-ignore drafts/example.md` 和 README 內容測試驗證。
- [x] 3.2 檢查 Risks / Trade-offs 與 Migration Plan 所需的發布及回復行為，執行 `npm test`、`npm run build`、`spxa analyze scheduled-post-publishing --json` 和 `spxa validate scheduled-post-publishing`，確認全部測試通過且 Spectra 沒有 Critical 或 Warning。

## 4. 避免無效與重複補跑

- [x] 4.1 [after: 3.2] 為 `Daily scheduled production deployment` 的新增分支建立測試：沒有當日到期文章時跳過、有到期文章且沒有成功 run 時部署、已有涵蓋最新文章的成功 run 時跳過、只有較早或失敗 run 時重試、run-history 查詢失敗時 fail-open；以 `node --test tests/scheduled-publish.test.mjs tests/deployment.test.mjs` 驗證目前缺少的判斷會被測試指出。
- [x] 4.2 [after: 4.1] 依「只在有到期文章且尚未成功部署時補跑」及 Implementation Contract 的 Behavior、Interface and data shape、Failure modes、Acceptance criteria、Scope boundaries，實作排程判斷腳本與 workflow 的 `actions: read`、concurrency 和條件式昂貴步驟；以 4.1 的測試驗證無文章和首次成功後不再部署，而失敗與 API 錯誤仍會補跑。
- [x] 4.3 [after: 4.2] 更新 README 說明智慧補跑結果，並執行 `npm test`、`npm run check`、`npm run build`、`spxa analyze scheduled-post-publishing --json`、`spxa validate scheduled-post-publishing`，確認文件與實際行為一致且 Spectra 沒有 Critical 或 Warning。
