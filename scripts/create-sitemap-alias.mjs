import { copyFile } from 'node:fs/promises';

const source = new URL('../dist/sitemap-0.xml', import.meta.url);
const destination = new URL('../dist/sitemap.xml', import.meta.url);

await copyFile(source, destination);
