# blog-posts Specification

## Purpose

Defines how a technical article is authored as a single Markdown content file and how each article is rendered as its own page. It exists so that publishing a new article requires adding exactly one file.

## Requirements

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


<!-- @trace
source: scheduled-post-publishing
updated: 2026-10-23
code:
  - src/lib/posts.ts
  - tests/content.test.mjs
-->

---
### Requirement: Article URL is derived from the file name

The system SHALL serve each article at `/<slug>`, where `<slug>` is the article file name without the `.md` extension. The build MUST fail when a slug equals a reserved slug: `about`, `privacy`, `contact`, `tags`, `page`, `posts`, `rss.xml`, `sitemap-index.xml`, `ads.txt`, `robots.txt`, `404`.

#### Scenario: Article is served at its slug

- **WHEN** the file `src/content/posts/astro-content-collections.md` is built
- **THEN** the page is available at `/astro-content-collections`

#### Scenario: Reserved slug collision fails the build

- **WHEN** a file `src/content/posts/about.md` exists
- **THEN** the build MUST fail with an error naming `about.md` as conflicting with a reserved page


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


<!-- @trace
source: post-table-of-contents
updated: 2026-10-29
code:
  - graphify-out/cache/semantic/pab7e20a8ed94/0728bf1f7d4e831020105adef38892b1fea01cae01922240de8fcd9fc8472f03.json
  - Tools/Folia-Traditional-Lyrics/test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/36dc05ef160837fd5cb843683234395787cf795e507e64eb86a9c9a8cb997b13.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/client.mjs
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico
  - tests/home.test.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/51d787b86b24ed0778c1629b8133395ccdd05d1ac1f0bff9b877634a1874de8f.json
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/yaml-complexity-story.png
  - src/content/posts/why-i-started-using-home-assistant.md
  - Downloads/Folia/local-whisper-lyrics-0.2.1.zip
  - src/content/posts/iphone-6s-mini-music-control-panel.md
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e51af191d290420269d7827968c771308f09c4c340bb4e41551fcf2f400da287.json
  - public/images/how-i-customized-cleanyourtv/02-custom-architecture.svg
  - graphify-out/cache/semantic/pab7e20a8ed94/4658852e3fedefdd172ec3c7b8b35384884139a7df65affd6638ff3502d64559.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/504c0cd324e9b4aa2af3b1f4324821c79b8279f77fa85ff29f630ba43bfac992.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a5de2ac79e14ef4556b615a302ce6515cb51070e05fb20e21376ddb09f8a35b8.json
  - public/images/pokemon-daily-dashboard/03-tasks.png
  - scripts/threads/publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/fdb4b8bd688e0c3e493d5ca0896553a44539fb500dea9ec5fe26bcc857ec2213.json
  - graphify-out/cache/semantic/pab7e20a8ed94/ac604214fcb0ea7d90e705b8c09fa0136317587988e52bf222dd75de1d2f3d45.json
  - public/images/how-i-customized-cleanyourtv/cover-option-3.png
  - graphify-out/cache/semantic/pab7e20a8ed94/13d36d4fb9901518539253eb1733b322eb481f2755108af847db5fae89bfeed4.json
  - public/images/why-i-started-using-home-assistant/cover.png
  - graphify-out/cache/semantic/pab7e20a8ed94/131db42dce9dd379381fc25b45de8ad6166349ea5b476764d059dd80380d3742.json
  - graphify-out/cache/semantic/pab7e20a8ed94/7cee2cf3c13ad43d81b629f9559e7d9a3a939bb901407b2a1688572fd848598e.json
  - public/images/pokemon-daily-dashboard/cover-03c-floating-alerts.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/main.cjs
  - graphify-out/cache/semantic/pab7e20a8ed94/e7867d8a16c8b3b26a0026cdba274d56fb7961b7a22d4ef9ac0920da8d60c331.json
  - tests/deployment.test.mjs
  - tests/redirects.test.mjs
  - src/content/posts/php2shell-zeabur-security-lessons.md
  - public/images/why-i-started-using-home-assistant/cooking-mode-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34302e4c5a199a6b586ea21cc66e37716b8661a07468581dd5b79e3f8b68cd72.json
  - src/content/posts/home-assistant-green-backup-recovery-plan.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-3.png
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/mod.json
  - scripts/threads/prompt.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/mod.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a376adb0a4b8f7b71ecf00acb6f1694bd64b1b88f1398b7c38f567a1456d5125.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/client.mjs
  - public/images/clawd-on-desk/cover.png
  - public/images/how-i-customized-cleanyourtv/02-after-cleanyourtv.png
  - public/images/php2shell-zeabur-security-lessons/cover.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/dc3e182882be2ba4a89f0abec068f615180b651df2f0a5d7a19858ad3d3bdbb5.json
  - public/images/pokemon-daily-dashboard/cover-02-pipeline.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-2.png
  - public/images/my-ai-agent-journey/cover.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/opencc-js-MIT.txt
  - graphify-out/cache/semantic/pab7e20a8ed94/dcc2f32e5ae525bd3f0f7295796f4de679b011f87a75fe0e11726cba4a901b20.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4f93b16fd565a5737fd3e3ea82d2f109cdf9984ba5ba67957cecde1b30566ccd.json
  - src/content/posts/clawd-on-desk.md
  - public/images/folia-youtube-music-local-whisper-lyrics/02-lyrics.webp
  - public/images/how-i-built-my-home-assistant-dashboard/room-overview.png
  - graphify-out/cache/semantic/pab7e20a8ed94/36ea6e22ca3b1052274cd8addaa4210b5d25d7354e6092160818ca4e31e9ab4d.json
  - graphify-out/.graphify_labels.json
  - tests/scheduled-publish.test.mjs
  - src/content/posts/smart-home-vs-remote-control.md
  - public/images/smart-home-vs-remote-control/cover-option-2.png
  - public/images/pokemon-daily-dashboard/07-archive.png
  - public/images/smart-home-vs-remote-control/04-night-ac-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0366e9b80ddbf3cfb53815493c87634b82f27e269b21937fedffe4d7671ca515.json
  - src/content/posts/build-blog-with-spectra.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-1.png
  - tests/helpers/build-site.mjs
  - .agents/skills/smart-home-article/references/visual-story.md
  - scripts/threads/lib.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/b96fe26dd736b1807209055f96db68baea26f424d3c5627cede6bca8ac6cf032.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c3bf249805e95695e12aa99c3719720664ac6271d9c0908e3478390ec39893a3.json
  - graphify-out/cache/semantic/pab7e20a8ed94/66d93a007d597e10432fe8707498dc52714b85ae30ebfdc9bc6c746ab3dcc0a1.json
  - public/images/why-i-started-using-home-assistant/dehumidifier-story.png
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Start Menu.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/f48ae2c1b82b2555dc9f5fd312ac1c8ac229cbb11130d8e36dc56b042b65720c.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico.md5
  - public/images/smart-home-vs-remote-control/01-dawn-curtains-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/dac9c9633010c9aa3a9af2c71ebef8db7caf52c9d6345e3d9b8d327b642cd2cd.json
  - public/images/how-i-customized-cleanyourtv/01-before-tv.png
  - public/images/clawd-on-desk/states.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/0915fb5cc6dc1287416d4846eb9401bbc260eced119faed7d082a0ec73acab32.json
  - scripts/create-sitemap-alias.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/bc9d7658acd48d5e836a5f0aab469f881330a364e4389a65674b21899fbf9d98.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/README.md
  - README.md
  - public/images/clawd-on-desk/dashboard.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/mod.json
  - graphify-out/cache/semantic/pab7e20a8ed94/852ea4b3890a875314eee8f11aede62c308839b06f4aad36abfeff96c9a02c77.json
  - graphify-out/cache/semantic/pab7e20a8ed94/d4cab1667e718304bbf17fac087652eab9649238c57c39f5351bf4a4ba992711.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/main.cjs
  - .agents/skills/smart-home-article/SKILL.md
  - public/images/iphone-6s-mini-music-control-panel/cover.png
  - public/images/pokemon-daily-dashboard/04-products.png
  - src/content/posts/pokemon-daily-dashboard.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover.png
  - public/images/build-blog-with-spectra/cover.png
  - public/images/pokemon-daily-dashboard/01-overview.png
  - Downloads/Folia/local-whisper-lyrics-0.1.0.zip
  - public/images/how-i-customized-cleanyourtv/cover-option-2.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ee66b98cab938a10de52c6f17c8c18c9517ec50f8a42ed951c5d618a7805d17d.json
  - Tools/Folia-Traditional-Lyrics/vendor/opencc-full.mjs
  - public/images/home-assistant-green-backup-recovery-plan/02-restore-rehearsal.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-3.png
  - .agents/skills/smart-home-article/references/cover-style.md
  - public/images/how-i-customized-cleanyourtv/cover-option-1.png
  - graphify-out/cache/semantic/pab7e20a8ed94/ef8bd4acb999122500548ce9fb1ba289228a66a4fb428c7388075136c0923ebb.json
  - public/images/pokemon-daily-dashboard/cover-04b-flowing-ribbons.png
  - graphify-out/cache/semantic/pab7e20a8ed94/634d0b60ab077531347a600f03b7eaa0753ff22aaa4203acb1d2ba27adb5e8e5.json
  - scripts/threads/draft.mjs
  - graphify-out/cost.json
  - public/images/how-i-customized-cleanyourtv/03-charizard-screensaver.png
  - src/lib/posts.ts
  - src/layouts/BaseLayout.astro
  - .github/workflows/threads-token-check.yml
  - public/images/my-ai-agent-journey/openclaw-discord-news.png
  - public/images/smart-home-vs-remote-control/02-sunset-curtains-story.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/cover.png
  - tests/config.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/53c08537650dccebbc85247ee78c866f9a47ad87c1514845dccb848ec8aeef8b.json
  - public/images/folia-youtube-music-local-whisper-lyrics/cover.png
  - tests/content.test.mjs
  - Tools/Folia-Traditional-Lyrics/README.md
  - graphify-out/cache/semantic/pab7e20a8ed94/856d33eb51ab7149f2fc60f742cdd0682250797420f2ed4c052fb50ae8697569.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/pab7e20a8ed94/aca8836147541264c23655249f1deb6f25a8ee79a313708a4dfe93e229215a0f.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4e3cdfaf652778fadb28afd77e710329b715649886c382335c280f5c27633c94.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/main.cjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9cf17a8be6aa67486e6b28cf5f2b2c0af143c480f7a479eb1fd6b5f357e478db.json
  - public/images/smart-home-vs-remote-control/03-bathroom-light-story.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-1.png
  - src/pages/privacy.astro
  - graphify-out/cache/semantic/pab7e20a8ed94/188813b7c5cbac037c596197ac2364b1611b5587fa36165c89b7ff09f84c1831.json
  - graphify-out/GRAPH_REPORT.md
  - public/images/smart-home-vs-remote-control/cover-option-3.png
  - public/images/pokemon-daily-dashboard/cover-03b-device-sync.png
  - public/images/pokemon-daily-dashboard/cover-04a-soft-gradient.png
  - Downloads/Folia/Folia-Setup-0.7.22.exe
  - src/content/posts/folia-youtube-music-local-whisper-lyrics.md
  - Tools/Folia-Auto-Lyrics/mod.json
  - .spectra.yaml
  - public/images/my-ai-agent-journey/open-webui-ollama.png
  - src/site.config.ts
  - public/images/pokemon-daily-dashboard/cover-03a-straight-phone.png
  - Tools/Folia-Auto-Lyrics/main.cjs
  - package.json
  - src/content/posts/my-ai-agent-journey.md
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Desktop.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/12c391cdebc46a052c13d6f4fd593f8f1ec437711164955d2b38ce07a2a4ebb9.json
  - public/images/pokemon-daily-dashboard/cover-01-dashboard.png
  - public/images/my-ai-agent-journey/claude-code-pokemon-dashboard.webp
  - public/images/pokemon-daily-dashboard/cover-03-reminder.png
  - graphify-out/cache/semantic/pab7e20a8ed94/2650283a322fd215c041f21386fd8e98894a318530810345d85ae4af9a3052f2.json
  - graphify-out/cache/semantic/pab7e20a8ed94/49dae8c3c13f45ba972d1a43b7de9552bb5f98a0e138ad719fb0dc158add56bd.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c12229a3132922b5f468955bc30f17c995f09c054944e528f8633d5bde5c96ba.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/main.cjs
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OPENCC-NOTICES.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/mod.json
  - public/images/pokemon-daily-dashboard/cover-04c-paper-layers.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/d32228490036065f7ef0aca9bec8cfabbf4b1d859a093daf6212632c550ec4b5.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/163e17cfbe8e15685da2b49f903c8e2328e67c38ae90cab26c765191604026d1.json
  - graphify-out/cache/semantic/pab7e20a8ed94/5f0b492c0e8f270de6120bea4938057f333d451b3a781974028f7c6746a81282.json
  - graphify-out/cache/semantic/pab7e20a8ed94/03731fe1e3403d1c3b641d631fd8ca96526466065a4a12eaa1198fa5cbf55ab6.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/f57ad7f36f5fadbf9d776b7031544953bc273e7c33721de4365245b2186c4994.json
  - public/images/home-assistant-green-backup-recovery-plan/01-three-layer-backup-plan.png
  - Tools/Folia-Auto-Lyrics/REMOVE.txt
  - Tools/Folia-Auto-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/7a8d7298a2754ec8fcc4ee5689970beb0d40d76a35e766f944dbd976e594602b.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/pab7e20a8ed94/d19367ed055694e34653ba608904fc6815acbd6f8fd7a173082b115ef64c7f09.json
  - src/pages/robots.txt.ts
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/mod.json
  - Downloads/Folia/traditional-lyrics-tw-1.0.1.zip
  - public/images/pokemon-daily-dashboard/06-favorites.png
  - public/images/smart-home-vs-remote-control/cover-option-1.png
  - public/images/how-i-customized-cleanyourtv/01-custom-launcher.png
  - public/images/smart-home-vs-remote-control/03-verification-loop-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/main.cjs
  - Tools/Folia-Auto-Lyrics/README.md
  - src/content/posts/spectra-workflow.md
  - graphify-out/cache/semantic/pab7e20a8ed94/73c40e947525ba5ab53380c73a5a17db9502c9e785a5c33f766ac23c66845577.json
  - .github/workflows/firebase-hosting-pull-request.yml
  - public/images/folia-youtube-music-local-whisper-lyrics/01-playlist.webp
  - src/content/posts/how-i-built-my-home-assistant-dashboard.md
  - scripts/threads/services.mjs
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-2.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/away-mode-story.png
  - public/images/smart-home-vs-remote-control/02-context-automation-story.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OpenCC-data-Apache-2.0.txt
  - public/images/pokemon-daily-dashboard/02-go-events.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/37e596cf0d40ff331867f92bfaa3c5d305aedb14636848fd4fd1cc570fb4fb0e.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/46bb96b74d08d78e7fea4bcc0c27eddb08c08c58eb9222c980483e4e3cd2cf7b.json
  - src/components/PostRow.astro
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/main.cjs
  - public/images/iphone-6s-mini-music-control-panel/iphone6s-mini-music-console-clean.png
  - graphify-out/cache/semantic/pab7e20a8ed94/074fb852689bd1154987986f7125ea1f7c4b9ae9484d6c52a41dcad52c82e22a.json
  - .github/workflows/firebase-hosting-merge.yml
  - public/images/my-ai-agent-journey/chatgpt-deep-research-home-assistant.png
  - .github/workflows/threads-draft.yml
  - graphify-out/cache/semantic/pab7e20a8ed94/8936d5d7f9984f0ac1bd2795fe44565056ab6234d9719003f85b11118c94e2ce.json
  - public/images/smart-home-vs-remote-control/01-remote-vs-smart-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/03d50432d440337e3693179fabcec8ee9aee5b759e439f2b0390076713f776aa.json
  - tests/threads.test.mjs
  - Tools/Folia-Auto-Lyrics/test.cjs
  - .agents/skills/smart-home-article/references/writing-guide.md
  - graphify-out/cache/semantic/pab7e20a8ed94/7a622a12f1f51ee3fde6a9be5b3d72f6e8b6da619ca8a0a94b5fed244b47d721.json
  - scripts/threads/check-token.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0fc8e8e54aedb152c7ee60f626af066c39b53bb40c043580df38be4731b09231.json
  - graphify-out/cache/semantic/pab7e20a8ed94/cc1e357bc9b0536b31254c5327792c18c1412b00003e724b30a71998babed05c.json
  - Tools/Folia-Traditional-Lyrics/mod.json
  - public/images/clawd-on-desk/how-it-works.png
  - graphify-out/cache/semantic/pab7e20a8ed94/b0edfb8dd34b91f3fa3adbbcb55c9bad43d1a142e611ad6c7e1adab383ac55b1.json
  - public/images/pokemon-daily-dashboard/05-news.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34055bd714bda49b4594790a02cb31a5794d52816c8a960b4c256d94c816b4d1.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/c66d1bbd042b9aa5d3bde319452e92708e7a6a5794e02084d8afc06b1d090b80.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/mod.json
  - Tools/Folia-Auto-Lyrics/INSTALL-MANIFEST.json
  - public/images/how-i-customized-cleanyourtv/cover.png
  - src/components/PostCard.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e96c403e45916e528891ef72649eece8bd46e737b1962a438ea92661b4e1b102.json
  - graphify-out/graph.json
  - scripts/check-scheduled-publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6f929cb87990bc045473ad172354908f3a8cb1a297303d2036b591da4195e02e.json
  - .agents/skills/smart-home-article/references/preview-workflow.md
  - Tools/Folia-Traditional-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9bbb21898cde1697fcda58b6c37b0fbc86d3551ac6d0e9ae968a057083f018d8.json
  - Downloads/Folia/local-whisper-lyrics-0.2.0.zip
  - src/pages/index.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/549e5039f72af3e93872309d8a17efbccc835f5c591673edea75a2b5a212a4a4.json
  - graphify-out/.graphify_python
  - src/content/posts/why-i-moved-home-assistant-automations-to-appdaemon.md
  - firebase.json
  - graphify-out/cache/stat-index.json
  - public/images/why-i-started-using-home-assistant/green-setup-story.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/de31da70161a43d65e7887976e1d39352d32a6213c1eabf76657498150d2ab01.json
  - graphify-out/cache/semantic/pab7e20a8ed94/34d8a703f09581047732a2e5a15b4c085f3426357e55e80c8bfdf6f3d521e064.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6191f860aa78b06d747409d57899e7e0ed88e5e30e19d4b5604b58ac4f3d5c5b.json
  - graphify-out/graph.html
  - src/content/posts/how-i-customized-cleanyourtv.md
  - .github/workflows/threads-publish.yml
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/fe0d9cca466b9fbce16caebe19e86b7acbba4d3fb82725fae79708be933f54a1.json
  - tests/site.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/4ff8891c977c12749d608499c6817df759d75ebc6b11f4220c4ae6ed23be4ccd.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/5773bd274842a00f43a868ba5018955a85e011c53b4d4b28e1d4a7bc184526f5.json
