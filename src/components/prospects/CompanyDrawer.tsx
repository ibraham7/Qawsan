// Side panel with everything known about one company.

import { Box, Chip, Divider, Drawer, IconButton, Link, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import type { CompanyRow } from "../../lib/prospects/types";

const ENRICH: Record<string, string> = {
    done: "تم الإثراء",
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

export default function CompanyDrawer({ company, onClose }: { company: CompanyRow | null; onClose: () => void }) {
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
                    <Row label="واتساب">{c.whatsapp ? <Link href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} {...ext} dir="ltr">{c.whatsapp}</Link> : "—"}</Row>
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
