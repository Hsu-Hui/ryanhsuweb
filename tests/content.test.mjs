// blog-posts：frontmatter 驗證範例表與保留 slug。
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSite } from './helpers/build-site.mjs';

const valid = { title: 'A', description: 'D', pubDate: '2026-10-21', category: 'ai' };

const cases = [
  { name: '完整的 frontmatter 建置成功', data: valid, ok: true },
  { name: '缺少 pubDate 時失敗並指出欄位', data: { title: 'A', description: 'D' }, ok: false, field: 'pubDate' },
  { name: 'pubDate 不是日期時失敗並指出欄位', data: { ...valid, pubDate: 'not a date' }, ok: false, field: 'pubDate' },
  { name: '缺少 category 時失敗並指出欄位', data: { title: 'A', description: 'D', pubDate: '2026-10-21' }, ok: false, field: 'category' },
  { name: 'category 不在分類清單時失敗並指出欄位', data: { ...valid, category: 'AI' }, ok: false, field: 'category' },
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

test('正式建置完整排除尚未到發布時間的文章', () => {
  const site = buildSite({
    posts: {
      published: {
        data: {
          title: '已發布文章',
          description: '已經可以公開',
          pubDate: '2020-01-01T08:00:00+08:00',
          category: 'ai',
          tags: ['published'],
        },
      },
      scheduled: {
        data: {
          title: '排程文章',
          description: '尚未公開',
          pubDate: '2099-01-01T08:00:00+08:00',
          category: 'ai',
          tags: ['scheduled-only'],
        },
      },
    },
  });

  try {
    assert.equal(site.ok, true, site.output);
    assert.equal(site.exists('published.html'), true);
    assert.equal(site.exists('scheduled.html'), false);
    assert.equal(site.exists('tags/scheduled-only.html'), false);

    for (const file of ['index.html', 'posts.html', 'tags.html', 'rss.xml', 'sitemap-0.xml', 'published.html']) {
      const output = site.read(file);
      assert.doesNotMatch(output, /排程文章|scheduled-only|\/scheduled(?:[<"/]|$)/, `${file} 洩漏未發布文章`);
    }
  } finally {
    site.cleanup();
  }
});
