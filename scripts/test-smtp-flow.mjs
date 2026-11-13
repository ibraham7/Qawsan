// End-to-end: real handlers (compiled) + real SMTP conversation with a fake server + in-memory database.
import assert from "node:assert/strict";
import net from "node:net";
import { pathToFileURL } from "node:url";

const OUT = process.argv[2];
const PORT = 2525;
process.env.SUPABASE_URL = "https://fake.supabase.test";
process.env.SUPABASE_SERVICE_ROLE_KEY = "svc-secret";
process.env.SMTP_HOST = "127.0.0.1";
process.env.SMTP_PORT = String(PORT);
process.env.SMTP_USER = "me@x.com";
process.env.SMTP_PASS = "good pass"; // spaces are stripped, like Google's grouped App Passwords
process.env.SMTP_FROM_NAME = "قوسان";

/* ---------------- fake SMTP server ---------------- */
const inbox = [];
const server = net.createServer((sock) => {
    let mode = "cmd", buf = "", cur = { to: [], data: "" };
    const w = (s) => sock.write(s + "\r\n");
    w("220 fake ESMTP");
    sock.on("data", (d) => {
        buf += d.toString("utf8");
        for (;;) {
            if (mode === "data") {
                const end = buf.indexOf("\r\n.\r\n");
                if (end === -1) return;
                cur.data = buf.slice(0, end);
                buf = buf.slice(end + 5);
                inbox.push(cur);
                cur = { to: [], data: "" };
                mode = "cmd";
                w("250 queued");
                continue;
            }
            const i = buf.indexOf("\r\n");
            if (i === -1) return;
            const line = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const up = line.toUpperCase();
            if (up.startsWith("EHLO") || up.startsWith("HELO")) { sock.write("250-fake\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n"); }
            else if (up.startsWith("AUTH PLAIN")) {
                const parts = Buffer.from(line.split(" ")[2] ?? "", "base64").toString().split("\0");
                w(parts[2] === (process.env.SMTP_PASS_EXPECTED ?? "goodpass") ? "235 ok" : "535 5.7.8 Username and Password not accepted");
            } else if (up.startsWith("AUTH LOGIN")) { w("334 VXNlcm5hbWU6"); mode = "login1"; }
            else if (mode === "login1") { w("334 UGFzc3dvcmQ6"); mode = "login2"; }
            else if (mode === "login2") { mode = "cmd"; w(Buffer.from(line, "base64").toString() === (process.env.SMTP_PASS_EXPECTED ?? "goodpass") ? "235 ok" : "535 5.7.8 Username and Password not accepted"); }
            else if (up.startsWith("MAIL FROM")) { cur.from = line; w("250 ok"); }
            else if (up.startsWith("RCPT TO")) {
                const to = line.match(/<(.+)>/)[1];
                if (to.includes("bounce")) w("550 5.1.1 user unknown");
                else { cur.to.push(to); w("250 ok"); }
            } else if (up === "DATA") { mode = "data"; w("354 go"); }
            else if (up === "QUIT") { w("221 bye"); sock.end(); }
            else if (up === "RSET" || up === "NOOP") w("250 ok");
            else w("250 ok");
        }
    });
    sock.on("error", () => {});
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

const decodeMail = (raw) => {
    const [head, ...rest] = raw.split("\r\n\r\n");
    const unfold = head.replace(/\r\n[ \t]+/g, " ");
    const hdr = (n) => unfold.split("\r\n").find((l) => l.toLowerCase().startsWith(n.toLowerCase() + ":"))?.slice(n.length + 1).trim() ?? "";
    const words = (v) => v.replace(/=\?UTF-8\?([BQ])\?([^?]*)\?=/gi, (_m, e, t) => (e.toUpperCase() === "B" ? Buffer.from(t, "base64").toString("utf8") : t)).replace(/\?= =\?/g, "");
    const enc = hdr("Content-Transfer-Encoding").toLowerCase();
    let body = rest.join("\r\n\r\n");
    if (enc === "base64") body = Buffer.from(body.replace(/\s+/g, ""), "base64").toString("utf8");
    else if (enc === "quoted-printable") body = Buffer.from(body.replace(/=\r\n/g, "").replace(/=([0-9A-F]{2})/g, (_m, h) => String.fromCharCode(parseInt(h, 16))), "latin1").toString("utf8");
    return { subject: words(hdr("Subject")), from: words(hdr("From")), replyTo: hdr("Reply-To"), listUnsub: hdr("List-Unsubscribe"), listPost: hdr("List-Unsubscribe-Post"), body };
};

/* ---------------- fake database (PostgREST subset) ---------------- */
let db;
const reset = (o) => {
    db = { campaigns: [], recipients: [], companies: [], suppressions: [], admins: [{ user_id: "u1" }], writes: [], ...o };
};
const filterRows = (rows, q) => {
    let out = rows;
    for (const [k, v] of q) {
        if (["select", "order", "limit", "on_conflict"].includes(k)) continue;
        const [op, ...r] = v.split(".");
        const val = r.join(".");
        if (op === "eq") out = out.filter((x) => String(x[k]) === val);
        else if (op === "gte") out = out.filter((x) => x[k] && new Date(x[k]) >= new Date(val));
        else if (op === "in") {
            const items = val.slice(1, -1).split(",").map((s) => s.replace(/^"|"$/g, ""));
            out = out.filter((x) => items.includes(String(x[k])));
        }
    }
    const order = q.get("order");
    if (order) out = [...out].sort((a, b) => String(a[order]).localeCompare(String(b[order])));
    if (q.get("limit")) out = out.slice(0, Number(q.get("limit")));
    return out;
};
globalThis.fetch = async (url, init = {}) => {
    const u = new URL(url);
    const json = (data, status = 200) => (status === 204 ? new Response(null, { status }) : new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } }));
    if (u.pathname === "/auth/v1/user") return json({ id: "u1", email: "admin@x.com" });
    const m = u.pathname.match(/^\/rest\/v1\/(\w+)$/);
    if (!m) throw new Error("unexpected request " + url);
    const t = { qawsan_admins: "admins", qawsan_campaigns: "campaigns", qawsan_campaign_recipients: "recipients", qawsan_companies: "companies", qawsan_suppressions: "suppressions" }[m[1]];
    const method = (init.method ?? "GET").toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;
    if (method === "GET") return json(filterRows(db[t], u.searchParams));
    if (method === "PATCH") {
        const rows = filterRows(db[t], u.searchParams);
        rows.forEach((r) => Object.assign(r, body));
        db.writes.push([t, rows.map((r) => r.id), body]);
        return json(null, 204);
    }
    if (method === "POST") {
        if (t === "suppressions" && db.suppressions.some((s) => s.value === body.value)) return json(null, 201);
        db[t].push(body);
        db.writes.push([t, "insert", body]);
        return json(null, 201);
    }
    throw new Error("unhandled " + method);
};

