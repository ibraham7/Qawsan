/**
 * /api/unsubscribe?r=<recipient id>&t=<signed token>   (public)
 *
 * GET  -> a page with one button (so a mail scanner that only opens links cannot unsubscribe anyone)
 * POST -> performs it: the address goes to do-not-contact, the recipient becomes "stopped" and the
 *         company "unsubscribed". Mail apps use POST for the one-click List-Unsubscribe header.
 */
import { verifyToken } from "../src/lib/prospects/unsubscribe.js";
import { rest, signingSecret } from "./_lib/server.js";
import type { Req, Res } from "./_lib/server.js";

const page = (title: string, text: string, form = "") =>
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>body{font-family:system-ui,sans-serif;background:#0b0f0e;color:#e6ece8;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px}main{max-width:440px;text-align:center}h1{font-size:22px}p{color:#a0a7a3;line-height:1.8}button{background:#00d084;color:#04150e;border:0;border-radius:12px;padding:12px 28px;font-size:16px;font-weight:700;cursor:pointer}</style></head><body><main><h1>${title}</h1><p>${text}</p>${form}</main></body></html>`;

function params(req: Req & { url?: string }): { r: string; t: string } {
    const url = new URL(req.url ?? "", "https://x");
    const b = typeof req.body === "object" && req.body ? (req.body as Record<string, unknown>) : {};
    const get = (k: string) => (url.searchParams.get(k) ?? (typeof b[k] === "string" ? (b[k] as string) : "")).slice(0, 80);
    return { r: get("r"), t: get("t") };
}

export default async function handler(req: Req & { url?: string }, res: Res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    try {
        const { r, t } = params(req);
        if (!verifyToken(signingSecret(), r, t)) {
            res.status(400).send(page("رابط غير صالح", "هذا الرابط غير صحيح أو منتهٍ. إن أردت التوقف عن استلام رسائلنا فردّ على الرسالة بكلمة «إيقاف»."));
            return;
        }

        if (req.method === "GET") {
            res.status(200).send(page("إلغاء الاشتراك", "اضغط الزر لنتوقف عن مراسلتك.", `<form method="post" action="/api/unsubscribe?r=${encodeURIComponent(r)}&t=${encodeURIComponent(t)}"><button type="submit">إلغاء الاشتراك</button></form>`));
            return;
        }
        if (req.method !== "POST") {
            res.status(405).send(page("غير مسموح", "طريقة غير مدعومة."));
            return;
        }

        const [rec] = await rest<{ id: string; company_id: string | null; email: string }[]>(`qawsan_campaign_recipients?select=id,company_id,email&id=eq.${encodeURIComponent(r)}`);
        if (rec) {
            if (rec.email) {
                await rest("qawsan_suppressions?on_conflict=value", {
                    method: "POST",
                    prefer: "resolution=ignore-duplicates,return=minimal",
                    body: { value: rec.email.toLowerCase(), kind: "email", reason: "unsubscribe_link" },
                });
            }
            await rest(`qawsan_campaign_recipients?id=eq.${rec.id}`, { method: "PATCH", body: { status: "stopped" } });
            if (rec.company_id) await rest(`qawsan_companies?id=eq.${rec.company_id}`, { method: "PATCH", body: { status: "unsubscribed" } });
        }
        // the same answer whether or not the recipient still exists
        res.status(200).send(page("تم إلغاء الاشتراك", "لن نراسلك مرة أخرى. نعتذر عن الإزعاج."));
    } catch (e) {
        console.error(e);
        res.status(500).send(page("حدث خطأ", "تعذّر إتمام الطلب الآن. ردّ على الرسالة بكلمة «إيقاف» وسنوقف المراسلة."));
    }
}
