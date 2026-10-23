## Why

部落格每天都有新文章，但只靠搜尋引擎帶來的讀者很少。Threads 是目前最容易接觸到台灣讀者的地方，可是每篇都手動改寫成貼文、貼連結、記得加 UTM 很花時間，也容易忘記。

## What Changes

- 新文章部署到正式站後，自動用 Claude 依固定風格產生兩則 Threads 主文和一則附連結的留言，開成 GitHub Issue（標籤 `threads-draft`），並發 Discord 通知。
- 在 Issue 修改草稿後加上 `publish` 標籤，自動發到 Threads：先發主文，再用回覆主文的方式發附 UTM 連結的第一則留言，讓兩則在同一個討論串。
- 發文成功後在 Issue 留言貼文連結、關閉 Issue，並發 Discord 通知；草稿格式錯誤或發文失敗時，在 Issue 與 Discord 說明原因並拿掉 `publish` 標籤。
- 每週檢查 Threads 權杖是否仍可使用，失效時發 Discord 提醒。
- 連結一律帶 `utm_source=threads&utm_medium=social&utm_campaign=<slug>`，在 GA4 可以分出 Threads 流量。

## Non-Goals

- 不自動發文：每則貼文都要經過人工確認（加上 `publish` 標籤）。
- 不替 2026-10-24 以前的文章自動產生草稿；舊文章用 workflow 的手動執行補產生。
- 不自動續期 Threads 權杖（需要能寫入 GitHub Secret 的 PAT），只在失效時提醒。

## Impact

- 新增程式碼：scripts/threads/（lib、services、draft、publish、check-token、prompt.md）。
- 新增 workflow：threads-draft.yml、threads-publish.yml、threads-token-check.yml；既有部署 workflow 不變。
- 新增測試：tests/threads.test.mjs。
- 新增 devDependency：@anthropic-ai/sdk（只有產生草稿的 workflow 會用到）。
- 需要的 GitHub Secrets：THREADS_ACCESS_TOKEN、THREADS_USER_ID、DISCORD_WEBHOOK_URL、ANTHROPIC_API_KEY。
