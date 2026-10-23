// 所有功能都開啟時的網站輸出：文章頁、列表、feed、SEO、AdSense、留言、主題判定。
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import vm from 'node:vm';
import { buildSite, textOf } from './helpers/build-site.mjs';

// 依發布日期由新到舊：B、C、A、D。由舊到新（上一篇／下一篇）：D、A、C、B。
const POSTS = {
  a: { data: { title: 'Post A', description: 'Desc A', pubDate: '2025-12-31', tags: ['astro'] } },
  b: {
    data: {
      title: 'Post B',
      description: 'Desc B',
      pubDate: '2026-03-01',
      updatedDate: '2026-03-05',
      tags: ['css'],
      cover: 'https://example.dev/cover.png',
    },
    body: '<figure><img src="/a.png" alt="A"><figcaption>A</figcaption></figure>\n\n```ts\nconst x = 1;\n```\n',
  },
  // UTC 20:00 是台北隔天 04:00，用來確認日期以台北時區顯示。
  c: { data: { title: 'Post C', description: 'Desc C', pubDate: '2026-01-14T20:00:00Z', tags: ['astro'] } },
  d: { data: { title: 'a </script> b', description: 'Desc D', pubDate: '2025-06-01' } },
};

let site;
before(() => {
  site = buildSite({ posts: POSTS });
  assert.ok(site.ok, site.output);
});
after(() => site.cleanup());

const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => ({ raw: m[1], data: JSON.parse(m[1]) }));
const postIds = (html) => [...html.matchAll(/data-post="([^"]+)"/g)].map((m) => m[1]);

describe('文章頁', () => {
  test('標題、描述、分享圖、canonical 與標籤連結', () => {
    const html = site.read('b.html');
    assert.match(html, /<title>Post B \| /);
    assert.match(html, /<meta name="description" content="Desc B">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/example.dev\/cover.png">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/example.dev\/b">/);
    assert.match(html, /href="\/tags\/css"/);
  });

  test('麵包屑顯示文章標題', () => {
    const crumb = site.read('b.html').match(/aria-label="麵包屑"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.equal(textOf(crumb), '~ / 文章 / Post B');
  });

  test('內文的 HTML 原樣保留，程式碼區塊有深色主題的顏色變數', () => {
    const html = site.read('b.html');
    assert.match(html, /<figure><img src="\/a.png" alt="A"><figcaption>A<\/figcaption><\/figure>/);
    assert.match(html, /class="astro-code[^"]*"[^>]*--shiki-dark/);
  });

  test('日期以台北時區顯示', () => {
    assert.match(site.read('c.html'), />2026-01-15<\/time>/);
  });

  test('上一篇／下一篇只連到相鄰的文章', () => {
    const nav = (id) => ({
      previous: site.read(`${id}.html`).match(/href="\/([^"]+)"[^>]*data-nav="previous"/)?.[1],
      next: site.read(`${id}.html`).match(/href="\/([^"]+)"[^>]*data-nav="next"/)?.[1],
    });
    assert.deepEqual(nav('d'), { previous: undefined, next: 'a' });
    assert.deepEqual(nav('a'), { previous: 'd', next: 'c' });
    assert.deepEqual(nav('b'), { previous: 'c', next: undefined });
  });
});

describe('BlogPosting 結構化資料', () => {
  test('欄位對應 frontmatter 與網站設定', () => {
    const [ld] = jsonLd(site.read('b.html'));
    assert.deepEqual(ld.data, {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Post B',
      description: 'Desc B',
      datePublished: '2026-03-01T00:00:00.000Z',
      dateModified: '2026-03-05T00:00:00.000Z',
      author: { '@type': 'Person', name: 'Ryan Hsu', url: 'https://example.dev/about' },
      image: 'https://example.dev/cover.png',
      mainEntityOfPage: 'https://example.dev/b',
      inLanguage: 'zh-TW',
      keywords: 'css',
    });
  });

  test('沒有 updatedDate 時 dateModified 等於 pubDate，沒有 cover 時不輸出 image', () => {
    const [ld] = jsonLd(site.read('a.html'));
    assert.equal(ld.data.dateModified, ld.data.datePublished);
    assert.equal('image' in ld.data, false);
  });

  test('標題含 </script> 時會轉義，頁面結構不被破壞', () => {
    const list = jsonLd(site.read('d.html'));
    assert.equal(list.length, 1);
    assert.match(list[0].raw, /\\u003c\/script>/);
    assert.equal(list[0].data.headline, 'a </script> b');
  });

  test('非文章頁不輸出 BlogPosting', () => {
    for (const page of ['index.html', 'about.html', 'posts.html']) {
      assert.doesNotMatch(site.read(page), /BlogPosting/, page);
    }
  });
});

