## MODIFIED Requirements

### Requirement: Required informational pages

The system SHALL provide an about page at `/about` and a privacy policy page at `/privacy`. The system SHALL NOT generate a separate contact page; the about page MUST show at least one way to reach the site owner.

When `adsenseClientId` is set, the privacy policy MUST state that:

- the site uses Google AdSense,
- Google and its partners use cookies to serve ads based on prior visits, and
- visitors can opt out of personalized advertising in Google Ads Settings, with a link to `https://adssettings.google.com`.

When `adsenseClientId` is empty, the privacy policy SHALL NOT mention Google AdSense or link to `https://adssettings.google.com`, so that it describes only services the site actually uses.

Any page text that refers readers to a way of contacting the owner SHALL link to `/about`.

#### Scenario: Privacy policy content

- **WHEN** `adsenseClientId` is `ca-pub-1234567890123456` and `/privacy` is opened
- **THEN** the page mentions Google AdSense and cookies and links to `https://adssettings.google.com`, and its contact sentence links to `/about`

#### Scenario: Privacy policy without AdSense

- **WHEN** `adsenseClientId` is empty and the site is built
- **THEN** `/privacy` still exists, does not contain `AdSense` or a link to `https://adssettings.google.com`, and its contact sentence links to `/about`; article content written by the owner is not restricted

#### Scenario: No contact page

- **WHEN** the site is built
- **THEN** `dist/contact.html` does not exist and no generated page links to `/contact`
