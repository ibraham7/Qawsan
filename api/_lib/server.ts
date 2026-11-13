// Shared helpers for the /api/prospects/* functions (files under api/_lib are not routes).
//
// Env (Vercel > Settings > Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY  required (already set for /api/review)
//   SUPABASE_URL               optional, defaults to Qawsan's project
//   GOOGLE_PLACES_API_KEY      required for /api/prospects/search
//   PLACES_MONTHLY_LIMIT       optional, Google requests allowed per calendar month (default 300)

import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net from "node:net";
import type { LookupFunction } from "node:net";

import { isPrivateAddress } from "../../src/lib/discovery/extract.js";

export interface Req {
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    body?: unknown;
}
export interface Res {
    status(code: number): Res;
    setHeader(k: string, v: string): Res;
    json(body: unknown): void;
    /** plain text / HTML reply (used by the public unsubscribe page) */
    send(body: string): void;
}

export const SUPABASE_URL = (process.env.SUPABASE_URL || "https://ghdrumngrpttuihyklnc.supabase.co").replace(/\/+$/, "");

export class HttpError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export function body(req: Req): unknown {
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        } catch {
            return null;
        }
    }
    return req.body ?? null;
}

/** secret used to sign unsubscribe links (the service key is already private to the server) */
export function signingSecret() {
    return serviceKey();
}

function serviceKey() {
    const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!k) throw new HttpError(500, "SUPABASE_SERVICE_ROLE_KEY غير مضاف في Vercel.");
    return k;
}

/** PostgREST call with the service key (bypasses RLS: callers check the admin first) */
export async function rest<T = unknown>(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
    const key = serviceKey();
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method: init.method ?? "GET",
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            ...(init.prefer ? { Prefer: init.prefer } : {}),
        },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await r.text();
    if (!r.ok) throw new HttpError(502, `Supabase ${r.status}: ${text.slice(0, 200)}`);
    return (text ? JSON.parse(text) : null) as T;
}

/** the signed-in user behind the request, who must be a qawsan admin */
export async function requireAdmin(req: Req): Promise<{ id: string; email: string }> {
    const auth = req.headers.authorization;
    const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) throw new HttpError(401, "سجّل الدخول أولًا.");
    const key = serviceKey();
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new HttpError(401, "انتهت الجلسة، سجّل الدخول من جديد.");
    const user = (await r.json()) as { id: string; email?: string };
    const rows = await rest<{ user_id: string }[]>(`qawsan_admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`);
    if (!rows.length) throw new HttpError(403, "هذا الحساب لا يملك صلاحية الإدارة.");
    return { id: user.id, email: user.email ?? "" };
}

export function handle(fn: (req: Req, res: Res) => Promise<void>) {
    return async (req: Req, res: Res) => {
        res.setHeader("Cache-Control", "no-store");
        try {
            await fn(req, res);
        } catch (e) {
            const status = e instanceof HttpError ? e.status : 500;
            if (status === 500) console.error(e);
            res.status(status).json({ ok: false, error: e instanceof Error ? e.message : "خطأ غير متوقع." });
        }
    };
}

/* ------------------------------------------------------------------ */
/* fetching other people's websites safely                              */

// resolve the host ourselves and refuse private/internal addresses; the connection uses the
// address we checked, so a DNS answer cannot change between the check and the request
const guardedLookup: LookupFunction = (hostname, options, callback) => {
    dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
        if (err) return callback(err, "", 0);
        const list = addresses as dns.LookupAddress[];
        const bad = list.find((a) => isPrivateAddress(a.address));
        if (!list.length || bad) return callback(new Error("blocked address"), "", 0);
        if ((options as dns.LookupOptions).all) return (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list);
        callback(null, list[0].address, list[0].family);
    });
};

export interface Page {
    url: string;
    html: string;
}

const MAX_BYTES = 1_500_000;

function getOnce(url: URL, timeoutMs: number): Promise<{ status: number; location?: string; type: string; body: string }> {
    return new Promise((resolve, reject) => {
        const lib = url.protocol === "https:" ? https : http;
        const r = lib.request(
            url,
            {
                method: "GET",
                lookup: guardedLookup,
                timeout: timeoutMs,
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; QawsanBot/1.0; +https://qawsan.website)",
                    Accept: "text/html,application/xhtml+xml",
                    "Accept-Encoding": "identity",
                    "Accept-Language": "ar,en;q=0.8,tr;q=0.6",
                },
            },
            (res) => {
                const status = res.statusCode ?? 0;
                const type = String(res.headers["content-type"] ?? "");
                if (status >= 300 && status < 400) {
                    res.resume();
                    return resolve({ status, location: res.headers.location, type, body: "" });
                }
                if (!/text\/html|application\/xhtml/i.test(type)) {
                    res.resume();
                    return resolve({ status, type, body: "" });
                }
                let size = 0;
                const chunks: Buffer[] = [];
                res.on("data", (c: Buffer) => {
                    size += c.length;
                    if (size > MAX_BYTES) {
                        r.destroy();
                        resolve({ status, type, body: Buffer.concat(chunks).toString("utf8") });
                        return;
                    }
                    chunks.push(c);
                });
                res.on("end", () => resolve({ status, type, body: Buffer.concat(chunks).toString("utf8") }));
                res.on("error", reject);
            }
        );
        r.on("timeout", () => r.destroy(new Error("timeout")));
        r.on("error", reject);
        r.end();
    });
}

/** GET an http(s) page, following at most 3 redirects, refusing internal hosts and non-HTML */
export async function fetchPage(raw: string, timeoutMs = 6000): Promise<Page | null> {
    let url: URL;
    try {
        url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
        return null;
    }
    for (let hop = 0; hop < 4; hop++) {
        if (!/^https?:$/.test(url.protocol) || url.username || url.password) return null;
        if (url.port && !["80", "443"].includes(url.port)) return null;
        // an IP written in the URL never goes through the DNS lookup, so check it here
        const literal = url.hostname.replace(/^\[|\]$/g, "");
        if (net.isIP(literal) && isPrivateAddress(literal)) return null;
        const r = await getOnce(url, timeoutMs);
        if (r.location && hop < 3) {
            url = new URL(r.location, url);
            continue;
        }
        if (r.status >= 200 && r.status < 300 && r.body) return { url: url.toString(), html: r.body };
        return null;
    }
    return null;
}
