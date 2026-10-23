## Context

網站以 Astro 產生純靜態檔案，再由 GitHub Actions 部署到 Firebase Hosting。現在 `getPosts()` 會回傳所有 `src/content/posts/` 文章，因此未來日期也會產生文章網址並進入首頁、標籤、RSS 與 sitemap。靜態檔案在部署後不會於 08:00 自行改變；要讓文章準時出現，必須在發布時間之後重新建置並部署。

作者同時需要兩種未公開狀態：仍在撰寫的草稿只留在本機；已完成且要自動發布的文章則必須先進入預設分支，讓 GitHub Actions 到時間時能取得內容。這兩種狀態不能混為一談。排程提供三次執行機會，但不能在沒有到期文章或第一次已成功後繼續浪費建置與部署。

## Goals / Non-Goals

**Goals:**

- 正式建置完整排除尚未到 `pubDate` 的文章，包含直接網址和所有探索輸出。
- 本機開發伺服器能預覽未來文章。
- 每天台灣時間 08:00 後儘快部署，並在 08:30 前提供多次執行機會。
- 沒有到期文章或已有涵蓋最新到期文章的成功部署時，排程不執行測試、建置或 Firebase 部署。
- 明確記錄本機草稿、排程完成稿和立即發布文章的操作方式。

**Non-Goals:**

- 不導入 CMS、資料庫或常駐伺服器。
- 不在瀏覽器端用 JavaScript 隱藏文章；未發布文章不得先存在正式輸出。
- 不宣稱 GitHub Actions 能保證準時完成；排程服務仍可能延遲或中斷。
- 不讓 workflow 自動提交、合併或修改文章檔案。
- 不建立永久部署狀態檔或把執行標記提交回 repository。

## Decisions

### 以共用文章查詢作為正式發布邊界

`getPosts()` 繼續作為所有文章頁、列表、標籤和 RSS 的單一資料入口。正式建置時只回傳 `pubDate <= 建置當下時間` 的文章，本機 `astro dev` 則回傳所有文章供作者預覽。這可讓文章路由、前後篇導覽、標籤數量、RSS 與 sitemap 使用同一份公開集合，避免每個頁面各自判斷而產生洩漏。

替代方案是在各頁面個別篩選，但容易漏掉 RSS、標籤或直接文章路由，因此不採用。另一個替代方案是在瀏覽器端到時間才顯示，但靜態 HTML 和直接網址仍會提前公開，因此不採用。

### 區分本機草稿與排程完成稿

新增根目錄 `drafts/` 作為作者本機草稿位置並加入 `.gitignore`。草稿完成後，作者將檔案移至 `src/content/posts/`、填入含 `+08:00` 的未來 `pubDate` 並推送到 `main`，才進入自動發布流程。

這項設計保證未完成草稿不離開本機，也承認全自動部署的必要條件：GitHub Actions 只能建置已存在於遠端預設分支的完成稿。排程完成稿雖存在 GitHub，但正式建置會在時間到達前排除它。

### 只在有到期文章且尚未成功部署時補跑

**Supersedes**: scheduled-post-publishing / 在發布時間後安排三次部署機會

正式 workflow 保留 `main` push，另加入 `workflow_dispatch` 和台灣時間每日 08:01、08:11、08:21 的排程。三個排程進入同一個 concurrency group，不取消進行中的部署，使後到的補跑必須等待前一個結束後才開始判斷。

排程啟動後，唯讀腳本掃描 `src/content/posts/*.md` 的 `pubDate`，只把台灣日期等於今天且時間已到的文章視為本次到期文章。沒有到期文章時直接結束。存在到期文章時，腳本透過 GitHub Actions API 查詢同一個正式 workflow 的成功紀錄；只要找到一個 `run_started_at` 大於或等於最新到期文章 `pubDate` 的成功執行，便代表該完成稿已由時間到達後的建置涵蓋，後續補跑跳過。

使用 `run_started_at` 而不是完成時間，避免一個在 08:00 前開始、文章仍被排除，但在 08:00 後才結束的部署被誤判為已發布。若先前執行失敗、仍在等待或沒有成功紀錄，補跑照常部署。GitHub API 查詢失敗時採 fail-open，照常部署並顯示 warning，優先避免漏發文章。

替代方案是每天無條件部署三次，但會在沒有文章或首次成功後浪費 Actions 與 Firebase 發布。另一個替代方案是以 cache 當成功標記，但 cache 可能被淘汰且不是部署紀錄，因此採用唯讀的 workflow run 歷史。

### 以帶時區的完整日期作為排程介面

排程文章使用 ISO 8601 格式，例如 `2026-11-01T08:00:00+08:00`。程式以 Date 的絕對時間比較，不依賴 GitHub runner 的系統時區。僅日期格式仍保持合法，適合立即發布或不需要精確時間的既有文章。

## Implementation Contract

### Behavior

