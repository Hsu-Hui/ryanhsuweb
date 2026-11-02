// 首頁最新文章與跑馬燈的筆數。
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSite } from './helpers/build-site.mjs';

/** 產生 count 篇文章，p01 最舊、編號越大越新。 */
function makePosts(count) {
  return Object.fromEntries(
    Array.from({ length: count }, (_, i) => {
      const n = String(i + 1).padStart(2, '0');
      return [`p${n}`, { data: { title: `Post ${n}`, description: 'D', pubDate: `2026-01-${n}`, category: 'ai' } }];
    }),
  );
}

function homeLists(site) {
  const html = site.read('index.html');
  const latest = html.slice(html.indexOf('latest-heading'), html.indexOf('topics-heading'));
  const marquee = html.slice(html.indexOf('最新文章跑馬燈'), html.indexOf('latest-heading'));
  // 跑馬燈第一個 <ul> 裡沒有 aria-hidden 的 <li> 才是真正給讀者的連結。
  const firstList = marquee.slice(marquee.indexOf('<ul'), marquee.indexOf('</ul>'));
  return {
    latest: [...latest.matchAll(/data-post="([^"]+)"/g)].map((m) => m[1]),
    marquee: [...firstList.matchAll(/<li(?![^>]*aria-hidden)[^>]*>\s*<a href="\/([^"]+)"/g)].map((m) => m[1]),
  };
}

const cases = [
  { count: 1, latest: ['p01'], marquee: ['p01'] },
  { count: 10, latest: ['p10', 'p09', 'p08', 'p07', 'p06', 'p05'], marquee: ['p10', 'p09', 'p08', 'p07', 'p06', 'p05', 'p04', 'p03'] },
];

for (const { count, latest, marquee } of cases) {
  test(`${count} 篇文章：最新文章最多 6 篇、跑馬燈最多 8 篇`, () => {
    const site = buildSite({ posts: makePosts(count) });
    try {
      assert.ok(site.ok, site.output);
      assert.deepEqual(homeLists(site), { latest, marquee });
    } finally {
      site.cleanup();
    }
  });
}
