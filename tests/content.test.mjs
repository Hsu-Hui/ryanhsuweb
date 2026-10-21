// blog-posts：frontmatter 驗證範例表與保留 slug。
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSite } from './helpers/build-site.mjs';

const valid = { title: 'A', description: 'D', pubDate: '2026-10-21' };

const cases = [
  { name: '完整的 frontmatter 建置成功', data: valid, ok: true },
  { name: '缺少 pubDate 時失敗並指出欄位', data: { title: 'A', description: 'D' }, ok: false, field: 'pubDate' },
  { name: 'pubDate 不是日期時失敗並指出欄位', data: { ...valid, pubDate: 'not a date' }, ok: false, field: 'pubDate' },
  { name: 'tags 不是陣列時失敗並指出欄位', data: { ...valid, tags: 'astro' }, ok: false, field: 'tags' },
];

for (const { name, data, ok, field } of cases) {
  test(`frontmatter：${name}`, () => {
    const site = buildSite({ posts: { 'zz-check': { data } } });
    try {
      assert.equal(site.ok, ok, site.output);
      if (!ok) {
        assert.match(site.output, /zz-check/, '錯誤訊息要指出檔案');
        assert.match(site.output, new RegExp(field), `錯誤訊息要指出欄位 ${field}`);
      }
    } finally {
      site.cleanup();
    }
  });
}

test('檔名和保留 slug 相同時建置失敗並列出檔名', () => {
  const site = buildSite({ posts: { posts: { data: valid } } });
  try {
    assert.equal(site.ok, false);
    assert.match(site.output, /posts\.md/);
  } finally {
    site.cleanup();
  }
});
