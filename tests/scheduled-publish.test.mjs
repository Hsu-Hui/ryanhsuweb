import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import { evaluateScheduledPublish } from '../scripts/check-scheduled-publish.mjs';

const NOW = new Date('2026-11-01T08:05:00+08:00');
const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function postsDir(posts) {
  const root = mkdtempSync(join(tmpdir(), 'scheduled-publish-'));
  tempDirs.push(root);
  const dir = join(root, 'src', 'content', 'posts');
  mkdirSync(dir, { recursive: true });
  for (const [slug, pubDate] of Object.entries(posts)) {
    writeFileSync(
      join(dir, `${slug}.md`),
      `---\ntitle: ${slug}\ndescription: test\npubDate: ${pubDate}\n---\n`,
    );
  }
  return dir;
}

const run = ({ posts = {}, runs = [], listRuns = async () => runs, eventName = 'schedule' } = {}) =>
  evaluateScheduledPublish({
    eventName,
    now: NOW,
    postsDir: postsDir(posts),
    currentRunId: '300',
    listRuns,
  });

test('push 與手動觸發不套用排程跳過判斷', async () => {
  for (const eventName of ['push', 'workflow_dispatch']) {
    assert.deepEqual(await run({ eventName }), {
      shouldDeploy: true,
      reason: 'immediate-trigger',
    });
  }
});

test('今天沒有已到時間的文章時跳過部署，也不查 GitHub API', async () => {
  let calls = 0;
  const result = await run({
    posts: {
      yesterday: '2026-10-31T08:00:00+08:00',
      later: '2026-11-01T20:00:00+08:00',
      tomorrow: '2026-11-02T08:00:00+08:00',
    },
    listRuns: async () => {
      calls += 1;
      return [];
    },
  });

  assert.equal(result.shouldDeploy, false);
  assert.equal(result.reason, 'no-due-posts');
  assert.equal(calls, 0);
});

test('今天有到期文章且沒有成功 run 時執行部署', async () => {
  const result = await run({ posts: { today: '2026-11-01T08:00:00+08:00' } });
  assert.equal(result.shouldDeploy, true);
  assert.equal(result.reason, 'due-posts-not-deployed');
});

test('已有在最新文章發布後開始的成功 run 時跳過部署', async () => {
  const result = await run({
    posts: {
      first: '2026-11-01T07:50:00+08:00',
      latest: '2026-11-01T08:00:00+08:00',
    },
    runs: [
      { id: 100, conclusion: 'success', run_started_at: '2026-11-01T00:01:30Z' },
    ],
  });

  assert.equal(result.shouldDeploy, false);
  assert.equal(result.reason, 'already-deployed');
});

test('較早、失敗、未完成及目前這次 run 都不能阻止補跑', async () => {
  const result = await run({
    posts: { today: '2026-11-01T08:00:00+08:00' },
    runs: [
      { id: 100, conclusion: 'success', run_started_at: '2026-10-31T23:59:59Z' },
      { id: 200, conclusion: 'failure', run_started_at: '2026-11-01T00:01:00Z' },
      { id: 250, conclusion: null, run_started_at: '2026-11-01T00:02:00Z' },
      { id: 300, conclusion: 'success', run_started_at: '2026-11-01T00:03:00Z' },
    ],
  });

  assert.equal(result.shouldDeploy, true);
  assert.equal(result.reason, 'due-posts-not-deployed');
});

test('GitHub run-history 查詢失敗時照常部署', async () => {
  const result = await run({
    posts: { today: '2026-11-01T08:00:00+08:00' },
    listRuns: async () => {
      throw new Error('API unavailable');
    },
  });

  assert.equal(result.shouldDeploy, true);
  assert.equal(result.reason, 'run-history-unavailable');
  assert.match(result.warning, /API unavailable/);
});
