// Threads 草稿分兩階段執行，中間由 Claude Code GitHub Action（用 Pro 訂閱權杖）寫草稿：
//   node draft.mjs plan    找出要產生草稿的文章，寫到 .threads/targets.json
//   node draft.mjs create  讀 Claude 寫好的 .threads/drafts/<slug>.json，開成 GitHub Issue 並通知 Discord
// 環境變數 THREADS_SLUG 有值時只處理那一篇，且不檢查發布日期（手動補發舊文章用）。
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import {
  DRAFT_LABEL,
  PUBLISH_LABEL,
  absoluteImageUrl,
  buildUtmUrl,
  isRecent,
  issueTitle,
  parseFrontmatter,
  renderIssueBody,
  slugFromIssueBody,
  threadsLength,
  THREADS_MAX_LENGTH,
} from './lib.mjs';
import { createIssue, ensureLabel, listDraftIssues, notifyDiscord } from './services.mjs';

const POSTS_DIR = new URL('../../src/content/posts/', import.meta.url);
const WORK_DIR = new URL('../../.threads/', import.meta.url);
const TARGETS_FILE = new URL('targets.json', WORK_DIR);
const DRAFTS_DIR = new URL('drafts/', WORK_DIR);
// 啟用自動化之前的文章已經手動排程發文，只替這個時間之後發布的文章自動產生草稿。
const AUTO_DRAFT_SINCE = new Date('2026-10-24T00:00:00+08:00');

async function loadPosts() {
  const files = (await readdir(POSTS_DIR)).filter((file) => file.endsWith('.md'));
  return Promise.all(files.map(async (file) => {
    const { data } = parseFrontmatter(await readFile(new URL(file, POSTS_DIR), 'utf8'));
    return {
      slug: file.replace(/\.md$/, ''),
      title: data.title,
      pubDate: data.pubDate,
      cover: absoluteImageUrl(data.cover),
      file: `src/content/posts/${file}`,
    };
  }));
}

async function plan() {
  const onlySlug = process.env.THREADS_SLUG?.trim();
  const posts = await loadPosts();
  const drafted = new Set((await listDraftIssues(DRAFT_LABEL)).map((issue) => slugFromIssueBody(issue.body)));
  const targets = posts.filter((post) =>
    onlySlug ? post.slug === onlySlug : isRecent(post.pubDate) && new Date(post.pubDate) >= AUTO_DRAFT_SINCE && !drafted.has(post.slug));

  if (onlySlug && targets.length === 0) throw new Error(`找不到文章 ${onlySlug}`);
  console.log(targets.length ? `要產生草稿的文章：${targets.map((post) => post.slug).join(', ')}` : '沒有需要產生草稿的新文章');

  await mkdir(DRAFTS_DIR, { recursive: true });
  await writeFile(TARGETS_FILE, `${JSON.stringify(targets, null, 2)}\n`);
  // 讓 workflow 在沒有新文章時跳過 Claude 那一步。
  if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `count=${targets.length}\n`, { flag: 'a' });
}

async function readDraft(slug) {
  const draft = JSON.parse(await readFile(new URL(`${slug}.json`, DRAFTS_DIR), 'utf8'));
  for (const key of ['main', 'alternative', 'reply_intro']) {
    if (typeof draft[key] !== 'string' || !draft[key].trim()) throw new Error(`${slug}.json 缺少 ${key}`);
  }
  return draft;
}

async function create() {
  const targets = JSON.parse(await readFile(TARGETS_FILE, 'utf8'));
  if (!targets.length) return;

  // 第一次執行時建立標籤，之後才能在 GitHub 網頁上直接選 publish。
  await ensureLabel(DRAFT_LABEL, '1d76db', 'Threads 貼文草稿');
  await ensureLabel(PUBLISH_LABEL, '0e8a16', '加上後把草稿發到 Threads');

  const failed = [];
  for (const post of targets) {
    let draft;
    try {
      draft = await readDraft(post.slug);
    } catch (error) {
      failed.push(post.slug);
      console.error(`草稿讀取失敗：${error.message}`);
      await notifyDiscord(`⚠️ **${post.title}** 的 Threads 草稿沒有產生成功，可以到 Actions 手動執行「Threads 草稿」並填入 \`${post.slug}\` 重試。`);
      continue;
    }
    const reply = `${draft.reply_intro.trim()} 👉 ${buildUtmUrl(post.slug)}`;
    const issue = await createIssue({
      title: issueTitle(post.title),
      body: renderIssueBody({ slug: post.slug, main: draft.main, reply, alternative: draft.alternative, imageUrl: post.cover }),
      labels: [DRAFT_LABEL],
    });
    const warning = threadsLength(draft.main) > THREADS_MAX_LENGTH ? `\n⚠️ 主文超過 ${THREADS_MAX_LENGTH} 字，發文前要刪短。` : '';
    await notifyDiscord(
      `📝 新的 Threads 草稿：**${post.title}**${warning}\n\n${draft.main.trim()}\n\n` +
      `👉 修改或發文：${issue.html_url}\n（在 Issue 加上 \`publish\` 標籤就會發出）`,
    );
    console.log(`已建立 ${issue.html_url}`);
  }
  if (failed.length) throw new Error(`以下文章沒有草稿：${failed.join(', ')}`);
}

const command = process.argv[2];
if (command === 'plan') await plan();
else if (command === 'create') await create();
else throw new Error('用法：node draft.mjs plan|create');
