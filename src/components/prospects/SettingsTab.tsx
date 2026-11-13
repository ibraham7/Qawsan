// "الإعدادات": what is connected and how much of the monthly Google budget is used.

import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, LinearProgress, Typography } from "@mui/material";

import { discoveryStatus, mailStatus, mailTest } from "../../lib/discovery/client";
import type { DiscoveryStatus, MailStatus } from "../../lib/discovery/client";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography component="h2" sx={{ m: 0, fontSize: 17, fontWeight: 700 }}>
            {title}
        </Typography>
        {children}
    </Box>
);

export default function SettingsTab({ demo }: { demo: boolean }) {
    const [status, setStatus] = useState<DiscoveryStatus | null>(null);
    const [error, setError] = useState("");
    const [mail, setMail] = useState<MailStatus | null>(null);
    const [testBusy, setTestBusy] = useState(false);
    const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);

    useEffect(() => {
        if (demo) return;
        discoveryStatus().then(setStatus, (e: Error) => setError(e.message));
        mailStatus().then(setMail, () => setMail(null));
    }, [demo]);

    const sendTest = async () => {
        setTestBusy(true);
        setTestMsg(null);
        try {
            const r = await mailTest();
            setTestMsg({ ok: true, text: `أُرسلت رسالة تجربة إلى ${r.to}. افتح بريدك وتأكد أنها وصلت.` });
        } catch (e) {
            setTestMsg({ ok: false, text: (e as Error).message });
        } finally {
            setTestBusy(false);
        }
    };

    const pct = status && status.limit ? Math.min(100, (status.used / status.limit) * 100) : 0;

    return (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            <Card title="خرائط Google (Places API)">
                {demo && <Alert severity="info">غير متاح في الوضع التجريبي.</Alert>}
                {error && <Alert severity="warning">{error}</Alert>}
                {status && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 14 }}>المفتاح:</Typography>
                            <Chip size="small" color={status.configured ? "success" : "warning"} label={status.configured ? "متصل" : "غير مضاف"} />
                        </Box>
                        <Typography sx={{ fontSize: 14 }}>
                            استُعمل <bdi>{status.used}</bdi> من <bdi>{status.limit}</bdi> طلبًا هذا الشهر.
                        </Typography>
                        <LinearProgress variant="determinate" value={pct} color={pct > 85 ? "warning" : "primary"} sx={{ height: 8, borderRadius: 4 }} />
                    </>
                )}
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.8 }}>
                    المفتاح يُضاف في Vercel باسم <bdi>GOOGLE_PLACES_API_KEY</bdi>، والحد الشهري بـ <bdi>PLACES_MONTHLY_LIMIT</bdi> (الافتراضي 300). Google تعطي حصة مجانية شهرية ثم
                    تحاسب على كل طلب؛ راجع الفوترة في Google Cloud.
                </Typography>
            </Card>
            <Card title="واتساب">
                <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>
                    الإرسال يدوي بمساعدة الصفحة: تفتح لك محادثة كل جهة معتمدة والرسالة جاهزة، وأنت تضغط «إرسال». لا يُرسل شيء آليًا من رقمك، فلا خطر حظر بسبب الإرسال الجماعي.
                </Typography>
                <Chip size="small" label="يأتي في المرحلة الثانية: الحملات" variant="outlined" sx={{ alignSelf: "flex-start" }} />
            </Card>
            <Card title="الإثراء من المواقع">
                <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>يفتح موقع كل جهة وصفحة تواصل واحدة ويستخرج الإيميل والسوشيال والواتساب. مجاني ولا يستخدم Google. حتى 25 جهة في المرة.</Typography>
            </Card>
            <Card title="الإيميل (SMTP)">
                {demo && <Alert severity="info">غير متاح في الوضع التجريبي.</Alert>}
                {mail && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontSize: 14 }}>الصندوق:</Typography>
                        <Chip size="small" color={mail.configured ? "success" : "warning"} label={mail.configured ? "متصل" : "غير مضاف"} />
                        {mail.configured && (
                            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                                <bdi>{mail.from}</bdi> عبر <bdi>{mail.host}</bdi>
                            </Typography>
                        )}
                    </Box>
                )}
                {mail?.configured && (
                    <Box>
                        <Button variant="outlined" size="small" onClick={sendTest} disabled={testBusy}>
                            {testBusy ? "جارٍ الإرسال…" : "إرسال رسالة تجربة لنفسي"}
                        </Button>
                        {testMsg && (
                            <Alert severity={testMsg.ok ? "success" : "error"} sx={{ mt: 1.5 }}>
                                {testMsg.text}
                            </Alert>
                        )}
                    </Box>
                )}
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.9 }}>
                    الإعداد في Vercel (من نوع Secret): <bdi>SMTP_USER</bdi> بريدك، و<bdi>SMTP_PASS</bdi> كلمة مرور التطبيقات (في Gmail: حسابك ثم Security ثم App passwords). اختياري:{" "}
                    <bdi>SMTP_FROM_NAME</bdi> اسم المُرسِل. الإرسال التلقائي يظهر في شاشة إرسال الحملة، وكل رسالة تحمل رابط إلغاء اشتراك. بدون هذا الإعداد يبقى الإرسال اليدوي من Gmail.
                </Typography>
            </Card>
        </Box>
    );
}
