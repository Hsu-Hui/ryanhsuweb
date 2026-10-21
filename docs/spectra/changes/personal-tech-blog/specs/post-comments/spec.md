## Purpose

Defines the comment section shown under each article, backed by giscus and GitHub Discussions. It exists so that readers can discuss articles without the site running its own database.

## ADDED Requirements

### Requirement: giscus comment section on article pages

When all giscus configuration fields (`repo`, `repoId`, `category`, `categoryId`) are non-empty, each article page SHALL render the giscus script `https://giscus.app/client.js` after the previous/next navigation. The script SHALL use `data-mapping="pathname"`, `data-loading="lazy"`, and `data-lang="zh-TW"`, so that each article maps to its own discussion. Non-article pages SHALL NOT render a comment section.

#### Scenario: Configured comments

- **WHEN** the giscus configuration is complete and the article `/hello-world` is built
- **THEN** the page contains the giscus script with `data-repo` set to the configured repo and `data-mapping="pathname"`

#### Scenario: No comments on fixed pages

- **WHEN** `/about` is built
- **THEN** the page contains no giscus script

### Requirement: Comments disabled when configuration is incomplete

When any giscus configuration field is empty, no page SHALL render the giscus script, and the build SHALL succeed.

#### Scenario: Missing category id

- **WHEN** `categoryId` is empty and the site is built
- **THEN** the build succeeds and no article page contains the giscus script
