// Threads 自動發文共用的純函式：讀文章 frontmatter、組 UTM 連結、產生與解析草稿 Issue。
// 不碰網路，方便在 tests/threads.test.mjs 直接測。

export const SITE_URL = 'https://ryan-hsu.com';
// Threads 單則貼文上限 500 字。
export const THREADS_MAX_LENGTH = 500;
export const DRAFT_LABEL = 'threads-draft';
export const PUBLISH_LABEL = 'publish';

const MAIN_HEADING = '## 主文';
const REPLY_HEADING = '## 第一則留言';
const IMAGE_HEADING = '## 封面圖（不想附圖就把下面的網址和預覽都刪掉）';
const ALT_HEADING = '## 備選主文（不會發出，想用就貼到上面）';

// 只解析文章用到的欄位：字串、日期與 [a, b] 形式的陣列。
export function parseFrontmatter(source) {
  const match = source.trimStart().match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error('找不到 frontmatter');
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^(\w+):\s*(.*)$/);
    if (!field) continue;
    const [, key, raw] = field;
    const value = raw.trim();
    data[key] = value.startsWith('[') && value.endsWith(']')
      ? value.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean)
      : value.replace(/^(['"])(.*)\1$/, '$2');
  }
  return { data, body: match[2] };
}

// 依台北時間判斷文章是否在最近幾天內發布，避免第一次啟用時替所有舊文章開 Issue。
export function isRecent(pubDate, now = new Date(), days = 3) {
  const published = new Date(pubDate);
  if (Number.isNaN(published.getTime())) return false;
  const diff = now.getTime() - published.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

export function buildUtmUrl(slug) {
  const params = new URLSearchParams({ utm_source: 'threads', utm_medium: 'social', utm_campaign: slug });
  return `${SITE_URL}/${slug}?${params}`;
}

// Threads 以字元計算長度，emoji 等組合字元用 code point 計算比較接近實際限制。
export function threadsLength(text) {
  return [...text].length;
}

// frontmatter 的 cover 可能是完整網址或站內路徑，Threads 只接受公開的完整網址。
export function absoluteImageUrl(cover) {
  if (!cover) return '';
  return new URL(cover, SITE_URL).href;
}

export function issueTitle(title) {
  return `[Threads] ${title}`;
}

export function slugMarker(slug) {
  return `<!-- threads-slug: ${slug} -->`;
}

export function slugFromIssueBody(body) {
  return body?.match(/<!-- threads-slug: ([\w-]+) -->/)?.[1] ?? null;
}

export function renderIssueBody({ slug, main, reply, alternative, imageUrl = '' }) {
  return [
    slugMarker(slug),
    '修改下面的「主文」和「第一則留言」後，加上 `publish` 標籤就會發到 Threads。',
    '',
    MAIN_HEADING,
    '',
    main.trim(),
    '',
    REPLY_HEADING,
    '',
    reply.trim(),
    '',
    IMAGE_HEADING,
    '',
    // 網址單獨一行讓發文時讀取，下面的圖片語法只是在 Issue 裡預覽。
    ...(imageUrl ? [imageUrl, '', `![封面圖](${imageUrl})`] : []),
    '',
    ALT_HEADING,
    '',
    alternative.trim(),
    '',
  ].join('\n');
}

function section(body, heading, nextHeadings) {
  const start = body.indexOf(heading);
  if (start === -1) return '';
  const rest = body.slice(start + heading.length);
  const ends = nextHeadings.map((next) => rest.indexOf(next)).filter((index) => index !== -1);
  return rest.slice(0, ends.length ? Math.min(...ends) : undefined).trim();
}

// 從 Issue 內文取出要發的主文與留言；GitHub 網頁編輯後可能變成 CRLF，先統一換行。
export function parseIssueBody(body) {
  const normalized = (body ?? '').replace(/\r\n/g, '\n');
  const main = section(normalized, MAIN_HEADING, [REPLY_HEADING, IMAGE_HEADING, ALT_HEADING]);
  const reply = section(normalized, REPLY_HEADING, [IMAGE_HEADING, ALT_HEADING]);
  const imageUrl = section(normalized, IMAGE_HEADING, [ALT_HEADING]).match(/^https:\/\/\S+$/m)?.[0] ?? '';
  const errors = [];
  if (!main) errors.push('找不到「主文」段落或內容是空的');
  if (!reply) errors.push('找不到「第一則留言」段落或內容是空的');
  if (threadsLength(main) > THREADS_MAX_LENGTH) errors.push(`主文 ${threadsLength(main)} 字，超過 ${THREADS_MAX_LENGTH} 字`);
  if (threadsLength(reply) > THREADS_MAX_LENGTH) errors.push(`留言 ${threadsLength(reply)} 字，超過 ${THREADS_MAX_LENGTH} 字`);
  return { main, reply, imageUrl, errors };
}
