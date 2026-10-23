// 用指定的文章與設定，在暫存資料夾建置一份網站，讓測試檢查實際輸出的檔案。
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ASTRO_CLI = join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');
const POSTS_DIR = join('src', 'content', 'posts');

/** 測試用的預設設定：所有功能都開啟。 */
export const FULL_CONFIG = {
  siteUrl: 'https://example.dev',
  author: 'Ryan Hsu',
  contactEmail: 'me@example.dev',
  githubUrl: 'https://github.com/example',
  adsenseClientId: 'ca-pub-1234567890123456',
  ga4MeasurementId: 'G-TEST123456',
  repo: 'example/repo',
  repoId: 'R_test',
  category: 'Announcements',
  categoryId: 'DIC_test',
};

/** 把 frontmatter 物件轉成 YAML；字串用 JSON 格式輸出，在 YAML 中也合法。 */
function toFrontmatter(data) {
  const lines = Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) return `${key}: [${value.map((v) => JSON.stringify(v)).join(', ')}]`;
    return `${key}: ${typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(value) ? JSON.stringify(value) : value}`;
  });
  return `---\n${lines.join('\n')}\n---\n`;
}

/** 改寫暫存資料夾裡 site.config.ts 的字串欄位，例如 { adsenseClientId: '' }。 */
function patchConfig(file, config) {
  let source = readFileSync(file, 'utf8');
  for (const [key, value] of Object.entries(config)) {
    const pattern = new RegExp(`(\\b${key}: )'[^']*'`);
    if (!pattern.test(source)) throw new Error(`site.config.ts 找不到欄位 ${key}`);
    source = source.replace(pattern, `$1'${value}'`);
  }
  writeFileSync(file, source);
}

/**
 * @param {object} options
 * @param {Record<string, {data?: object, body?: string, raw?: string}>} options.posts 檔名（不含 .md）→ 內容
 * @param {Record<string, string>} [options.config] 要覆寫的 site.config.ts 欄位
 */
export function buildSite({ posts, config = FULL_CONFIG }) {
  const dir = mkdtempSync(join(tmpdir(), 'ryanhsuweb-test-'));

  for (const file of ['astro.config.mjs', 'package.json', 'tsconfig.json']) {
    cpSync(join(ROOT, file), join(dir, file));
  }
  cpSync(join(ROOT, 'src'), join(dir, 'src'), {
    recursive: true,
    filter: (path) => !relative(ROOT, path).split(sep).join('/').startsWith('src/content/posts/'),
  });
  mkdirSync(join(dir, POSTS_DIR), { recursive: true });
  for (const [slug, post] of Object.entries(posts)) {
    const content = post.raw ?? toFrontmatter(post.data) + (post.body ?? '內文\n');
    writeFileSync(join(dir, POSTS_DIR, `${slug}.md`), content);
  }
  symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'), 'junction');
  patchConfig(join(dir, 'src', 'site.config.ts'), config);
  // Astro 和 Vite 預設把快取放在 node_modules/.astro 與 node_modules/.vite。node_modules 是共用的，
  // 平行建置時會讀到彼此的文章、搶著改寫同一個資料夾，所以每個暫存網站改用自己的快取資料夾。
  const astroConfig = join(dir, 'astro.config.mjs');
  const configSource = readFileSync(astroConfig, 'utf8')
    .replace('defineConfig({', "defineConfig({\n  cacheDir: './.astro-cache',")
    .replace('vite: {', "vite: {\n    cacheDir: './.vite-cache',");
  if (!configSource.includes('.astro-cache') || !configSource.includes('.vite-cache')) {
    throw new Error('astro.config.mjs 的格式變了，測試工具無法設定獨立的快取資料夾');
  }
  writeFileSync(astroConfig, configSource);

  const result = spawnSync(process.execPath, [ASTRO_CLI, 'build'], { cwd: dir, encoding: 'utf8' });
  const dist = join(dir, 'dist');

  return {
    ok: result.status === 0,
    output: `${result.stdout}\n${result.stderr}`,
    exists: (path) => existsSync(join(dist, path)),
    read: (path) => readFileSync(join(dist, path), 'utf8'),
    /** dist 底下所有 .html 檔的相對路徑。 */
    htmlFiles: () => listFiles(dist).filter((path) => path.endsWith('.html')),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

function listFiles(base, current = base) {
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const path = join(current, entry.name);
    return entry.isDirectory() ? listFiles(base, path) : [relative(base, path).split(sep).join('/')];
  });
}

/** 去掉 HTML 標籤並壓縮空白，方便比對畫面上的文字。 */
export function textOf(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
