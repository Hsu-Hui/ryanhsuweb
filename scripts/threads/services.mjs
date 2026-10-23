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

// 建立貼文容器，等 Threads 處理完（圖片要先被下載）再發布。有 imageUrl 時發圖文貼文。
export async function publishThreads(text, { imageUrl, replyToId } = {}) {
  const userId = requireEnv('THREADS_USER_ID');
  const container = await threads(`/${userId}/threads`, {
    media_type: imageUrl ? 'IMAGE' : 'TEXT',
    text,
    ...(imageUrl && { image_url: imageUrl }),
    ...(replyToId && { reply_to_id: replyToId }),
  });
  await waitForContainer(container.id);
  const published = await threads(`/${userId}/threads_publish`, { creation_id: container.id });
  return published.id;
}

// Meta 建議建立容器後等一段時間；這裡每隔幾秒查一次狀態，最多等約 1 分鐘。
async function waitForContainer(id) {
  const interval = Number(process.env.THREADS_PUBLISH_DELAY_MS ?? 5_000);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await sleep(interval);
    const { status, error_message: reason } = await threads(`/${id}`, { fields: 'status,error_message' }, 'GET');
    if (status === 'FINISHED') return;
    if (status === 'ERROR' || status === 'EXPIRED') throw new Error(`Threads 處理貼文失敗（${status}）：${reason ?? '沒有說明'}`);
  }
  throw new Error('Threads 處理貼文逾時');
}

export async function threadsPermalink(mediaId) {
  const media = await threads(`/${mediaId}`, { fields: 'permalink' }, 'GET');
  return media.permalink;
}

export const threadsMe = () => threads('/me', { fields: 'id,username' }, 'GET');