/* ---------------- handlers ---------------- */
const load = async (p) => (await import(pathToFileURL(`${OUT}/${p}`).href)).default;
const send = await load("api/prospects/email-send.js");
const status = await load("api/prospects/email-status.js");
const unsub = await load("api/unsubscribe.js");
const { unsubscribeUrl, verifyToken } = await import(pathToFileURL(`${OUT}/src/lib/prospects/unsubscribe.js`).href);

const call = async (handler, req) => {
    const res = { statusCode: 200, body: null, status(c) { this.statusCode = c; return this; }, setHeader() { return this; }, json(b) { this.body = b; }, send(s) { this.body = s; } };
    await handler({ headers: { authorization: "Bearer t" }, ...req }, res);
    return res;
};

const ID = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const camp = (o = {}) => ({ id: ID(1), channel: "email", status: "active", subject: "عرض لـ {name}", message: "مرحبًا {name}، عرض قصير.", stop_line: "للإيقاف ردّ بكلمة إيقاف.", daily_limit: 7, ...o });
const comp = (n, o = {}) => ({ id: ID(100 + n), status: "approved", emails: [`info${n}@c.com`], phone: "", ...o });
const rec = (n, o = {}) => ({ id: ID(200 + n), campaign_id: ID(1), company_id: ID(100 + n), name: `a${n}`, email: `info${n}@c.com`, status: "pending", sent_at: null, error: "", ...o });

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok -", name); };

await test("status: configured, from address shown (no secrets)", async () => {
    reset({});
    const r = await call(status, { method: "GET" });
    assert.equal(r.statusCode, 200);
    assert.deepEqual(r.body, { ok: true, configured: true, from: "me@x.com", host: "127.0.0.1" });
    assert.ok(!JSON.stringify(r.body).includes("goodpass"));
});

