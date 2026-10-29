/**
 * POST /api/start-project  (Vercel Serverless Function)
 *
 * 1. validate  2. anti-spam  3. append a row to Google Sheets (source of truth)
 * 4. notify the admin by email through Resend.
 * Success is only returned after the row is saved. An email failure never loses a request.
 *
 * Env (Vercel > Settings > Environment Variables, never in the client):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID, [GOOGLE_SHEET_TAB=Requests]
 *   RESEND_API_KEY, NOTIFY_EMAIL_TO, [NOTIFY_EMAIL_FROM]
 */
import { createSign } from "node:crypto";
import {
  BUDGETS,
  CONTACT_METHODS,
  PROJECT_TYPES,
  TIMELINES,
  validate,
  type StartProjectPayload,
} from "../src/lib/startProject";

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

const ALLOWED_ORIGINS = [
  "https://qawsan.website",
  "https://www.qawsan.website",
  "https://qawsan.vercel.app",
];

// Best-effort limiter: memory is per serverless instance, so it slows bursts but is not absolute.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

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

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.slice(0, max + 1) : "";

function parse(body: unknown): StartProjectPayload | null {
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
    company: str(o.company, 300),
    email: str(o.email, 300),
    whatsapp: str(o.whatsapp, 60),
    projectType: str(o.projectType, 30),
    description: str(o.description, 5000),
    features: str(o.features, 5000),
    references: str(o.references, 5000),
    budget: str(o.budget, 30),
    timeline: str(o.timeline, 30),
    contactMethod: str(o.contactMethod, 30),
    consent: o.consent === true,
    website: str(o.website, 200),
    elapsed: typeof o.elapsed === "number" ? o.elapsed : 0,
  };
}

const label = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((i) => i.value === v)?.label ?? v;

const b64 = (v: string | Buffer) => Buffer.from(v).toString("base64url");

async function googleToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const head = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const sig = createSign("RSA-SHA256").update(`${head}.${claim}`).sign(privateKey);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claim}.${b64(sig)}`,
    }),
  });
  if (!r.ok) throw new Error(`google token ${r.status}`);
  return ((await r.json()) as { access_token: string }).access_token;
}

// Stops spreadsheet formula injection (=, +, -, @ at the start of a cell).
const cell = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

async function saveToSheet(p: StartProjectPayload, ref: string) {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheet = process.env.GOOGLE_SHEET_ID;
  if (!email || !key || !sheet) throw new Error("sheets not configured");
  const tab = process.env.GOOGLE_SHEET_TAB || "Requests";
  const token = await googleToken(email, key);
  const row = [
    new Date().toISOString(),
    ref,
    p.name,
    p.company,
    p.email,
    p.whatsapp,
    label(PROJECT_TYPES, p.projectType),
    p.description,
    p.features,
    p.references,
    label(BUDGETS, p.budget),
    label(TIMELINES, p.timeline),
    label(CONTACT_METHODS, p.contactMethod),
    "yes",
    "new",
  ].map((v) => cell(String(v).trim()));
  const r = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheet)}/values/${encodeURIComponent(tab)}!A:O:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  if (!r.ok) throw new Error(`sheets append ${r.status}`);
}

const esc = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function notify(p: StartProjectPayload, ref: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) throw new Error("resend not configured");
  const rows: [string, string][] = [
    ["الاسم", p.name],
    ["الشركة", p.company || "-"],
    ["البريد", p.email],
    ["واتساب", p.whatsapp],
    ["نوع المشروع", label(PROJECT_TYPES, p.projectType)],
    ["الميزانية", label(BUDGETS, p.budget)],
    ["المدة", label(TIMELINES, p.timeline)],
    ["وسيلة التواصل المفضلة", label(CONTACT_METHODS, p.contactMethod)],
    ["الوصف", p.description],
    ["الميزات", p.features || "-"],
    ["روابط/أمثلة", p.references || "-"],
    ["لغة الموقع", ({ ar: "العربية", en: "English", tr: "Türkçe" } as Record<string, string>)[p.lang ?? "ar"] ?? "العربية"],
  ];
  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.7"><h2>طلب مشروع جديد (${esc(ref)})</h2>${rows
    .map(([k, v]) => `<p><b>${k}:</b><br>${esc(v.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("")}</div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_EMAIL_FROM || "Qawsan <onboarding@resend.dev>",
      to: [to],
      reply_to: p.email,
      subject: `طلب مشروع جديد - ${p.name} (${ref})`,
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
  if (p.website || p.elapsed < 2500) return res.status(200).json({ ok: true });

  const errors = validate(p);
  if (Object.keys(errors).length) {
    return res.status(400).json({ ok: false, error: "validation", fields: errors });
  }

  const ref = `QW-${Date.now().toString(36).toUpperCase()}`;
  try {
    await saveToSheet(p, ref);
  } catch (e) {
    console.error("start-project: save failed", (e as Error).message);
    return res.status(500).json({ ok: false, error: "save" });
  }
  try {
    await notify(p, ref);
  } catch (e) {
    console.error("start-project: notify failed", (e as Error).message);
  }
  return res.status(200).json({ ok: true, ref });
}
