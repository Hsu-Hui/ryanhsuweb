// GitHub、Discord、Threads 三個外部服務的最小封裝，只用 Node 內建的 fetch。

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`缺少環境變數 ${name}`);
  return value;
}

async function request(url, options, label) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`${label} 失敗（HTTP ${response.status}）：${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

// ---------- GitHub ----------

function github(path, { method = 'GET', body } = {}) {
  const repo = requireEnv('GITHUB_REPOSITORY');
  return request(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${requireEnv('GITHUB_TOKEN')}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(body && { 'content-type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
  }, `GitHub ${method} ${path}`);
}

export async function listDraftIssues(label) {
  const issues = [];
  for (let page = 1; ; page += 1) {
    const batch = await github(`/issues?labels=${label}&state=all&per_page=100&page=${page}`);
    issues.push(...batch);
    if (batch.length < 100) return issues;
  }
}

// 標籤已存在時 GitHub 回 422，忽略即可。
export const ensureLabel = (name, color, description) =>
  github('/labels', { method: 'POST', body: { name, color, description } }).catch((error) => {
    if (!error.message.includes('HTTP 422')) throw error;
  });
export const createIssue = (issue) => github('/issues', { method: 'POST', body: issue });
export const commentIssue = (number, body) => github(`/issues/${number}/comments`, { method: 'POST', body: { body } });
export const closeIssue = (number) => github(`/issues/${number}`, { method: 'PATCH', body: { state: 'closed', state_reason: 'completed' } });
export const removeLabel = (number, label) =>
  github(`/issues/${number}/labels/${encodeURIComponent(label)}`, { method: 'DELETE' }).catch(() => null);

// ---------- Discord ----------

// Discord 單則訊息上限 2000 字，超過就截斷，完整內容看 Issue。
export async function notifyDiscord(content) {
  const text = [...content].length > 1900 ? `${[...content].slice(0, 1900).join('')}…` : content;
  await request(requireEnv('DISCORD_WEBHOOK_URL'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: text, allowed_mentions: { parse: [] } }),
  }, 'Discord 通知');
}

// ---------- Threads ----------

const THREADS_API = 'https://graph.threads.net/v1.0';

function threads(path, params, method = 'POST') {
  const query = new URLSearchParams({ ...params, access_token: requireEnv('THREADS_ACCESS_TOKEN') });
  return request(`${THREADS_API}${path}?${query}`, { method }, `Threads ${path}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 建立文字貼文容器後再發布；Meta 建議容器建立後等一下再發布，讓伺服器處理完成。
export async function publishThreadsText(text, replyToId) {
  const userId = requireEnv('THREADS_USER_ID');
  const container = await threads(`/${userId}/threads`, {
    media_type: 'TEXT',
    text,
    ...(replyToId && { reply_to_id: replyToId }),
  });
  await sleep(Number(process.env.THREADS_PUBLISH_DELAY_MS ?? 10_000));
  const published = await threads(`/${userId}/threads_publish`, { creation_id: container.id });
  return published.id;
}

export async function threadsPermalink(mediaId) {
  const media = await threads(`/${mediaId}`, { fields: 'permalink' }, 'GET');
  return media.permalink;
}

export const threadsMe = () => threads('/me', { fields: 'id,username' }, 'GET');
