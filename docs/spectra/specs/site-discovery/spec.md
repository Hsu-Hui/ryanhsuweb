# site-discovery Specification

## Purpose

Defines the listing and feed outputs generated automatically from article content files: the home page with its latest-articles marquee, the posts archive with tag filtering, tag pages, sitemap, and RSS feed. It exists so that no listing has to be edited by hand when an article is added.

## Requirements

### Requirement: Home page

The home page SHALL show, in order:

1. an introduction block with the prompt `$ whoami`, an `<h1>` whose text is the configured `siteDescription` (for example `Ryan Hsu 的技術筆記`) revealed with a typing animation, and links to `/posts`, `/about`, and `/rss.xml`;
2. the latest-articles marquee;
3. a section headed `~/ 最新文章` listing the 5 newest articles by `pubDate` descending, each row showing the publish date and the title linked to `/<slug>`, followed by a link `看全部文章` to `/posts`;
4. a section headed `~/ 依主題瀏覽` listing every tag used by at least one article with its article count, each linking to `/posts?tag=<tag>`.

The full heading text SHALL be present in the built HTML so that search engines and readers without JavaScript see it. The typing animation SHALL type one character at a time with a blinking cursor, SHALL keep the heading's accessible name equal to the full text while typing, and SHALL be skipped (showing the full text immediately) when `prefers-reduced-motion: reduce` is set. No separate subtitle line SHALL repeat the heading text.

When there are no articles, the latest-articles section and the marquee SHALL be omitted and the introduction block SHALL still render.

#### Scenario: Heading text and animation

- **WHEN** the home page is built with `siteDescription` `Ryan Hsu 的技術筆記` and opened in a browser
- **THEN** `dist/index.html` contains `<h1` with the text `Ryan Hsu 的技術筆記`, the visible text grows one character at a time until it equals the full text, the heading keeps the accessible name `Ryan Hsu 的技術筆記` throughout, and no other element in the introduction block repeats that text

#### Scenario: Latest articles limited to five

- **WHEN** the home page is built from a given number of articles
- **THEN** the latest-articles section lists at most 5 articles, newest first

##### Example: latest list by article count

| Article count | Rows in `~/ 最新文章` | Order |
| --- | --- | --- |
| 1 | 1 | the only article |
| 3 | 3 | newest to oldest |
| 8 | 5 | the 5 newest, newest first |

#### Scenario: Topic links

- **WHEN** article A has tags `["astro", "css"]` and article B has tags `["astro"]`
- **THEN** the `~/ 依主題瀏覽` section shows `#astro (2)` linking to `/posts?tag=astro` and `#css (1)` linking to `/posts?tag=css`


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
### Requirement: Latest articles marquee

The home page SHALL show a horizontally scrolling marquee of the titles of the 8 newest articles, each title linking to `/<slug>`. The scrolling SHALL loop seamlessly, SHALL pause while the pointer is over the marquee or any link inside it has keyboard focus, and SHALL NOT scroll when `prefers-reduced-motion: reduce` is set, in which case the titles SHALL be shown as a static, wrapping list. Assistive technologies SHALL encounter each title link only once, even though the titles are visually duplicated to make the loop seamless.

#### Scenario: Marquee content

- **WHEN** the home page is built from 10 articles
- **THEN** the marquee contains links to the 8 newest articles, and every duplicated copy used for looping is hidden from assistive technologies and removed from the keyboard tab order

#### Scenario: Pause and reduced motion

- **WHEN** the reader hovers the marquee, or the system has `prefers-reduced-motion: reduce`
- **THEN** the marquee does not move


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
### Requirement: Posts archive page

The system SHALL generate `/posts` listing every article, grouped by publish year in descending order, and within each year sorted by `pubDate` descending. Each row SHALL show the publish date as `MM-DD`, the title linked to `/<slug>`, and the article's tags. The page SHALL NOT be paginated.

#### Scenario: Grouped by year

- **WHEN** `/posts` is built

##### Example: year grouping

- **GIVEN** articles A (pubDate 2025-12-31), B (2026-03-01), C (2026-01-15)
- **WHEN** `/posts` is built
- **THEN** the page shows a `2026` group containing B then C, followed by a `2025` group containing A


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
### Requirement: Posts tag filter

`/posts` SHALL show a row of filter controls: `全部` and one control per used tag. Selecting a tag control SHALL show only the articles with that tag, hide year groups left empty, mark the selected control with `aria-pressed="true"`, and update the address to `/posts?tag=<tag>` without reloading. Selecting `全部` SHALL show every article and update the address to `/posts`. Opening `/posts?tag=<tag>` directly SHALL apply that filter on load; an unknown tag SHALL fall back to `全部`. Without JavaScript, each tag control SHALL be a link to `/tags/<tag>`.

#### Scenario: Filter by tag

- **WHEN** a reader opens `/posts` and selects a tag

##### Example: filtering

| Articles | Action | Visible articles | Address |
| --- | --- | --- | --- |
| A `[astro]` 2026, B `[css]` 2025 | open `/posts` | A, B | `/posts` |
| same | select `#astro` | A (the 2025 group is hidden) | `/posts?tag=astro` |
| same | select `全部` | A, B | `/posts` |
| same | open `/posts?tag=css` | B | `/posts?tag=css` |
| same | open `/posts?tag=nope` | A, B, with `全部` pressed | `/posts?tag=nope` |


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
### Requirement: Legacy pagination URLs redirect to the posts page

