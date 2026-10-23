// Threads 自動發文：frontmatter 解析、UTM 連結、草稿 Issue 的產生與解析。
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { describe, test } from 'node:test';
import {
  absoluteImageUrl,
  buildUtmUrl,
  isRecent,
  parseFrontmatter,
  parseIssueBody,
  renderIssueBody,
  slugFromIssueBody,
  threadsLength,
} from '../scripts/threads/lib.mjs';

describe('parseFrontmatter', () => {
  test('解析字串、日期與標籤陣列', () => {
    const { data, body } = parseFrontmatter('---\ntitle: 標題：副標\ndescription: "描述"\npubDate: 2026-10-23T09:00:00+08:00\ntags: [a, b-c]\n---\n\n內文');
    assert.deepEqual(data, { title: '標題：副標', description: '描述', pubDate: '2026-10-23T09:00:00+08:00', tags: ['a', 'b-c'] });
    assert.equal(body.trim(), '內文');
  });

  test('frontmatter 前面有空行也能解析', () => {
    assert.equal(parseFrontmatter('\n---\ntitle: A\n---\n').data.title, 'A');
  });

  test('現有每篇文章都能解析出標題、摘要與發布日期', async () => {
    const dir = new URL('../src/content/posts/', import.meta.url);
    for (const file of (await readdir(dir)).filter((name) => name.endsWith('.md'))) {
      const { data } = parseFrontmatter(await readFile(new URL(file, dir), 'utf8'));
      assert.ok(data.title && data.description, file);
      assert.ok(!Number.isNaN(new Date(data.pubDate).getTime()), file);
    }
  });
});

test('isRecent 只接受最近三天內、不在未來的日期', () => {
  const now = new Date('2026-10-23T12:00:00+08:00');
  assert.equal(isRecent('2026-10-23T09:00:00+08:00', now), true);
  assert.equal(isRecent('2026-10-20T13:00:00+08:00', now), true);
  assert.equal(isRecent('2026-10-20T11:00:00+08:00', now), false);
  assert.equal(isRecent('2026-10-24T09:00:00+08:00', now), false);
  assert.equal(isRecent('not a date', now), false);
});

test('buildUtmUrl 帶上 threads 來源與文章 slug', () => {
  assert.equal(
    buildUtmUrl('pokemon-daily-dashboard'),
    'https://ryan-hsu.com/pokemon-daily-dashboard?utm_source=threads&utm_medium=social&utm_campaign=pokemon-daily-dashboard',
  );
});

test('absoluteImageUrl 把站內路徑轉成完整網址，空值回傳空字串', () => {
  assert.equal(absoluteImageUrl('/images/a/cover.png'), 'https://ryan-hsu.com/images/a/cover.png');
  assert.equal(absoluteImageUrl('https://cdn.example.com/x.png'), 'https://cdn.example.com/x.png');
  assert.equal(absoluteImageUrl(undefined), '');
});

test('threadsLength 把 emoji 算成一個字', () => {
  assert.equal(threadsLength('看👉'), 2);
});

describe('草稿 Issue', () => {
  const draft = { slug: 'my-post', main: '主文第一段\n\n你覺得呢？\n\n#智能家居', reply: '完整過程 👉 https://ryan-hsu.com/my-post', alternative: '另一個角度' };

  test('產生後能解析回主文、留言與 slug，備選主文不會被發出', () => {
    const body = renderIssueBody(draft);
    assert.equal(slugFromIssueBody(body), 'my-post');
    assert.deepEqual(parseIssueBody(body), { main: draft.main, reply: draft.reply, imageUrl: '', errors: [] });
  });

  test('封面圖網址能解析回來，Issue 裡同時有圖片預覽', () => {
    const imageUrl = 'https://ryan-hsu.com/images/my-post/cover.png';
    const body = renderIssueBody({ ...draft, imageUrl });
    assert.match(body, /!\[封面圖\]\(https:\/\/ryan-hsu\.com\/images\/my-post\/cover\.png\)/);
    const parsed = parseIssueBody(body);
    assert.equal(parsed.imageUrl, imageUrl);
    assert.equal(parsed.main, draft.main);
  });

  test('把封面圖網址和預覽刪掉就只發文字', () => {
    const body = renderIssueBody({ ...draft, imageUrl: 'https://ryan-hsu.com/a.png' })
      .replace('https://ryan-hsu.com/a.png\n', '')
      .replace('![封面圖](https://ryan-hsu.com/a.png)', '');
    assert.equal(parseIssueBody(body).imageUrl, '');
  });

  test('在 GitHub 網頁編輯後的 CRLF 換行也能解析', () => {
    const { main, errors } = parseIssueBody(renderIssueBody(draft).replace(/\n/g, '\r\n'));
    assert.equal(main, draft.main);
    assert.deepEqual(errors, []);
  });

  test('主文被刪空或超過 500 字時回報錯誤', () => {
    assert.match(parseIssueBody(renderIssueBody({ ...draft, main: ' ' })).errors.join(), /主文/);
    assert.match(parseIssueBody(renderIssueBody({ ...draft, main: '字'.repeat(501) })).errors.join(), /501 字/);
  });
});
