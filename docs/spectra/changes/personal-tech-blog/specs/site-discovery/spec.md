## Purpose

Defines the listing and feed outputs generated automatically from article content files: the home page with its latest-articles marquee, the posts archive with tag filtering, tag pages, sitemap, and RSS feed. It exists so that no listing has to be edited by hand when an article is added.

## ADDED Requirements

### Requirement: Home page

The home page SHALL show, in order:

1. an introduction block with the prompt `$ whoami`, the configured `author` name, the configured `siteDescription`, and links to `/posts`, `/about`, and `/rss.xml`;
2. the latest-articles marquee;
3. a section headed `~/ 最新文章` listing the 5 newest articles by `pubDate` descending, each row showing the publish date and the title linked to `/<slug>`, followed by a link `看全部文章` to `/posts`;
4. a section headed `~/ 依主題瀏覽` listing every tag used by at least one article with its article count, each linking to `/posts?tag=<tag>`.

When there are no articles, the latest-articles section and the marquee SHALL be omitted and the introduction block SHALL still render.

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

### Requirement: Latest articles marquee

The home page SHALL show a horizontally scrolling marquee of the titles of the 8 newest articles, each title linking to `/<slug>`. The scrolling SHALL loop seamlessly, SHALL pause while the pointer is over the marquee or any link inside it has keyboard focus, and SHALL NOT scroll when `prefers-reduced-motion: reduce` is set, in which case the titles SHALL be shown as a static, wrapping list. Assistive technologies SHALL encounter each title link only once, even though the titles are visually duplicated to make the loop seamless.

#### Scenario: Marquee content

- **WHEN** the home page is built from 10 articles
- **THEN** the marquee contains links to the 8 newest articles, and every duplicated copy used for looping is hidden from assistive technologies and removed from the keyboard tab order

#### Scenario: Pause and reduced motion

- **WHEN** the reader hovers the marquee, or the system has `prefers-reduced-motion: reduce`
- **THEN** the marquee does not move

### Requirement: Posts archive page

The system SHALL generate `/posts` listing every article, grouped by publish year in descending order, and within each year sorted by `pubDate` descending. Each row SHALL show the publish date as `MM-DD`, the title linked to `/<slug>`, and the article's tags. The page SHALL NOT be paginated.

#### Scenario: Grouped by year

- **WHEN** `/posts` is built

##### Example: year grouping

- **GIVEN** articles A (pubDate 2025-12-31), B (2026-03-01), C (2026-01-15)
- **WHEN** `/posts` is built
- **THEN** the page shows a `2026` group containing B then C, followed by a `2025` group containing A

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

### Requirement: Legacy pagination URLs redirect to the posts page

The site SHALL NOT generate `/page/N` pages. When served by Firebase Hosting, requests to `/page/<n>` SHALL receive a 301 redirect to `/posts`.

#### Scenario: Old page link

- **WHEN** a reader requests `/page/2` on the deployed site
- **THEN** the response is a 301 redirect to `/posts`

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

### Requirement: Tag pages

The system SHALL generate `/tags`, listing every tag used by at least one article together with its article count. It SHALL also generate `/tags/<tag>` for each such tag, listing that tag's articles sorted by `pubDate` descending. No page SHALL be generated for a tag that no article uses.

#### Scenario: Tag index and tag page

- **WHEN** article A has tags `["astro", "css"]` and article B has tags `["astro"]`
- **THEN** `/tags` lists `astro (2)` and `css (1)`, `/tags/astro` lists A and B, and `/tags/css` lists only A

### Requirement: Sitemap

The system SHALL generate `sitemap-index.xml`, using the configured `siteUrl`. Its sitemaps SHALL include the absolute URL of the home page, `/posts`, every article, every tag page, `/about`, `/privacy`, and `/contact`. The 404 page MUST NOT be included.

#### Scenario: New article appears in sitemap

- **WHEN** the article `hello-world` is added and the site is built with `siteUrl` `https://example.dev`
- **THEN** the generated sitemap contains `https://example.dev/hello-world` and `https://example.dev/posts`

### Requirement: RSS feed

The system SHALL generate `/rss.xml` as an RSS 2.0 feed containing every article sorted by `pubDate` descending. Each item SHALL have the article title, absolute link, `pubDate`, and description. Every page SHALL include a `<link rel="alternate" type="application/rss+xml">` pointing to `/rss.xml`.

#### Scenario: Feed item

- **WHEN** the article `hello-world` with `title: "Hello"` is built with `siteUrl` `https://example.dev`
- **THEN** `rss.xml` contains an item with title `Hello` and link `https://example.dev/hello-world`
