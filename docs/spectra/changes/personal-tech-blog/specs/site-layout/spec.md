## Purpose

Defines the single shared frame that wraps every page of the site, modelled on the layout of kaochenlong.com. It exists so that layout changes are made in one place.

## ADDED Requirements

### Requirement: Shared page frame

Every page SHALL be rendered through one shared base layout that provides the HTML head (charset, viewport, title, meta description, canonical URL, global stylesheet), the navigation, and the footer. The footer SHALL link to `/about` and `/privacy`.

#### Scenario: Footer links on every page

- **WHEN** any generated page (home, posts, article, tag page, about, privacy, 404) is opened
- **THEN** the page contains footer links to `/about` and `/privacy`, and no link to `/contact`

#### Scenario: Canonical URL uses the configured site URL

- **WHEN** `siteUrl` is `https://example.dev` and the article `/hello-world` is built
- **THEN** its canonical link is `https://example.dev/hello-world`

### Requirement: Responsive navigation

At viewport widths of 1024px and above, the system SHALL show a left sidebar navigation and SHALL hide the bottom navigation bar. Below 1024px, it SHALL show a bottom navigation bar fixed to the viewport bottom and SHALL hide the sidebar. Both navigations SHALL contain exactly five items: links to the home page, `/posts`, `/about`, and `/rss.xml`, and the theme toggle button. The home link SHALL use the terminal icon (`>_`) as the site mark; no separate decorative logo or additional home icon SHALL be shown. Every icon-only item SHALL have an accessible label and a touch target of at least 44×44px. The bottom navigation bar SHALL NOT cover page content when the page is scrolled to the end.

#### Scenario: Desktop width

- **WHEN** a page is viewed at 1280px width
- **THEN** the sidebar is visible and the bottom navigation bar is not

#### Scenario: Mobile width

- **WHEN** a page is viewed at 375px width
- **THEN** the bottom navigation bar is visible, the sidebar is not, and the last line of the footer is fully visible above the bottom bar when scrolled to the end

### Requirement: Not found page

The system SHALL generate a `404` page, rendered with the shared frame, that links back to the home page.

#### Scenario: Unknown path

- **WHEN** a visitor requests a path that matches no page on the deployed site
- **THEN** the 404 page with a link to the home page is shown