await test("test email goes only to the signed-in admin", async () => {
    reset({});
    inbox.length = 0;
    process.env.SMTP_PASS_EXPECTED = "goodpass";
    const r = await call(status, { method: "POST" });
    assert.equal(r.statusCode, 200, JSON.stringify(r.body));
    assert.equal(inbox.length, 1);
    assert.deepEqual(inbox[0].to, ["admin@x.com"]);
});

await test("batch: sends, skips what must be skipped, marks failures, respects the limit", async () => {
    inbox.length = 0;
    // 9 recipients; a3's company was set to not_fit, a5's address is blocked, a6 bounces
    reset({
        campaigns: [camp({ daily_limit: 7 })],
        companies: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => comp(n, n === 3 ? { status: "not_fit" } : n === 6 ? { emails: ["bounce6@c.com"] } : {})),
        recipients: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => rec(n, n === 6 ? { email: "bounce6@c.com" } : {})),
        suppressions: [{ value: "info5@c.com", kind: "email" }],
    });
    const r1 = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(r1.statusCode, 200, JSON.stringify(r1.body));
    // first batch = a1..a5: a3 and a5 skipped, a1 a2 a4 sent
    assert.deepEqual([r1.body.sent, r1.body.failed, r1.body.skipped], [3, 0, 2]);
    assert.equal(r1.body.sentToday, 3);
    const st = (n) => db.recipients.find((x) => x.id === ID(200 + n));
    assert.deepEqual([1, 2, 3, 4, 5].map((n) => st(n).status), ["sent", "sent", "skipped", "sent", "skipped"]);
    assert.equal(st(3).error, "company_not_approved");
    assert.equal(st(5).error, "blocked");
    assert.equal(db.companies.find((c) => c.id === ID(101)).status, "contacted");
    assert.equal(db.companies.find((c) => c.id === ID(103)).status, "not_fit", "a skipped company keeps its status");

    const r2 = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(r2.statusCode, 200, JSON.stringify(r2.body));
    // second batch: room = 7-3 = 4 -> a6 (bounce) a7 a8 a9
    assert.deepEqual([r2.body.sent, r2.body.failed], [3, 1]);
    assert.equal(st(6).status, "failed");
    assert.ok(st(6).error.includes("550"), st(6).error);
    assert.equal(r2.body.stopped, "done");
    assert.equal(r2.body.pending, 0);
    assert.equal(inbox.length, 6, "a1 a2 a4 a7 a8 a9 were delivered, nothing else");
    assert.ok(!inbox.some((m) => m.to.includes("info5@c.com") || m.to.includes("info3@c.com")), "blocked / not approved never get a message");
});

await test("message content: subject, body, stop line, unsubscribe link and headers", async () => {
    const m = decodeMail(inbox[0].data);
    assert.equal(m.subject, "عرض لـ a1");
    assert.ok(m.from.includes("قوسان") && m.from.includes("me@x.com"), m.from);
    assert.equal(m.replyTo, "me@x.com");
    assert.ok(m.body.startsWith("مرحبًا a1، عرض قصير."), m.body);
    assert.ok(m.body.includes("للإيقاف ردّ بكلمة إيقاف."));
    const link = m.body.match(/https:\/\/qawsan\.website\/api\/unsubscribe\?[^\s]+/)?.[0];
    assert.ok(link, "no unsubscribe link in body");
    assert.equal(m.listUnsub, `<${link}>`);
    assert.equal(m.listPost, "List-Unsubscribe=One-Click");
    const u = new URL(link);
    assert.equal(u.searchParams.get("r"), ID(201));
    assert.equal(verifyToken("svc-secret", ID(201), u.searchParams.get("t")), true);
});

