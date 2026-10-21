# blog-posts Specification

## Purpose

Defines how a technical article is authored as a single Markdown content file and how each article is rendered as its own page. It exists so that publishing a new article requires adding exactly one file.

## Requirements

### Requirement: Article content file format

Each article SHALL be one Markdown file in `src/content/posts/`. The frontmatter MUST contain `title` (string), `description` (string), and `pubDate` (date). The fields `updatedDate` (date), `tags` (string array, default empty), and `cover` (string URL) are optional. The Markdown body SHALL accept inline HTML and render it unchanged.

#### Scenario: Valid article file is published

- **WHEN** a file `src/content/posts/hello-world.md` with valid frontmatter is added and the site is built
- **THEN** the build succeeds and the article is included in the generated site

#### Scenario: Invalid frontmatter fails the build

- **WHEN** an article file is missing a required frontmatter field or has a field of the wrong type
- **THEN** the build MUST fail with an error that names the file and the field

##### Example: frontmatter validation cases

| Frontmatter | Build result |
| --- | --- |
| title, description, pubDate: 2026-10-21 | success |
| title, description (no pubDate) | fail, names `pubDate` |
| title, description, pubDate: "not a date" | fail, names `pubDate` |
| title, description, pubDate, tags: "astro" (string, not array) | fail, names `tags` |

#### Scenario: Inline HTML in the body is preserved

- **WHEN** an article body contains `<figure><img src="/a.png"><figcaption>A</figcaption></figure>`
- **THEN** the rendered article page contains that `figure` element with its `figcaption`


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
### Requirement: Article URL is derived from the file name

The system SHALL serve each article at `/<slug>`, where `<slug>` is the article file name without the `.md` extension. The build MUST fail when a slug equals a reserved slug: `about`, `privacy`, `contact`, `tags`, `page`, `posts`, `rss.xml`, `sitemap-index.xml`, `ads.txt`, `robots.txt`, `404`.

#### Scenario: Article is served at its slug

- **WHEN** the file `src/content/posts/astro-content-collections.md` is built
- **THEN** the page is available at `/astro-content-collections`

#### Scenario: Reserved slug collision fails the build

- **WHEN** a file `src/content/posts/about.md` exists
- **THEN** the build MUST fail with an error naming `about.md` as conflicting with a reserved page


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
### Requirement: Article page content

The article page SHALL show, in order: a breadcrumb rendered as `~/ 文章 / <title>` whose `~` links to the home page and whose last segment is the article `title`, the title, the publish date, the update date when `updatedDate` is set, tag links to `/tags/<tag>`, the rendered body, and previous/next article links. The page `<title>` and meta description SHALL come from `title` and `description`, and `og:image` SHALL come from `cover` when set. All dates SHALL be displayed in the `Asia/Taipei` time zone as `YYYY-MM-DD`.

#### Scenario: Metadata is rendered

- **WHEN** an article with `title: "Hello"`, `description: "First post"`, `tags: ["astro"]` is built
- **THEN** its page has a `<title>` containing `Hello`, a meta description `First post`, and a link to `/tags/astro`

#### Scenario: Breadcrumb shows the article title

- **WHEN** the article `hello-world.md` with `title: "用 Astro 打造技術部落格"` is built
- **THEN** its breadcrumb reads `~ / 文章 / 用 Astro 打造技術部落格` and does not contain the slug `hello-world`

#### Scenario: Date is shown in Taipei time

- **WHEN** an article has `pubDate: 2026-10-20T20:00:00Z`
- **THEN** the page displays the date `2026-10-21`


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
### Requirement: Previous and next article navigation

Articles SHALL be ordered by `pubDate` ascending for navigation. The "previous" link SHALL point to the adjacent older article and the "next" link to the adjacent newer article. A link SHALL be omitted when no such article exists.

#### Scenario: Navigation across three articles

- **WHEN** three articles with distinct publish dates are built
- **THEN** each article page links only to its adjacent older and newer articles

##### Example: three articles

- **GIVEN** articles A (pubDate 2026-01-01), B (2026-02-01), C (2026-03-01)
- **WHEN** each article page is rendered
- **THEN** A shows only next → B; B shows previous → A and next → C; C shows only previous → B

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