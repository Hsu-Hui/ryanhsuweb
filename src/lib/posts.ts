import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// 固定頁面和自動產生的檔案佔用的網址，文章檔名不能用這些名字。
export const RESERVED_SLUGS = new Set([
  'about',
  'privacy',
  'contact',
  'tags',
  'page',
  'rss.xml',
  'sitemap-index.xml',
  'ads.txt',
  'robots.txt',
  '404',
]);

/** 所有文章，依發布日期由新到舊排列。檔名撞到保留 slug 時直接讓建置失敗。 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');

  const conflicts = posts.filter((post) => RESERVED_SLUGS.has(post.id));
  if (conflicts.length > 0) {
    const files = conflicts.map((post) => post.filePath ?? `${post.id}.md`).join(', ');
    throw new Error(`文章檔名和保留的網址衝突，請改名：${files}`);
  }

  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
