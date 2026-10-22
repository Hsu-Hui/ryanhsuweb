// blog-posts：文章自動目錄。
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { buildSite, textOf } from './helpers/build-site.mjs';

const post = (body) => ({ data: { title: 'T', description: 'D', pubDate: '2026-01-01', tags: ['astro'] }, body });

// spec「Heading hierarchy and threshold」範例表：檔名 → 內文標題與預期的目錄（[層級, 文字]）。
const HIERARCHY = {
  'h-nested': { body: '## A\n\n### A1\n\n### A2\n\n## B\n', toc: [[1, 'A'], [2, 'A1'], [2, 'A2'], [1, 'B']] },
  'h-intro': { body: '### Intro\n\n## A\n\n### A1\n', toc: [[1, 'Intro'], [1, 'A'], [2, 'A1']] },
  'h-deep': { body: '## A\n\n#### A-deep\n\n## B\n', toc: [[1, 'A'], [1, 'B']] },
  'h-pair': { body: '## A\n\n### A1\n', toc: [[1, 'A'], [2, 'A1']] },
  'h-only': { body: '## Only\n', toc: null },
  'h-none': { body: '只有內文，沒有標題。\n', toc: null },
};

let site;
before(() => {
  const posts = Object.fromEntries(Object.entries(HIERARCHY).map(([slug, { body }]) => [slug, post(body)]));
  posts.install = post('## 安裝\n\n先安裝。\n\n## 設定\n\n再設定。\n');
  site = buildSite({ posts });
  assert.ok(site.ok, site.output);
});
after(() => site.cleanup());

/** 取出指定外觀（panel 或 collapsible）的目錄 HTML；沒有目錄時回傳 undefined。 */
function tocHtml(html, form) {
  const start = html.indexOf(`data-toc="${form}"`);
  if (start === -1) return undefined;
  const nav = html.slice(start).match(/<nav aria-label="目錄"[^>]*>([\s\S]*?)<\/nav>/);
  return nav?.[1];
}

/** 依 <ol> 的巢狀深度攤平成 [層級, 文字, href]。 */
function flatten(navHtml) {
  const entries = [];
  let depth = 0;
  for (const [token, href, text] of navHtml.matchAll(/<ol\b[^>]*>|<\/ol>|<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    if (token.startsWith('<ol')) depth += 1;
    else if (token === '</ol>') depth -= 1;
    else entries.push([depth, textOf(text), href]);
  }
  return entries;
}

/** 文章內文（不含留言區等其他區塊）裡 h2～h4 的 id 與文字。 */
function bodyHeadings(html) {
  const body = html.slice(html.indexOf('prose prose-themed'), html.indexOf('</article>'));
  return [...body.matchAll(/<h([2-4]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].map(([, , id, text]) => ({ id, text: textOf(text) }));
}

describe('目錄的階層與顯示門檻', () => {
  for (const [slug, { toc }] of Object.entries(HIERARCHY)) {
    test(`${slug}：${toc ? toc.map(([d, t]) => `${'  '.repeat(d - 1)}${t}`).join(' / ') : '不顯示目錄'}`, () => {
      const html = site.read(`${slug}.html`);
      if (toc === null) {
        assert.doesNotMatch(html, /aria-label="目錄"/);
        assert.doesNotMatch(html, /data-toc=/);
        return;
      }
      for (const form of ['panel', 'collapsible']) {
        const nav = tocHtml(html, form);
        assert.ok(nav, `缺少 ${form} 目錄`);
        assert.deepEqual(
          flatten(nav).map(([depth, text]) => [depth, text]),
          toc,
          form,
        );
      }
    });
  }
});

describe('目錄連結對應內文標題', () => {
  test('href 是 # 加上內文標題的 id，依文件順序排列', () => {
    const html = site.read('install.html');
    const headings = bodyHeadings(html);
    assert.deepEqual(
      headings.map((h) => h.text),
      ['安裝', '設定'],
    );
    for (const form of ['panel', 'collapsible']) {
      assert.deepEqual(
        flatten(tocHtml(html, form)).map(([, text, href]) => [text, href]),
        headings.map((h) => [h.text, `#${h.id}`]),
        form,
      );
    }
  });

  test('h3 的連結也對應內文的 id', () => {
    const html = site.read('h-nested.html');
    const ids = new Set(bodyHeadings(html).map((h) => `#${h.id}`));
    for (const [, , href] of flatten(tocHtml(html, 'panel'))) assert.ok(ids.has(href), href);
  });
});

describe('目前段落的判斷（spec「article with headings A, B, C」）', async () => {
  const { currentSectionIndex } = await import('../src/lib/toc.ts');
  const NAMES = ['A', 'B', 'C', 'none'];
  // [標題 A、B、C 頂端到視窗頂端的距離, 是否已經捲到底, 預期標示]
  const cases = [
    ['頁面頂端，A 在下方 300px', [300, 1100, 1900], false, 'none'],
    ['A 在 50px，B 還在視窗下方', [50, 950, 1750], false, 'A'],
    ['B 剛好在 96px', [-700, 96, 900], false, 'B'],
    ['C 在 400px 且已經捲到底', [-1500, -700, 400], true, 'C'],
    ['B 在 97px（還沒到線）', [-700, 97, 900], false, 'A'],
    // 排版會產生小數位置，捲動卻只能以整數像素移動，標題頂端到不了剛好 96.0px。
    ['B 在 96.48px（排版的小數位置）', [-700, 96.484375, 900], false, 'B'],
  ];
  for (const [name, tops, atBottom, expected] of cases) {
    test(`${name} → ${expected}`, () => {
      const index = currentSectionIndex(tops, atBottom);
      assert.equal(index === -1 ? 'none' : NAMES[index], expected);
    });
  }
});

describe('收合目錄的位置', () => {
  test('出現在標籤連結之後、內文第一個元素之前', () => {
    const html = site.read('install.html');
    const tags = html.indexOf('href="/tags/astro"');
    const collapsible = html.indexOf('data-toc="collapsible"');
    const body = html.indexOf('<h2 id=');
    assert.ok(tags !== -1 && collapsible !== -1 && body !== -1);
    assert.ok(tags < collapsible, '收合目錄要在標籤連結之後');
    assert.ok(collapsible < body, '收合目錄要在內文之前');
  });
});
