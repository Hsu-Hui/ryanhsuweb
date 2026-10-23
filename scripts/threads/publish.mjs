// 草稿 Issue 加上 publish 標籤時執行：發主文，再用回覆主文的方式發附連結的第一則留言。
import { readFile } from 'node:fs/promises';
import { PUBLISH_LABEL, parseIssueBody } from './lib.mjs';
import {
  closeIssue,
  commentIssue,
  notifyDiscord,
  publishThreads,
  removeLabel,
  requireEnv,
  threadsPermalink,
} from './services.mjs';

const event = JSON.parse(await readFile(requireEnv('GITHUB_EVENT_PATH'), 'utf8'));
const { number, title, body, html_url: issueUrl } = event.issue;
const { main, reply, imageUrl, errors } = parseIssueBody(body);

// 草稿有問題時拿掉 publish 標籤，修正後重新加上就會再跑一次。
if (errors.length) {
  const message = `草稿還不能發：\n${errors.map((error) => `- ${error}`).join('\n')}`;
  await commentIssue(number, `${message}\n\n修正後重新加上 \`publish\` 標籤即可。`);
  await removeLabel(number, PUBLISH_LABEL);
  await notifyDiscord(`⚠️ **${title}** ${message}\n${issueUrl}`);
  process.exit(1);
}

let mainId;
try {
  mainId = await publishThreads(main, { imageUrl });
  await publishThreads(reply, { replyToId: mainId });
} catch (error) {
  // 主文已發出但留言失敗時，不能重跑整篇，否則會重複發主文。
  const status = mainId ? `主文已發出（ID ${mainId}），但留言發送失敗，請到 Threads 手動補留言。` : '主文沒有發出，修正後重新加上 `publish` 標籤即可。';
  await commentIssue(number, `發文失敗：${error.message}\n\n${status}`);
  await removeLabel(number, PUBLISH_LABEL);
  await notifyDiscord(`❌ **${title}** 發文失敗：${status}\n${issueUrl}`);
  throw error;
}

const permalink = await threadsPermalink(mainId).catch(() => null);
const link = permalink ?? `貼文 ID ${mainId}`;
await commentIssue(number, `已發到 Threads：${link}`);
await closeIssue(number);
await notifyDiscord(`✅ 已發到 Threads：**${title}**\n${link}`);
console.log(`已發布 ${link}`);
