// "بحث عن جهات جديدة": Google Maps search card at the top of the discovery tab.

import { useEffect, useState } from "react";
import { Alert, Autocomplete, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { discoveryStatus, runDiscovery } from "../../lib/discovery/client";
import type { DiscoveryStatus, SearchOutcome } from "../../lib/discovery/client";
import { pagesFor } from "../../lib/discovery/places";
import type { Lang } from "../../lib/discovery/places";
import { CITIES, COUNTRIES } from "../../lib/prospects/options";
import { Select } from "./controls";

const TYPES = [
    "عيادات أسنان", "عيادات طبية", "صيدليات", "مطاعم", "مقاهي", "شركات عقارية", "صالونات تجميل", "محلات ملابس", "محامون",
    "مدارس خاصة", "متاجر إلكترونية", "شركات مقاولات", "وكالات تسويق", "معارض سيارات", "مصانع", "شركات توزيع", "فنادق",
];

/** Google's price for one Text Search Enterprise request after the monthly free usage (USD) */
const PRICE_PER_REQUEST = 0.035;

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
        <Typography component="label" sx={{ fontSize: 14, fontWeight: 700 }}>
            {label}
            {required && (
                <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, fontSize: 12, mx: 0.75 }}>
                    إلزامي <Box component="span" sx={{ color: "error.main" }}>*</Box>
                </Box>
            )}
        </Typography>
        {children}
    </Box>
);

