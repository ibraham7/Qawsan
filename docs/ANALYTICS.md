# Analytics, tracking and cookie consent

Everything optional is **off until its ID is set** and **off until the visitor consents**.
Code: `src/lib/consent.ts` (choice store), `src/lib/analytics.ts` (tags + events),
`src/components/common/ConsentBanner.tsx` (banner; footer "Cookie settings" reopens it).

## Environment variables (Vercel → Settings → Environment Variables, then Redeploy)

| Variable | Tool | Consent category |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` (`G-XXXXXXXXXX`) | Google Analytics 4 | Analytics |
| `VITE_CLARITY_PROJECT_ID` | Microsoft Clarity | Analytics |
| `VITE_META_PIXEL_ID` (digits) | Meta Pixel | Marketing |

They are `VITE_` build-time values, so changing one needs a new deployment. An empty or malformed
value means the tool does not exist; if none is set, no banner is shown (nothing to ask about).

## Consent behaviour

- Necessary: always on (language, theme). Analytics: GA4 + Clarity. Marketing: Meta Pixel.
- Before a choice: no script is loaded and no request is sent to Google, Microsoft or Meta.
- "Reject non-essential" is as prominent as "Accept all"; "Customize" has one switch per category.
- Choice is stored in `localStorage["qawsan-consent"]`; footer → "Cookie settings" changes it.
- Withdrawing: GA4 is disabled (`ga-disable-<id>` + consent update), Clarity and Pixel are told to
  revoke consent, and their cookies (`_ga*`, `_clck`, `_clsk`, `_fbp`, ...) are removed.
- `/admin` is never measured.

## Events

All GA4 events carry `page_language` (`ar` | `en` | `tr`). No name, email, phone, message or any
form value is ever sent.

| Event | When | Parameters |
|---|---|---|
| `page_view` | every page load (the site uses full page loads, one per navigation) | `page_location` (campaign params only), `page_path`, `page_title` |
| `select_service` | footer service link clicked, or project type chosen in the form | `service`, `source` = `footer` / `start_project_form` |
| `start_project` | first edit of the project form, once per page | `form_name` |
| `generate_lead` | **only** after the server answers OK for a project request; once per request ref | `form_name`, `project_type` |
| `contact_click` | email / phone / WhatsApp / Instagram / LinkedIn link clicked | `method`, `placement` = `header` / `footer` / `page` |
| `language_change` | a different language chosen in the switcher | `language_from`, `language_to` |

`view_service` is not implemented: the site has no individual service pages to view.
The review form is not a lead and sends no `generate_lead`.

Meta Pixel: `PageView` per page, `Lead` on the same success as `generate_lead` (with an `eventID`).
Pixel automatic configuration is disabled. No Conversions API.

Clarity: `data-clarity-mask="true"` is on the project and review forms. Also set
Settings → Masking → **Strict** in the Clarity project.

## Setting up the accounts (you)

1. **GA4**: analytics.google.com → Admin → Create property → Web data stream `https://qawsan.website`
   → copy the Measurement ID. Admin → Events → mark `generate_lead` as a **key event**. Admin →
   Custom definitions → add event-scoped dimensions `page_language`, `service`, `project_type`,
   `method`, `placement`, `language_from`, `language_to`. Data retention → 14 months.
2. **Clarity**: clarity.microsoft.com → New project → copy the Project ID; Masking → Strict.
3. **Meta**: Events Manager → Connect data → Web → create a Pixel → copy the Pixel ID.
4. Add the three variables in Vercel and redeploy.

## Testing after deploy

- **GA4**: Admin → DebugView (open the site with the GA Debugger extension, or check Realtime).
  Accept analytics, click through, submit a request; look for each event once.
- **Tag Assistant**: tagassistant.google.com → connect the site; confirm the tag fires only after consent.
- **Meta Pixel Helper** (Chrome extension) + Events Manager → Test events: `PageView`, `Lead`.
- **Clarity**: a recording appears after ~2 minutes; inputs show as masked.
- **No consent**: DevTools → Network, filter `googletagmanager|clarity|facebook` → must stay empty
  until you accept. After withdrawing, no new requests, and the cookies are gone (Application → Cookies).
