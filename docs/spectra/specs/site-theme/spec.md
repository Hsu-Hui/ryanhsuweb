# site-theme Specification

## Purpose

Defines how the site chooses, switches, and remembers its light or dark color theme, and how code highlighting and motion follow the reader's settings. It exists so that the tech-styled design stays readable in both themes and respects the reader's system preferences.

## Requirements

### Requirement: Initial theme follows stored choice then system preference

On every page load, the system SHALL set `data-theme` on the `<html>` element to `light` or `dark`. It SHALL use the value stored under the `localStorage` key `theme` when that value is `light` or `dark`. Otherwise, it SHALL use the `prefers-color-scheme` media query. The theme SHALL be applied by an inline script in `<head>` that runs before the first paint, so the page never renders in the other theme first.

#### Scenario: Theme resolution

- **WHEN** a page loads with a given stored value and system preference
- **THEN** `data-theme` is set according to the resolution order

##### Example: theme resolution cases

| localStorage `theme` | System preference | Resulting `data-theme` |
| --- | --- | --- |
| (not set) | dark | dark |
| (not set) | light | light |
| `light` | dark | light |
| `dark` | light | dark |
| `blue` (invalid) | dark | dark |
| storage access throws | light | light |

#### Scenario: No flash of the wrong theme

- **WHEN** a reader with `theme` stored as `dark` and a light system preference reloads an article page
- **THEN** the first painted frame already uses the dark theme colors


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
### Requirement: Manual theme toggle persists the choice

The sidebar and the bottom navigation bar SHALL each contain a theme toggle button. Activating it SHALL switch `data-theme` between `light` and `dark` and SHALL store the new value under the `localStorage` key `theme`. The button's accessible label SHALL describe the action, `切換為深色模式` in the light theme and `切換為淺色模式` in the dark theme. While no choice is stored, a change in the system preference SHALL update the theme without a reload. After a choice is stored, system preference changes SHALL NOT override it. If `localStorage` is unavailable, the toggle SHALL still switch the theme for the current page without throwing an error.

#### Scenario: Choice survives navigation

- **WHEN** a reader in the light theme activates the toggle and then opens another page
- **THEN** the other page renders in the dark theme and `localStorage` `theme` equals `dark`

#### Scenario: Storage blocked

- **WHEN** `localStorage` access throws and the reader activates the toggle
- **THEN** the current page switches theme and no error is raised


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
### Requirement: Theme color tokens meet contrast requirements

All page colors SHALL come from CSS custom properties defined once for each theme. Body text, muted text, and accent text SHALL each have a contrast ratio of at least 4.5:1 against both the page background and the card background in both themes.

#### Scenario: Token contrast

- **WHEN** the contrast ratios of the defined token pairs are computed with the WCAG relative luminance formula
- **THEN** every text-on-background pair is at least 4.5:1

##### Example: defined tokens

| Token | Light | Dark |
| --- | --- | --- |
| background | #F8FAFC | #0F172A |
| card | #FFFFFF | #1B2336 |
| text | #0F172A | #F8FAFC |
| muted text | #475569 | #94A3B8 |
| accent | #0E7490 | #22D3EE |


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
### Requirement: Code block highlighting follows the theme

Fenced code blocks in articles SHALL be highlighted with the `github-light` theme when `data-theme` is `light` and with the `github-dark` theme when it is `dark`. Switching the theme SHALL change the code colors without re-rendering the page.

#### Scenario: Toggle recolors code

- **WHEN** an article with a fenced `ts` code block is viewed and the reader switches from light to dark
- **THEN** the code block colors change to the `github-dark` colors without a page reload


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
### Requirement: Reduced motion is respected

Hover and focus transitions SHALL last between 150ms and 300ms. When the reader's system has `prefers-reduced-motion: reduce`, all transitions and animations SHALL be disabled. Every focusable element SHALL show a visible focus indicator when focused with the keyboard.

#### Scenario: Reduced motion enabled

- **WHEN** a page is viewed with `prefers-reduced-motion: reduce`
- **THEN** hovering a card or link changes its style without a transition

#### Scenario: Keyboard focus

- **WHEN** a reader tabs to the theme toggle button
- **THEN** a visible focus ring is shown around it

##### Example: focus ring on the theme toggle

| Viewport | Theme | Focused element | Expected focus ring |
| --- | --- | --- | --- |
| 1280px | light | sidebar theme toggle | 2px solid outline in `#0E7490` with 2px offset |
| 1280px | dark | sidebar theme toggle | 2px solid outline in `#22D3EE` with 2px offset |
| 375px | dark | bottom bar theme toggle | 2px solid outline in `#22D3EE` with 2px offset |
| 1280px | light | theme toggle focused by mouse click | no focus ring (`:focus-visible` only) |

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