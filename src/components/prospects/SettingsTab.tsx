// "الإعدادات": what is connected and how much of the monthly Google budget is used.

import { useEffect, useState } from "react";
import { Alert, Box, Chip, LinearProgress, Typography } from "@mui/material";

import { discoveryStatus } from "../../lib/discovery/client";
import type { DiscoveryStatus } from "../../lib/discovery/client";

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

    useEffect(() => {
        if (demo) return;
        discoveryStatus().then(setStatus, (e: Error) => setError(e.message));
    }, [demo]);

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
            <Card title="الإيميل">
                <Typography sx={{ fontSize: 14, lineHeight: 1.8 }}>ربط صندوق بريد (SMTP) وإرسال حملات باعتماد نهائي ورابط إلغاء اشتراك.</Typography>
                <Chip size="small" label="يأتي في المرحلة الثالثة" variant="outlined" sx={{ alignSelf: "flex-start" }} />
            </Card>
        </Box>
    );
}
