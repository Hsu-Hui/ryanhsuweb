## Purpose

Defines what the site provides so that search engines and AI answer engines can crawl, understand, and consistently index its articles: the crawler policy file, article structured data, and a single canonical URL form. It exists to support both SEO and GEO without depending on hosting-provider defaults.

## ADDED Requirements

### Requirement: Crawler policy file

The system SHALL serve `/robots.txt` at the site root. It SHALL allow all user agents to crawl every path and SHALL reference the absolute sitemap URL built from `siteUrl`. It SHALL NOT disallow any AI crawler.

#### Scenario: robots.txt content

- **WHEN** the site is built with `siteUrl` `https://example.dev`
- **THEN** `/robots.txt` allows all crawlers and points to `https://example.dev/sitemap-index.xml`

##### Example: generated robots.txt

- **GIVEN** `siteUrl` is `https://example.dev`
- **WHEN** the site is built
- **THEN** `dist/robots.txt` contains the lines `User-agent: *`, `Allow: /`, and `Sitemap: https://example.dev/sitemap-index.xml`, and contains no `Disallow` line

### Requirement: Article structured data

Each article page SHALL include exactly one `<script type="application/ld+json">` element with a schema.org `BlogPosting` object, built from the article frontmatter and site configuration:

- `headline` from `title`
- `description` from `description`
- `datePublished` from `pubDate` in ISO 8601
- `dateModified` from `updatedDate`, or from `pubDate` when `updatedDate` is not set
- `author` as a `Person` with the configured `author` name and `url` `<siteUrl>/about`
- `image` from `cover`, omitted when `cover` is not set
- `mainEntityOfPage` set to the article's canonical URL
- `inLanguage` set to `zh-TW`
- `keywords` from `tags` joined with commas

Any `<` character in the serialized JSON SHALL be escaped as `<`. Non-article pages SHALL NOT include a `BlogPosting` object.

#### Scenario: Structured data fields

- **WHEN** an article is built and its JSON-LD is parsed
- **THEN** the object fields match the frontmatter mapping

##### Example: field mapping

| Frontmatter / config | JSON-LD result |
| --- | --- |
| `title: "Hello"` | `"headline": "Hello"` |
| `pubDate: 2026-10-21`, no `updatedDate` | `datePublished` and `dateModified` both `2026-10-21T00:00:00.000Z` |
| `pubDate: 2026-10-21`, `updatedDate: 2026-11-01` | `dateModified` `2026-11-01T00:00:00.000Z` |
| no `cover` | no `image` key |
| `tags: ["astro", "seo"]` | `"keywords": "astro,seo"` |
| `title: "a </script> b"` | serialized text contains `</script>` and the page HTML stays valid |

#### Scenario: Not on fixed pages

- **WHEN** `/about` is built
- **THEN** the page contains no `BlogPosting` JSON-LD

### Requirement: Canonical URLs without trailing slash

Every internal link, canonical link, sitemap entry, and RSS link SHALL use the URL form without a trailing slash and without an `.html` extension, except the home page `/`. When deployed on Firebase Hosting, requests to the trailing-slash form or the `.html` form SHALL be answered with a 301 redirect to the canonical form, and requests to unknown paths SHALL receive the 404 page with status 404.

#### Scenario: Hosting responses

- **WHEN** the built site is served by the Firebase Hosting emulator and the following paths are requested
- **THEN** the status codes and redirect targets match the table

##### Example: request handling

| Request path | Status | Location |
| --- | --- | --- |
| `/about` | 200 | (none) |
| `/about/` | 301 | `/about` |
| `/about.html` | 301 | `/about` |
| `/hello-world/` | 301 | `/hello-world` |
| `/page/2/` | 301 | `/page/2` |
| `/does-not-exist` | 404 | (none) |

#### Scenario: Links use canonical form

- **WHEN** the built HTML, sitemap, and RSS files are searched for internal URLs
- **THEN** no internal URL other than `/` ends with `/` or `.html`
