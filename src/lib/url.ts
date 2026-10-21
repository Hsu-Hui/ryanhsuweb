// build.format 為 'file' 時，建置階段的 pathname 會帶 .html（例如 /about.html、/index.html），
// 這裡轉成對外的正式網址格式：不帶 .html、也不帶結尾斜線。
export function canonicalPath(pathname: string): string {
  const path = pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1');
  return path === '' ? '/' : path;
}
