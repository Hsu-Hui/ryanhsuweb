import { siteConfig } from '../site.config';
import type { Post } from './posts';

/** 文章頁的 schema.org BlogPosting，給搜尋引擎和 AI 搜尋理解文章用。 */
export function blogPostingJsonLd(post: Post, site: URL): string {
  const { title, description, pubDate, updatedDate, tags, cover } = post.data;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    author: {
      '@type': 'Person',
      name: siteConfig.author,
      url: new URL('/about', site).href,
    },
    ...(cover ? { image: cover } : {}),
    mainEntityOfPage: new URL(`/${post.id}`, site).href,
    inLanguage: 'zh-TW',
    keywords: tags.join(','),
  };

  // 轉義 <，避免標題裡出現 </script> 時提早結束 script 標籤。
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
