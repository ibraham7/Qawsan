/**
 * /api/prospects/search  (admins only)
 *
 * GET  -> { configured, used, limit }   whether the Google key is set and this month's usage
 * POST -> runs a Google Places Text Search and saves every result as a company "to review".
 *         Nothing is sent to anyone. Repeating a search refreshes the same places (keyed by
 *         Google's place id) instead of adding duplicates.
 *
 * Each Google request returns up to 20 places; 20/40/60 results cost 1/2/3 requests.
 * PLACES_MONTHLY_LIMIT (default 300) caps the requests per calendar month (UTC).
 */
import { CITIES } from "../../src/lib/prospects/options.js";
import { FIELD_MASK, pagesFor, requestBody, textQuery, toCompany, validateInput } from "../../src/lib/discovery/places.js";
import type { GooglePlace } from "../../src/lib/discovery/places.js";
import { HttpError, body, handle, requireAdmin, rest } from "../_lib/server.js";

const limit = () => Math.max(0, Number(process.env.PLACES_MONTHLY_LIMIT) || 300);

async function usedThisMonth(): Promise<number> {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const rows = await rest<{ requests: number }[]>(`qawsan_searches?select=requests&created_at=gte.${encodeURIComponent(start)}`);
    return rows.reduce((s, r) => s + (r.requests || 0), 0);
}

export default handle(async (req, res) => {
    const admin = await requireAdmin(req);

    if (req.method === "GET") {
        res.status(200).json({ ok: true, configured: !!process.env.GOOGLE_PLACES_API_KEY, used: await usedThisMonth(), limit: limit() });
        return;
    }
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) throw new HttpError(503, "مفتاح Google Places غير مضاف بعد في Vercel (GOOGLE_PLACES_API_KEY).");

    const input = validateInput(body(req));
    if (typeof input === "string") throw new HttpError(400, input);

    const pages = pagesFor(input.max);
    const used = await usedThisMonth();
    if (used + pages > limit()) {
        throw new HttpError(429, `وصلت للحد الشهري: استُخدم ${used} من ${limit()} طلبًا هذا الشهر.`);
    }

    // bias results towards the chosen city when we know where it is
    const city = CITIES.find((c) => c.name.toLowerCase() === input.city.toLowerCase());
    const center = city ? { lat: city.lat, lng: city.lng } : null;

    const places: GooglePlace[] = [];
    let requests = 0;
    let token: string | undefined;
    let error = "";
    for (let i = 0; i < pages; i++) {
        requests++;
        const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELD_MASK },
            body: JSON.stringify(requestBody(input, center, token)),
        });
        const data = (await r.json().catch(() => ({}))) as { places?: GooglePlace[]; nextPageToken?: string; error?: { message?: string } };
        if (!r.ok) {
            error = data.error?.message ?? `Google ${r.status}`;
            break;
        }
        places.push(...(data.places ?? []));
        token = data.nextPageToken;
        if (!token) break;
    }

    const query = textQuery(input);
    const [search] = await rest<{ id: string }[]>("qawsan_searches", {
        method: "POST",
        prefer: "return=representation",
        body: {
            query,
            params: input,
            requests,
            found: places.length,
            status: error && !places.length ? "failed" : "done",
            error,
            created_by: admin.id,
        },
    });
    if (error && !places.length) throw new HttpError(502, `Google: ${error}`);

    // de-duplicate within this result set, then count which places we already had
    const unique = [...new Map(places.filter((p) => p.id).map((p) => [p.id, p])).values()];
    let inserted = 0;
    if (unique.length) {
        const ids = unique.map((p) => `"${p.id.replace(/"/g, "")}"`).join(",");
        const existing = await rest<{ google_place_id: string }[]>(`qawsan_companies?select=google_place_id&google_place_id=in.(${encodeURIComponent(ids)})`);
        inserted = unique.length - existing.length;
        const rows = unique.map((p) => toCompany(p, { cities: CITIES, searchId: search.id, query: input.type }));
        await rest("qawsan_companies?on_conflict=google_place_id", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: rows });
        await rest(`qawsan_searches?id=eq.${search.id}`, { method: "PATCH", body: { inserted } });
    }

    res.status(200).json({
        ok: true,
        searchId: search.id,
        query,
        requests,
        found: unique.length,
        inserted,
        updated: unique.length - inserted,
        warning: error ? `توقف Google بعد ${requests} طلب: ${error}` : "",
        used: used + requests,
        limit: limit(),
    });
});
