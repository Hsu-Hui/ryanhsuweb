// 新文章部署後執行：替最近發布、還沒有草稿的文章產生 Threads 草稿，開成 GitHub Issue，並通知 Discord。
// 環境變數 THREADS_SLUG 有值時只處理那一篇，且不檢查發布日期（手動補發舊文章用）。
import { readdir, readFile } from 'node:fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import {
  DRAFT_LABEL,
  PUBLISH_LABEL,
  buildUtmUrl,
  isRecent,
  issueTitle,
  parseFrontmatter,
  renderIssueBody,
  slugFromIssueBody,
  threadsLength,
  THREADS_MAX_LENGTH,
} from './lib.mjs';
import { createIssue, ensureLabel, listDraftIssues, notifyDiscord, requireEnv } from './services.mjs';

const POSTS_DIR = new URL('../../src/content/posts/', import.meta.url);
// 啟用自動化之前的文章已經手動排程發文，只替這個時間之後發布的文章自動產生草稿。
const AUTO_DRAFT_SINCE = new Date('2026-10-24T00:00:00+08:00');
const PROMPT = await readFile(new URL('./prompt.md', import.meta.url), 'utf8');

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    main: { type: 'string' },
    alternative: { type: 'string' },
    reply_intro: { type: 'string' },
  },
  required: ['main', 'alternative', 'reply_intro'],
  additionalProperties: false,
};

async function loadPosts() {
  const files = (await readdir(POSTS_DIR)).filter((file) => file.endsWith('.md'));
  return Promise.all(files.map(async (file) => {
    const { data, body } = parseFrontmatter(await readFile(new URL(file, POSTS_DIR), 'utf8'));
    return { slug: file.replace(/\.md$/, ''), ...data, body };
  }));
}

async function generateDraft(client, post) {
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    // 被安全分類器拒絕時，由伺服器自動改用其他模型重試。
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: DRAFT_SCHEMA },
    },
    system: PROMPT,
    messages: [{
      role: 'user',
      content: `文章標題：${post.title}\n文章摘要：${post.description}\n標籤：${(post.tags ?? []).join(', ')}\n\n文章內文：\n${post.body}`,
    }],
  });
  if (response.stop_reason === 'refusal') throw new Error(`Claude 拒絕產生草稿：${response.stop_details?.explanation ?? ''}`);
  const text = response.content.find((block) => block.type === 'text')?.text;
  if (!text) throw new Error(`Claude 沒有回傳內容（stop_reason: ${response.stop_reason}）`);
  return JSON.parse(text);
}

const onlySlug = process.env.THREADS_SLUG?.trim();
const posts = await loadPosts();
const drafted = new Set((await listDraftIssues(DRAFT_LABEL)).map((issue) => slugFromIssueBody(issue.body)));
const targets = posts.filter((post) =>
  onlySlug ? post.slug === onlySlug : isRecent(post.pubDate) && new Date(post.pubDate) >= AUTO_DRAFT_SINCE && !drafted.has(post.slug));

if (onlySlug && targets.length === 0) throw new Error(`找不到文章 ${onlySlug}`);
console.log(targets.length ? `要產生草稿的文章：${targets.map((post) => post.slug).join(', ')}` : '沒有需要產生草稿的新文章');

if (targets.length) {
  // 第一次執行時建立標籤，之後才能在 GitHub 網頁上直接選 publish。
  await ensureLabel(DRAFT_LABEL, '1d76db', 'Threads 貼文草稿');
  await ensureLabel(PUBLISH_LABEL, '0e8a16', '加上後把草稿發到 Threads');
}

const client = new Anthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') });
for (const post of targets) {
  const draft = await generateDraft(client, post);
  const reply = `${draft.reply_intro.trim()} 👉 ${buildUtmUrl(post.slug)}`;
  const issue = await createIssue({
    title: issueTitle(post.title),
    body: renderIssueBody({ slug: post.slug, main: draft.main, reply, alternative: draft.alternative }),
    labels: [DRAFT_LABEL],
  });
  const warning = threadsLength(draft.main) > THREADS_MAX_LENGTH ? `\n⚠️ 主文超過 ${THREADS_MAX_LENGTH} 字，發文前要刪短。` : '';
  await notifyDiscord(
    `📝 新的 Threads 草稿：**${post.title}**${warning}\n\n${draft.main.trim()}\n\n` +
    `👉 修改或發文：${issue.html_url}\n（在 Issue 加上 \`publish\` 標籤就會發出）`,
  );
  console.log(`已建立 ${issue.html_url}`);
}
