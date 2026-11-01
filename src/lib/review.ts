/** Shared by the /review page and the /api/review function so both enforce the same rules. */

export const REVIEW_LIMITS = { name: 80, role: 120, text: 1000, textMin: 10 } as const;

export interface ReviewPayload {
  name: string;
  role: string;
  rating: number;
  text: string;
  consent: boolean;
  /** site language the review was written on (ar | en | tr) */
  lang?: string;
  /** honeypot: must stay empty */
  website: string;
  /** ms the visitor spent on the form */
  elapsed: number;
}

/** values are error codes; the page shows them in its own language (review.errors in src/i18n) */
export type ReviewErrors = Partial<Record<"name" | "role" | "rating" | "text" | "consent", string>>;

export function validateReview(p: ReviewPayload): ReviewErrors {
  const e: ReviewErrors = {};
  const name = p.name.trim();
  if (name.length < 2) e.name = "name_required";
  else if (name.length > REVIEW_LIMITS.name) e.name = "too_long";
  if (p.role.trim().length > REVIEW_LIMITS.role) e.role = "too_long";
  if (!Number.isInteger(p.rating) || p.rating < 1 || p.rating > 5) e.rating = "rating";
  const text = p.text.trim();
  if (text.length < REVIEW_LIMITS.textMin) e.text = "text_short";
  else if (text.length > REVIEW_LIMITS.text) e.text = "too_long";
  if (!p.consent) e.consent = "consent";
  return e;
}
