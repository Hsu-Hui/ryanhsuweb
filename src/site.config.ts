// 網站唯一的設定來源。外框、ads.txt、robots.txt、留言區都從這裡讀值。
// 還沒拿到的值保持空字串即可，相關功能會自動不輸出。
export const siteConfig = {
  siteUrl: 'https://ryan-hsu.com',
  siteTitle: 'RyanHsuWeb',
  siteDescription: 'Ryan Hsu 的技術筆記',
  author: 'Ryan Hsu',
  // 聯絡頁顯示的信箱。
  contactEmail: 'a3218484@gmail.com',
  // 關於我頁面的 GitHub 圖示連結，留空就不顯示。
  githubUrl: 'https://github.com/Hsu-Hui',
  // AdSense 發布商 ID，格式為 ca-pub- 加數字。
  adsenseClientId: '',
  // 到 https://giscus.app 產生設定後填入。
  giscus: {
    repo: 'Hsu-Hui/ryanhsuweb',
    repoId: 'R_kgDOVSUgIA',
    category: 'Announcements',
    categoryId: 'DIC_kwDOVSUgIM4DJRFk',
  },
};

const ADSENSE_CLIENT_ID = /^ca-pub-\d+$/;

if (siteConfig.adsenseClientId !== '' && !ADSENSE_CLIENT_ID.test(siteConfig.adsenseClientId)) {
  throw new Error(
    `site.config.ts: adsenseClientId "${siteConfig.adsenseClientId}" 格式錯誤，必須是 ca-pub- 加數字，或留空字串。`,
  );
}

export const adsenseEnabled = siteConfig.adsenseClientId !== '';

export const giscusEnabled = Object.values(siteConfig.giscus).every((value) => value !== '');
