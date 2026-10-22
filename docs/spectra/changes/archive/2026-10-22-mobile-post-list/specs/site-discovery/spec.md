## ADDED Requirements

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
