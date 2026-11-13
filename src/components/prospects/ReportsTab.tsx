// "التقارير": how the campaigns are doing, and who to follow up with.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    LinearProgress,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import type { Campaign } from "../../lib/prospects/campaigns";
import type { Backend } from "../../lib/prospects/data";
import { statusOf } from "../../lib/prospects/options";
import { pct, sentOf, totals } from "../../lib/prospects/reports";
import type { CompanyRow } from "../../lib/prospects/types";

type Channel = "all" | Campaign["channel"];

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
    <Box sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
        <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.3 }} dir="ltr">
            {value}
        </Typography>
        {hint && <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{hint}</Typography>}
    </Box>
);

const CHANNEL_ICON = { whatsapp: <WhatsAppIcon sx={{ fontSize: 18 }} />, email: <EmailRoundedIcon sx={{ fontSize: 18 }} /> };

export default function ReportsTab({ backend, onStatusChanged }: { backend: Backend; onStatusChanged: () => void }) {
    const [list, setList] = useState<Campaign[] | null>(null);
    const [leads, setLeads] = useState<CompanyRow[] | null>(null);
    const [channel, setChannel] = useState<Channel>("all");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(() => {
        backend.campaigns().then(setList, (e: Error) => setError(e.message));
        // companies that answered and are waiting for a decision, newest first
        backend.search("companies", { status: { inc: ["replied", "interested"], exc: [] } }, 0, 100, "newest").then(
            (r) => setLeads(r.rows as CompanyRow[]),
            (e: Error) => setError(e.message)
        );
    }, [backend]);
    useEffect(load, [load]);

    const shown = useMemo(() => (list ?? []).filter((c) => channel === "all" || c.channel === channel), [list, channel]);
    const t = useMemo(() => totals(shown), [shown]);

    const decide = async (c: CompanyRow, status: string) => {
        setBusy(c.id);
        try {
            await backend.setStatus([c.id], status);
            load();
            onStatusChanged();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(null);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Typography component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 700 }}>
                        التقارير
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>أداء الحملات، ومن ردّ عليك ويحتاج متابعة. الأرقام تعتمد على ما تسجّله في شاشة الإرسال.</Typography>
                </Box>
                <ToggleButtonGroup exclusive size="small" value={channel} onChange={(_, v) => v && setChannel(v)} aria-label="القناة">
                    <ToggleButton value="all" sx={{ px: 2 }}>
                        الكل
                    </ToggleButton>
                    <ToggleButton value="whatsapp" sx={{ px: 2 }}>
                        واتساب
                    </ToggleButton>
                    <ToggleButton value="email" sx={{ px: 2 }}>
                        إيميل
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {list === null && !error && <LinearProgress />}

            {list && (
                <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 2 }}>
                        <Stat label="الحملات" value={t.campaigns} />
                        <Stat label="رسائل أُرسلت" value={t.sent} hint={`${t.pending} بانتظار الإرسال`} />
                        <Stat label="ردّوا" value={t.replied} hint={`${pct(t.replied, t.sent)}% من المُرسَل لهم`} />
                        <Stat label="طلبوا الإيقاف" value={t.stopped} hint={`${pct(t.stopped, t.sent)}% من المُرسَل لهم`} />
                        <Stat label="تخطّيتَهم" value={t.skipped} hint={t.failed ? `${t.failed} فشلت (إيميل مرفوض)` : undefined} />
                    </Box>

                    {t.sent > 0 && t.stopped > 0 && pct(t.stopped, t.sent) >= 5 && (
                        <Alert severity="warning">نسبة طلبات الإيقاف {pct(t.stopped, t.sent)}% وهي مرتفعة. راجع نص الرسالة وقائمة المستلمين، وتأكد أنها تناسب نشاط كل جهة.</Alert>
                    )}

                    <Box sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small" sx={{ minWidth: 760 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>الحملة</TableCell>
                                        <TableCell>القناة</TableCell>
                                        <TableCell>الحالة</TableCell>
                                        <TableCell>أُرسلت</TableCell>
                                        <TableCell>ردّ</TableCell>
                                        <TableCell>إيقاف</TableCell>
                                        <TableCell>تخطّي</TableCell>
                                        <TableCell>فشلت</TableCell>
                                        <TableCell>متبقية</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {shown.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                                                لا توجد حملات بعد.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {shown.map((c) => {
                                        const sent = sentOf(c.counts);
                                        return (
                                            <TableRow key={c.id} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                                                        {CHANNEL_ICON[c.channel]}
                                                        {c.channel === "email" ? "إيميل" : "واتساب"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{{ active: "نشطة", paused: "متوقفة", done: "مكتملة", cancelled: "ملغاة" }[c.status]}</TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>{sent}</TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>
                                                    {c.counts.replied} <Box component="span" sx={{ color: "text.secondary", fontSize: 12 }}>({pct(c.counts.replied, sent)}%)</Box>
                                                </TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.counts.stopped}</TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.counts.skipped}</TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.counts.failed}</TableCell>
                                                <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.counts.pending}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </>
            )}

            <Box>
                <Typography component="h3" sx={{ m: 0, fontSize: 17, fontWeight: 700, mb: 0.5 }}>
                    للمتابعة
                </Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>جهات ردّت على رسالتك. حدّد من هو مهتم ومن لا.</Typography>
                {leads === null ? (
                    <LinearProgress />
                ) : leads.length === 0 ? (
                    <Alert severity="info">لا توجد ردود بعد. عندما تسجّل «ردّ» في شاشة إرسال حملة، تظهر الجهة هنا.</Alert>
                ) : (
                    <Box sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
                        <Box sx={{ overflowX: "auto" }}>
                            <Table size="small" sx={{ minWidth: 720 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>الجهة</TableCell>
                                        <TableCell>للتواصل</TableCell>
                                        <TableCell>الحالة</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {leads.map((c) => {
                                        const st = statusOf(c.status);
                                        const wa = (c.whatsapp || (c.phone_kind === "mobile" ? c.phone : "")).replace(/\D/g, "");
                                        return (
                                            <TableRow key={c.id} hover>
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {c.name}
                                                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                                        <bdi>{[c.hq_city, c.industry].filter(Boolean).join(" · ")}</bdi>
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                    {wa && (
                                                        <Link href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" sx={{ display: "block" }} dir="ltr">
                                                            +{wa}
                                                        </Link>
                                                    )}
                                                    {c.emails[0] && (
                                                        <Link href={`mailto:${c.emails[0]}`} sx={{ display: "block" }} dir="ltr">
                                                            {c.emails[0]}
                                                        </Link>
                                                    )}
                                                    {!wa && !c.emails[0] && "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={st.label} color={st.color} variant={st.color === "default" ? "outlined" : "filled"} sx={{ fontWeight: 700 }} />
                                                </TableCell>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                    <Button size="small" variant="contained" disabled={busy === c.id || c.status === "interested"} onClick={() => decide(c, "interested")}>
                                                        مهتم
                                                    </Button>{" "}
                                                    <Button size="small" disabled={busy === c.id} onClick={() => decide(c, "not_interested")}>
                                                        غير مهتم
                                                    </Button>{" "}
                                                    <Button size="small" color="success" disabled={busy === c.id} onClick={() => decide(c, "converted")}>
                                                        نُقل
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
