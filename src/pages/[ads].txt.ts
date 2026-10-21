import type { APIRoute, GetStaticPaths } from 'astro';
import { adsenseEnabled, siteConfig } from '../site.config';

// 只有設定了 AdSense 發布商 ID 才產生 /ads.txt；沒設定時不產生任何檔案。
// 用動態路由是因為固定路由（ads.txt.ts）在靜態建置時一定會輸出檔案。
export const getStaticPaths = (() => (adsenseEnabled ? [{ params: { ads: 'ads' } }] : [])) satisfies GetStaticPaths;

export const GET: APIRoute = () => {
  const publisherId = siteConfig.adsenseClientId.replace(/^ca-/, '');
  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
