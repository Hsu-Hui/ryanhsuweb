## MODIFIED Requirements

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
