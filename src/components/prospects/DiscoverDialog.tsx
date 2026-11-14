// "Discover from Google Maps": search card that saves results as companies to review.

import { useEffect, useState } from "react";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";

import { discoveryStatus, runDiscovery } from "../../lib/discovery/client";
import type { DiscoveryStatus, SearchOutcome } from "../../lib/discovery/client";
import { cleanCities, estimateRequests, mergeOutcomes, runCities, MAX_CITIES } from "../../lib/discovery/multicity";
import { pagesFor } from "../../lib/discovery/places";
import type { Lang } from "../../lib/discovery/places";
import { CITIES, COUNTRIES } from "../../lib/prospects/options";
import { Select } from "./controls";

const TYPES = [
    "عيادات أسنان", "عيادات طبية", "مطاعم", "مقاهي", "شركات عقارية", "صالونات تجميل", "محامون", "مدارس خاصة",
    "متاجر إلكترونية", "شركات مقاولات", "وكالات تسويق", "معارض سيارات", "مصانع", "شركات توزيع", "فنادق",
];

export default function DiscoverDialog({ open, demo, onClose, onDone }: { open: boolean; demo: boolean; onClose: () => void; onDone: (r: SearchOutcome) => void }) {
    const [type, setType] = useState("");
    const [keywords, setKeywords] = useState("");
    const [country, setCountry] = useState("Saudi Arabia");
    // one or more cities: each is searched on its own (see lib/discovery/multicity.ts)
    const [selCities, setSelCities] = useState<string[]>(["Riyadh"]);
    const [progress, setProgress] = useState("");
    const [language, setLanguage] = useState<Lang>("ar");
    const [minRating, setMinRating] = useState<string | undefined>(undefined);
    const [max, setMax] = useState<20 | 40 | 60>(20);
    const [status, setStatus] = useState<DiscoveryStatus | null>(null);
    const [statusError, setStatusError] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<SearchOutcome | null>(null);

    useEffect(() => {
        if (!open || demo) return;
        let live = true;
        discoveryStatus().then(
            (s) => live && (setStatus(s), setStatusError("")),
            (e: Error) => live && setStatusError(e.message)
        );
        return () => {
            live = false;
        };
    }, [open, demo]);

    const cityList = cleanCities(selCities);
    const pages = estimateRequests(cityList.length, max);
    const left = status ? status.limit - status.used : null;
    const cities = CITIES.filter((c) => !country || c.country === country).map((c) => c.name);

    const submit = async () => {
        setBusy(true);
        setError("");
        setResult(null);
        try {
            const base = { type, keywords, country, language, minRating: minRating ? Number(minRating) : null, max };
            // no city picked still means one search ("in <country>")
            const targets = cityList.length ? cityList : [""];
            const run = await runCities(
                targets,
                (city) => runDiscovery({ ...base, city }),
                (done, current) => setProgress(targets.length > 1 ? `جارٍ البحث في ${current || country} (${done + 1} من ${targets.length})…` : "")
            );
            if (run.outcomes.length) {
                const r = run.outcomes.length === 1 && !run.failed ? run.outcomes[0] : mergeOutcomes(run.outcomes);
                setResult(r);
                setStatus((s) => (s ? { ...s, used: r.used, limit: r.limit } : s));
                onDone(r);
            }
            if (run.failed) setError(`توقف البحث عند «${run.failed.city}»: ${run.failed.message}${run.outcomes.length ? ` — حُفظت نتائج المدن السابقة (${run.outcomes.length}).` : ""}`);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
            setProgress("");
        }
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TravelExploreRoundedIcon color="primary" />
                اكتشاف عملاء من Google Maps
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
                {demo && <Alert severity="info">البحث في Google غير متاح في الوضع التجريبي.</Alert>}
                {statusError && <Alert severity="warning">{statusError}</Alert>}
                {status && !status.configured && (
                    <Alert severity="warning">مفتاح Google Places غير مضاف بعد. أضف GOOGLE_PLACES_API_KEY في Vercel ثم أعد النشر.</Alert>
                )}

                <Autocomplete
                    freeSolo
                    options={TYPES}
                    inputValue={type}
                    onInputChange={(_, v) => setType(v)}
                    renderInput={(p) => <TextField {...p} label="نوع النشاط *" placeholder="مثل: عيادات أسنان" autoFocus />}
                />
                <TextField label="كلمات إضافية (اختياري)" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="مثل: تقويم، زراعة" />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <Autocomplete
                        freeSolo
                        options={COUNTRIES.map((c) => c.value)}
                        inputValue={country}
                        onInputChange={(_, v) => setCountry(v)}
                        renderInput={(p) => <TextField {...p} label="الدولة" />}
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        filterSelectedOptions
                        options={cities}
                        value={selCities}
                        onChange={(_, v) => setSelCities(v.slice(0, MAX_CITIES))}
                        renderInput={(p) => <TextField {...p} label={`المدن (حتى ${MAX_CITIES})`} placeholder="اختر مدينة أو أكثر" />}
                        sx={{ gridColumn: { sm: "1 / -1" } }}
                    />
                    <Select
                        label="لغة النتائج"
                        value={language}
                        onChange={(v) => setLanguage((v ?? "ar") as Lang)}
                        options={[
                            { value: "ar", label: "العربية" },
                            { value: "en", label: "English" },
                            { value: "tr", label: "Türkçe" },
                        ]}
                        none={null}
                    />
                    <Select
                        label="أقل تقييم"
                        value={minRating}
                        onChange={setMinRating}
                        options={[
                            { value: "3.5", label: "3.5 ★ فأكثر" },
                            { value: "4", label: "4 ★ فأكثر" },
                            { value: "4.5", label: "4.5 ★ فأكثر" },
                        ]}
                        none="أي تقييم"
                    />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>عدد النتائج</Typography>
                    <ToggleButtonGroup exclusive size="small" value={max} onChange={(_, v) => v && setMax(v)}>
                        {[20, 40, 60].map((n) => (
                            <ToggleButton key={n} value={n} sx={{ px: 2.5 }}>
                                {n}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.8 }}>
                    سيستهلك هذا البحث حتى <b>{pages}</b> {pages === 1 ? "طلب" : "طلبات"} من Google{cityList.length > 1 && <> ({cityList.length} مدن × {pagesFor(max)})</>}
                    {status && (
                        <>
                            {" "}· استُخدم <b dir="ltr">{status.used}</b> من <b dir="ltr">{status.limit}</b> طلبًا هذا الشهر
                        </>
                    )}
                    . الكلفة التقديرية حوالي <bdi>${(pages * 0.035).toFixed(3)}</bdi> بعد الحصة المجانية الشهرية، والتسعير الفعلي من Google وقد يختلف. النتائج تُحفظ كجهات للمراجعة، ولا يُرسل شيء لأحد.
                </Typography>
                {left !== null && left < pages && <Alert severity="error">لا يكفي الرصيد الشهري المتبقي ({left}) لهذا البحث. قلّل عدد النتائج.</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                {result && (
                    <Alert severity="success">
                        وجدنا {result.found} نتيجة{result.cities && result.cities > 1 ? ` في ${result.cities} مدن` : ""}: {result.inserted} جديدة و{result.updated} محدّثة ({result.requests} طلب).
                        {result.warning && <Box sx={{ mt: 0.5 }}>{result.warning}</Box>}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    {result ? "إغلاق" : "إلغاء"}
                </Button>
                <Button
                    variant="contained"
                    onClick={submit}
                    disabled={busy || demo || type.trim().length < 2 || !!(status && !status.configured) || (left !== null && left < pages)}
                    startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <TravelExploreRoundedIcon />}
                >
                    {busy && progress ? progress : cityList.length > 1 ? `ابحث في ${cityList.length} مدن` : "ابحث"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
