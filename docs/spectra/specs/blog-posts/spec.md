# blog-posts Specification

## Purpose

Defines how a technical article is authored as a single Markdown content file and how each article is rendered as its own page. It exists so that publishing a new article requires adding exactly one file.

## Requirements

### Requirement: Article content file format

Each article SHALL be one Markdown file in `src/content/posts/`. The frontmatter MUST contain `title` (string), `description` (string), and `pubDate` (date). The fields `updatedDate` (date), `tags` (string array, default empty), and `cover` (string URL) are optional. The Markdown body SHALL accept inline HTML and render it unchanged. A production build SHALL publish an article only when its `pubDate` is less than or equal to the build instant. The local development server SHALL include future-dated articles for author preview.

#### Scenario: Valid article file is published

- **WHEN** a file `src/content/posts/hello-world.md` has valid frontmatter and a `pubDate` at or before the production build instant
- **THEN** the build succeeds and the article is included in the generated site

#### Scenario: Future article is excluded from production

- **WHEN** a valid article has a `pubDate` later than the production build instant
- **THEN** the production build succeeds without generating that article's page or including it in previous and next article navigation

#### Scenario: Future article is available in local development

- **WHEN** a valid future-dated article is loaded by the local development server
- **THEN** the article remains available for author preview

##### Example: Preview tomorrow's article

- **GIVEN** the current instant is `2026-11-01T07:30:00+08:00` and an article has `pubDate: 2026-11-02T08:00:00+08:00`
- **WHEN** the author runs the local development server and opens the article slug
- **THEN** the article page is available for preview

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
source: scheduled-post-publishing
updated: 2026-10-23
code:
  - src/lib/posts.ts
  - tests/content.test.mjs
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

The article page SHALL show, in order: a breadcrumb rendered as `~/ 文章 / <title>` whose `~` links to the home page and whose last segment is the article `title`, the title, the publish date, the update date when `updatedDate` is set, tag links to `/tags/<tag>`, the collapsible table of contents when the article qualifies for one (see "Article table of contents"), the rendered body, previous/next article links, and the related articles section when the article has at least one related article (see "Related articles"). The page `<title>` and meta description SHALL come from `title` and `description`, and `og:image` SHALL come from `cover` when set. All dates SHALL be displayed in the `Asia/Taipei` time zone as `YYYY-MM-DD`.

#### Scenario: Metadata is rendered

- **WHEN** an article with `title: "Hello"`, `description: "First post"`, `tags: ["astro"]` is built
- **THEN** its page has a `<title>` containing `Hello`, a meta description `First post`, and a link to `/tags/astro`

#### Scenario: Breadcrumb shows the article title

- **WHEN** the article `hello-world.md` with `title: "用 Astro 打造技術部落格"` is built
- **THEN** its breadcrumb reads `~ / 文章 / 用 Astro 打造技術部落格` and does not contain the slug `hello-world`

#### Scenario: Date is shown in Taipei time

- **WHEN** an article has `pubDate: 2026-10-20T20:00:00Z`
- **THEN** the page displays the date `2026-10-21`

#### Scenario: Collapsible table of contents sits between the header and the body

- **WHEN** an article with two or more `##`/`###` headings is built
- **THEN** in the page source the collapsible table of contents appears after the tag links and before the first element of the rendered body

#### Scenario: Related articles sit between the previous/next links and the comments

- **WHEN** an article that has at least one related article is built
- **THEN** in the page source the related articles section appears after the previous/next article links and before the comment section


<!-- @trace
source: related-posts
updated: 2026-11-02
code:
  - src/pages/[slug].astro
  - src/components/TableOfContents.astro
  - tests/toc.test.mjs
  - tests/related-posts.test.mjs
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

---
### Requirement: Article table of contents

The article page SHALL generate a table of contents from the article's level-2 and level-3 headings, without the author writing it. Each entry SHALL be a link `#<id>` whose `<id>` equals the `id` of the corresponding heading in the rendered body, and whose text equals the heading text. A level-3 heading SHALL be nested under the closest preceding level-2 heading; a level-3 heading with no preceding level-2 heading SHALL be a top-level entry. Headings of level 4 or deeper SHALL NOT be listed. When the article has fewer than two level-2 or level-3 headings in total, the page SHALL NOT output any table of contents and SHALL NOT reserve a side column.

The table of contents SHALL be presented in two forms, each labelled `目錄`:

- At viewport widths of 1280px and above, a side panel to the right of the article that stays fixed in view while the page scrolls. The collapsible form SHALL be hidden.
- Below 1280px, a collapsible block placed between the article header and the body, collapsed by default and expandable by activating its `目錄` summary. The side panel SHALL be hidden.

#### Scenario: Entries link to the matching headings

- **WHEN** an article whose body contains `## 安裝` and `## 設定` is built
- **THEN** the table of contents contains links whose `href` values are `#` followed by the `id` of each heading in the body, in document order, with link texts `安裝` and `設定`

#### Scenario: Heading hierarchy and threshold

- **WHEN** an article is built with the heading sequence in the example table
- **THEN** the table of contents matches the expected structure

##### Example: heading sequences

| Headings in the body (in order) | Table of contents |
| --- | --- |
| `## A`, `### A1`, `### A2`, `## B` | top-level A (children A1, A2), top-level B |
| `### Intro`, `## A`, `### A1` | top-level Intro, top-level A (child A1) |
| `## A`, `#### A-deep`, `## B` | top-level A, top-level B; no entry for A-deep |
| `## A`, `### A1` | top-level A (child A1) |
| `## Only` | no table of contents, no side column |
| no headings | no table of contents, no side column |

#### Scenario: Wide viewport shows the side panel