export default function DiscoverCard({ demo, onDone }: { demo: boolean; onDone: (r: SearchOutcome) => void }) {
    const [type, setType] = useState("");
    const [keywords, setKeywords] = useState("");
    const [country, setCountry] = useState("Türkiye");
    const [city, setCity] = useState("");
    const [language, setLanguage] = useState<Lang>("ar");
    const [minRating, setMinRating] = useState<string | undefined>(undefined);
    const [max, setMax] = useState("20");
    const [status, setStatus] = useState<DiscoveryStatus | null>(null);
    const [statusError, setStatusError] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<SearchOutcome | null>(null);

    useEffect(() => {
        if (demo) return;
        let live = true;
        discoveryStatus().then(
            (s) => live && (setStatus(s), setStatusError("")),
            (e: Error) => live && setStatusError(e.message)
        );
        return () => {
            live = false;
        };
    }, [demo]);

    const pages = pagesFor(Number(max));
    const left = status ? status.limit - status.used : null;
    const cities = CITIES.filter((c) => !country || c.country === country).map((c) => c.name);
    const blocked = demo || !!(status && !status.configured) || (left !== null && left < pages);

    const submit = async () => {
        if (type.trim().length < 2 || blocked) return;
        setBusy(true);
        setError("");
        setResult(null);
        try {
            const r = await runDiscovery({ type, keywords, country, city, language, minRating: minRating ? Number(minRating) : null, max: Number(max) as 20 | 40 | 60 });
            setResult(r);
            setStatus((s) => (s ? { ...s, used: r.used, limit: r.limit } : s));
            onDone(r);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
            sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "20px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 2.5 }}
        >
            <Box>
                <Typography component="h2" sx={{ m: 0, fontSize: 19, fontWeight: 700 }}>
                    بحث عن جهات جديدة
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>يبحث في خرائط Google ويحفظ النتائج هنا للمراجعة. لا يُرسل أي رسالة بسبب البحث.</Typography>
            </Box>

            {demo && <Alert severity="info">البحث في Google غير متاح في الوضع التجريبي.</Alert>}
            {statusError && <Alert severity="warning">{statusError}</Alert>}
            {status && !status.configured && <Alert severity="warning">مفتاح Google Places غير مضاف بعد. أضف GOOGLE_PLACES_API_KEY في Vercel ثم أعد النشر.</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
                <Field label="نوع النشاط" required>
                    <Autocomplete
                        freeSolo
                        options={TYPES}
                        inputValue={type}
                        onInputChange={(_, v) => setType(v)}
                        renderInput={(p) => <TextField {...p} placeholder="مثال: عيادات أسنان، صيدليات، محلات ملابس" slotProps={{ ...p.slotProps, htmlInput: { ...p.slotProps.htmlInput, "aria-label": "نوع النشاط" } }} />}
                    />
                </Field>
                <Field label="كلمات إضافية (اختياري)">
                    <TextField value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="مثال: تقويم، جملة، عربي" slotProps={{ htmlInput: { "aria-label": "كلمات إضافية" } }} />
                </Field>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1.3fr 1.3fr 1.3fr 0.8fr 0.8fr" }, gap: 2 }}>
                <Field label="الدولة">
                    <Autocomplete
                        freeSolo
                        options={COUNTRIES.map((c) => c.value)}
                        inputValue={country}
                        onInputChange={(_, v) => setCountry(v)}
                        renderInput={(p) => <TextField {...p} slotProps={{ ...p.slotProps, htmlInput: { ...p.slotProps.htmlInput, "aria-label": "الدولة" } }} />}
                    />
                </Field>
                <Field label="المدينة أو المنطقة">
                    <Autocomplete
                        freeSolo
                        options={cities}
                        inputValue={city}
                        onInputChange={(_, v) => setCity(v)}
                        renderInput={(p) => <TextField {...p} placeholder="مثال: إسطنبول" slotProps={{ ...p.slotProps, htmlInput: { ...p.slotProps.htmlInput, "aria-label": "المدينة" } }} />}
                    />
                </Field>
                <Field label="لغة النتائج">
                    <Select
                        label=""
                        value={language}
                        onChange={(v) => setLanguage((v ?? "ar") as Lang)}
                        options={[
                            { value: "ar", label: "العربية" },
                            { value: "en", label: "English" },
                            { value: "tr", label: "Türkçe" },
                        ]}
                        none={null}
                    />
                </Field>
                <Field label="أقل تقييم">
                    <Select
                        label=""
                        value={minRating}
                        onChange={setMinRating}
                        options={[
                            { value: "3.5", label: "3.5 ★" },
                            { value: "4", label: "4 ★" },
                            { value: "4.5", label: "4.5 ★" },
                        ]}
                        none="الكل"
                    />
                </Field>
                <Field label="عدد النتائج">
                    <Select
                        label=""
                        value={max}
                        onChange={(v) => setMax(v ?? "20")}
                        options={[
                            { value: "20", label: "حتى 20" },
                            { value: "40", label: "حتى 40" },
                            { value: "60", label: "حتى 60" },
                        ]}
                        none={null}
                    />
                </Field>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={busy || blocked || type.trim().length < 2}
                    startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <SearchRoundedIcon />}
                    sx={{ minWidth: 120 }}
                >
                    ابحث
                </Button>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", flex: 1, minWidth: 240, lineHeight: 1.8 }}>
                    يستهلك البحث حتى <bdi>{pages}</bdi> {pages === 1 ? "طلب" : "طلبات"} من Google (كل طلب حتى 20 نتيجة)، بتكلفة تقديرية تقارب{" "}
                    <bdi>${(pages * PRICE_PER_REQUEST).toFixed(3)}</bdi> بعد الحصة المجانية. التسعير الفعلي من Google وقد يختلف.
                    {status && (
                        <>
                            {" "}استُعمل <bdi>{status.used}</bdi> من <bdi>{status.limit}</bdi> طلبًا هذا الشهر.
                        </>
                    )}
                </Typography>
            </Box>

            {left !== null && left < pages && <Alert severity="error">لا يكفي الرصيد الشهري المتبقي ({left}) لهذا البحث. قلّل عدد النتائج.</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            {result && (
                <Alert severity="success">
                    وجدنا {result.found} نتيجة: {result.inserted} جديدة و{result.updated} محدّثة. تظهر الآن في الجدول أدناه.
                    {result.warning && <Box sx={{ mt: 0.5 }}>{result.warning}</Box>}
                </Alert>
            )}
        </Box>
    );
}
