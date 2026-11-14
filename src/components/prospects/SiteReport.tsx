// A one-page website report for a clinic, laid out as an A4 sheet: open it from a company's card, press
// "طباعة / حفظ PDF" and choose "Save as PDF". The look is fixed (white paper, Qawsan green) whatever the
// admin theme is, because the sheet is meant to be sent to the clinic. Content: lib/prospects/sitereport.ts.

import { useEffect, useState } from "react";
import { Alert, Box, Button, GlobalStyles, LinearProgress, TextField, Typography } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";

import type { Backend } from "../../lib/prospects/data";
import { buildReport } from "../../lib/prospects/sitereport";
import type { Finding, SiteReportModel } from "../../lib/prospects/sitereport";
import type { CompanyRow } from "../../lib/prospects/types";

const C = { ink: "#0B1713", muted: "#5F6B66", line: "#D7E2DD", brand: "#00A86B", deep: "#0E3D2E", soft: "#E8F0EC", bad: "#C0392B", mid: "#B7791F" };
const LEVEL_COLOR = { weak: C.bad, medium: C.mid, good: C.brand } as const;
const CONTACT_KEY = "qawsan-report-contact";

function Ring({ score, color }: { score: number; color: string }) {
    const r = 52;
    const len = 2 * Math.PI * r;
    return (
        <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`الدرجة ${score} من 100`}>
            <circle cx="70" cy="70" r={r} fill="none" stroke={C.soft} strokeWidth="12" />
            <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * len} ${len}`} transform="rotate(-90 70 70)" />
            <text x="70" y="68" textAnchor="middle" fontSize="38" fontWeight="700" fill={C.ink}>
                {score}
            </text>
            <text x="70" y="92" textAnchor="middle" fontSize="13" fill={C.muted}>
                من 100
            </text>
        </svg>
    );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <Box sx={{ flex: 1, minWidth: 110, p: 1.5, border: `1px solid ${C.line}`, borderRadius: "12px", textAlign: "center", breakInside: "avoid" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: tone, lineHeight: 1.3 }} dir="ltr">
                {value}
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.muted }}>{label}</Typography>
        </Box>
    );
}

const tone = (n: number | null) => (n === null ? C.muted : n >= 90 ? C.brand : n >= 50 ? C.mid : C.bad);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box sx={{ mt: 3 }}>
            <Typography component="h2" sx={{ m: 0, mb: 1.25, fontSize: 16, fontWeight: 700, color: C.deep, borderInlineStart: `4px solid ${C.brand}`, paddingInlineStart: "10px" }}>
                {title}
            </Typography>
            {children}
        </Box>
    );
}

function List({ items, numbered }: { items: Finding[]; numbered?: boolean }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {items.map((f, i) => (
                <Box key={f.code} sx={{ display: "flex", gap: 1.25, breakInside: "avoid" }}>
                    <Box sx={{ width: 24, height: 24, flex: "none", borderRadius: "50%", bgcolor: numbered ? C.deep : C.soft, color: numbered ? "#fff" : C.deep, fontSize: 12.5, fontWeight: 700, display: "grid", placeItems: "center" }}>
                        {numbered ? i + 1 : "•"}
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{f.title}</Typography>
                        <Typography sx={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{f.why}</Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function Sheet({ company, model, contact }: { company: CompanyRow; model: SiteReportModel; contact: string }) {
    const color = LEVEL_COLOR[model.level];
    const { speed } = model;
    const measured = speed.perf !== null;
    return (
        <Box sx={{ width: "100%", maxWidth: "210mm", mx: "auto", bgcolor: "#fff", color: C.ink, p: { xs: 3, sm: "14mm" }, boxShadow: "0 4px 30px rgba(0,0,0,.25)", borderRadius: "12px", "@media print": { boxShadow: "none", p: 0, maxWidth: "none", borderRadius: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: `2px solid ${C.brand}` }}>
                <Box component="img" src="/logo/logo.png" alt="قوسان" sx={{ height: 44, width: "auto" }} />
                <Box sx={{ flex: 1 }}>
                    <Typography component="h1" sx={{ m: 0, fontSize: 22, fontWeight: 700, color: C.deep, lineHeight: 1.4 }}>
                        تقرير سريع عن موقع {company.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.muted }}>
                        <bdi>{company.website || company.domain}</bdi> · تاريخ الفحص <bdi>{model.date}</bdi>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 3, flexWrap: "wrap" }}>
                <Ring score={model.score} color={color} />
                <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 700, color }}>{model.verdict}</Typography>
                    <Typography sx={{ fontSize: 13.5, color: C.muted, lineHeight: 1.8, mt: 0.5 }}>
                        فحصنا الصفحة الرئيسية لموقعكم كما يراها المريض من جواله ومحرك البحث. فيما يلي ما وجدناه وكيف يؤثر على حجوزاتكم، مرتبًا بحسب الأهمية.
                    </Typography>
                </Box>
            </Box>

            {measured && (
                <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
                    <Tile label="سرعة الجوال (Google)" value={`${speed.perf}`} tone={tone(speed.perf)} />
                    {speed.lcpSeconds !== null && <Tile label="ظهور المحتوى (ثانية)" value={`${speed.lcpSeconds}`} tone={speed.lcpSeconds <= 2.5 ? C.brand : speed.lcpSeconds <= 4 ? C.mid : C.bad} />}
                    {speed.seo !== null && <Tile label="الظهور في Google" value={`${speed.seo}`} tone={tone(speed.seo)} />}
                    {speed.a11y !== null && <Tile label="سهولة الاستخدام" value={`${speed.a11y}`} tone={tone(speed.a11y)} />}
                </Box>
            )}

            <Section title="نقاط مؤكدة تحتاج إلى إصلاح">
                {model.confirmed.length ? <List items={model.confirmed} numbered /> : <Typography sx={{ fontSize: 13.5, color: C.muted }}>لم نجد مشكلات مؤكدة في الفحص الآلي، وهذا جيد.</Typography>}
            </Section>

            {model.observations.length > 0 && (
                <Section title="ملاحظات للتحسين (تقدير آلي)">
                    <List items={model.observations} />
                </Section>
            )}

            {model.passed.length > 0 && (
                <Section title="ما يعمل جيدًا">
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}>
                        {model.passed.map((p) => (
                            <Typography key={p} sx={{ fontSize: 13, color: C.ink, breakInside: "avoid" }}>
                                <Box component="span" sx={{ color: C.brand, fontWeight: 700 }}>
                                    ✓
                                </Box>{" "}
                                {p}
                            </Typography>
                        ))}
                    </Box>
                </Section>
            )}

            <Section title="الخطوة التالية">
                <Typography sx={{ fontSize: 13.5, color: C.ink, lineHeight: 1.9 }}>
                    نقترح البدء بالنقاط المؤكدة أعلاه لأنها الأسرع أثرًا على حجوزاتكم، ثم إضافة حجز مباشر أو زر واتساب على الجوال، وإعادة القياس بعد التحسين للتأكد من النتيجة. يسعدنا مناقشة ذلك معكم دون أي التزام.
                </Typography>
            </Section>

            <Box sx={{ mt: 4, pt: 1.5, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", breakInside: "avoid" }}>
                <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.deep }}>استوديو قوسان</Typography>
                    <Typography sx={{ fontSize: 12.5, color: C.muted }} dir="ltr">
                        qawsan.website
                    </Typography>
                    {contact.trim() && <Typography sx={{ fontSize: 12.5, color: C.ink, mt: 0.25 }}>{contact.trim()}</Typography>}
                </Box>
                <Typography sx={{ fontSize: 11, color: C.muted, maxWidth: 360, lineHeight: 1.7 }}>
                    فحص آلي سريع للصفحة الرئيسية وقت إعداد التقرير، ولا يغني عن مراجعة شاملة. الدرجة مؤشر للمقارنة وليست حكمًا نهائيًا.
                </Typography>
            </Box>
        </Box>
    );
}

export default function SiteReport({ backend, id }: { backend: Backend; id: string }) {
    const [company, setCompany] = useState<CompanyRow | null | undefined>(undefined);
    const [error, setError] = useState("");
    const [contact, setContact] = useState(() => {
        try {
            return localStorage.getItem(CONTACT_KEY) ?? "";
        } catch {
            return "";
        }
    });

    useEffect(() => {
        backend.company(id).then(
            (c) => {
                setCompany(c);
                if (c) document.title = `تقرير موقع ${c.name}`;
            },
            (e: Error) => setError(e.message)
        );
    }, [backend, id]);

    const model = company ? buildReport(company) : null;
    const changeContact = (v: string) => {
        setContact(v);
        try {
            localStorage.setItem(CONTACT_KEY, v);
        } catch {
            /* storage unavailable */
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#1a1f1d", py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 }, "@media print": { bgcolor: "#fff", py: 0, px: 0 } }}>
            <GlobalStyles styles={{ "@page": { size: "A4", margin: "12mm" }, "@media print": { body: { background: "#fff !important", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }, ".no-print": { display: "none !important" } } }} />

            <Box className="no-print" sx={{ maxWidth: "210mm", mx: "auto", mb: 2, display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    label="سطر التواصل (يظهر أسفل التقرير)"
                    placeholder="مثال: واتساب 0500000000 · info@..."
                    value={contact}
                    onChange={(e) => changeContact(e.target.value)}
                    sx={{ flex: 1, minWidth: 240, "& .MuiInputBase-root": { bgcolor: "#fff" } }}
                    slotProps={{ htmlInput: { maxLength: 160 } }}
                />
                <Button variant="contained" startIcon={<PrintRoundedIcon />} onClick={() => window.print()} disabled={!model}>
                    طباعة / حفظ PDF
                </Button>
                <Button onClick={() => window.close()} sx={{ color: "#fff" }}>
                    إغلاق
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {company === undefined && !error && <LinearProgress />}
            {company === null && <Alert severity="warning">لم أجد هذه الجهة.</Alert>}
            {company && !model && <Alert severity="info">لا يوجد تقرير لهذه الجهة بعد: اضغط «فحص جودة الموقع» لها في الشركات أولًا (أو تعذّر الحكم على موقعها).</Alert>}
            {company && model && <Sheet company={company} model={model} contact={contact} />}
        </Box>
    );
}