- `npm run build`、Pull Request 預覽建置與正式部署都不得輸出 `pubDate` 晚於建置時間的文章頁，也不得將它列入首頁、文章列表、標籤頁、RSS、sitemap 或前後篇導覽。
- `npm run dev` 必須保留未來文章，供本機預覽。
- `pubDate` 等於或早於建置時間的文章必須維持既有排序與輸出行為。
- 正式部署必須可由 `main` push、手動操作及每日三個 Asia/Taipei 排程觸發；push 與手動操作維持立即執行。
- 排程在今天沒有已到時間的文章時不得執行測試、建置或 Firebase 部署。
- 排程在找到一個開始時間不早於最新到期文章且已成功的正式 workflow run 時不得重複部署。
- 前一次失敗、尚未成功或 Actions API 無法查詢時，排程必須執行部署。
- `drafts/` 內容不得被 Git 追蹤，也不得參與 Astro content collection。

### Interface and data shape

- 文章仍使用既有 `pubDate: date` frontmatter，不增加另一個互相衝突的發布欄位。
- 精確排程格式為 `YYYY-MM-DDTHH:mm:ss+08:00`。
- GitHub Actions schedule 使用 `timezone: Asia/Taipei`，cron 分鐘為 1、11、21，小時為 8。
- 排程判斷腳本以 `GITHUB_OUTPUT` 輸出 `should_deploy=true|false` 與人類可讀的 `reason`。
- GitHub API 查詢使用 `GITHUB_TOKEN`、`GITHUB_REPOSITORY` 和目前 workflow 檔名，並忽略目前的 `GITHUB_RUN_ID`。
- workflow 只增加 `actions: read` 與既有的 `contents: read` 權限。
- 文件流程定義兩個位置：`drafts/<slug>.md` 是本機草稿；`src/content/posts/<slug>.md` 是可由建置系統讀取的文章。

### Failure modes

- frontmatter 無效時仍由 content schema 讓建置失敗，不因文章在未來而忽略驗證錯誤。
- GitHub 排程延遲時不提前公開文章；後續排程會再次嘗試判斷與建置。
- 完成稿若未在發布前推送到 `main`，自動部署不得假裝成功發布，下一次 push 或仍在發布窗口內的排程才會取得它。
- Actions API 回應失敗、格式錯誤或 token 不可用時，腳本輸出 warning 並設定 `should_deploy=true`。
- 找到先前失敗或尚未完成的 run 不得視為成功；只有 `conclusion=success` 且 `run_started_at >= 最新到期時間` 才能跳過。
- 時間比較不得使用 runner 的本地日期，台灣日期一律由 `Asia/Taipei` 計算。

### Acceptance criteria

- 測試建置包含一篇過去文章和一篇遠未來文章時，只產生過去文章的頁面，所有列表、RSS 與 sitemap 都找不到未來文章及其專屬標籤。
- 排程判斷測試覆蓋：今天沒有到期文章、今天有到期文章且沒有成功 run、已有涵蓋最新文章的成功 run、只有較早或失敗 run、Actions API 查詢失敗。
- workflow 靜態測試確認 push、手動觸發、三個 Asia/Taipei 排程、concurrency、唯讀 Actions 權限及所有昂貴步驟的條件式執行。
- 既有完整測試、`npm run check` 與 `npm run build` 通過。
- README 說明無文章與已成功時會跳過補跑，以及純本機檔案不能由 CI 發布。

### Scope boundaries

範圍包含文章集合篩選、排程判斷腳本、唯讀 workflow run 查詢、部署觸發、測試與作者文件。範圍不包含自動 git push、自動合併、CMS、通知、Firebase 預覽頻道預建後切換、永久部署狀態資料，以及對已發布 HTML 做瀏覽器端計時顯示。

## Risks / Trade-offs

- [GitHub Actions 排程可能延遲或被略過] → 在 08:01、08:11、08:21 提供三次機會，並保留手動觸發；文件不承諾硬性 SLA。
- [Actions API 暫時不可用] → fail-open 執行部署，可能多部署一次但不會因此漏發文章。
- [前一次排程尚未完成] → concurrency 讓補跑等待，待前一次結束後重新查詢成功紀錄。
- [未來完成稿存在遠端原始碼] → 正式輸出完整排除；真正敏感或未完成內容維持在 gitignored `drafts/`。
- [本機 dev 與 production build 看到的文章集合不同] → README 明確說明，並以 production build 測試公開邊界。
- [使用僅日期的 `pubDate` 無法表達台灣 08:00] → 排程文章文件要求完整 ISO 8601 與 `+08:00`。

## Migration Plan

1. 保留現有 production 發布時間篩選與測試。
2. 在三個排程前加入到期文章檢查、唯讀 run 歷史查詢與 concurrency；push 和手動觸發維持原行為。
3. 更新 README 並執行完整測試。若判斷腳本異常，可先移除排程步驟條件恢復三次無條件補跑；文章時間篩選仍保留，避免未來文章提前公開。

## Open Questions

無。查詢失敗的安全策略已選擇 fail-open，以發布可靠性優先於節省重複部署。
