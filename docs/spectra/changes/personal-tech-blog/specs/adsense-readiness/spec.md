## Purpose

Defines what the site provides to qualify for and serve Google AdSense: the required informational pages, the publisher authorization file, the ad script, and consent handling. It exists so that the site meets AdSense review requirements from a single configuration value.

## ADDED Requirements

### Requirement: Required informational pages

The system SHALL provide an about page at `/about`, a privacy policy page at `/privacy`, and a contact page at `/contact`. The privacy policy MUST state that:

- the site uses Google AdSense,
- Google and its partners use cookies to serve ads based on prior visits, and
- visitors can opt out of personalized advertising in Google Ads Settings, with a link to `https://adssettings.google.com`.

The contact page MUST show at least one way to reach the site owner.

#### Scenario: Privacy policy content

- **WHEN** `/privacy` is opened
- **THEN** the page mentions Google AdSense and cookies and links to `https://adssettings.google.com`

#### Scenario: Contact page

- **WHEN** `/contact` is opened
- **THEN** the page shows at least one contact method for the site owner

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

### Requirement: Publisher authorization file

When `adsenseClientId` is set, the system SHALL serve `/ads.txt` at the site root. The file SHALL contain the line `google.com, pub-<digits>, DIRECT, f08c47fec0942fa0`, where `<digits>` are taken from `adsenseClientId`. When `adsenseClientId` is empty, `/ads.txt` SHALL NOT be generated.

#### Scenario: ads.txt content

- **WHEN** `adsenseClientId` is `ca-pub-1234567890123456` and the site is built
- **THEN** `/ads.txt` contains `google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0`

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
