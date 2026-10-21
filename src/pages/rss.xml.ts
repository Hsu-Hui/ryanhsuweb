import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { siteConfig } from '../site.config';
import { getPosts } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  return rss({
    title: siteConfig.siteTitle,
    description: siteConfig.siteDescription,
    site: site!,
    // 網址一律不帶結尾斜線，和 canonical 一致。
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${post.id}`,
    })),
    customData: '<language>zh-TW</language>',
  });
};