- **WHEN** an article with a table of contents is opened in a 1440px-wide viewport and scrolled to the bottom
- **THEN** the side panel labelled `目錄` is visible to the right of the article throughout the scroll, and the collapsible block is not visible

#### Scenario: Narrow viewport shows the collapsible block

- **WHEN** an article with a table of contents is opened in a 375px-wide viewport
- **THEN** a collapsed `目錄` block is visible between the article header and the body, the side panel is not visible, and activating `目錄` reveals the entries

#### Scenario: Activating an entry jumps to its heading

- **WHEN** the reader activates the table of contents entry for a heading
- **THEN** the page scrolls so that heading is in view near the top of the viewport and the URL fragment becomes `#<id>` of that heading


<!-- @trace
source: post-table-of-contents
updated: 2026-10-29
code:
  - src/components/TableOfContents.astro
  - src/lib/toc.ts
  - src/pages/[slug].astro
  - src/styles/global.css
  - tests/toc.test.mjs
-->

---
### Requirement: Current section highlight in the side panel

While the side panel is shown, it SHALL mark exactly one entry as the current section with `aria-current="true"`, or none, using these rules evaluated on every scroll position:

- The current section SHALL be the last listed heading whose top edge is at or above 96px from the top of the viewport.
- When no listed heading has reached that line, no entry SHALL be marked.
- When the page is scrolled to its bottom, the last listed heading SHALL be marked.

The marked entry SHALL be visually distinguished with the accent color. The collapsible form SHALL NOT mark a current section.

#### Scenario: Highlight follows the scroll position

- **WHEN** the reader scrolls an article with a side panel to the positions in the example table
- **THEN** the marked entry matches the expected entry

##### Example: article with headings A, B, C

| Scroll position | Marked entry |
| --- | --- |
| page top, heading A is 300px below the viewport top | none |
| heading A's top is 50px from the viewport top, B is below the viewport | A |
| heading B's top is 96px from the viewport top | B |
| heading C's top is 400px from the viewport top and the page cannot scroll further | C |

<!-- @trace
source: post-table-of-contents
updated: 2026-10-29
code:
  - src/components/TableOfContents.astro
  - src/lib/toc.ts
  - src/pages/[slug].astro
  - src/styles/global.css
  - tests/toc.test.mjs
-->

---
### Requirement: Related articles

Each article page SHALL show a section headed `相關文章` that lists up to 3 other published articles, chosen at build time from article tags without any additional frontmatter field. The candidates SHALL be all articles included in the build except the current article and the articles linked as its previous and next article. Each candidate's score SHALL be the number of tags it shares with the current article. Candidates with a score of at least 1 SHALL come first, ordered by score descending and then by `pubDate` descending. When fewer than 3 candidates have a score of at least 1, the remaining slots SHALL be filled with the newest candidates that share no tag, ordered by `pubDate` descending. When there are fewer than 3 candidates in total, the section SHALL list all of them. When there are no candidates, the section SHALL be omitted. Each listed article SHALL be rendered with the same card as the home page latest-articles list (cover, tags, title, description, publish date) and the whole card SHALL link to `/<slug>`. Articles excluded from the production build because their `pubDate` is in the future SHALL NOT appear as related articles.

#### Scenario: Shared tags rank first and adjacent articles are excluded

- **WHEN** an article's related articles are chosen from candidates with different numbers of shared tags
- **THEN** the section lists candidates by shared tag count descending, breaks ties by newer `pubDate`, and never lists the current, previous, or next article

##### Example: ranking with neighbours

- **GIVEN** the current article X (pubDate 2026-01-10, tags `ha`, `smart`), its previous article O (2026-01-09, tags `ha`), its next article N (2026-01-11, tags `ha`, `smart`), and A (2026-01-01, tags `ha`, `smart`), B (2026-01-02, tags `ha`), C (2026-01-03, tags `smart`), D (2026-01-05, tags `pokemon`)
- **WHEN** the page for X is built
- **THEN** the related articles are, in order: A, C, B

#### Scenario: Newest articles fill the remaining slots

- **WHEN** fewer than 3 candidates share a tag with the current article
- **THEN** the remaining slots are filled with the newest candidates that share no tag, so the section lists 3 articles when at least 3 candidates exist

##### Example: one tagged match

- **GIVEN** the current article X (pubDate 2026-01-10, tags `ha`), its previous article O (2026-01-09) and next article N (2026-01-11), and A (2026-01-01, tags `ha`), B (2026-01-02, tags `x`), C (2026-01-03, tags `y`), D (2026-01-05, tags `z`)
- **WHEN** the page for X is built
- **THEN** the related articles are, in order: A, D, C

#### Scenario: Small sites show fewer cards or no section

- **WHEN** an article has fewer than 3 candidates
- **THEN** the section lists every candidate, and is omitted entirely when there are no candidates

##### Example: three articles in total

- **GIVEN** exactly three published articles P (2026-01-01), Q (2026-02-01), R (2026-03-01)
- **WHEN** each article page is built
- **THEN** P lists only R, Q has no related articles section, and R lists only P

#### Scenario: Cards link to the article pages

- **WHEN** an article lists a related article with slug `pokemon-daily-dashboard`
- **THEN** the related card is a link to `/pokemon-daily-dashboard` and shows that article's title, description, and publish date

#### Scenario: Future articles are not recommended

- **WHEN** the production build runs while an article has a `pubDate` later than the build time
- **THEN** no article page lists that article as a related article


<!-- @trace
source: related-posts
updated: 2026-11-02
code:
  - src/lib/posts.ts
  - src/pages/[slug].astro
  - tests/related-posts.test.mjs
-->