-->

---
### Requirement: Previous and next article navigation

Articles SHALL be ordered by `pubDate` ascending for navigation. The "previous" link SHALL point to the adjacent older article and the "next" link to the adjacent newer article. A link SHALL be omitted when no such article exists.

#### Scenario: Navigation across three articles

- **WHEN** three articles with distinct publish dates are built
- **THEN** each article page links only to its adjacent older and newer articles

##### Example: three articles

- **GIVEN** articles A (pubDate 2026-01-01), B (2026-02-01), C (2026-03-01)
- **WHEN** each article page is rendered
- **THEN** A shows only next → B; B shows previous → A and next → C; C shows only previous → B

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


<!-- @trace
source: post-table-of-contents
updated: 2026-10-29
code:
  - graphify-out/cache/semantic/pab7e20a8ed94/0728bf1f7d4e831020105adef38892b1fea01cae01922240de8fcd9fc8472f03.json
  - Tools/Folia-Traditional-Lyrics/test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/36dc05ef160837fd5cb843683234395787cf795e507e64eb86a9c9a8cb997b13.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/client.mjs
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico
  - tests/home.test.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/51d787b86b24ed0778c1629b8133395ccdd05d1ac1f0bff9b877634a1874de8f.json
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/yaml-complexity-story.png
  - src/content/posts/why-i-started-using-home-assistant.md
  - Downloads/Folia/local-whisper-lyrics-0.2.1.zip
  - src/content/posts/iphone-6s-mini-music-control-panel.md
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e51af191d290420269d7827968c771308f09c4c340bb4e41551fcf2f400da287.json
  - public/images/how-i-customized-cleanyourtv/02-custom-architecture.svg
  - graphify-out/cache/semantic/pab7e20a8ed94/4658852e3fedefdd172ec3c7b8b35384884139a7df65affd6638ff3502d64559.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/504c0cd324e9b4aa2af3b1f4324821c79b8279f77fa85ff29f630ba43bfac992.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a5de2ac79e14ef4556b615a302ce6515cb51070e05fb20e21376ddb09f8a35b8.json
  - public/images/pokemon-daily-dashboard/03-tasks.png
  - scripts/threads/publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/fdb4b8bd688e0c3e493d5ca0896553a44539fb500dea9ec5fe26bcc857ec2213.json
  - graphify-out/cache/semantic/pab7e20a8ed94/ac604214fcb0ea7d90e705b8c09fa0136317587988e52bf222dd75de1d2f3d45.json
  - public/images/how-i-customized-cleanyourtv/cover-option-3.png
  - graphify-out/cache/semantic/pab7e20a8ed94/13d36d4fb9901518539253eb1733b322eb481f2755108af847db5fae89bfeed4.json
  - public/images/why-i-started-using-home-assistant/cover.png
  - graphify-out/cache/semantic/pab7e20a8ed94/131db42dce9dd379381fc25b45de8ad6166349ea5b476764d059dd80380d3742.json
  - graphify-out/cache/semantic/pab7e20a8ed94/7cee2cf3c13ad43d81b629f9559e7d9a3a939bb901407b2a1688572fd848598e.json
  - public/images/pokemon-daily-dashboard/cover-03c-floating-alerts.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/main.cjs
  - graphify-out/cache/semantic/pab7e20a8ed94/e7867d8a16c8b3b26a0026cdba274d56fb7961b7a22d4ef9ac0920da8d60c331.json
  - tests/deployment.test.mjs
  - tests/redirects.test.mjs
  - src/content/posts/php2shell-zeabur-security-lessons.md
  - public/images/why-i-started-using-home-assistant/cooking-mode-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34302e4c5a199a6b586ea21cc66e37716b8661a07468581dd5b79e3f8b68cd72.json
  - src/content/posts/home-assistant-green-backup-recovery-plan.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-3.png
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/mod.json
  - scripts/threads/prompt.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/mod.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a376adb0a4b8f7b71ecf00acb6f1694bd64b1b88f1398b7c38f567a1456d5125.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/client.mjs
  - public/images/clawd-on-desk/cover.png
  - public/images/how-i-customized-cleanyourtv/02-after-cleanyourtv.png
  - public/images/php2shell-zeabur-security-lessons/cover.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/dc3e182882be2ba4a89f0abec068f615180b651df2f0a5d7a19858ad3d3bdbb5.json
  - public/images/pokemon-daily-dashboard/cover-02-pipeline.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-2.png
  - public/images/my-ai-agent-journey/cover.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/opencc-js-MIT.txt
  - graphify-out/cache/semantic/pab7e20a8ed94/dcc2f32e5ae525bd3f0f7295796f4de679b011f87a75fe0e11726cba4a901b20.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4f93b16fd565a5737fd3e3ea82d2f109cdf9984ba5ba67957cecde1b30566ccd.json
  - src/content/posts/clawd-on-desk.md
  - public/images/folia-youtube-music-local-whisper-lyrics/02-lyrics.webp
  - public/images/how-i-built-my-home-assistant-dashboard/room-overview.png
  - graphify-out/cache/semantic/pab7e20a8ed94/36ea6e22ca3b1052274cd8addaa4210b5d25d7354e6092160818ca4e31e9ab4d.json
  - graphify-out/.graphify_labels.json
  - tests/scheduled-publish.test.mjs
  - src/content/posts/smart-home-vs-remote-control.md
  - public/images/smart-home-vs-remote-control/cover-option-2.png
  - public/images/pokemon-daily-dashboard/07-archive.png
  - public/images/smart-home-vs-remote-control/04-night-ac-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0366e9b80ddbf3cfb53815493c87634b82f27e269b21937fedffe4d7671ca515.json
  - src/content/posts/build-blog-with-spectra.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-1.png
  - tests/helpers/build-site.mjs
  - .agents/skills/smart-home-article/references/visual-story.md
  - scripts/threads/lib.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/b96fe26dd736b1807209055f96db68baea26f424d3c5627cede6bca8ac6cf032.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c3bf249805e95695e12aa99c3719720664ac6271d9c0908e3478390ec39893a3.json
  - graphify-out/cache/semantic/pab7e20a8ed94/66d93a007d597e10432fe8707498dc52714b85ae30ebfdc9bc6c746ab3dcc0a1.json
  - public/images/why-i-started-using-home-assistant/dehumidifier-story.png
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Start Menu.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/f48ae2c1b82b2555dc9f5fd312ac1c8ac229cbb11130d8e36dc56b042b65720c.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico.md5
  - public/images/smart-home-vs-remote-control/01-dawn-curtains-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/dac9c9633010c9aa3a9af2c71ebef8db7caf52c9d6345e3d9b8d327b642cd2cd.json
  - public/images/how-i-customized-cleanyourtv/01-before-tv.png
  - public/images/clawd-on-desk/states.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/0915fb5cc6dc1287416d4846eb9401bbc260eced119faed7d082a0ec73acab32.json
  - scripts/create-sitemap-alias.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/bc9d7658acd48d5e836a5f0aab469f881330a364e4389a65674b21899fbf9d98.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/README.md
  - README.md
  - public/images/clawd-on-desk/dashboard.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/mod.json
  - graphify-out/cache/semantic/pab7e20a8ed94/852ea4b3890a875314eee8f11aede62c308839b06f4aad36abfeff96c9a02c77.json
  - graphify-out/cache/semantic/pab7e20a8ed94/d4cab1667e718304bbf17fac087652eab9649238c57c39f5351bf4a4ba992711.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/main.cjs
  - .agents/skills/smart-home-article/SKILL.md
  - public/images/iphone-6s-mini-music-control-panel/cover.png
  - public/images/pokemon-daily-dashboard/04-products.png
  - src/content/posts/pokemon-daily-dashboard.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover.png
  - public/images/build-blog-with-spectra/cover.png
  - public/images/pokemon-daily-dashboard/01-overview.png
  - Downloads/Folia/local-whisper-lyrics-0.1.0.zip
  - public/images/how-i-customized-cleanyourtv/cover-option-2.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ee66b98cab938a10de52c6f17c8c18c9517ec50f8a42ed951c5d618a7805d17d.json
  - Tools/Folia-Traditional-Lyrics/vendor/opencc-full.mjs
  - public/images/home-assistant-green-backup-recovery-plan/02-restore-rehearsal.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-3.png
  - .agents/skills/smart-home-article/references/cover-style.md
  - public/images/how-i-customized-cleanyourtv/cover-option-1.png
  - graphify-out/cache/semantic/pab7e20a8ed94/ef8bd4acb999122500548ce9fb1ba289228a66a4fb428c7388075136c0923ebb.json
  - public/images/pokemon-daily-dashboard/cover-04b-flowing-ribbons.png
  - graphify-out/cache/semantic/pab7e20a8ed94/634d0b60ab077531347a600f03b7eaa0753ff22aaa4203acb1d2ba27adb5e8e5.json
  - scripts/threads/draft.mjs
  - graphify-out/cost.json
  - public/images/how-i-customized-cleanyourtv/03-charizard-screensaver.png
  - src/lib/posts.ts
  - src/layouts/BaseLayout.astro
  - .github/workflows/threads-token-check.yml
  - public/images/my-ai-agent-journey/openclaw-discord-news.png
  - public/images/smart-home-vs-remote-control/02-sunset-curtains-story.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/cover.png
  - tests/config.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/53c08537650dccebbc85247ee78c866f9a47ad87c1514845dccb848ec8aeef8b.json
  - public/images/folia-youtube-music-local-whisper-lyrics/cover.png
  - tests/content.test.mjs
  - Tools/Folia-Traditional-Lyrics/README.md
  - graphify-out/cache/semantic/pab7e20a8ed94/856d33eb51ab7149f2fc60f742cdd0682250797420f2ed4c052fb50ae8697569.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/pab7e20a8ed94/aca8836147541264c23655249f1deb6f25a8ee79a313708a4dfe93e229215a0f.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4e3cdfaf652778fadb28afd77e710329b715649886c382335c280f5c27633c94.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/main.cjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9cf17a8be6aa67486e6b28cf5f2b2c0af143c480f7a479eb1fd6b5f357e478db.json
  - public/images/smart-home-vs-remote-control/03-bathroom-light-story.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-1.png
  - src/pages/privacy.astro
  - graphify-out/cache/semantic/pab7e20a8ed94/188813b7c5cbac037c596197ac2364b1611b5587fa36165c89b7ff09f84c1831.json
  - graphify-out/GRAPH_REPORT.md
  - public/images/smart-home-vs-remote-control/cover-option-3.png
  - public/images/pokemon-daily-dashboard/cover-03b-device-sync.png
  - public/images/pokemon-daily-dashboard/cover-04a-soft-gradient.png
  - Downloads/Folia/Folia-Setup-0.7.22.exe
  - src/content/posts/folia-youtube-music-local-whisper-lyrics.md
  - Tools/Folia-Auto-Lyrics/mod.json
  - .spectra.yaml
  - public/images/my-ai-agent-journey/open-webui-ollama.png
  - src/site.config.ts
  - public/images/pokemon-daily-dashboard/cover-03a-straight-phone.png
  - Tools/Folia-Auto-Lyrics/main.cjs
  - package.json
  - src/content/posts/my-ai-agent-journey.md
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Desktop.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/12c391cdebc46a052c13d6f4fd593f8f1ec437711164955d2b38ce07a2a4ebb9.json
  - public/images/pokemon-daily-dashboard/cover-01-dashboard.png
  - public/images/my-ai-agent-journey/claude-code-pokemon-dashboard.webp
  - public/images/pokemon-daily-dashboard/cover-03-reminder.png
  - graphify-out/cache/semantic/pab7e20a8ed94/2650283a322fd215c041f21386fd8e98894a318530810345d85ae4af9a3052f2.json
  - graphify-out/cache/semantic/pab7e20a8ed94/49dae8c3c13f45ba972d1a43b7de9552bb5f98a0e138ad719fb0dc158add56bd.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c12229a3132922b5f468955bc30f17c995f09c054944e528f8633d5bde5c96ba.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/main.cjs
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OPENCC-NOTICES.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/mod.json
  - public/images/pokemon-daily-dashboard/cover-04c-paper-layers.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/d32228490036065f7ef0aca9bec8cfabbf4b1d859a093daf6212632c550ec4b5.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/163e17cfbe8e15685da2b49f903c8e2328e67c38ae90cab26c765191604026d1.json
  - graphify-out/cache/semantic/pab7e20a8ed94/5f0b492c0e8f270de6120bea4938057f333d451b3a781974028f7c6746a81282.json
  - graphify-out/cache/semantic/pab7e20a8ed94/03731fe1e3403d1c3b641d631fd8ca96526466065a4a12eaa1198fa5cbf55ab6.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/f57ad7f36f5fadbf9d776b7031544953bc273e7c33721de4365245b2186c4994.json
  - public/images/home-assistant-green-backup-recovery-plan/01-three-layer-backup-plan.png
  - Tools/Folia-Auto-Lyrics/REMOVE.txt
  - Tools/Folia-Auto-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/7a8d7298a2754ec8fcc4ee5689970beb0d40d76a35e766f944dbd976e594602b.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/pab7e20a8ed94/d19367ed055694e34653ba608904fc6815acbd6f8fd7a173082b115ef64c7f09.json
  - src/pages/robots.txt.ts
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/mod.json
  - Downloads/Folia/traditional-lyrics-tw-1.0.1.zip
  - public/images/pokemon-daily-dashboard/06-favorites.png
  - public/images/smart-home-vs-remote-control/cover-option-1.png
  - public/images/how-i-customized-cleanyourtv/01-custom-launcher.png
  - public/images/smart-home-vs-remote-control/03-verification-loop-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/main.cjs
  - Tools/Folia-Auto-Lyrics/README.md
  - src/content/posts/spectra-workflow.md
  - graphify-out/cache/semantic/pab7e20a8ed94/73c40e947525ba5ab53380c73a5a17db9502c9e785a5c33f766ac23c66845577.json
  - .github/workflows/firebase-hosting-pull-request.yml
  - public/images/folia-youtube-music-local-whisper-lyrics/01-playlist.webp
  - src/content/posts/how-i-built-my-home-assistant-dashboard.md
  - scripts/threads/services.mjs
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-2.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/away-mode-story.png
  - public/images/smart-home-vs-remote-control/02-context-automation-story.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OpenCC-data-Apache-2.0.txt
  - public/images/pokemon-daily-dashboard/02-go-events.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/37e596cf0d40ff331867f92bfaa3c5d305aedb14636848fd4fd1cc570fb4fb0e.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/46bb96b74d08d78e7fea4bcc0c27eddb08c08c58eb9222c980483e4e3cd2cf7b.json
  - src/components/PostRow.astro
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/main.cjs
  - public/images/iphone-6s-mini-music-control-panel/iphone6s-mini-music-console-clean.png
  - graphify-out/cache/semantic/pab7e20a8ed94/074fb852689bd1154987986f7125ea1f7c4b9ae9484d6c52a41dcad52c82e22a.json
  - .github/workflows/firebase-hosting-merge.yml
  - public/images/my-ai-agent-journey/chatgpt-deep-research-home-assistant.png
  - .github/workflows/threads-draft.yml
  - graphify-out/cache/semantic/pab7e20a8ed94/8936d5d7f9984f0ac1bd2795fe44565056ab6234d9719003f85b11118c94e2ce.json
  - public/images/smart-home-vs-remote-control/01-remote-vs-smart-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/03d50432d440337e3693179fabcec8ee9aee5b759e439f2b0390076713f776aa.json
  - tests/threads.test.mjs
  - Tools/Folia-Auto-Lyrics/test.cjs
  - .agents/skills/smart-home-article/references/writing-guide.md
  - graphify-out/cache/semantic/pab7e20a8ed94/7a622a12f1f51ee3fde6a9be5b3d72f6e8b6da619ca8a0a94b5fed244b47d721.json
  - scripts/threads/check-token.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0fc8e8e54aedb152c7ee60f626af066c39b53bb40c043580df38be4731b09231.json
  - graphify-out/cache/semantic/pab7e20a8ed94/cc1e357bc9b0536b31254c5327792c18c1412b00003e724b30a71998babed05c.json
  - Tools/Folia-Traditional-Lyrics/mod.json
  - public/images/clawd-on-desk/how-it-works.png
  - graphify-out/cache/semantic/pab7e20a8ed94/b0edfb8dd34b91f3fa3adbbcb55c9bad43d1a142e611ad6c7e1adab383ac55b1.json
  - public/images/pokemon-daily-dashboard/05-news.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34055bd714bda49b4594790a02cb31a5794d52816c8a960b4c256d94c816b4d1.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/c66d1bbd042b9aa5d3bde319452e92708e7a6a5794e02084d8afc06b1d090b80.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/mod.json
  - Tools/Folia-Auto-Lyrics/INSTALL-MANIFEST.json
  - public/images/how-i-customized-cleanyourtv/cover.png
  - src/components/PostCard.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e96c403e45916e528891ef72649eece8bd46e737b1962a438ea92661b4e1b102.json
  - graphify-out/graph.json
  - scripts/check-scheduled-publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6f929cb87990bc045473ad172354908f3a8cb1a297303d2036b591da4195e02e.json
  - .agents/skills/smart-home-article/references/preview-workflow.md
  - Tools/Folia-Traditional-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9bbb21898cde1697fcda58b6c37b0fbc86d3551ac6d0e9ae968a057083f018d8.json
  - Downloads/Folia/local-whisper-lyrics-0.2.0.zip
  - src/pages/index.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/549e5039f72af3e93872309d8a17efbccc835f5c591673edea75a2b5a212a4a4.json
  - graphify-out/.graphify_python
  - src/content/posts/why-i-moved-home-assistant-automations-to-appdaemon.md
  - firebase.json
  - graphify-out/cache/stat-index.json
  - public/images/why-i-started-using-home-assistant/green-setup-story.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/de31da70161a43d65e7887976e1d39352d32a6213c1eabf76657498150d2ab01.json
  - graphify-out/cache/semantic/pab7e20a8ed94/34d8a703f09581047732a2e5a15b4c085f3426357e55e80c8bfdf6f3d521e064.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6191f860aa78b06d747409d57899e7e0ed88e5e30e19d4b5604b58ac4f3d5c5b.json
  - graphify-out/graph.html
  - src/content/posts/how-i-customized-cleanyourtv.md
  - .github/workflows/threads-publish.yml
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/fe0d9cca466b9fbce16caebe19e86b7acbba4d3fb82725fae79708be933f54a1.json
  - tests/site.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/4ff8891c977c12749d608499c6817df759d75ebc6b11f4220c4ae6ed23be4ccd.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/5773bd274842a00f43a868ba5018955a85e011c53b4d4b28e1d4a7bc184526f5.json
