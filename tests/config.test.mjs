// 設定值為空或格式錯誤時，相關功能要關閉或讓建置失敗。
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSite, FULL_CONFIG } from './helpers/build-site.mjs';

const POSTS = { a: { data: { title: 'Post A', description: 'D', pubDate: '2026-01-01', tags: ['astro'] } } };

test('AdSense、giscus、GitHub 設定為空時都不輸出', () => {
  const site = buildSite({ posts: POSTS, config: { ...FULL_CONFIG, adsenseClientId: '', categoryId: '', githubUrl: '' } });
  try {
    assert.ok(site.ok, site.output);
    assert.equal(site.exists('ads.txt'), false);
    for (const file of site.htmlFiles()) {
      const html = site.read(file);
      assert.doesNotMatch(html, /adsbygoogle/, file);
      assert.doesNotMatch(html, /giscus\.app\/client\.js/, file);
    }
    const about = site.read('about.html');
    assert.match(about, /href="mailto:me@example.dev"/);
    assert.doesNotMatch(about, /aria-label="GitHub"/);
  } finally {
    site.cleanup();
  }
});

test('信箱為空時只顯示 GitHub 圖示', () => {
  const site = buildSite({ posts: POSTS, config: { ...FULL_CONFIG, contactEmail: '' } });
  try {
    assert.ok(site.ok, site.output);
    const about = site.read('about.html');
    assert.doesNotMatch(about, /mailto:/);
    assert.match(about, /aria-label="GitHub"/);
  } finally {
    site.cleanup();
  }
});

test('adsenseClientId 格式錯誤時建置失敗並指出欄位', () => {
  const site = buildSite({ posts: POSTS, config: { ...FULL_CONFIG, adsenseClientId: 'pub-1234' } });
  try {
    assert.equal(site.ok, false);
    assert.match(site.output, /adsenseClientId/);
  } finally {
    site.cleanup();
  }
});
