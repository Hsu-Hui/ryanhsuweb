import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// 固定頁面和自動產生的檔案佔用的網址，文章檔名不能用這些名字。
export const RESERVED_SLUGS = new Set([
  'about',
  'privacy',
  'contact',
  'tags',
  'page',
  'posts',
  'rss.xml',
  'sitemap.xml',
  'sitemap-index.xml',
  'ads.txt',
  'robots.txt',
  '404',
]);

/**
 * 可公開的文章，依發布日期由新到舊排列。
 * 本機開發保留未來文章供預覽；正式建置不產生尚未到發布時間的任何輸出。
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');

  const conflicts = posts.filter((post) => RESERVED_SLUGS.has(post.id));
  if (conflicts.length > 0) {
    const files = conflicts.map((post) => post.filePath ?? `${post.id}.md`).join(', ');
    throw new Error(`文章檔名和保留的網址衝突，請改名：${files}`);
  }

  const now = Date.now();
  const visiblePosts = import.meta.env.DEV
    ? posts
    : posts.filter((post) => post.data.pubDate.getTime() <= now);

  return visiblePosts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** 所有用過的標籤和篇數，依篇數由多到少，同篇數依名稱排序。 */
export function countTags(posts: Post[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
