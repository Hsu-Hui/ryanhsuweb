## MODIFIED Requirements

### Requirement: Article page content

The article page SHALL show, in order: a breadcrumb rendered as `~/ 文章 / <title>` whose `~` links to the home page and whose last segment is the article `title`, the title, the publish date, the update date when `updatedDate` is set, tag links to `/tags/<tag>`, the collapsible table of contents when the article qualifies for one (see "Article table of contents"), the rendered body, and previous/next article links. The page `<title>` and meta description SHALL come from `title` and `description`, and `og:image` SHALL come from `cover` when set. All dates SHALL be displayed in the `Asia/Taipei` time zone as `YYYY-MM-DD`.

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

## ADDED Requirements

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
