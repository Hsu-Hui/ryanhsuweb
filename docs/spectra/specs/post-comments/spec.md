# post-comments Specification

## Purpose

Defines the comment section shown under each article, backed by giscus and GitHub Discussions. It exists so that readers can discuss articles without the site running its own database.

## Requirements

### Requirement: giscus comment section on article pages

When all giscus configuration fields (`repo`, `repoId`, `category`, `categoryId`) are non-empty, each article page SHALL render a comment section as a separate card directly after the article card, headed `留言討論`. The section SHALL load `https://giscus.app/client.js` with `data-mapping="pathname"`, `data-loading="lazy"`, and `data-lang="zh-TW"`, so that each article maps to its own discussion. Non-article pages SHALL NOT render a comment section.

#### Scenario: Configured comments

- **WHEN** the giscus configuration is complete and the article `/spectra-workflow` is built
- **THEN** the page contains a `留言討論` card after the article card, with the giscus configuration `data-repo` set to the configured repo and `data-mapping="pathname"`, and loads `https://giscus.app/client.js` in the browser


<!-- @trace
source: personal-tech-blog
updated: 2026-10-22
code:
  - src/pages/posts.astro
  - src/layouts/BaseLayout.astro
  - public/images/hello-world/grid.svg
  - firebase.json
  - tests/helpers/build-site.mjs
  - src/content/posts/spectra-workflow.md
  - .github/workflows/firebase-hosting-pull-request.yml
  - package.json
  - src/components/Comments.astro
  - tests/config.test.mjs
  - src/pages/about.astro
  - src/lib/pagination.ts
  - tests/site.test.mjs
  - src/components/TagList.astro
  - tests/redirects.test.mjs
  - src/lib/posts.ts
  - src/styles/global.css
  - src/components/PostRow.astro
  - src/pages/tags/index.astro
  - src/pages/[slug].astro
  - README.md
  - src/components/Pagination.astro
  - src/components/NavItems.astro
  - .github/workflows/firebase-hosting-merge.yml
  - src/content/posts/hello-world.md
  - src/assets/about/julia.webp
  - src/layouts/PageLayout.astro
  - src/pages/contact.astro
  - src/pages/index.astro
  - src/components/Icon.astro
  - src/pages/privacy.astro
  - src/site.config.ts
  - src/pages/page/[page].astro
  - src/components/PostList.astro
  - tests/content.test.mjs
  - src/components/Marquee.astro
  - tests/home.test.mjs
  - .firebaserc
-->

---
### Requirement: Comment theme follows the site theme

The giscus theme SHALL match the site theme: `light` when `data-theme` is `light`, and `transparent_dark` when it is `dark`. The theme SHALL be chosen when the comment section loads, and switching the site theme with the toggle SHALL update the loaded comment section without a page reload.

#### Scenario: Theme on load and on toggle

- **WHEN** an article page with comments is loaded and the reader toggles the theme
- **THEN** the giscus theme matches the site theme at each step

##### Example: theme sequence

| Step | Site `data-theme` | giscus theme |
| --- | --- | --- |
| page loads in light | light | `light` |
| reader toggles | dark | `transparent_dark` |
| reader toggles again | light | `light` |

#### Scenario: No comments on fixed pages

- **WHEN** `/about` is built
- **THEN** the page contains no giscus script


<!-- @trace
source: personal-tech-blog
updated: 2026-10-22
code:
  - src/pages/posts.astro
  - src/layouts/BaseLayout.astro
  - public/images/hello-world/grid.svg
  - firebase.json
  - tests/helpers/build-site.mjs
  - src/content/posts/spectra-workflow.md
  - .github/workflows/firebase-hosting-pull-request.yml
  - package.json
  - src/components/Comments.astro
  - tests/config.test.mjs
  - src/pages/about.astro
  - src/lib/pagination.ts
  - tests/site.test.mjs
  - src/components/TagList.astro
  - tests/redirects.test.mjs
  - src/lib/posts.ts
  - src/styles/global.css
  - src/components/PostRow.astro
  - src/pages/tags/index.astro
  - src/pages/[slug].astro
  - README.md
  - src/components/Pagination.astro
  - src/components/NavItems.astro
  - .github/workflows/firebase-hosting-merge.yml
  - src/content/posts/hello-world.md
  - src/assets/about/julia.webp
  - src/layouts/PageLayout.astro
  - src/pages/contact.astro
  - src/pages/index.astro
  - src/components/Icon.astro
  - src/pages/privacy.astro
  - src/site.config.ts
  - src/pages/page/[page].astro
  - src/components/PostList.astro
  - tests/content.test.mjs
  - src/components/Marquee.astro
  - tests/home.test.mjs
  - .firebaserc
-->

---
### Requirement: Comments disabled when configuration is incomplete

When any giscus configuration field is empty, no page SHALL render the giscus script, and the build SHALL succeed.

#### Scenario: Missing category id

- **WHEN** `categoryId` is empty and the site is built
- **THEN** the build succeeds and no article page contains the giscus script

<!-- @trace
source: personal-tech-blog
updated: 2026-10-22
code:
  - src/pages/posts.astro
  - src/layouts/BaseLayout.astro
  - public/images/hello-world/grid.svg
  - firebase.json
  - tests/helpers/build-site.mjs
  - src/content/posts/spectra-workflow.md
  - .github/workflows/firebase-hosting-pull-request.yml
  - package.json
  - src/components/Comments.astro
  - tests/config.test.mjs
  - src/pages/about.astro
  - src/lib/pagination.ts
  - tests/site.test.mjs
  - src/components/TagList.astro
  - tests/redirects.test.mjs
  - src/lib/posts.ts
  - src/styles/global.css
  - src/components/PostRow.astro
  - src/pages/tags/index.astro
  - src/pages/[slug].astro
  - README.md
  - src/components/Pagination.astro
  - src/components/NavItems.astro
  - .github/workflows/firebase-hosting-merge.yml
  - src/content/posts/hello-world.md
  - src/assets/about/julia.webp
  - src/layouts/PageLayout.astro
  - src/pages/contact.astro
  - src/pages/index.astro
  - src/components/Icon.astro
  - src/pages/privacy.astro
  - src/site.config.ts
  - src/pages/page/[page].astro
  - src/components/PostList.astro
  - tests/content.test.mjs
  - src/components/Marquee.astro
  - tests/home.test.mjs
  - .firebaserc
-->