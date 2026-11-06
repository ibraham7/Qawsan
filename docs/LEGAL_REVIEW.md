# Legal pages: what to confirm before relying on them

The privacy, terms and cookie pages (`/privacy`, `/terms`, `/cookies`, plus `/en/…` and `/tr/…`) describe
only what the site really does today. They are **not a final legal review**. Texts live in
`src/i18n/legal/{ar,en,tr}.ts`; change the date in `ui.updatedDate` whenever you edit them.

## What the site actually does (found in the project)

| Area | Fact |
|---|---|
| Hosting | Vercel (site + serverless functions in `api/`) |
| Project request form | name, company, email, WhatsApp, project type, description, features, references, budget, timeline, contact method, consent. Saved to **Google Sheets** (service account), email via **Resend** |
| Review form | name, role, rating, text, locale. Saved to **Supabase**, **published immediately**, email via Resend |
| Anti-spam | hidden field, time taken to fill, IP used for an in-memory rate limit (not stored by the app) |
| Database | Supabase (reviews, projects shown, admin sign-in) |
| Fonts | Google Fonts, loaded on every page **regardless of consent** (Google receives the IP) |
| Optional tools | GA4, Microsoft Clarity (analytics consent); Meta Pixel (marketing consent) |
| Browser storage | `qawsan-mode`, `qawsan-consent` (local); `qawsan-lead-…` (session) |

## Missing details only you can give

1. **Controller identity**: the pages say "an individual project run by its founder from Türkiye" and
   publish no name, address or phone. KVKK normally expects the data controller to be identifiable
   (a real name or trade name) and a contact channel. Decide what you are willing to publish.
2. **Contact email** for privacy requests: currently `ibrahim.dev.pr@gmail.com` (already in the footer).
   Confirm it, or create a dedicated address.
3. **Governing law and courts** for the terms: intentionally **not** stated. Add after confirming.
4. **Retention periods**: the text gives criteria only (no numbers). If you adopt fixed periods
   (for example, how long unsuccessful requests are kept), add them.
5. **Cookie table**: not published. After the tools run on the live site, list the real cookie names and
   lifetimes seen in DevTools → Application → Cookies.
6. **Analytics retention** settings in GA4 / Clarity (mentioned only as "per each tool").

## Points for a lawyer

- Whether Turkish **KVKK** obligations apply to you as an individual (VERBIS registration thresholds,
  the controller information notice "aydınlatma metni", explicit-consent wording, and cross-border transfer
  rules, which in Türkiye have specific requirements).
- Whether **GDPR** applies: the text does not assume it. It applies if you target or monitor people in the EU.
  If it does, legal bases, a representative and transfer mechanisms need review.
- Gulf-country rules (for example UAE, Saudi Arabia PDPL) for visitors and clients there.
- The legal-basis sentence in the privacy page (consent + running/protecting the site).
- Publishing customer **reviews with names**: confirm the consent wording on the review form is enough.
- Showing client work and screenshots in the portfolio: confirm you have the clients' permission.
- **Google Fonts** loads before any consent. Options: self-host the fonts (removes the issue), or keep and disclose (current).
- Whether anyone other than you can open the Google Sheet or the Resend dashboard.

## Behaviour of the consent system (already built)

Banner with accept all / reject non-essential / customize; analytics and marketing off until chosen;
closing the dialog is not consent; no pre-ticked boxes; choice stored locally and changeable from the
footer link; refusing never blocks browsing. The banner appears only while at least one tool ID is set.
