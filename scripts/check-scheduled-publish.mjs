import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const TAIPEI_TIME_ZONE = 'Asia/Taipei';

function taipeiDateKey(date) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: TAIPEI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function readPostDates(postsDir) {
  return readdirSync(postsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const source = readFileSync(resolve(postsDir, entry.name), 'utf8');
      const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
      const raw = frontmatter?.match(/^pubDate:\s*(.+?)\s*$/m)?.[1]
        ?.replace(/\s+#.*$/, '')
        .replace(/^(['"])(.*)\1$/, '$2');
      const pubDate = raw ? new Date(raw) : new Date(Number.NaN);
      if (Number.isNaN(pubDate.getTime())) {
        throw new Error(`${entry.name} 缺少有效的 pubDate`);
      }
      return { file: entry.name, pubDate };
    });
}

async function fetchWorkflowRuns() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const workflow = process.env.SCHEDULED_WORKFLOW_FILE ?? 'firebase-hosting-merge.yml';
  if (!repository || !token) throw new Error('缺少 GITHUB_REPOSITORY 或 GITHUB_TOKEN');

  const url = new URL(
    `https://api.github.com/repos/${repository}/actions/workflows/${encodeURIComponent(workflow)}/runs`,
  );
  url.searchParams.set('branch', 'main');
  url.searchParams.set('status', 'success');
  url.searchParams.set('per_page', '100');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok) throw new Error(`GitHub Actions API 回傳 ${response.status}`);

  const data = await response.json();
  if (!Array.isArray(data.workflow_runs)) throw new Error('GitHub Actions API 回應缺少 workflow_runs');
  return data.workflow_runs;
}

/** 判斷這次 workflow 是否需要執行正式部署。 */
export async function evaluateScheduledPublish({
  eventName,
  now,
  postsDir,
  currentRunId,
  listRuns = fetchWorkflowRuns,
}) {
  if (eventName !== 'schedule') {
    return { shouldDeploy: true, reason: 'immediate-trigger' };
  }

  let duePosts;
  try {
    const today = taipeiDateKey(now);
    duePosts = readPostDates(postsDir).filter(
      ({ pubDate }) => pubDate <= now && taipeiDateKey(pubDate) === today,
    );
  } catch (error) {
    return {
      shouldDeploy: true,
      reason: 'post-scan-unavailable',
      warning: error instanceof Error ? error.message : String(error),
    };
  }

  if (duePosts.length === 0) {
    return { shouldDeploy: false, reason: 'no-due-posts' };
  }

  const latestDue = Math.max(...duePosts.map(({ pubDate }) => pubDate.getTime()));
  let runs;
  try {
    runs = await listRuns();
  } catch (error) {
    return {
      shouldDeploy: true,
      reason: 'run-history-unavailable',
      warning: error instanceof Error ? error.message : String(error),
    };
  }

  const alreadyDeployed = runs.some((run) => {
    if (String(run.id) === String(currentRunId) || run.conclusion !== 'success') return false;
    const startedAt = new Date(run.run_started_at).getTime();
    return Number.isFinite(startedAt) && startedAt >= latestDue;
  });

  return alreadyDeployed
    ? { shouldDeploy: false, reason: 'already-deployed' }
    : { shouldDeploy: true, reason: 'due-posts-not-deployed' };
}

function writeOutputs(result) {
  const lines = [
    `should_deploy=${result.shouldDeploy}`,
    `reason=${result.reason}`,
  ];
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  } else {
    console.log(lines.join('\n'));
  }
}

async function main() {
  const result = await evaluateScheduledPublish({
    eventName: process.env.GITHUB_EVENT_NAME,
    now: new Date(),
    postsDir: resolve('src/content/posts'),
    currentRunId: process.env.GITHUB_RUN_ID,
  });
  if (result.warning) console.log(`::warning::排程發布檢查失敗，將照常部署：${result.warning}`);
  console.log(`排程發布判斷：${result.reason}`);
  writeOutputs(result);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`::warning::排程發布檢查發生未預期錯誤，將照常部署：${message}`);
    writeOutputs({ shouldDeploy: true, reason: 'precheck-error' });
  });
}
