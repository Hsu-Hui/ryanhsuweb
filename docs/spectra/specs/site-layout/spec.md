# site-layout Specification

## Purpose

Defines the single shared frame that wraps every page of the site, modelled on the layout of kaochenlong.com. It exists so that layout changes are made in one place.

## Requirements

### Requirement: Shared page frame

Every page SHALL be rendered through one shared base layout that provides the HTML head (charset, viewport, title, meta description, canonical URL, global stylesheet), the navigation, and the footer. The footer SHALL link to `/about` and `/privacy`.

#### Scenario: Footer links on every page

- **WHEN** any generated page (home, posts, article, tag page, about, privacy, 404) is opened
- **THEN** the page contains footer links to `/about` and `/privacy`, and no link to `/contact`

#### Scenario: Canonical URL uses the configured site URL

- **WHEN** `siteUrl` is `https://example.dev` and the article `/hello-world` is built
- **THEN** its canonical link is `https://example.dev/hello-world`


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
### Requirement: Responsive navigation

At viewport widths of 1024px and above, the system SHALL show a left sidebar navigation and SHALL hide the bottom navigation bar. Below 1024px, it SHALL show a bottom navigation bar fixed to the viewport bottom and SHALL hide the sidebar. Both navigations SHALL contain exactly five items: links to the home page, `/posts`, `/about`, and `/rss.xml`, and the theme toggle button. The home link SHALL use the terminal icon (`>_`) as the site mark; no separate decorative logo or additional home icon SHALL be shown. Every icon-only item SHALL have an accessible label and a touch target of at least 44×44px. The bottom navigation bar SHALL NOT cover page content when the page is scrolled to the end.

#### Scenario: Desktop width

- **WHEN** a page is viewed at 1280px width
- **THEN** the sidebar is visible and the bottom navigation bar is not

#### Scenario: Mobile width

- **WHEN** a page is viewed at 375px width
- **THEN** the bottom navigation bar is visible, the sidebar is not, and the last line of the footer is fully visible above the bottom bar when scrolled to the end


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
### Requirement: Not found page

The system SHALL generate a `404` page, rendered with the shared frame, that links back to the home page.

#### Scenario: Unknown path

- **WHEN** a visitor requests a path that matches no page on the deployed site
- **THEN** the 404 page with a link to the home page is shown

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