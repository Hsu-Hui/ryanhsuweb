/** 首頁每頁顯示的文章數。 */
export const PAGE_SIZE = 10;

/** 第 1 頁是 /，第 2 頁起是 /page/<n>；不產生 /page/1，避免和首頁重複。 */
export function pageHref(page: number): string {
  return page === 1 ? '/' : `/page/${page}`;
}
