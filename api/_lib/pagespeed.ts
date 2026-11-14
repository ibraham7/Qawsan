// The call to Google PageSpeed Insights. Google opens the site itself, so there is nothing for us to
// guard against here; reading the answer is in src/lib/discovery/pagespeed.ts.
import { parsePageSpeed } from "../../src/lib/discovery/pagespeed.js";
import type { Measured } from "../../src/lib/discovery/pagespeed.js";

export type PageSpeedResult =
    | { kind: "ok"; measured: Measured }
    /** the daily or per-minute quota is used up */
    | { kind: "quota" }
    /** the key is refused: the API is not enabled for it or the key's restrictions leave it out */
    | { kind: "blocked" }
    /** the site could not be measured (timeout, blocked Google, broken page) */
    | { kind: "failed" };

export const pageSpeedKey = () => process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PLACES_API_KEY || "";

export async function runPageSpeed(url: string, key: string, timeoutMs = 24_000): Promise<PageSpeedResult> {
    const q = new URLSearchParams({ url, strategy: "mobile", key, locale: "ar" });
    for (const c of ["performance", "seo", "accessibility"]) q.append("category", c);
    try {
        const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, { signal: AbortSignal.timeout(timeoutMs) });
        if (r.status === 429) return { kind: "quota" };
        if (r.status === 403) return { kind: "blocked" };
        if (!r.ok) return { kind: "failed" };
        const measured = parsePageSpeed(await r.json());
        return measured ? { kind: "ok", measured } : { kind: "failed" };
    } catch {
        return { kind: "failed" };
    }
}
