// Side panel with everything known about one company.

import { useState } from "react";
import { Alert, Box, Button, Chip, Divider, Drawer, IconButton, Link, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { ISSUE_LABEL, bucket } from "../../lib/discovery/siteaudit";
import { reportAvailable } from "../../lib/prospects/sitereport";
import { cleanWhatsapp } from "../../lib/prospects/contactedit";
import type { IssueCode } from "../../lib/discovery/siteaudit";
import type { CompanyRow } from "../../lib/prospects/types";

const ENRICH: Record<string, string> = {
    done: "تم الإثراء ووجدنا إيميل أو واتساب",
    socials_only: "وجدنا حسابات سوشيال فقط (بلا إيميل أو واتساب)",
    nothing_found: "لم نجد بيانات في الموقع",
    no_website: "لا يوجد موقع",
    failed: "تعذّر فتح الموقع",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 1.5, py: 1, alignItems: "start" }}>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{label}</Typography>
            <Box sx={{ fontSize: 14, minWidth: 0, overflowWrap: "anywhere" }}>{children}</Box>
        </Box>
    );
}

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

/** enter or fix the WhatsApp number by hand (the campaigns only reach companies that have one) */
function WhatsappEditor({ company, onSave }: { company: CompanyRow; onSave: (number: string) => Promise<void> }) {
    const [value, setValue] = useState(company.whatsapp);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const result = cleanWhatsapp(value, company.hq_country);
    const changed = result.ok && result.number !== company.whatsapp;
    const save = async () => {
        if (!result.ok) return;
        setBusy(true);
        setError("");
        try {
            await onSave(result.number);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };
    return (
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField
                    size="small"
                    placeholder="اكتب رقم الواتساب (05… أو +966…)"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    error={!result.ok && value.trim() !== ""}
                    slotProps={{ htmlInput: { dir: "ltr", maxLength: 30 } }}
                    sx={{ flex: 1 }}
                />
                <Button size="small" variant="contained" onClick={save} disabled={busy || !changed}>
                    حفظ
                </Button>
            </Box>
            {value.trim() !== "" && !result.ok && <Typography sx={{ fontSize: 12.5, color: "error.main" }}>{result.error}</Typography>}
            {result.ok && result.number && result.number !== value.trim() && <Typography sx={{ fontSize: 12.5, color: "text.secondary" }} dir="ltr">→ {result.number}</Typography>}
            {result.ok && result.warning && <Alert severity="warning" sx={{ py: 0 }}>{result.warning}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    );
}

export default function CompanyDrawer({ company, onClose, onSetWhatsapp }: { company: CompanyRow | null; onClose: () => void; onSetWhatsapp?: (c: CompanyRow, number: string) => Promise<void> }) {
    const theme = useTheme();
    const c = company;
    return (
        <Drawer anchor={theme.direction === "rtl" ? "left" : "right"} open={!!c} onClose={onClose} slotProps={{ paper: { sx: { width: "min(94vw, 440px)" } } }}>
            {c && (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 700 }}>
                                {c.name}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                                <bdi>{[c.industry, c.hq_city, c.hq_country].filter(Boolean).join(" · ")}</bdi>
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} aria-label="إغلاق">
                            <CloseRoundedIcon />
                        </IconButton>
                    </Box>
                    {c.rating !== null && (
                        <Typography sx={{ mt: 1, fontSize: 14 }}>
                            <Box component="span" sx={{ color: "warning.main" }}>★</Box> <bdi>{c.rating}</bdi>
                            {c.rating_count !== null && <Box component="span" sx={{ color: "text.secondary" }}> (<bdi>{c.rating_count}</bdi> مراجعة)</Box>}
                        </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />

                    <Row label="العنوان">{c.address || "—"}</Row>
                    <Row label="خرائط Google">{c.google_maps_url ? <Link href={c.google_maps_url} {...ext}>فتح في الخرائط</Link> : "—"}</Row>
                    <Row label="الموقع">{c.website ? <Link href={c.website} {...ext} dir="ltr">{c.domain || c.website}</Link> : "—"}</Row>
                    <Row label="الهاتف">{c.phone ? <Link href={`tel:${c.phone.replace(/\s/g, "")}`} dir="ltr">{c.phone}</Link> : "—"}</Row>
                    <Row label="الإيميلات">
                        {c.emails.length
                            ? c.emails.map((e) => (
                                  <Box key={e}>
                                      <Link href={`mailto:${e}`} dir="ltr">{e}</Link>
                                  </Box>
                              ))
                            : "—"}
                    </Row>
                    <Row label="واتساب">
                        {c.whatsapp ? <Link href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} {...ext} dir="ltr">{c.whatsapp}</Link> : "—"}
                        {onSetWhatsapp && <WhatsappEditor key={`${c.id}:${c.whatsapp}`} company={c} onSave={(n) => onSetWhatsapp(c, n)} />}
                    </Row>
                    <Row label="السوشيال">
                        {Object.keys(c.socials).length ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                {Object.entries(c.socials).map(([k, url]) => (
                                    <Chip key={k} size="small" label={k} component="a" href={url} clickable {...ext} variant="outlined" />
                                ))}
                            </Box>
                        ) : (
                            "—"
                        )}
                    </Row>
                    <Row label="جودة الموقع">
                        {!c.site_checked_at ? (
                            c.website ? "لم يُفحص بعد (حدّدها في الجدول واضغط «فحص جودة الموقع»)" : "لا يوجد موقع"
                        ) : (
                            <>
                                <Chip
                                    size="small"
                                    label={
                                        c.site_score === null
                                            ? "تعذّر الحكم عليه"
                                            : `${{ weak: "ضعيف", medium: "متوسط", good: "جيد", unreadable: "" }[bucket(c.site_score)]} · ${c.site_score}/100`
                                    }
                                    color={bucket(c.site_score) === "weak" ? "error" : bucket(c.site_score) === "medium" ? "warning" : bucket(c.site_score) === "good" ? "success" : "default"}
                                />
                                {c.site_perf !== null && (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                                        <Chip size="small" variant="outlined" color={c.site_perf < 50 ? "error" : c.site_perf < 90 ? "warning" : "success"} label={`سرعة الجوال ${c.site_perf}/100`} />
                                        {c.site_lcp_ms !== null && <Chip size="small" variant="outlined" label={`ظهور المحتوى ${(c.site_lcp_ms / 1000).toFixed(1)} ث`} />}
                                        {c.site_seo !== null && <Chip size="small" variant="outlined" label={`SEO ${c.site_seo}`} />}
                                        {c.site_a11y !== null && <Chip size="small" variant="outlined" label={`إمكانية الوصول ${c.site_a11y}`} />}
                                    </Box>
                                )}
                                {c.site_issues.length > 0 && (
                                    <Box component="ul" sx={{ m: 0, mt: 0.75, ps: 2.5, fontSize: 13 }}>
                                        {(c.site_issues as IssueCode[]).map((i) => (
                                            <li key={i}>{ISSUE_LABEL[i] ?? i}</li>
                                        ))}
                                    </Box>
                                )}
                                <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }} dir="ltr">
                                    {new Date(c.site_checked_at).toLocaleString("en-GB")}
                                </Typography>
                                {reportAvailable(c) && (
                                    <Button size="small" variant="outlined" component="a" href={`/prospects?report=${c.id}${import.meta.env.DEV && window.location.search.includes("demo") ? "&demo" : ""}`} {...ext} sx={{ mt: 1 }}>
                                        تقرير الموقع للعيادة (PDF)
                                    </Button>
                                )}
                            </>
                        )}
                    </Row>
                    <Row label="الإثراء">
                        {c.enrich_status ? ENRICH[c.enrich_status] ?? c.enrich_status : "لم يتم بعد"}
                        {c.enriched_at && <Typography sx={{ fontSize: 12, color: "text.secondary" }} dir="ltr">{new Date(c.enriched_at).toLocaleString("en-GB")}</Typography>}
                    </Row>
                    {c.place_types.length > 0 && (
                        <Row label="تصنيف Google">
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {c.place_types.map((t) => (
                                    <Chip key={t} size="small" label={t} sx={{ height: 22, fontSize: 11 }} />
                                ))}
                            </Box>
                        </Row>
                    )}
                    <Row label="المصدر"><bdi>{c.source}</bdi></Row>
                </Box>
            )}
        </Drawer>
    );
}
