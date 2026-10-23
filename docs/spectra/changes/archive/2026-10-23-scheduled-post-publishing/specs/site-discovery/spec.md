## ADDED Requirements

### Requirement: Discovery outputs expose only published articles

Every production discovery output SHALL use the same published article set as article page generation. The home page, posts archive, tag index, tag pages, RSS feed, sitemap, tag counts, and article navigation MUST NOT reference an article whose `pubDate` is later than the production build instant. A tag used only by future articles MUST NOT receive a production tag page.

#### Scenario: Future article is absent from all discovery outputs

- **WHEN** a production build contains one past article and one future article with a unique tag
- **THEN** the past article appears in normal discovery outputs, while the future article and its unique tag are absent from the home page, posts archive, tag index, tag pages, RSS feed, sitemap, and article navigation

##### Example: publication cutoff

- **GIVEN** a build instant of `2026-11-01T08:05:00+08:00`, article A with `pubDate: 2026-11-01T08:00:00+08:00`, and article B tagged `scheduled-only` with `pubDate: 2026-11-02T08:00:00+08:00`
- **WHEN** the production site is built
- **THEN** article A is discoverable, article B is not discoverable, and no `/tags/scheduled-only` page is generated
