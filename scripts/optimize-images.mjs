// 把 public/images 裡的 PNG 轉成小檔，並更新文章裡的路徑與尺寸。
// 封面轉 JPEG（Threads 和社群預覽只吃 JPEG/PNG），其他圖片轉 WebP。
// 用法：node scripts/optimize-images.mjs
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = 'public/images';
const POSTS_DIR = 'src/content/posts';
const COVER_WIDTH = 1200;
const BODY_MAX_WIDTH = 1600;

const postFiles = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md')).map((f) => path.join(POSTS_DIR, f));
const posts = await Promise.all(postFiles.map(async (file) => ({ file, text: await readFile(file, 'utf8') })));

// frontmatter 的 cover 指到的圖片，網址只取 /images/ 之後的站內路徑。
const covers = new Set(
  posts.flatMap(({ text }) => {
    const match = text.match(/^cover:\s*\S*?(\/images\/\S+\.png)\s*$/m);
    return match ? [match[1]] : [];
  }),
);

async function listPngs(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? listPngs(path.join(dir, e.name)) : e.name.endsWith('.png') ? [path.join(dir, e.name)] : [])),
  );
  return nested.flat();
}

const renames = new Map();
let before = 0;
let after = 0;

for (const file of await listPngs(IMAGES_DIR)) {
  const webPath = '/' + path.relative('public', file).split(path.sep).join('/');
  const isCover = covers.has(webPath);
  const input = await readFile(file);
  const pipeline = sharp(input).resize({ width: isCover ? COVER_WIDTH : BODY_MAX_WIDTH, withoutEnlargement: true });
  const { data, info } = isCover
    ? await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true })
    : await pipeline.webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  const ext = isCover ? '.jpg' : '.webp';
  const outFile = file.replace(/\.png$/, ext);
  await writeFile(outFile, data);
  await unlink(file);
  renames.set(webPath, { to: webPath.replace(/\.png$/, ext), width: info.width, height: info.height });
  before += input.length;
  after += data.length;
  console.log(`${webPath}  ${Math.round(input.length / 1024)} KB -> ${Math.round(data.length / 1024)} KB`);
}

for (const { file, text } of posts) {
  let next = text;
  for (const [from, { to, width, height }] of renames) {
    if (!next.includes(from)) continue;
    // 先更新引用這張圖的 <img> 尺寸，再換掉所有路徑（含 cover 的完整網址）。
    next = next.replace(
      new RegExp(`(<img[^>]*src="${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*?)width="\\d+" height="\\d+"`, 'g'),
      `$1width="${width}" height="${height}"`,
    );
    next = next.split(from).join(to);
  }
  if (next !== text) await writeFile(file, next);
}

console.log(`\n共 ${renames.size} 張：${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
