// 每天兩次提醒到 Discord：中午提醒補發舊文章（依草稿建立順序），晚上提醒發當天新文章的草稿。
//   node remind.mjs noon | evening
import { readFile } from 'node:fs/promises';
import { AUTO_DRAFT_SINCE, DRAFT_LABEL, parseFrontmatter, slugFromIssueBody } from './lib.mjs';
import { listDraftIssues, notifyDiscord } from './services.mjs';

const POSTS_DIR = new URL('../../src/content/posts/', import.meta.url);
const taipeiDate = (date) => date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Taipei' });

async function pubDateOf(slug) {
  const source = await readFile(new URL(`${slug}.md`, POSTS_DIR), 'utf8').catch(() => null);
  return source ? new Date(parseFrontmatter(source).data.pubDate) : null;
}

const slot = process.argv[2];
if (slot !== 'noon' && slot !== 'evening') throw new Error('用法：node remind.mjs noon|evening');

const open = (await listDraftIssues(DRAFT_LABEL)).filter((issue) => issue.state === 'open' && !issue.pull_request);
const drafts = (await Promise.all(open.map(async (issue) => ({ issue, pubDate: await pubDateOf(slugFromIssueBody(issue.body)) }))))
  .filter((draft) => draft.pubDate)
  .sort((a, b) => a.issue.number - b.issue.number);

const today = taipeiDate(new Date());
// 晚上只提醒今天發布、啟用自動化之後的新文章；其他草稿都算補發，中午照草稿建立的先後提醒。
const isTonight = (draft) => taipeiDate(draft.pubDate) === today && draft.pubDate >= AUTO_DRAFT_SINCE;
const pick = slot === 'noon' ? drafts.find((draft) => !isTonight(draft)) : drafts.findLast(isTonight);

if (!pick) {
  console.log('沒有需要提醒的草稿');
} else {
  const label = slot === 'noon' ? '🍱 中午補發舊文章' : '🌙 晚上發新文章';
  const rest = drafts.length - 1;
  await notifyDiscord(
    `${label}：**${pick.issue.title.replace(/^\[Threads\] /, '')}**\n` +
    `看過草稿後加上 \`publish\` 標籤就會發出：${pick.issue.html_url}` +
    (rest > 0 ? `\n（另外還有 ${rest} 篇草稿等著發）` : ''),
  );
  console.log(`已提醒 ${pick.issue.html_url}`);
}
