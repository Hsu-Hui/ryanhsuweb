## Why

手機上首頁「最新文章」和文章頁的列表是一行一篇：日期、標題、標籤擠在同一行，標題被壓成很窄的一直排，很難閱讀，也看不到文章在講什麼。

## What Changes

- 首頁「最新文章」與文章頁 `/posts` 共用的文章列，在 768px 以下改成由上到下：日期、標題、引文（文章 `description`，最多兩行）、標籤。
- 768px 以上維持原本一行一篇（日期｜標題｜標籤）的排版，不顯示引文。

## Non-Goals (optional)

- 不改網頁版的排版。
- 不改標籤頁 `/tags/<tag>` 的卡片。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `site-discovery`: 新增文章列在窄螢幕與寬螢幕的排版需求

## Impact

- 修改 `src/components/PostRow.astro`（首頁與 `/posts` 共用）。
- 測試 `tests/site.test.mjs` 新增引文的檢查。
