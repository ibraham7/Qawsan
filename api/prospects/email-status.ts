/**
 * /api/prospects/email-status  (admins only)
 *
 * GET  -> { configured, from, host }   whether the SMTP mailbox is set in Vercel
 * POST -> verifies the connection and sends one test message to the signed-in admin's own address
 */
import { HttpError, handle, requireAdmin } from "../_lib/server.js";
import { createSender, mailConfig } from "../_lib/mail.js";

export default handle(async (req, res) => {
    const admin = await requireAdmin(req);
    const cfg = mailConfig();

    if (req.method === "GET") {
        res.status(200).json({ ok: true, configured: !!cfg, from: cfg?.from ?? "", host: cfg?.host ?? "" });
        return;
    }
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");
    if (!cfg) throw new HttpError(503, "صندوق البريد غير مضاف بعد في Vercel (SMTP_USER وSMTP_PASS).");
    if (!admin.email) throw new HttpError(400, "حسابك بلا إيميل.");

    const mail = createSender(cfg);
    const ok = await mail.verify();
    if (!ok.ok) throw new HttpError(502, ok.kind === "auth" ? "رفض الخادم اسم المستخدم أو كلمة المرور. في Gmail استخدم «كلمة مرور التطبيقات» لا كلمة مرور حسابك." : `تعذّر الاتصال بالخادم: ${ok.error}`);

    const sent = await mail.send({
        to: admin.email,
        subject: "رسالة تجربة من صفحة التسويق - قوسان",
        text: "هذه رسالة تجربة. إن وصلتك فالإرسال من الصفحة يعمل بشكل صحيح.\n\nلم تُرسل أي رسالة لأي جهة.",
    });
    if (!sent.ok) throw new HttpError(502, `فشل الإرسال: ${sent.error}`);
    res.status(200).json({ ok: true, to: admin.email });
});
