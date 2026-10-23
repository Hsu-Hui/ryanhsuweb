## Purpose

Defines how the site loads Google Analytics 4 from a single configuration value and how the privacy policy discloses it. It exists so the owner can measure article views from every traffic source, not only Google Search.

## ADDED Requirements

### Requirement: Analytics script loading from configuration

The GA4 script SHALL depend on `ga4MeasurementId` in the site configuration:

- When `ga4MeasurementId` matches `G-` followed by one or more uppercase letters or digits, every generated HTML page SHALL include exactly one script `https://www.googletagmanager.com/gtag/js?id=<ga4MeasurementId>` with `async`, and an inline script that initializes `window.dataLayer` and calls `gtag('config', <ga4MeasurementId>)`.
- When `ga4MeasurementId` is empty, no page SHALL include `googletagmanager` or a `gtag(` call, and the build SHALL succeed.
- When `ga4MeasurementId` is non-empty but does not match the pattern, the build MUST fail with an error naming `ga4MeasurementId`.

#### Scenario: Configured measurement id

- **WHEN** `ga4MeasurementId` is `G-TEST123456` and the site is built
- **THEN** every HTML page contains one script tag loading `gtag/js?id=G-TEST123456` and an inline script configuring `G-TEST123456`

##### Example: configuration cases

| ga4MeasurementId | GA4 script | Build |
| --- | --- | --- |
| G-TEST123456 | on every page, once | success |
| empty string | absent from every page | success |
| UA-1234 | not applicable | fail, error names ga4MeasurementId |

#### Scenario: Page view reaches Google Analytics

- **WHEN** a built page with `ga4MeasurementId` set is opened in a browser with network access
- **THEN** the browser sends a request to `https://www.google-analytics.com/g/collect` whose `tid` parameter equals `ga4MeasurementId` and whose `en` parameter is `page_view`

### Requirement: Privacy policy discloses analytics

When `ga4MeasurementId` is set, the privacy policy page at `/privacy` SHALL contain a section stating that the site uses Google Analytics to measure visits and that Google Analytics uses cookies, and SHALL link to the Google Analytics opt-out add-on at `https://tools.google.com/dlpage/gaoptout`. When `ga4MeasurementId` is empty, no generated page SHALL mention `Google Analytics`. The site SHALL NOT add a consent banner of its own for analytics.

#### Scenario: Analytics enabled

- **WHEN** `ga4MeasurementId` is `G-TEST123456` and `/privacy` is built
- **THEN** the page mentions `Google Analytics` and links to `https://tools.google.com/dlpage/gaoptout`

#### Scenario: Analytics disabled

- **WHEN** `ga4MeasurementId` is empty and the site is built
- **THEN** no HTML page under `dist/` contains the text `Google Analytics`
