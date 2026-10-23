// 每週檢查一次 Threads 權杖還能不能用；長效權杖 60 天會過期，失效時發 Discord 提醒重新產生。
import { notifyDiscord, threadsMe } from './services.mjs';

try {
  const me = await threadsMe();
  console.log(`Threads 權杖正常：@${me.username}`);
} catch (error) {
  await notifyDiscord(`⚠️ Threads 權杖無法使用，自動發文會失敗。請照設定說明重新產生長效權杖並更新 GitHub Secret \`THREADS_ACCESS_TOKEN\`。\n錯誤：${error.message.slice(0, 300)}`);
  throw error;
}
