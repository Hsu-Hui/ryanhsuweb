// 正式部署 workflow 的觸發契約：push、手動執行，以及台灣時間每日三次排程。
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const WORKFLOW = fileURLToPath(
  new URL('../.github/workflows/firebase-hosting-merge.yml', import.meta.url),
);

const source = readFileSync(WORKFLOW, 'utf8');

test('正式部署保留 main push 與手動觸發', () => {
  assert.match(source, /^on:\s*$/m);
  assert.match(source, /^\s{2}push:\s*$/m);
  assert.match(source, /^\s{6}- main\s*$/m);
  assert.match(source, /^\s{2}workflow_dispatch:\s*$/m);
});

test('排程判斷可讀取 Actions 歷史，且正式部署不會互相重疊', () => {
  assert.match(source, /^\s{2}actions: read\s*$/m);
  assert.match(source, /^concurrency:\s*$/m);
  assert.match(source, /^\s{2}group: production-deploy\s*$/m);
  assert.match(source, /^\s{2}cancel-in-progress: false\s*$/m);
  assert.match(source, /id: scheduled_publish/);
  assert.match(source, /node scripts\/check-scheduled-publish\.mjs/);
});

test('每天台灣時間 08:01、08:11、08:21 提供三次部署機會', () => {
  assert.match(source, /^\s{2}schedule:\s*$/m);
  assert.match(source, /^\s{4}- cron: ['"]1,11,21 8 \* \* \*['"]\s*$/m);
  assert.match(source, /^\s{6}timezone: ['"]?Asia\/Taipei['"]?\s*$/m);
});

test('所有觸發共用同一個測試、建置與正式部署工作', () => {
  assert.equal((source.match(/^\s{2}build_and_deploy:\s*$/gm) ?? []).length, 1);
  assert.match(source, /run: npm ci && npm test && npm run build/);
  assert.match(source, /channelId: live/);
});

test('安裝、測試建置與 Firebase 部署都受排程判斷控制', () => {
  const condition = "if: steps.scheduled_publish.outputs.should_deploy == 'true'";
  assert.equal(source.split(condition).length - 1, 3);
});
