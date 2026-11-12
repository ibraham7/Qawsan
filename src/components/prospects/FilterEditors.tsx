// The editor shown inside each filter section of the sidebar.

import { Box, FormControlLabel, Switch, TextField, Typography, Slider } from "@mui/material";

import {
    ACCOUNT_STAGES,
    CITY_OPTS,
    CONTACT_STAGES,
    CONTACT_DATA,
    COUNTRIES,
    DEPARTMENTS,
    EMPTY_IE,
    EMAIL_STATUS,
    EMPLOYEE_BANDS,
    EXCLUSIONS,
    FUNDING_TYPES,
    GROWTH_PERIODS,
    INDUSTRIES,
    INTENT_LEVELS,
    INTENT_TOPICS,
    JOB_CHANGE,
    LANGUAGES,
    PHONE_STATUS,
    REGIONS,
    REVENUE_BANDS,
    SCORE_GRADE_OPTS,
    SENIORITY,
    STATUSES,
    SEQUENCE_MODES,
    SIGNALS,
    SINCE,
    TECHNOLOGIES,
    TITLE_SYNONYMS,
    VISIT_PERIODS,
} from "../../lib/prospects/options";
import type { Opt } from "../../lib/prospects/options";
import type { Meta } from "../../lib/prospects/data";
import type { FilterKey, Filters, Location, Tab } from "../../lib/prospects/types";
import { CsvButton, IncExcInput, Multi, RangeInput, Select, Toggles } from "./controls";

const keys = (o: Record<string, unknown>): Opt[] => Object.keys(o).map((k) => ({ value: k, label: k }));
const TITLE_OPTS: Opt[] = [...new Set(TITLE_SYNONYMS.flat().filter((t) => /^[\x20-\x7e]+$/.test(t)))].map((t) => ({ value: t, label: t }));

const Hint = ({ children }: { children: string }) => (
    <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.6 }}>{children}</Typography>
);

function LocationEditor({ value, onChange, radius = true }: { value: Location | undefined; onChange: (v: Location) => void; radius?: boolean }) {
    const v = value ?? {};
    return (
        <>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>الدولة</Typography>
            <IncExcInput value={v.countries} onChange={(countries) => onChange({ ...v, countries })} options={COUNTRIES} free />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>المنطقة</Typography>
            <IncExcInput value={v.regions} onChange={(regions) => onChange({ ...v, regions })} options={REGIONS} free />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>المدينة</Typography>
            <IncExcInput value={v.cities} onChange={(cities) => onChange({ ...v, cities })} options={CITY_OPTS} free />
            {radius && (
                <>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>نطاق حول مدينة</Typography>
                    <Select
                        label="المدينة"
                        value={v.radius?.city}
                        onChange={(city) => onChange({ ...v, radius: city ? { city, km: v.radius?.km || 50 } : null })}
                        options={CITY_OPTS}
                        none="بدون نطاق"
                    />
                    {v.radius?.city && (
                        <Box sx={{ px: 1 }}>
                            <Slider
                                value={v.radius.km}
                                min={5}
                                max={300}
                                step={5}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(x) => `${x} كم`}
                                onChange={(_, km) => onChange({ ...v, radius: { city: v.radius!.city, km: km as number } })}
                                aria-label="نصف القطر بالكيلومتر"
                            />
                            <Hint>{`ضمن ${v.radius.km} كم تقريبًا حول ${v.radius.city} (حسب الإحداثيات المحفوظة)`}</Hint>
                        </Box>
                    )}
                </>
            )}
        </>
    );
}