-->

---
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

<!-- @trace
source: post-table-of-contents
updated: 2026-10-29
code:
  - graphify-out/cache/semantic/pab7e20a8ed94/0728bf1f7d4e831020105adef38892b1fea01cae01922240de8fcd9fc8472f03.json
  - Tools/Folia-Traditional-Lyrics/test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/36dc05ef160837fd5cb843683234395787cf795e507e64eb86a9c9a8cb997b13.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/client.mjs
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico
  - tests/home.test.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/51d787b86b24ed0778c1629b8133395ccdd05d1ac1f0bff9b877634a1874de8f.json
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/yaml-complexity-story.png
  - src/content/posts/why-i-started-using-home-assistant.md
  - Downloads/Folia/local-whisper-lyrics-0.2.1.zip
  - src/content/posts/iphone-6s-mini-music-control-panel.md
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e51af191d290420269d7827968c771308f09c4c340bb4e41551fcf2f400da287.json
  - public/images/how-i-customized-cleanyourtv/02-custom-architecture.svg
  - graphify-out/cache/semantic/pab7e20a8ed94/4658852e3fedefdd172ec3c7b8b35384884139a7df65affd6638ff3502d64559.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/504c0cd324e9b4aa2af3b1f4324821c79b8279f77fa85ff29f630ba43bfac992.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a5de2ac79e14ef4556b615a302ce6515cb51070e05fb20e21376ddb09f8a35b8.json
  - public/images/pokemon-daily-dashboard/03-tasks.png
  - scripts/threads/publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/fdb4b8bd688e0c3e493d5ca0896553a44539fb500dea9ec5fe26bcc857ec2213.json
  - graphify-out/cache/semantic/pab7e20a8ed94/ac604214fcb0ea7d90e705b8c09fa0136317587988e52bf222dd75de1d2f3d45.json
  - public/images/how-i-customized-cleanyourtv/cover-option-3.png
  - graphify-out/cache/semantic/pab7e20a8ed94/13d36d4fb9901518539253eb1733b322eb481f2755108af847db5fae89bfeed4.json
  - public/images/why-i-started-using-home-assistant/cover.png
  - graphify-out/cache/semantic/pab7e20a8ed94/131db42dce9dd379381fc25b45de8ad6166349ea5b476764d059dd80380d3742.json
  - graphify-out/cache/semantic/pab7e20a8ed94/7cee2cf3c13ad43d81b629f9559e7d9a3a939bb901407b2a1688572fd848598e.json
  - public/images/pokemon-daily-dashboard/cover-03c-floating-alerts.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/main.cjs
  - graphify-out/cache/semantic/pab7e20a8ed94/e7867d8a16c8b3b26a0026cdba274d56fb7961b7a22d4ef9ac0920da8d60c331.json
  - tests/deployment.test.mjs
  - tests/redirects.test.mjs
  - src/content/posts/php2shell-zeabur-security-lessons.md
  - public/images/why-i-started-using-home-assistant/cooking-mode-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34302e4c5a199a6b586ea21cc66e37716b8661a07468581dd5b79e3f8b68cd72.json
  - src/content/posts/home-assistant-green-backup-recovery-plan.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-3.png
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/mod.json
  - scripts/threads/prompt.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/mod.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/a376adb0a4b8f7b71ecf00acb6f1694bd64b1b88f1398b7c38f567a1456d5125.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/client.mjs
  - public/images/clawd-on-desk/cover.png
  - public/images/how-i-customized-cleanyourtv/02-after-cleanyourtv.png
  - public/images/php2shell-zeabur-security-lessons/cover.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/dc3e182882be2ba4a89f0abec068f615180b651df2f0a5d7a19858ad3d3bdbb5.json
  - public/images/pokemon-daily-dashboard/cover-02-pipeline.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-2.png
  - public/images/my-ai-agent-journey/cover.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/opencc-js-MIT.txt
  - graphify-out/cache/semantic/pab7e20a8ed94/dcc2f32e5ae525bd3f0f7295796f4de679b011f87a75fe0e11726cba4a901b20.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4f93b16fd565a5737fd3e3ea82d2f109cdf9984ba5ba67957cecde1b30566ccd.json
  - src/content/posts/clawd-on-desk.md
  - public/images/folia-youtube-music-local-whisper-lyrics/02-lyrics.webp
  - public/images/how-i-built-my-home-assistant-dashboard/room-overview.png
  - graphify-out/cache/semantic/pab7e20a8ed94/36ea6e22ca3b1052274cd8addaa4210b5d25d7354e6092160818ca4e31e9ab4d.json
  - graphify-out/.graphify_labels.json
  - tests/scheduled-publish.test.mjs
  - src/content/posts/smart-home-vs-remote-control.md
  - public/images/smart-home-vs-remote-control/cover-option-2.png
  - public/images/pokemon-daily-dashboard/07-archive.png
  - public/images/smart-home-vs-remote-control/04-night-ac-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0366e9b80ddbf3cfb53815493c87634b82f27e269b21937fedffe4d7671ca515.json
  - src/content/posts/build-blog-with-spectra.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-1.png
  - tests/helpers/build-site.mjs
  - .agents/skills/smart-home-article/references/visual-story.md
  - scripts/threads/lib.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/b96fe26dd736b1807209055f96db68baea26f424d3c5627cede6bca8ac6cf032.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c3bf249805e95695e12aa99c3719720664ac6271d9c0908e3478390ec39893a3.json
  - graphify-out/cache/semantic/pab7e20a8ed94/66d93a007d597e10432fe8707498dc52714b85ae30ebfdc9bc6c746ab3dcc0a1.json
  - public/images/why-i-started-using-home-assistant/dehumidifier-story.png
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Start Menu.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/f48ae2c1b82b2555dc9f5fd312ac1c8ac229cbb11130d8e36dc56b042b65720c.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/PWA-Resources/YouTube Music.ico.md5
  - public/images/smart-home-vs-remote-control/01-dawn-curtains-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/dac9c9633010c9aa3a9af2c71ebef8db7caf52c9d6345e3d9b8d327b642cd2cd.json
  - public/images/how-i-customized-cleanyourtv/01-before-tv.png
  - public/images/clawd-on-desk/states.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/0915fb5cc6dc1287416d4846eb9401bbc260eced119faed7d082a0ec73acab32.json
  - scripts/create-sitemap-alias.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/bc9d7658acd48d5e836a5f0aab469f881330a364e4389a65674b21899fbf9d98.json
  - Backups/YouTubeMusic-before-Folia-2026-10-26/README.md
  - README.md
  - public/images/clawd-on-desk/dashboard.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/mod.json
  - graphify-out/cache/semantic/pab7e20a8ed94/852ea4b3890a875314eee8f11aede62c308839b06f4aad36abfeff96c9a02c77.json
  - graphify-out/cache/semantic/pab7e20a8ed94/d4cab1667e718304bbf17fac087652eab9649238c57c39f5351bf4a4ba992711.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/main.cjs
  - .agents/skills/smart-home-article/SKILL.md
  - public/images/iphone-6s-mini-music-control-panel/cover.png
  - public/images/pokemon-daily-dashboard/04-products.png
  - src/content/posts/pokemon-daily-dashboard.md
  - public/images/how-i-built-my-home-assistant-dashboard/cover.png
  - public/images/build-blog-with-spectra/cover.png
  - public/images/pokemon-daily-dashboard/01-overview.png
  - Downloads/Folia/local-whisper-lyrics-0.1.0.zip
  - public/images/how-i-customized-cleanyourtv/cover-option-2.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/ee66b98cab938a10de52c6f17c8c18c9517ec50f8a42ed951c5d618a7805d17d.json
  - Tools/Folia-Traditional-Lyrics/vendor/opencc-full.mjs
  - public/images/home-assistant-green-backup-recovery-plan/02-restore-rehearsal.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-3.png
  - .agents/skills/smart-home-article/references/cover-style.md
  - public/images/how-i-customized-cleanyourtv/cover-option-1.png
  - graphify-out/cache/semantic/pab7e20a8ed94/ef8bd4acb999122500548ce9fb1ba289228a66a4fb428c7388075136c0923ebb.json
  - public/images/pokemon-daily-dashboard/cover-04b-flowing-ribbons.png
  - graphify-out/cache/semantic/pab7e20a8ed94/634d0b60ab077531347a600f03b7eaa0753ff22aaa4203acb1d2ba27adb5e8e5.json
  - scripts/threads/draft.mjs
  - graphify-out/cost.json
  - public/images/how-i-customized-cleanyourtv/03-charizard-screensaver.png
  - src/lib/posts.ts
  - src/layouts/BaseLayout.astro
  - .github/workflows/threads-token-check.yml
  - public/images/my-ai-agent-journey/openclaw-discord-news.png
  - public/images/smart-home-vs-remote-control/02-sunset-curtains-story.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/cover.png
  - tests/config.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/53c08537650dccebbc85247ee78c866f9a47ad87c1514845dccb848ec8aeef8b.json
  - public/images/folia-youtube-music-local-whisper-lyrics/cover.png
  - tests/content.test.mjs
  - Tools/Folia-Traditional-Lyrics/README.md
  - graphify-out/cache/semantic/pab7e20a8ed94/856d33eb51ab7149f2fc60f742cdd0682250797420f2ed4c052fb50ae8697569.json
  - graphify-out/manifest.json
  - graphify-out/cache/semantic/pab7e20a8ed94/aca8836147541264c23655249f1deb6f25a8ee79a313708a4dfe93e229215a0f.json
  - graphify-out/cache/semantic/pab7e20a8ed94/4e3cdfaf652778fadb28afd77e710329b715649886c382335c280f5c27633c94.json
  - Tools/Folia-Auto-Lyrics/backup-v0.2.1-installed/main.cjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9cf17a8be6aa67486e6b28cf5f2b2c0af143c480f7a479eb1fd6b5f357e478db.json
  - public/images/smart-home-vs-remote-control/03-bathroom-light-story.png
  - public/images/home-assistant-green-backup-recovery-plan/cover-option-1.png
  - src/pages/privacy.astro
  - graphify-out/cache/semantic/pab7e20a8ed94/188813b7c5cbac037c596197ac2364b1611b5587fa36165c89b7ff09f84c1831.json
  - graphify-out/GRAPH_REPORT.md
  - public/images/smart-home-vs-remote-control/cover-option-3.png
  - public/images/pokemon-daily-dashboard/cover-03b-device-sync.png
  - public/images/pokemon-daily-dashboard/cover-04a-soft-gradient.png
  - Downloads/Folia/Folia-Setup-0.7.22.exe
  - src/content/posts/folia-youtube-music-local-whisper-lyrics.md
  - Tools/Folia-Auto-Lyrics/mod.json
  - .spectra.yaml
  - public/images/my-ai-agent-journey/open-webui-ollama.png
  - src/site.config.ts
  - public/images/pokemon-daily-dashboard/cover-03a-straight-phone.png
  - Tools/Folia-Auto-Lyrics/main.cjs
  - package.json
  - src/content/posts/my-ai-agent-journey.md
  - Backups/YouTubeMusic-before-Folia-2026-10-26/Shortcuts/YouTube Music - Desktop.lnk
  - graphify-out/cache/semantic/pab7e20a8ed94/12c391cdebc46a052c13d6f4fd593f8f1ec437711164955d2b38ce07a2a4ebb9.json
  - public/images/pokemon-daily-dashboard/cover-01-dashboard.png
  - public/images/my-ai-agent-journey/claude-code-pokemon-dashboard.webp
  - public/images/pokemon-daily-dashboard/cover-03-reminder.png
  - graphify-out/cache/semantic/pab7e20a8ed94/2650283a322fd215c041f21386fd8e98894a318530810345d85ae4af9a3052f2.json
  - graphify-out/cache/semantic/pab7e20a8ed94/49dae8c3c13f45ba972d1a43b7de9552bb5f98a0e138ad719fb0dc158add56bd.json
  - graphify-out/cache/semantic/pab7e20a8ed94/c12229a3132922b5f468955bc30f17c995f09c054944e528f8633d5bde5c96ba.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/main.cjs
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OPENCC-NOTICES.md
  - Tools/Folia-Auto-Lyrics/backup-v0.3.3-installed/mod.json
  - public/images/pokemon-daily-dashboard/cover-04c-paper-layers.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/d32228490036065f7ef0aca9bec8cfabbf4b1d859a093daf6212632c550ec4b5.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/163e17cfbe8e15685da2b49f903c8e2328e67c38ae90cab26c765191604026d1.json
  - graphify-out/cache/semantic/pab7e20a8ed94/5f0b492c0e8f270de6120bea4938057f333d451b3a781974028f7c6746a81282.json
  - graphify-out/cache/semantic/pab7e20a8ed94/03731fe1e3403d1c3b641d631fd8ca96526466065a4a12eaa1198fa5cbf55ab6.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/f57ad7f36f5fadbf9d776b7031544953bc273e7c33721de4365245b2186c4994.json
  - public/images/home-assistant-green-backup-recovery-plan/01-three-layer-backup-plan.png
  - Tools/Folia-Auto-Lyrics/REMOVE.txt
  - Tools/Folia-Auto-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/7a8d7298a2754ec8fcc4ee5689970beb0d40d76a35e766f944dbd976e594602b.json
  - graphify-out/.graphify_root
  - graphify-out/cache/semantic/pab7e20a8ed94/d19367ed055694e34653ba608904fc6815acbd6f8fd7a173082b115ef64c7f09.json
  - src/pages/robots.txt.ts
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/mod.json
  - Downloads/Folia/traditional-lyrics-tw-1.0.1.zip
  - public/images/pokemon-daily-dashboard/06-favorites.png
  - public/images/smart-home-vs-remote-control/cover-option-1.png
  - public/images/how-i-customized-cleanyourtv/01-custom-launcher.png
  - public/images/smart-home-vs-remote-control/03-verification-loop-story.png
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/main.cjs
  - Tools/Folia-Auto-Lyrics/README.md
  - src/content/posts/spectra-workflow.md
  - graphify-out/cache/semantic/pab7e20a8ed94/73c40e947525ba5ab53380c73a5a17db9502c9e785a5c33f766ac23c66845577.json
  - .github/workflows/firebase-hosting-pull-request.yml
  - public/images/folia-youtube-music-local-whisper-lyrics/01-playlist.webp
  - src/content/posts/how-i-built-my-home-assistant-dashboard.md
  - scripts/threads/services.mjs
  - public/images/how-i-built-my-home-assistant-dashboard/cover-option-2.png
  - public/images/why-i-moved-home-assistant-automations-to-appdaemon/away-mode-story.png
  - public/images/smart-home-vs-remote-control/02-context-automation-story.png
  - Tools/Folia-Traditional-Lyrics/THIRD_PARTY_LICENSES/OpenCC-data-Apache-2.0.txt
  - public/images/pokemon-daily-dashboard/02-go-events.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/37e596cf0d40ff331867f92bfaa3c5d305aedb14636848fd4fd1cc570fb4fb0e.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/46bb96b74d08d78e7fea4bcc0c27eddb08c08c58eb9222c980483e4e3cd2cf7b.json
  - src/components/PostRow.astro
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/main.cjs
  - public/images/iphone-6s-mini-music-control-panel/iphone6s-mini-music-console-clean.png
  - graphify-out/cache/semantic/pab7e20a8ed94/074fb852689bd1154987986f7125ea1f7c4b9ae9484d6c52a41dcad52c82e22a.json
  - .github/workflows/firebase-hosting-merge.yml
  - public/images/my-ai-agent-journey/chatgpt-deep-research-home-assistant.png
  - .github/workflows/threads-draft.yml
  - graphify-out/cache/semantic/pab7e20a8ed94/8936d5d7f9984f0ac1bd2795fe44565056ab6234d9719003f85b11118c94e2ce.json
  - public/images/smart-home-vs-remote-control/01-remote-vs-smart-story.png
  - graphify-out/cache/semantic/pab7e20a8ed94/03d50432d440337e3693179fabcec8ee9aee5b759e439f2b0390076713f776aa.json
  - tests/threads.test.mjs
  - Tools/Folia-Auto-Lyrics/test.cjs
  - .agents/skills/smart-home-article/references/writing-guide.md
  - graphify-out/cache/semantic/pab7e20a8ed94/7a622a12f1f51ee3fde6a9be5b3d72f6e8b6da619ca8a0a94b5fed244b47d721.json
  - scripts/threads/check-token.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/0fc8e8e54aedb152c7ee60f626af066c39b53bb40c043580df38be4731b09231.json
  - graphify-out/cache/semantic/pab7e20a8ed94/cc1e357bc9b0536b31254c5327792c18c1412b00003e724b30a71998babed05c.json
  - Tools/Folia-Traditional-Lyrics/mod.json
  - public/images/clawd-on-desk/how-it-works.png
  - graphify-out/cache/semantic/pab7e20a8ed94/b0edfb8dd34b91f3fa3adbbcb55c9bad43d1a142e611ad6c7e1adab383ac55b1.json
  - public/images/pokemon-daily-dashboard/05-news.png
  - graphify-out/cache/semantic/pab7e20a8ed94/34055bd714bda49b4594790a02cb31a5794d52816c8a960b4c256d94c816b4d1.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.0-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/c66d1bbd042b9aa5d3bde319452e92708e7a6a5794e02084d8afc06b1d090b80.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.2-installed/mod.json
  - Tools/Folia-Auto-Lyrics/INSTALL-MANIFEST.json
  - public/images/how-i-customized-cleanyourtv/cover.png
  - src/components/PostCard.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/e96c403e45916e528891ef72649eece8bd46e737b1962a438ea92661b4e1b102.json
  - graphify-out/graph.json
  - scripts/check-scheduled-publish.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6f929cb87990bc045473ad172354908f3a8cb1a297303d2036b591da4195e02e.json
  - .agents/skills/smart-home-article/references/preview-workflow.md
  - Tools/Folia-Traditional-Lyrics/client.mjs
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/9bbb21898cde1697fcda58b6c37b0fbc86d3551ac6d0e9ae968a057083f018d8.json
  - Downloads/Folia/local-whisper-lyrics-0.2.0.zip
  - src/pages/index.astro
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/549e5039f72af3e93872309d8a17efbccc835f5c591673edea75a2b5a212a4a4.json
  - graphify-out/.graphify_python
  - src/content/posts/why-i-moved-home-assistant-automations-to-appdaemon.md
  - firebase.json
  - graphify-out/cache/stat-index.json
  - public/images/why-i-started-using-home-assistant/green-setup-story.png
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/de31da70161a43d65e7887976e1d39352d32a6213c1eabf76657498150d2ab01.json
  - graphify-out/cache/semantic/pab7e20a8ed94/34d8a703f09581047732a2e5a15b4c085f3426357e55e80c8bfdf6f3d521e064.json
  - graphify-out/cache/ast/v0.9.93-s20-g7154a062ba57/6191f860aa78b06d747409d57899e7e0ed88e5e30e19d4b5604b58ac4f3d5c5b.json
  - graphify-out/graph.html
  - src/content/posts/how-i-customized-cleanyourtv.md
  - .github/workflows/threads-publish.yml
  - Tools/Folia-Auto-Lyrics/backup-v0.3.1-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/fe0d9cca466b9fbce16caebe19e86b7acbba4d3fb82725fae79708be933f54a1.json
  - tests/site.test.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/4ff8891c977c12749d608499c6817df759d75ebc6b11f4220c4ae6ed23be4ccd.json
  - Tools/Folia-Auto-Lyrics/backup-v0.3.4-installed/client.mjs
  - graphify-out/cache/semantic/pab7e20a8ed94/5773bd274842a00f43a868ba5018955a85e011c53b4d4b28e1d4a7bc184526f5.json
-->