The site SHALL NOT generate `/page/N` pages. When served by Firebase Hosting, requests to `/page/<n>` SHALL receive a 301 redirect to `/posts`.

#### Scenario: Old page link

- **WHEN** a reader requests `/page/2` on the deployed site
- **THEN** the response is a 301 redirect to `/posts`


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
### Requirement: Article card on tag pages

Tag pages SHALL list their articles as cards containing the title, the publish date, the description, and the tags. Activating any part of the card other than a tag link SHALL navigate to `/<slug>`; activating a tag link SHALL navigate to `/tags/<tag>`. The card SHALL expose exactly one link to `/<slug>`, whose accessible name is the article title.

#### Scenario: Whole card opens the article

- **WHEN** a reader clicks a point on an article card
- **THEN** the browser navigates according to the clicked area

##### Example: click targets on the card for article `hello-world` tagged `astro`

| Clicked area | Destination |
| --- | --- |
| title | `/hello-world` |
| description text | `/hello-world` |
| publish date | `/hello-world` |
| empty padding inside the card | `/hello-world` |
| `#astro` tag | `/tags/astro` |


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
### Requirement: Tag pages

The system SHALL generate `/tags`, listing every tag used by at least one article together with its article count. It SHALL also generate `/tags/<tag>` for each such tag, listing that tag's articles sorted by `pubDate` descending. No page SHALL be generated for a tag that no article uses.

#### Scenario: Tag index and tag page

- **WHEN** article A has tags `["astro", "css"]` and article B has tags `["astro"]`
- **THEN** `/tags` lists `astro (2)` and `css (1)`, `/tags/astro` lists A and B, and `/tags/css` lists only A


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
### Requirement: Sitemap

The system SHALL generate `sitemap-index.xml`, using the configured `siteUrl`. Its sitemaps SHALL include the absolute URL of the home page, `/posts`, every article, every tag page, `/about`, and `/privacy`. The 404 page MUST NOT be included, and `/contact` MUST NOT be included because it only redirects.

#### Scenario: New article appears in sitemap

- **WHEN** the article `hello-world` is added and the site is built with `siteUrl` `https://example.dev`
- **THEN** the generated sitemap contains `https://example.dev/hello-world` and `https://example.dev/posts`


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
### Requirement: RSS feed

The system SHALL generate `/rss.xml` as an RSS 2.0 feed containing every article sorted by `pubDate` descending. Each item SHALL have the article title, absolute link, `pubDate`, and description. Every page SHALL include a `<link rel="alternate" type="application/rss+xml">` pointing to `/rss.xml`.

#### Scenario: Feed item

- **WHEN** the article `hello-world` with `title: "Hello"` is built with `siteUrl` `https://example.dev`
- **THEN** `rss.xml` contains an item with title `Hello` and link `https://example.dev/hello-world`

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
### Requirement: Article list row layout

The article rows on the home page `~/ 最新文章` section and on `/posts` SHALL use one shared layout. Below a viewport width of 768px, each row SHALL show, from top to bottom: the publish date, the title linked to `/<slug>`, the article `description` truncated to at most two lines, and the tags. At 768px and above, each row SHALL show the publish date, the title, and the tags on one line, and SHALL NOT show the description. A row SHALL omit the tag line when the article has no tags.

#### Scenario: Row content by viewport width

- **WHEN** an article with title `Post B`, description `Desc B`, and tags `["css"]` is listed and viewed at a given width
- **THEN** the row shows the elements in the order given by the table

##### Example: row layout

| Viewport width | Row content (in order) |
| --- | --- |
| 390px | date, `Post B` on its own line, `Desc B` (at most two lines), `#css` |
| 1280px | date, `Post B`, `#css` on one line; `Desc B` not shown |

<!-- @trace
source: mobile-post-list
updated: 2026-10-22
code:
  - src/components/PostRow.astro
  - tests/site.test.mjs
-->

---
### Requirement: Discovery outputs expose only published articles

Every production discovery output SHALL use the same published article set as article page generation. The home page, posts archive, tag index, tag pages, RSS feed, sitemap, tag counts, and article navigation MUST NOT reference an article whose `pubDate` is later than the production build instant. A tag used only by future articles MUST NOT receive a production tag page.

#### Scenario: Future article is absent from all discovery outputs

- **WHEN** a production build contains one past article and one future article with a unique tag
- **THEN** the past article appears in normal discovery outputs, while the future article and its unique tag are absent from the home page, posts archive, tag index, tag pages, RSS feed, sitemap, and article navigation

##### Example: publication cutoff

- **GIVEN** a build instant of `2026-11-01T08:05:00+08:00`, article A with `pubDate: 2026-11-01T08:00:00+08:00`, and article B tagged `scheduled-only` with `pubDate: 2026-11-02T08:00:00+08:00`
- **WHEN** the production site is built
- **THEN** article A is discoverable, article B is not discoverable, and no `/tags/scheduled-only` page is generated

<!-- @trace
source: scheduled-post-publishing
updated: 2026-10-23
code:
  - src/lib/posts.ts
  - tests/content.test.mjs
-->
