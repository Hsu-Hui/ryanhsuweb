## MODIFIED Requirements

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

## ADDED Requirements

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
