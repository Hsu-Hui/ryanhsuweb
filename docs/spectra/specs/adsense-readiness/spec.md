# adsense-readiness Specification

## Purpose

Defines what the site provides to qualify for and serve Google AdSense: the required informational pages, the publisher authorization file, the ad script, and consent handling. It exists so that the site meets AdSense review requirements from a single configuration value.

## Requirements

### Requirement: Required informational pages

The system SHALL provide an about page at `/about` and a privacy policy page at `/privacy`. The system SHALL NOT generate a separate contact page; the about page MUST show at least one way to reach the site owner. The privacy policy MUST state that:

- the site uses Google AdSense,
- Google and its partners use cookies to serve ads based on prior visits, and
- visitors can opt out of personalized advertising in Google Ads Settings, with a link to `https://adssettings.google.com`.

Any page text that refers readers to a way of contacting the owner SHALL link to `/about`.

#### Scenario: Privacy policy content

- **WHEN** `/privacy` is opened
- **THEN** the page mentions Google AdSense and cookies and links to `https://adssettings.google.com`, and its contact sentence links to `/about`

#### Scenario: No contact page

- **WHEN** the site is built
- **THEN** `dist/contact.html` does not exist and no generated page links to `/contact`


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
### Requirement: About page profile and contact links

The about page SHALL show a profile photo of the owner's cat Julia and a row of icon-only contact links built from the site configuration. At viewport widths of 768px and above, the photo and the icon row SHALL form a left column and the introduction text a right column; below 768px, the photo and the centered icon row SHALL appear above the introduction text. The contact links are:

- an email link `mailto:<contactEmail>` with the accessible name `寄信給 <author>`, shown only when `contactEmail` is non-empty;
- a GitHub link to `githubUrl` with the accessible name `GitHub`, `rel="me"`, shown only when `githubUrl` is non-empty.

Each icon link SHALL use an SVG icon, have a touch target of at least 44×44px, and show its accessible name as a tooltip on hover. The profile photo SHALL be served as an optimized WebP image with explicit `width` and `height`, SHALL have the alt text `我的貓 Julia`, and SHALL NOT carry the original file's EXIF metadata (such as GPS location or camera details).

#### Scenario: Contact icons from configuration

- **WHEN** `/about` is built with a given configuration
- **THEN** the icon links match the configuration

##### Example: icon links by configuration

| `contactEmail` | `githubUrl` | Icon links shown |
| --- | --- | --- |
| `a3218484@gmail.com` | `https://github.com/Hsu-Hui` | email (`mailto:a3218484@gmail.com`), GitHub (`https://github.com/Hsu-Hui`) |
| `a3218484@gmail.com` | empty | email only |
| empty | `https://github.com/Hsu-Hui` | GitHub only |

#### Scenario: Layout by viewport width

- **WHEN** `/about` is viewed at a given width
- **THEN** the photo, icons, and text are arranged as follows

##### Example: layout

| Viewport width | Photo and icons | Introduction text | Horizontal scroll |
| --- | --- | --- | --- |
| 1280px | left column | right column, top aligned with the photo | none |
| 768px | left column | right column | none |
| 375px | above the text, centered | below the photo and icons | none |

#### Scenario: Profile photo

- **WHEN** `/about` is built
- **THEN** the page contains one `<img>` whose `src` is a WebP file, with `width`, `height`, and `alt="我的貓 Julia"`, and the served image file contains no EXIF data


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
### Requirement: Legacy contact URL redirects to the about page

When served by Firebase Hosting, requests to `/contact` SHALL receive a 301 redirect to `/about`, so that links shared before the contact page was removed keep working. `contact` SHALL remain a reserved slug so that no article can take over this URL.

#### Scenario: Old contact link

- **WHEN** a reader requests `/contact` on the deployed site
- **THEN** the response is a 301 redirect to `/about`


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
### Requirement: Ad script loading from configuration

The AdSense script SHALL depend on `adsenseClientId` in the site configuration:

- When `adsenseClientId` matches `ca-pub-` followed by digits, every page SHALL include exactly one script `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=<adsenseClientId>` with `async` and `crossorigin="anonymous"`, which enables Auto ads.
- When `adsenseClientId` is empty, no page SHALL include the AdSense script, and the build SHALL succeed.
- When `adsenseClientId` is non-empty but does not match the pattern, the build MUST fail with an error naming `adsenseClientId`.

#### Scenario: Configured client id

- **WHEN** `adsenseClientId` is `ca-pub-1234567890123456` and the site is built
- **THEN** every page contains one AdSense script tag with `client=ca-pub-1234567890123456`

##### Example: configuration cases

| adsenseClientId | AdSense script | ads.txt | Build |
| --- | --- | --- | --- |
| ca-pub-1234567890123456 | on every page, once | generated | success |
| empty string | absent | absent | success |
| pub-1234 | not applicable | not applicable | fail, names adsenseClientId |


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
### Requirement: Publisher authorization file

When `adsenseClientId` is set, the system SHALL serve `/ads.txt` at the site root. The file SHALL contain the line `google.com, pub-<digits>, DIRECT, f08c47fec0942fa0`, where `<digits>` are taken from `adsenseClientId`. When `adsenseClientId` is empty, `/ads.txt` SHALL NOT be generated.

#### Scenario: ads.txt content

- **WHEN** `adsenseClientId` is `ca-pub-1234567890123456` and the site is built
- **THEN** `/ads.txt` contains `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`


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
### Requirement: Consent handling through AdSense Privacy and messaging

The site SHALL rely on the consent message that the owner configures in AdSense "Privacy & messaging" and that the AdSense script delivers. The site SHALL NOT include any other consent banner. The project README SHALL document that the owner must enable the GDPR message in AdSense before ads serve to EEA and UK visitors.

#### Scenario: No duplicate consent banner

- **WHEN** any page is built
- **THEN** the page contains no consent banner markup of its own

##### Example: built pages contain no site-made consent markup

- **GIVEN** the site is built with `adsenseClientId` set to `ca-pub-1234567890123456`
- **WHEN** every `.html` file under `dist/` is searched for elements whose `id`, `class`, or `data-*` attribute contains `consent`, `cookie-banner`, or `cookie-notice`
- **THEN** the search finds 0 matches in each file

| Page | Matching elements | Note |
| --- | --- | --- |
| `dist/index.html` | 0 | home page |
| `dist/hello-world.html` | 0 | article page |
| `dist/privacy.html` | 0 | body text mentions cookies, but no banner element exists |

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