await test("daily limit: stops at the limit and says so", async () => {
    inbox.length = 0;
    const now = new Date().toISOString();
    reset({
        campaigns: [camp({ daily_limit: 2 })],
        companies: [1, 2, 3, 4, 5, 6].map((n) => comp(n)),
        recipients: [1, 2, 3, 4, 5, 6].map((n) => rec(n)),
    });
    const r1 = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.deepEqual([r1.body.sent, r1.body.pending], [2, 4]);
    const r2 = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.deepEqual([r2.body.sent, r2.body.stopped, r2.body.pending, r2.body.sentToday], [0, "limit", 4, 2]);
    assert.equal(inbox.length, 2);
    // yesterday's sends do not count today
    db.recipients.forEach((r) => r.status === "sent" && (r.sent_at = new Date(Date.now() - 36 * 3600 * 1000).toISOString()));
    const r3 = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(r3.body.sent, 2, "a new day, a new limit");
    assert.ok(now);
});

await test("paused or non-email campaigns are refused", async () => {
    reset({ campaigns: [camp({ status: "paused" }), camp({ id: ID(2), channel: "whatsapp" })], recipients: [rec(1)], companies: [comp(1)] });
    inbox.length = 0;
    const a = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(a.statusCode, 409);
    const b = await call(send, { method: "POST", body: { campaignId: ID(2) } });
    assert.equal(b.statusCode, 404);
    const c = await call(send, { method: "POST", body: { campaignId: "x'; drop" } });
    assert.equal(c.statusCode, 400);
    const d = await call(send, { method: "GET" });
    assert.equal(d.statusCode, 405);
    assert.equal(inbox.length, 0);
});

await test("wrong mailbox password: nothing is sent and recipients stay pending", async () => {
    inbox.length = 0;
    process.env.SMTP_PASS_EXPECTED = "different";
    reset({ campaigns: [camp()], companies: [1, 2].map((n) => comp(n)), recipients: [1, 2].map((n) => rec(n)) });
    const r = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(r.statusCode, 502);
    assert.ok(r.body.error.includes("كلمة مرور"), r.body.error);
    assert.ok(db.recipients.every((x) => x.status === "pending"));
    assert.equal(db.writes.length, 0);
    assert.equal(inbox.length, 0);
    const t = await call(status, { method: "POST" });
    assert.equal(t.statusCode, 502);
    process.env.SMTP_PASS_EXPECTED = "goodpass";
});

await test("not signed in: refused before anything happens", async () => {
    reset({ admins: [] });
    const r = await call(send, { method: "POST", body: { campaignId: ID(1) } });
    assert.equal(r.statusCode, 403);
    const r2 = await call(send, { method: "POST", headers: {}, body: { campaignId: ID(1) } });
    assert.equal(r2.statusCode, 401);
});

await test("unsubscribe: a scanner opening the link changes nothing; the button does", async () => {
    reset({ recipients: [rec(7)], companies: [comp(7)] });
    const link = unsubscribeUrl("https://qawsan.website", "svc-secret", ID(207));
    const url = new URL(link);
    const q = `?r=${url.searchParams.get("r")}&t=${url.searchParams.get("t")}`;
    const g = await call(unsub, { method: "GET", url: "/api/unsubscribe" + q, headers: {} });
    assert.equal(g.statusCode, 200);
    assert.ok(g.body.includes("<form") && g.body.includes("method=\"post\""));
    assert.equal(db.writes.length, 0, "GET must not change anything");
    const p = await call(unsub, { method: "POST", url: "/api/unsubscribe" + q, headers: {} });
    assert.equal(p.statusCode, 200);
    assert.ok(p.body.includes("تم إلغاء الاشتراك"));
    assert.deepEqual(db.suppressions.map((s) => [s.value, s.kind, s.reason]), [["info7@c.com", "email", "unsubscribe_link"]]);
    assert.equal(db.recipients[0].status, "stopped");
    assert.equal(db.companies[0].status, "unsubscribed");
});

await test("unsubscribe: forged or damaged links are refused", async () => {
    reset({ recipients: [rec(7)], companies: [comp(7)] });
    const good = new URL(unsubscribeUrl("https://qawsan.website", "svc-secret", ID(207)));
    for (const q of [`?r=${ID(207)}&t=${"a".repeat(32)}`, `?r=${ID(207)}`, `?t=${good.searchParams.get("t")}`, `?r=${ID(208)}&t=${good.searchParams.get("t")}`, ""]) {
        const r = await call(unsub, { method: "POST", url: "/api/unsubscribe" + q, headers: {} });
        assert.equal(r.statusCode, 400, q);
    }
    assert.equal(db.writes.length, 0);
});

server.close();
console.log(`\n${passed} end-to-end checks passed`);
process.exit(0);
