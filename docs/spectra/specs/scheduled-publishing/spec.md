# scheduled-publishing Specification

## Purpose

Defines how completed articles are staged for a future publication time and how the static production site is rebuilt after the daily publication boundary. It also separates local-only drafts from completed scheduled content available to CI.

## Requirements

### Requirement: Daily scheduled production deployment

The production deployment workflow SHALL retain deployment on pushes to `main`, SHALL support manual dispatch, and SHALL schedule deployment checks every day at `08:01`, `08:11`, and `08:21` in the `Asia/Taipei` time zone. Scheduled runs MUST execute the production tests, build, and Firebase Hosting deployment only when the current Taipei calendar date has at least one article whose `pubDate` is at or before the check time and no successful production workflow run started at or after the latest such `pubDate`. Push and manual triggers SHALL continue to execute the production job immediately. Scheduled runs SHALL be serialized without cancelling an in-progress production deployment. If successful-run history cannot be queried, the scheduled run MUST proceed with deployment.

#### Scenario: No article is due today

- **WHEN** a scheduled check runs and no article has a `pubDate` on the current Taipei calendar date at or before the check time
- **THEN** the workflow skips dependency installation, tests, the production build, and Firebase deployment

#### Scenario: First check publishes a due article

- **WHEN** an article is due today and no successful production workflow run started at or after that article's `pubDate`
- **THEN** the scheduled workflow executes tests, the production build, and Firebase deployment

#### Scenario: Later checks skip an already successful publication

- **WHEN** an article is due today and a successful production workflow run started at or after the latest due article's `pubDate`
- **THEN** the scheduled workflow skips dependency installation, tests, the production build, and Firebase deployment

#### Scenario: Later check retries after failure

- **WHEN** an article is due today but earlier runs after its `pubDate` failed or did not complete successfully
- **THEN** the next scheduled workflow executes tests, the production build, and Firebase deployment

#### Scenario: Run-history lookup fails open

- **WHEN** an article is due today and the GitHub Actions run-history request fails or returns unusable data
- **THEN** the workflow emits a warning and executes tests, the production build, and Firebase deployment

#### Scenario: Daily publishing window has retry opportunities

- **WHEN** the default-branch workflow schedule is evaluated for a calendar day in `Asia/Taipei`
- **THEN** scheduled checks run at `08:01`, `08:11`, and `08:21` on that day

#### Scenario: Existing immediate deployment remains available

- **WHEN** a commit is pushed to `main` or an operator starts a manual workflow dispatch
- **THEN** the production test, build, and deployment job runs without waiting for the daily schedule or applying the scheduled-run skip decision


<!-- @trace
source: scheduled-post-publishing
updated: 2026-10-23
code:
  - .github/workflows/firebase-hosting-merge.yml
  - .gitignore
  - README.md
  - src/lib/posts.ts
  - scripts/check-scheduled-publish.mjs
  - tests/content.test.mjs
  - tests/deployment.test.mjs
  - tests/scheduled-publish.test.mjs
-->

---
### Requirement: Local drafts and scheduled completed articles are separate

The project SHALL provide a gitignored root `drafts/` location for unfinished local-only Markdown. A completed article intended for automatic publication MUST be moved to `src/content/posts/`, assigned a future `pubDate` with an explicit time-zone offset, and pushed to the default branch before its publication window. Project documentation MUST state that CI cannot automatically publish a file that remains only on the author's computer.

#### Scenario: Unfinished draft remains local

- **WHEN** an author saves `drafts/example.md`
- **THEN** Git ignores the file and Astro does not include it in the posts content collection

#### Scenario: Completed article enters automatic publishing

- **WHEN** an author moves a completed article to `src/content/posts/example.md`, sets `pubDate: 2026-11-01T08:00:00+08:00`, and pushes it to `main` before that time
- **THEN** production builds before that instant exclude it and the first required production build after that instant includes it

<!-- @trace
source: scheduled-post-publishing
updated: 2026-10-23
code:
  - .github/workflows/firebase-hosting-merge.yml
  - .gitignore
  - README.md
  - src/lib/posts.ts
  - scripts/check-scheduled-publish.mjs
  - tests/content.test.mjs
  - tests/deployment.test.mjs
  - tests/scheduled-publish.test.mjs
-->
