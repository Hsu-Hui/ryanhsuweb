## 1. 草稿產生

- [x] 1.1 `scripts/threads/lib.mjs`：frontmatter 解析、UTM 連結、草稿 Issue 的產生與解析。驗證：`tests/threads.test.mjs` 通過。
- [x] 1.2 `scripts/threads/draft.mjs`（plan／create）與 `threads-draft.yml`：部署成功後挑出新文章，由 Claude Code GitHub Action 用 Pro 訂閱權杖寫草稿 JSON，再開成 Issue 並通知 Discord；可手動指定 slug。驗證：以模擬的 GitHub、Discord API 執行，確認只處理 2026-10-24 之後的文章、已有草稿的文章不重複開 Issue、Claude 沒寫出草稿時通知 Discord 並讓 workflow 失敗。

## 2. 發文

- [x] 2.1 `scripts/threads/publish.mjs` 與 `threads-publish.yml`：草稿 Issue 由 repo 擁有者加上 `publish` 標籤時，發主文與回覆留言、留言貼文連結並關閉 Issue。驗證：以模擬 API 執行成功與草稿錯誤兩種情況。
- [ ] 2.2 設定 4 個 GitHub Secrets 後，用手動執行 `Threads 草稿` 替一篇文章產生草稿並實際發文一次。

## 3. 權杖檢查

- [x] 3.1 `scripts/threads/check-token.mjs` 與 `threads-token-check.yml`：每週檢查權杖，失效時通知 Discord。

## 4. 封面圖

- [x] 4.1 草稿 Issue 加入「封面圖」段落（frontmatter `cover` 的完整網址加上圖片預覽），發文時有網址就以 `IMAGE` 貼文附上封面，刪掉就只發文字；發布前輪詢容器狀態，圖片處理完成才發布。驗證：`tests/threads.test.mjs` 的封面圖測試通過，以模擬 API 確認主文帶 `image_url`、留言仍是 `TEXT`。
