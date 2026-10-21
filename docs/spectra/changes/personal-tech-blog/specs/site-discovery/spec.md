## Purpose

Defines the listing and feed outputs generated automatically from article content files: the paginated home page list, tag pages, sitemap, and RSS feed. It exists so that no listing has to be edited by hand when an article is added.

## ADDED Requirements

### Requirement: Home page article list

The home page SHALL list articles sorted by `pubDate` descending, under the heading `~/ 文章`. For each article it SHALL show a card containing the title, the publish date, the description, and its tags. Activating any part of the card other than a tag link SHALL navigate to `/<slug>`; activating a tag link SHALL navigate to `/tags/<tag>`. The card SHALL expose exactly one link to `/<slug>`, whose accessible name is the article title. Tag pages SHALL use the same card.

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

#### Scenario: Newest first

- **WHEN** the home page is built from articles with different publish dates
- **THEN** the articles appear from newest to oldest

##### Example: ordering

- **GIVEN** articles A (pubDate 2026-01-01), B (2026-03-01), C (2026-02-01)
- **WHEN** the home page is built
- **THEN** articles appear in order B, C, A

### Requirement: Home page pagination

The home page article list SHALL be split into pages of 10 articles. Page 1 SHALL be served at `/`, and page N for N ≥ 2 SHALL be served at `/page/N`. The system SHALL NOT generate `/page/1`. When there is more than one page, each page SHALL show a previous-page link (omitted on page 1), a next-page link (omitted on the last page), and the indicator `第 N / M 頁`. When there is only one page, no pagination controls SHALL be shown. Tag pages SHALL NOT be paginated.

#### Scenario: Article count determines pages

- **WHEN** the site is built with a given number of articles
- **THEN** the generated home pages and pagination controls match the article count

##### Example: page generation by article count

| Article count | Pages generated | Page 1 controls | Last page controls |
| --- | --- | --- | --- |
| 3 | `/` | none | none |
| 10 | `/` | none | none |
| 11 | `/`, `/page/2` | next → `/page/2`, `第 1 / 2 頁` | previous → `/`, `第 2 / 2 頁` |
| 25 | `/`, `/page/2`, `/page/3` | next → `/page/2`, `第 1 / 3 頁` | previous → `/page/2`, `第 3 / 3 頁` |

#### Scenario: Second page content

- **WHEN** 11 articles are built
- **THEN** `/` lists the 10 newest articles and `/page/2` lists only the oldest article

### Requirement: Tag pages

The system SHALL generate `/tags`, listing every tag used by at least one article together with its article count. It SHALL also generate `/tags/<tag>` for each such tag, listing that tag's articles sorted by `pubDate` descending. No page SHALL be generated for a tag that no article uses.

#### Scenario: Tag index and tag page

- **WHEN** article A has tags `["astro", "css"]` and article B has tags `["astro"]`
- **THEN** `/tags` lists `astro (2)` and `css (1)`, `/tags/astro` lists A and B, and `/tags/css` lists only A

### Requirement: Sitemap

The system SHALL generate `sitemap-index.xml`, using the configured `siteUrl`. Its sitemaps SHALL include the absolute URL of the home page, every generated `/page/N` page, every article, every tag page, `/about`, `/privacy`, and `/contact`. The 404 page MUST NOT be included.

#### Scenario: New article appears in sitemap

- **WHEN** the article `hello-world` is added and the site is built with `siteUrl` `https://example.dev`
- **THEN** the generated sitemap contains `https://example.dev/hello-world`

### Requirement: RSS feed

The system SHALL generate `/rss.xml` as an RSS 2.0 feed containing every article sorted by `pubDate` descending. Each item SHALL have the article title, absolute link, `pubDate`, and description. Every page SHALL include a `<link rel="alternate" type="application/rss+xml">` pointing to `/rss.xml`.

#### Scenario: Feed item

- **WHEN** the article `hello-world` with `title: "Hello"` is built with `siteUrl` `https://example.dev`
- **THEN** `rss.xml` contains an item with title `Hello` and link `https://example.dev/hello-world`