describe('首頁', () => {
  const home = () => site.read('index.html');

  test('標題是網站描述，並保留完整的 aria-label', () => {
    const h1 = home().match(/<h1[^>]*>[\s\S]*?<\/h1>/)[0];
    assert.match(h1, /aria-label="Ryan Hsu 的技術筆記"/);
    assert.match(h1, /data-typewriter>Ryan Hsu 的技術筆記</);
  });

  test('最新文章由新到舊', () => {
    const latest = home().slice(home().indexOf('latest-heading'), home().indexOf('topics-heading'));
    assert.deepEqual(postIds(latest), ['b', 'c', 'a', 'd']);
  });

  test('文章列依序是日期、標題、引文、標籤（引文在窄螢幕顯示）', () => {
    for (const page of ['index.html', 'posts.html']) {
      const row = site.read(page).match(/<li[^>]*data-post="b"[\s\S]*?<\/li>/)[0];
      const order = ['<time', '>Post B<', '>Desc B<', '#css'].map((marker) => row.indexOf(marker));
      assert.ok(order.every((index) => index !== -1), `${page} 的文章列缺少內容`);
      assert.deepEqual([...order].sort((a, b) => a - b), order, `${page} 的文章列順序不對`);
    }
  });

  test('跑馬燈的複製內容對螢幕閱讀器與鍵盤隱藏', () => {
    const marquee = home().slice(home().indexOf('最新文章跑馬燈'), home().indexOf('latest-heading'));
    const copies = [...marquee.matchAll(/<(?:ul|li) aria-hidden="true"[\s\S]*?<\/(?:ul|li)>/g)].map((m) => m[0]);
    assert.ok(copies.length > 0);
    for (const copy of copies) {
      for (const link of copy.match(/<a [^>]*>/g) ?? []) assert.match(link, /tabindex="-1"/);
    }
  });

  test('依主題瀏覽連到文章頁的篩選', () => {
    assert.match(home(), /href="\/posts\?tag=astro"[^>]*>\s*#astro \(2\)/);
    assert.match(home(), /href="\/posts\?tag=css"[^>]*>\s*#css \(1\)/);
  });
});

describe('文章頁 /posts 與標籤頁', () => {
  test('依年份分組，年份與文章都由新到舊', () => {
    const html = site.read('posts.html');
    const order = [...html.matchAll(/data-year="(\d+)"|data-post="([^"]+)"/g)].map((m) => m[1] ?? m[2]);
    assert.deepEqual(order, ['2026', 'b', 'c', '2025', 'a', 'd']);
    assert.match(html, />01-15<\/time>/);
  });

  test('篩選按鈕沒有 JavaScript 時是標籤頁連結', () => {
    assert.match(site.read('posts.html'), /href="\/tags\/astro"[^>]*data-filter="astro"/);
  });

  test('標籤總表的篇數與各標籤頁的文章', () => {
    const tags = textOf(site.read('tags.html'));
    assert.match(tags, /#astro \(2\)/);
    assert.match(tags, /#css \(1\)/);
    assert.deepEqual(postIds(site.read('tags/astro.html')), ['c', 'a']);
    assert.deepEqual(postIds(site.read('tags/css.html')), ['b']);
  });
});

describe('sitemap、RSS 與 robots.txt', () => {
  test('sitemap 包含所有公開頁面，不含 404 與 /contact', () => {
    const urls = [...site.read('sitemap-0.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const path of ['/', '/posts', '/a', '/b', '/c', '/d', '/tags', '/tags/astro', '/about', '/privacy']) {
      assert.ok(urls.includes(new URL(path, 'https://example.dev').href), `sitemap 缺少 ${path}`);
    }
    assert.ok(!urls.some((url) => /404|contact/.test(url)));
  });

  test('RSS 依新到舊列出每篇文章，連結是絕對網址且不帶結尾斜線', () => {
    const rss = site.read('rss.xml');
    const links = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]);
    assert.deepEqual(links, ['b', 'c', 'a', 'd'].map((id) => `https://example.dev/${id}`));
  });

  test('robots.txt 允許所有爬蟲並指向 sitemap', () => {
    assert.equal(site.read('robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://example.dev/sitemap.xml\n');
  });

  test('站內網址除了首頁都不帶結尾斜線或 .html', () => {
    const files = [...site.htmlFiles(), 'sitemap-0.xml', 'rss.xml'];
    for (const file of files) {
      for (const [, url] of site.read(file).matchAll(/(?:href|src)="([^"#?]+)|<(?:loc|link)>([^<]+)</g)) {
        const path = url?.startsWith('https://example.dev') ? url.slice('https://example.dev'.length) : url;
        if (!path?.startsWith('/') || path.startsWith('//') || path.startsWith('/_astro/') || path === '/') continue;
        assert.ok(!path.endsWith('/') && !path.endsWith('.html'), `${file} 有不合規則的網址 ${url}`);
      }
    }
  });
});

describe('Google Analytics', () => {
  test('每一頁剛好載入一次 GA4 script，並以評估 ID 設定', () => {
    for (const file of site.htmlFiles()) {
      const html = site.read(file);
      const count = html.match(/googletagmanager\.com\/gtag\/js\?id=G-TEST123456/g)?.length ?? 0;
      assert.equal(count, 1, file);
      assert.match(html, /gtag\('config', ga4MeasurementId\)/, file);
      assert.match(html, /"G-TEST123456"/, file);
    }
  });

  test('隱私權政策說明使用 Google Analytics', () => {
    const html = site.read('privacy.html');
    assert.match(html, /Google Analytics/);
    assert.match(html, /href="https:\/\/tools\.google\.com\/dlpage\/gaoptout"/);
  });
});

describe('AdSense', () => {
  test('每一頁剛好載入一次 AdSense script', () => {
    for (const file of site.htmlFiles()) {
      const count = site.read(file).match(/adsbygoogle\.js\?client=ca-pub-1234567890123456/g)?.length ?? 0;
      assert.equal(count, 1, file);
    }
  });

  test('ads.txt 內容由發布商 ID 產生', () => {
    assert.equal(site.read('ads.txt').trim(), 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0');
  });

  test('不另外輸出自己的同意橫幅', () => {
    for (const file of site.htmlFiles()) {
      assert.doesNotMatch(site.read(file), /(?:id|class|data-[\w-]+)="[^"]*(?:consent|cookie-banner|cookie-notice)/, file);
    }
  });
});

describe('關於我、留言與舊的聯絡頁', () => {
  test('關於我有照片與兩個聯絡圖示', () => {
    const html = site.read('about.html');
    assert.match(html, /<img src="\/_astro\/[^"]+\.webp"[^>]*alt="我的貓 Julia"[^>]*width="\d+" height="\d+"/);
    assert.match(html, /href="mailto:me@example.dev" aria-label="寄信給 Ryan Hsu"/);
    assert.match(html, /href="https:\/\/github.com\/example" rel="me" aria-label="GitHub"/);
  });

  test('沒有聯絡頁，也沒有任何連到 /contact 的連結', () => {
    assert.equal(site.exists('contact.html'), false);
    for (const file of site.htmlFiles()) assert.doesNotMatch(site.read(file), /href="\/contact"/, file);
  });

  test('只有文章頁有留言區', () => {
    const article = site.read('a.html');
    assert.match(article, /留言討論/);
    assert.match(article, /data-repo="example\/repo"/);
    assert.match(article, /data-mapping="pathname"/);
    assert.match(article, /giscus\.app\/client\.js/);
    assert.doesNotMatch(site.read('about.html'), /giscus\.app\/client\.js/);
  });
});

describe('主題判定（<head> 的 inline script）', () => {
  const resolveTheme = ({ stored, systemDark, storageThrows = false }) => {
    const source = site.read('index.html').match(/<head><script>([\s\S]*?)<\/script>/)[1];
    const documentElement = { dataset: {} };
    vm.runInNewContext(source, {
      document: { documentElement },
      localStorage: {
        getItem: () => {
          if (storageThrows) throw new Error('blocked');
          return stored ?? null;
        },
      },
      matchMedia: () => ({ matches: systemDark }),
    });
    return documentElement.dataset.theme;
  };

  const cases = [
    { stored: undefined, systemDark: true, expected: 'dark' },
    { stored: undefined, systemDark: false, expected: 'light' },
    { stored: 'light', systemDark: true, expected: 'light' },
    { stored: 'dark', systemDark: false, expected: 'dark' },
    { stored: 'blue', systemDark: true, expected: 'dark' },
    { storageThrows: true, systemDark: false, expected: 'light' },
  ];

  for (const { expected, ...input } of cases) {
    test(`${JSON.stringify(input)} → ${expected}`, () => {
      assert.equal(resolveTheme(input), expected);
    });
  }
});
