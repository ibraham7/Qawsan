// Google PageSpeed Insights (Lighthouse run on a phone profile): the real mobile speed, search
// basics and accessibility scores. This file only reads the answer; the call itself is in
// api/_lib/pagespeed.ts.

export interface Measured {
    /** 0-100 */
    perf: number | null;
    seo: number | null;
    a11y: number | null;
    /** largest contentful paint, milliseconds */
    lcpMs: number | null;
}

const pct = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? Math.round(Math.max(0, Math.min(1, x)) * 100) : null);
const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? Math.round(x) : null);

/** the numbers we keep from a runPagespeed response; null when the response holds no Lighthouse result */
export function parsePageSpeed(json: unknown): Measured | null {
    const L = (json as { lighthouseResult?: { categories?: Record<string, { score?: unknown }>; audits?: Record<string, { numericValue?: unknown }> } } | null)?.lighthouseResult;
    if (!L?.categories) return null;
    const perf = pct(L.categories.performance?.score);
    // Lighthouse gives no performance score when the page failed to load properly
    if (perf === null) return null;
    return {
        perf,
        seo: pct(L.categories.seo?.score),
        a11y: pct(L.categories.accessibility?.score),
        lcpMs: num(L.audits?.["largest-contentful-paint"]?.numericValue),
    };
}
