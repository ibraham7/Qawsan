/**
 * POST /api/review  (Vercel Serverless Function)
 *
 * Saves a customer review in Supabase (qawsan_reviews), published straight away, and emails
 * the owner. An admin can hide or delete any review in /admin.
 *
 * Env (Vercel > Settings > Environment Variables, never in the client):
 *   SUPABASE_SERVICE_ROLE_KEY   required: the service-role key of the Supabase project
 *   SUPABASE_URL                optional: defaults to the project the site already uses
 *   RESEND_API_KEY, NOTIFY_EMAIL_TO, [NOTIFY_EMAIL_FROM]   optional: new-review email
 */
import { validateReview } from "../src/lib/review.js";
import type { ReviewPayload } from "../src/lib/review.js";

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  socket?: { remoteAddress?: string };
}
interface Res {
  status(code: number): Res;
  setHeader(k: string, v: string): Res;
  json(body: unknown): void;
}

const ALLOWED_ORIGINS = ["https://qawsan.website", "https://www.qawsan.website", "https://qawsan.vercel.app"];

const DEFAULT_SUPABASE_URL = "https://eviqgyfwspemvfoehjfs.supabase.co";

// Best-effort limiter: memory is per serverless instance, so it slows bursts but is not absolute.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max + 1) : "");

function parse(body: unknown): ReviewPayload | null {
  let b = body;
  if (typeof b === "string") {
    try {
      b = JSON.parse(b);
    } catch {
      return null;
    }
  }
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  return {
    name: str(o.name, 200),
    role: str(o.role, 300),
    rating: typeof o.rating === "number" ? o.rating : 0,
    text: str(o.text, 3000),
    consent: o.consent === true,
    lang: str(o.lang, 5),
    website: str(o.website, 200),
    elapsed: typeof o.elapsed === "number" ? o.elapsed : 0,
  };
}

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function save(p: ReviewPayload) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  const url = (process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, "");
  const lang = ["ar", "en", "tr"].includes(p.lang ?? "") ? p.lang : "ar";
  const r = await fetch(`${url}/rest/v1/qawsan_reviews`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: p.name.trim(),
      role: p.role.trim(),
      rating: p.rating,
      text: p.text.trim(),
      locale: lang,
      consent: true,
      approved: true,
    }),
  });
  if (!r.ok) throw new Error(`supabase insert ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function notify(p: ReviewPayload) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) return;
  const stars = "★".repeat(p.rating) + "☆".repeat(5 - p.rating);
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7"><h2>تقييم جديد على الموقع ${stars}</h2>
<p><b>الاسم:</b> ${esc(p.name.trim())}</p>
<p><b>الوظيفة / الجهة:</b> ${esc(p.role.trim() || "-")}</p>
<p><b>الرأي:</b><br>${esc(p.text.trim()).replace(/\n/g, "<br>")}</p>
<p>نُشر على الموقع فور إرساله. للإخفاء أو الحذف: <a href="https://qawsan.website/admin">qawsan.website/admin</a></p></div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_EMAIL_FROM || "Qawsan <onboarding@resend.dev>",
      to: [to],
      subject: `تقييم جديد ${stars} — ${p.name.trim()}`.slice(0, 150),
      html,
    }),
  });
  if (!r.ok) throw new Error(`resend ${r.status}`);
}

export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method" });
  }

  const origin = String(req.headers.origin ?? "");
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return res.status(403).json({ ok: false, error: "origin" });
  }

  const fwd = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  if (limited(fwd || req.socket?.remoteAddress || "unknown")) {
    return res.status(429).json({ ok: false, error: "rate" });
  }

  const p = parse(req.body);
  if (!p) return res.status(400).json({ ok: false, error: "invalid" });

  // Honeypot / too-fast submissions: pretend success so bots learn nothing.
  if (p.website || p.elapsed < 3000) return res.status(200).json({ ok: true });

  const errors = validateReview(p);
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: "validation", fields: errors });
  }

  try {
    await save(p);
  } catch (e) {
    console.error("review: save failed", (e as Error).message);
    return res.status(500).json({ ok: false, error: "save" });
  }
  try {
    await notify(p);
  } catch (e) {
    console.error("review: notify failed", (e as Error).message);
  }
  return res.status(200).json({ ok: true });
}