export function FilterEditor({
    k,
    f,
    tab,
    meta,
    set,
}: {
    k: FilterKey;
    f: Filters;
    tab: Tab;
    meta: Meta;
    set: <K extends FilterKey>(key: K, v: Filters[K] | undefined) => void;
}) {
    switch (k) {
        case "titles":
            return (
                <>
                    <IncExcInput value={f.titles} onChange={(x) => set("titles", { ...f.titles, ...x })} options={TITLE_OPTS} free noun="مثل: Marketing Manager" />
                    <FormControlLabel
                        control={<Switch size="small" checked={!!f.titles?.similar} onChange={(e) => set("titles", { ...(f.titles ?? EMPTY_IE), similar: e.target.checked })} />}
                        label={<Typography sx={{ fontSize: 13 }}>تضمين المسميات المشابهة</Typography>}
                    />
                </>
            );
        case "seniority":
            return <IncExcInput value={f.seniority} onChange={(x) => set("seniority", x)} options={SENIORITY} />;
        case "departments":
            return <IncExcInput value={f.departments} onChange={(x) => set("departments", x)} options={DEPARTMENTS} />;
        case "personLocation":
            return <LocationEditor value={f.personLocation} onChange={(x) => set("personLocation", x)} />;
        case "hqLocation":
            return (
                <>
                    <Hint>مقر الشركة، مستقل عن موقع الشخص.</Hint>
                    <LocationEditor value={f.hqLocation} onChange={(x) => set("hqLocation", x)} />
                </>
            );
        case "name":
            return (
                <Multi
                    label="اسم الشخص"
                    value={f.name ? [f.name] : []}
                    onChange={(v) => set("name", v[v.length - 1])}
                    free
                    placeholder="اكتب الاسم واضغط Enter"
                />
            );
        case "emailStatus":
            return <Toggles options={EMAIL_STATUS} value={f.emailStatus ?? []} onChange={(v) => set("emailStatus", v)} />;
        case "phoneStatus":
            return <Toggles options={PHONE_STATUS} value={f.phoneStatus ?? []} onChange={(v) => set("phoneStatus", v)} />;
        case "roleTenure":
            return (
                <>
                    <RangeInput value={f.roleTenure} onChange={(v) => set("roleTenure", v)} unit="شهر" />
                    <Hint>بالأشهر: 12 = سنة، 24 = سنتان.</Hint>
                </>
            );
        case "experience":
            return <RangeInput value={f.experience} onChange={(v) => set("experience", v)} unit="سنة" />;
        case "jobChange":
            return <Select label="غيّر وظيفته" value={f.jobChange} onChange={(v) => set("jobChange", v)} options={JOB_CHANGE} none="أي وقت" />;
        case "languages":
            return <Multi label="اللغات" value={f.languages ?? []} onChange={(v) => set("languages", v)} options={LANGUAGES} free />;

        case "q":
            return (
                <TextField
                    size="small"
                    fullWidth
                    placeholder={tab === "people" ? "اسم، مسمى، إيميل" : "اسم، عنوان، رقم"}
                    value={f.q ?? ""}
                    onChange={(e) => set("q", e.target.value || undefined)}
                />
            );
        case "status":
            return <IncExcInput value={f.status} onChange={(x) => set("status", x)} options={STATUSES} />;
        case "searches":
            return meta.searches.length ? (
                <Multi label="عمليات البحث" value={f.searches ?? []} onChange={(v) => set("searches", v)} options={meta.searches.map((s) => ({ value: s.id, label: s.name }))} />
            ) : (
                <Hint>لا توجد عمليات بحث في Google بعد.</Hint>
            );
        case "contactData":
            return (
                <>
                    <Toggles options={CONTACT_DATA} value={f.contactData ?? []} onChange={(v) => set("contactData", v)} />
                    <Hint>تظهر الجهات التي تملك كل ما اخترته. الإيميل والواتساب يأتيان من زر «إثراء».</Hint>
                </>
            );
        case "googleRating":
            return <RangeInput value={f.googleRating} onChange={(v) => set("googleRating", v)} minLabel="من" maxLabel="إلى" unit="★ (0-5)" />;
        case "company":
            return (
                <>
                    <IncExcInput value={f.company} onChange={(x) => set("company", x)} free noun="اسم الشركة أو الدومين" />
                    <CsvButton onValues={(vals) => set("company", { ...(f.company ?? EMPTY_IE), inc: [...new Set([...(f.company?.inc ?? []), ...vals])] })} label="رفع قائمة CSV للتضمين" />
                    <CsvButton onValues={(vals) => set("company", { ...(f.company ?? EMPTY_IE), exc: [...new Set([...(f.company?.exc ?? []), ...vals])] })} label="رفع قائمة CSV للاستثناء" />
                    <Hint>العمود الأول من الملف: اسم الشركة أو الدومين (حتى 500 سطر).</Hint>
                </>
            );
        case "employees":
            return (
                <>
                    <Toggles options={keys(EMPLOYEE_BANDS)} value={f.employees?.presets ?? []} onChange={(presets) => set("employees", { ...f.employees, presets })} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>نطاق مخصص</Typography>
                    <RangeInput value={f.employees} onChange={(r) => set("employees", { presets: f.employees?.presets ?? [], ...r })} unit="موظف" />
                </>
            );
        case "industry":
            return <IncExcInput value={f.industry} onChange={(x) => set("industry", x)} options={INDUSTRIES} free />;
        case "keywords":
            return (
                <>
                    <IncExcInput value={f.keywords} onChange={(x) => set("keywords", x)} free noun="مثل: dental, online store" />
                    <Hint>تُبحث في كلمات الشركة المفتاحية وفي وصفها.</Hint>
                </>
            );
        case "codes":
            return (
                <>
                    <Multi label="SIC" value={f.codes?.sic ?? []} onChange={(sic) => set("codes", { naics: f.codes?.naics ?? [], sic })} free placeholder="مثل: 8021" />
                    <Multi label="NAICS" value={f.codes?.naics ?? []} onChange={(naics) => set("codes", { sic: f.codes?.sic ?? [], naics })} free placeholder="مثل: 621210" />
                </>
            );
        case "technologies":
            return <IncExcInput value={f.technologies} onChange={(x) => set("technologies", x)} options={TECHNOLOGIES} free />;
        case "revenue":
            return (
                <>
                    <Toggles options={keys(REVENUE_BANDS)} value={f.revenue?.presets ?? []} onChange={(presets) => set("revenue", { ...f.revenue, presets })} />
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>نطاق مخصص (بالدولار)</Typography>
                    <RangeInput value={f.revenue} onChange={(r) => set("revenue", { presets: f.revenue?.presets ?? [], ...r })} unit="USD" />
                </>
            );
        case "funding": {
            const fu = f.funding ?? { types: [] };
            return (
                <>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>إجمالي التمويل (بالدولار)</Typography>
                    <RangeInput value={fu.total} onChange={(total) => set("funding", { ...fu, total })} unit="USD" />
                    <Multi label="نوع آخر جولة" value={fu.types} onChange={(types) => set("funding", { ...fu, types })} options={FUNDING_TYPES} />
                    <Select label="تاريخ آخر جولة" value={fu.since} onChange={(since) => set("funding", { ...fu, since })} options={SINCE} none="أي وقت" />
                </>
            );
        }
        case "jobPostings": {
            const j = f.jobPostings ?? { titles: [], locations: [] };
            return (
                <>
                    <FormControlLabel
                        control={<Switch size="small" checked={!!j.active} onChange={(e) => set("jobPostings", { ...j, active: e.target.checked })} />}
                        label={<Typography sx={{ fontSize: 13 }}>لديها وظائف شاغرة حاليًا</Typography>}
                    />
                    <Multi label="مسمى الوظيفة الشاغرة" value={j.titles} onChange={(titles) => set("jobPostings", { ...j, titles })} free />
                    <Multi label="موقع الوظيفة" value={j.locations} onChange={(locations) => set("jobPostings", { ...j, locations })} options={CITY_OPTS} free />
                    <Select label="تاريخ النشر" value={j.since} onChange={(since) => set("jobPostings", { ...j, since })} options={SINCE} none="أي وقت" />
                </>
            );
        }
        case "headcountGrowth": {
            const g = f.headcountGrowth ?? { period: "12m" as const };
            return (
                <>
                    <Select label="خلال" value={g.period} onChange={(p) => set("headcountGrowth", { ...g, period: (p ?? "12m") as "6m" | "12m" | "24m" })} options={GROWTH_PERIODS} none={null} />
                    <RangeInput value={g} onChange={(r) => set("headcountGrowth", { period: g.period, ...r })} unit="%" minLabel="من %" maxLabel="إلى %" />
                    <Hint>النمو الإجمالي لعدد الموظفين. القيم السالبة تعني انكماشًا.</Hint>
                </>
            );
        }
        case "founded":
            return <RangeInput value={f.founded} onChange={(v) => set("founded", v)} minLabel="من سنة" maxLabel="إلى سنة" />;
        case "retail":
            return <RangeInput value={f.retail} onChange={(v) => set("retail", v)} unit="فرع" />;
        case "lookalike":
            return (
                <>
                    <Multi label="دومين شركة مرجعية" value={f.lookalike ? [f.lookalike] : []} onChange={(v) => set("lookalike", v[v.length - 1])} free placeholder="مثل: example.com" />
                    <Hint>نجلب شركات من نفس القطاع وبحجم قريب (نصف إلى ضعف عدد موظفيها). يجب أن تكون الشركة المرجعية محفوظة عندنا.</Hint>
                </>
            );

        case "intent": {
            const i = f.intent ?? { topics: [], levels: [] };
            return (
                <>
                    <Multi label="مواضيع تبحث عنها الشركة" value={i.topics} onChange={(topics) => set("intent", { ...i, topics })} options={INTENT_TOPICS} free />
                    <Toggles options={INTENT_LEVELS} value={i.levels} onChange={(levels) => set("intent", { ...i, levels })} />
                </>
            );
        }
        case "signals": {
            const s = f.signals ?? { types: [] };
            return (
                <>
                    <Toggles options={SIGNALS} value={s.types} onChange={(types) => set("signals", { ...s, types })} />
                    <Select label="خلال" value={s.since} onChange={(since) => set("signals", { ...s, since })} options={SINCE} none="أي وقت" />
                </>
            );
        }
        case "visitors":
            return (
                <>
                    <Select label="زارت موقعي خلال" value={f.visitors} onChange={(v) => set("visitors", v)} options={VISIT_PERIODS} none="بدون" />
                    <Hint>يعمل فقط للشركات التي سُجّل لها تاريخ زيارة.</Hint>
                </>
            );
        case "leadScore": {
            const s = f.leadScore ?? { grades: [] };
            return (
                <>
                    <Toggles options={SCORE_GRADE_OPTS} value={s.grades} onChange={(grades) => set("leadScore", { ...s, grades })} />
                    <RangeInput value={s} onChange={(r) => set("leadScore", { grades: s.grades, ...r })} minLabel="من 0" maxLabel="إلى 100" />
                </>
            );
        }

        case "lists": {
            const opts = meta.lists.filter((l) => l.kind === tab).map((l) => ({ value: l.id, label: l.name }));
            return opts.length ? <IncExcInput value={f.lists} onChange={(x) => set("lists", x)} options={opts} /> : <Hint>لا توجد قوائم محفوظة بعد.</Hint>;
        }
        case "stage":
            return <IncExcInput value={f.stage} onChange={(x) => set("stage", x)} options={tab === "people" ? CONTACT_STAGES : ACCOUNT_STAGES} />;
        case "owner":
            return meta.owners.length ? (
                <Multi label="عضو الفريق" value={f.owner ?? []} onChange={(v) => set("owner", v)} options={meta.owners.map((o) => ({ value: o, label: o }))} />
            ) : (
                <Hint>لم يُسند أي سجل لعضو فريق بعد.</Hint>
            );
        case "sequences": {
            const s = f.sequences ?? { mode: "in_any" as const, ids: [] };
            const needsIds = s.mode === "in" || s.mode === "not_in";
            return (
                <>
                    <Select
                        label="الحالة"
                        value={f.sequences?.mode}
                        onChange={(mode) => set("sequences", mode ? { mode: mode as typeof s.mode, ids: s.ids } : undefined)}
                        options={SEQUENCE_MODES}
                        none="بدون"
                    />
                    {needsIds && (
                        <Multi label="الحملات" value={s.ids} onChange={(ids) => set("sequences", { ...s, ids })} options={meta.sequences.map((q) => ({ value: q.id, label: q.name }))} />
                    )}
                </>
            );
        }
        case "exclusions":
            return <Toggles options={EXCLUSIONS} value={f.exclusions ?? []} onChange={(v) => set("exclusions", v)} />;
    }
}
