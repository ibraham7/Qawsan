// Who is worth contacting first: a 0-100 priority for a company, written to `lead_score` by the
// database (trigger in 20261119000000_qawsan_issue_and_priority.sql). Keep this file and that SQL
// function in sync: scripts/test-priority.ts checks them against each other.
//
// The idea: a busy, well-rated clinic that can be reached and whose website is weak has the budget and
// the most to gain, so it comes first.
//   need      0-45  how much the website needs help (a missing site or a low audit score)
//   strength  0-35  how busy and well regarded the business is (Google rating and number of reviews)
//   reach     0-20  whether we can actually write to it (mobile / WhatsApp, email)

export interface PriorityInput {
    rating: number | null;
    rating_count: number | null;
    phone_kind: string;
    whatsapp: string;
    emails: string[];
    website: string;
    site_score: number | null;
    status: string;
}

export interface PriorityParts {
    need: number;
    strength: number;
    reach: number;
    total: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
// halves round away from zero, like Postgres round(numeric)
const round = (x: number) => (x < 0 ? -Math.round(-x) : Math.round(x));

export function priorityParts(c: PriorityInput): PriorityParts {
    // rejected or invalid companies are never a priority
    if (c.status === "not_fit" || c.status === "invalid") return { need: 0, strength: 0, reach: 0, total: 0 };

    // need: no website 40; audited -> the lower the score the higher the need; has a site not audited (or unreadable) 15
    const need = c.website === "" ? 40 : c.site_score !== null ? round((45 * (100 - c.site_score)) / 100) : 15;

    // strength: rating 3.5 -> 0 points, 5.0 -> 15; reviews 0 -> 0, 300 or more -> 20
    const ratingPts = c.rating === null ? 0 : round(clamp((c.rating - 3.5) / 1.5, 0, 1) * 15);
    const reviewPts = c.rating_count === null ? 0 : round(20 * Math.min(1, Math.log(1 + c.rating_count) / Math.log(301)));
    const strength = ratingPts + reviewPts;

    // reach: a mobile number or a WhatsApp number 12 (a landline only 4), plus 8 for an email
    const phonePts = c.phone_kind === "mobile" || c.whatsapp !== "" ? 12 : c.phone_kind === "landline" ? 4 : 0;
    const reach = phonePts + (c.emails.length > 0 ? 8 : 0);

    return { need, strength, reach, total: need + strength + reach };
}

export const priority = (c: PriorityInput) => priorityParts(c).total;
