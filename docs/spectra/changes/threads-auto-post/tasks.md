## 1. 草稿產生

- [x] 1.1 `scripts/threads/lib.mjs`：frontmatter 解析、UTM 連結、草稿 Issue 的產生與解析。驗證：`tests/threads.test.mjs` 通過。
- [x] 1.2 `scripts/threads/draft.mjs` 與 `threads-draft.yml`：部署成功後替新文章產生草稿 Issue 並通知 Discord；可手動指定 slug。驗證：以模擬的 GitHub、Claude、Discord API 執行，確認只處理 2026-10-24 之後的文章、已有草稿的文章不重複開 Issue。

## 2. 發文

- [x] 2.1 `scripts/threads/publish.mjs` 與 `threads-publish.yml`：草稿 Issue 由 repo 擁有者加上 `publish` 標籤時，發主文與回覆留言、留言貼文連結並關閉 Issue。驗證：以模擬 API 執行成功與草稿錯誤兩種情況。
- [ ] 2.2 設定 4 個 GitHub Secrets 後，用手動執行 `Threads 草稿` 替一篇文章產生草稿並實際發文一次。

## 3. 權杖檢查

- [x] 3.1 `scripts/threads/check-token.mjs` 與 `threads-token-check.yml`：每週檢查權杖，失效時通知 Discord。
