// 所有日期一律以台北時區顯示，避免在 UTC 的建置機器上差一天。
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** 輸出 YYYY-MM-DD。 */
export function formatDate(date: Date): string {
  return formatter.format(date);
}
