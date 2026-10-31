// blog-posts：文章頁底部的相關文章。
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { buildSite } from './helpers/build-site.mjs';

const post = (title, pubDate, tags = []) => ({ data: { title, description: `Desc ${title}`, pubDate, tags } });

/** 相關文章區塊的 HTML；沒有區塊時回傳 undefined。 */
function relatedHtml(html) {
  return html.match(/<section aria-label="相關文章"[\s\S]*?<\/section>/)?.[0];
}

/** 相關文章區塊裡卡片的 slug，依頁面順序。 */
function relatedIds(html) {
  const section = relatedHtml(html);
  return section ? [...section.matchAll(/data-post="([^"]+)"/g)].map((m) => m[1]) : [];
}

// spec「Related articles」範例。由舊到新：A、B、C、D、O、X、N，所以 X 的上一篇是 O、下一篇是 N。
describe('相同 tag 越多越前面，並排除上一篇與下一篇', () => {
  let site;
  before(() => {
    site = buildSite({
      posts: {
        x: post('X', '2026-01-10', ['ha', 'smart']),
        o: post('O', '2026-01-09', ['ha']),
        n: post('N', '2026-01-11', ['ha', 'smart']),
        a: post('A', '2026-01-01', ['ha', 'smart']),
        b: post('B', '2026-01-02', ['ha']),
        c: post('C', '2026-01-03', ['smart']),
        d: post('D', '2026-01-05', ['pokemon']),
        // 正式建置不輸出未來文章，所以即使 tag 完全相同也不會被推薦。
        future: post('Future', '2099-01-01', ['ha', 'smart']),
      },
    });
    assert.ok(site.ok, site.output);
  });
  after(() => site.cleanup());

  test('X 的相關文章依序是 A、C、B', () => {
    assert.deepEqual(relatedIds(site.read('x.html')), ['a', 'c', 'b']);
  });

  test('未來文章不出現在任何相關文章', () => {
    for (const file of site.htmlFiles()) assert.ok(!relatedIds(site.read(file)).includes('future'), file);
  });

  test('卡片連到文章頁，並顯示標題、引文與日期', () => {
    const card = relatedHtml(site.read('x.html')).match(/<li[^>]*data-post="a"[\s\S]*?<\/li>/)[0];
    assert.match(card, /href="\/a"/);
    assert.match(card, />A</);
    assert.match(card, />Desc A</);
    assert.match(card, />2026-01-01</);
  });

  test('相關文章在上一篇／下一篇之後、留言區之前', () => {
    const html = site.read('x.html');
    const nav = html.indexOf('data-nav="next"');
    const related = html.indexOf('aria-label="相關文章"');
    const comments = html.indexOf('留言討論');
    assert.ok(nav !== -1 && related !== -1 && comments !== -1);
    assert.ok(nav < related && related < comments);
  });
});

describe('有相同 tag 的不足 3 篇時，用最新文章補滿', () => {
  let site;
  before(() => {
    site = buildSite({
      posts: {
        x: post('X', '2026-01-10', ['ha']),
        o: post('O', '2026-01-09'),
        n: post('N', '2026-01-11'),
        a: post('A', '2026-01-01', ['ha']),
        b: post('B', '2026-01-02', ['x']),
        c: post('C', '2026-01-03', ['y']),
        d: post('D', '2026-01-05', ['z']),
      },
    });
    assert.ok(site.ok, site.output);
  });
  after(() => site.cleanup());

  test('X 的相關文章依序是 A、D、C', () => {
    assert.deepEqual(relatedIds(site.read('x.html')), ['a', 'd', 'c']);
  });
});

describe('文章很少時有幾篇顯示幾篇，沒有就不顯示區塊', () => {
  let site;
  before(() => {
    site = buildSite({
      posts: {
        p: post('P', '2026-01-01'),
        q: post('Q', '2026-02-01'),
        r: post('R', '2026-03-01'),
      },
    });
    assert.ok(site.ok, site.output);
  });
  after(() => site.cleanup());

  test('P 只列出 R、R 只列出 P', () => {
    assert.deepEqual(relatedIds(site.read('p.html')), ['r']);
    assert.deepEqual(relatedIds(site.read('r.html')), ['p']);
  });

  test('Q 沒有相關文章區塊', () => {
    assert.equal(relatedHtml(site.read('q.html')), undefined);
  });
});
