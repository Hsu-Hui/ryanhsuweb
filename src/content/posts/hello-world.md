---
title: 用 Astro 打造技術部落格
description: 這個網站的第一篇文章：為什麼選 Astro、文章怎麼寫，以及網站的基本架構。
pubDate: 2026-10-21
tags: [astro, blog]
---

這是一篇範例文章，用來確認網站的文章頁、標籤和程式碼區塊都正常運作。

## 每篇文章就是一個 Markdown 檔

新增文章只要在 `src/content/posts/` 放一個 `.md` 檔，檔名就是網址。例如這篇是 `hello-world.md`，網址就是 `/hello-world`。

```ts
const site = {
  framework: 'astro',
  hosting: 'firebase',
};

console.log(`Built with ${site.framework}`);
```

## 內文可以直接寫 HTML

<figure>
  <img src="/images/hello-world/grid.svg" alt="網站背景使用的格線圖樣" width="640" height="200" />
  <figcaption>網站背景的格線圖樣</figcaption>
</figure>
