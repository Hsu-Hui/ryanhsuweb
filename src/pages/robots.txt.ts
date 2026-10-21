import type { APIRoute } from 'astro';

// User-agent: * 已包含 GPTBot、ClaudeBot、PerplexityBot 等 AI 爬蟲，不另外列出。
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('/sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
