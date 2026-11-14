// "تابع اليوم": companies we messaged a few days ago that have not answered. One follow-up each,
// sent by the person from WhatsApp / Gmail like the first message; this card only prepares the text,
// opens the chat and records it. The rules (who is due, the daily cap) live in lib/prospects/followups.ts.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, LinearProgress, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { gmailLink, validateTemplate, waLink } from "../../lib/prospects/campaigns";
import type { Campaign, Recipient } from "../../lib/prospects/campaigns";
import type { Backend } from "../../lib/prospects/data";
import {
    DEFAULT_FOLLOWUP_DAYS,
    DEFAULT_FOLLOWUP_EMAIL,
    DEFAULT_FOLLOWUP_WHATSAPP,
    FOLLOWUP_DAILY_LIMIT,
    FOLLOWUP_DAYS,
    dueFollowUps,
    followUpSubject,
    followUpText,
    followUpsToday,
} from "../../lib/prospects/followups";
import type { FollowUp } from "../../lib/prospects/followups";
import { dayStart } from "../../lib/prospects/sending";

const KEY = { whatsapp: "qawsan-followup-whatsapp", email: "qawsan-followup-email" } as const;

function saved(key: string, fallback: string) {
    try {
        return localStorage.getItem(key) || fallback;
    } catch {
        return fallback;
    }
}

export default function FollowUps({ backend }: { backend: Backend }) {
    const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
    const [waiting, setWaiting] = useState<Recipient[]>([]);
    const [doneRows, setDoneRows] = useState<Recipient[]>([]);
    const [blocked, setBlocked] = useState<Set<string>>(new Set());
    const [days, setDays] = useState(DEFAULT_FOLLOWUP_DAYS);
    const [tpl, setTpl] = useState({ whatsapp: saved(KEY.whatsapp, DEFAULT_FOLLOWUP_WHATSAPP), email: saved(KEY.email, DEFAULT_FOLLOWUP_EMAIL) });
    // the follow-up whose chat was just opened: waiting for "sent" / "skip"
    const [opened, setOpened] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [showText, setShowText] = useState(false);

    const load = useCallback(() => {
        const since = dayStart(new Date(), "Europe/Istanbul");
        Promise.all([backend.campaigns(), backend.awaitingFollowUp(), backend.followedUpSince(since), backend.suppressions()]).then(
            ([c, w, d, s]) => {
                setCampaigns(c);
                setWaiting(w);
                setDoneRows(d);
                setBlocked(new Set(s.map((x) => x.value.toLowerCase())));
            },
            (e: Error) => setError(e.message)
        );
    }, [backend]);
    useEffect(load, [load]);

    const due = useMemo(() => dueFollowUps(waiting, campaigns ?? [], { now: new Date(), days, blocked }), [waiting, campaigns, days, blocked]);
    const today = followUpsToday(doneRows, new Date());
    const capReached = today >= FOLLOWUP_DAILY_LIMIT;
    const next = due[0];
    const after = due[1];

    const tplError = { whatsapp: validateTemplate(tpl.whatsapp), email: validateTemplate(tpl.email) };
    const setTemplate = (ch: "whatsapp" | "email", v: string) => {
        setTpl((t) => ({ ...t, [ch]: v }));
        try {
            localStorage.setItem(KEY[ch], v);
        } catch {
            /* storage unavailable: the text just is not remembered */
        }
    };

    const open = (f: FollowUp) => {
        const text = followUpText(tpl[f.campaign.channel], f);
        const url = f.campaign.channel === "whatsapp" ? waLink(f.recipient.phone, text) : gmailLink(f.recipient.email, followUpSubject(f), text);
        window.open(url, "_blank", "noopener,noreferrer");
        setOpened(f.recipient.id);
    };

    const record = async (f: FollowUp, status: "sent" | "skipped", chain = false) => {
        // the next chat is opened first, inside the click, so the browser does not block it as a pop-up
        const chained = chain && !!after && today + 1 < FOLLOWUP_DAILY_LIMIT && !tplError[after.campaign.channel];
        if (chained) open(after);
        try {
            await backend.markFollowUp(f.recipient, status);
            if (!chained) setOpened(null);
            load();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const wa = next?.campaign.channel === "whatsapp";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Typography component="h3" sx={{ m: 0, fontSize: 17, fontWeight: 700 }}>
                        تابع اليوم {campaigns !== null && <bdi>({due.length})</bdi>}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>جهات راسلتها ولم تردّ. رسالة متابعة واحدة لكل جهة، ولا تُعاد.</Typography>
                </Box>
                <ToggleButtonGroup size="small" exclusive value={days} onChange={(_e, v: number | null) => v && setDays(v)} aria-label="بعد كم يوم">
                    {FOLLOWUP_DAYS.map((d) => (
                        <ToggleButton key={d} value={d} sx={{ px: 1.5 }}>
                            بعد {d} أيام
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                <Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
                    اليوم: <b dir="ltr">{today}</b> / <b dir="ltr">{FOLLOWUP_DAILY_LIMIT}</b>
                </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {campaigns === null ? (
                <LinearProgress />
            ) : capReached ? (
                <Alert severity="success">بلغت حد المتابعات اليومي ({FOLLOWUP_DAILY_LIMIT}). أكمل غدًا، فالتوزيع على أيام يحمي رقمك.</Alert>
            ) : !next ? (
                <Alert severity="info">لا أحد يحتاج متابعة الآن. تظهر هنا الجهات التي مرّ على رسالتك الأولى لها {days} أيام أو أكثر بلا ردّ ولا إيقاف.</Alert>
            ) : (
                <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: "1px solid", borderColor: "primary.main", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        المتابعة التالية · الأقدم أولًا · من حملة «{next.campaign.name}» قبل <bdi>{next.daysAgo}</bdi> أيام
                    </Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                        {next.recipient.name} <bdi style={{ fontSize: 14, color: "gray" }}>{wa ? `+${next.recipient.phone}` : next.recipient.email}</bdi>
                    </Typography>
                    <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "action.hover", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}>
                        {!wa && <Typography sx={{ fontWeight: 700, mb: 1 }}>{followUpSubject(next)}</Typography>}
                        {followUpText(tpl[next.campaign.channel], next)}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Button variant="contained" size="large" startIcon={wa ? <WhatsAppIcon /> : <EmailRoundedIcon />} disabled={!!tplError[next.campaign.channel]} onClick={() => open(next)}>
                            {wa ? "فتح واتساب" : "فتح Gmail"}
                        </Button>
                        {after && today + 1 < FOLLOWUP_DAILY_LIMIT ? (
                            <Button variant="contained" color="success" size="large" disabled={opened !== next.recipient.id} onClick={() => record(next, "sent", true)}>
                                أرسلتها ✓ وافتح التالية
                            </Button>
                        ) : null}
                        <Button variant="outlined" size="large" disabled={opened !== next.recipient.id} onClick={() => record(next, "sent")}>
                            {after && today + 1 < FOLLOWUP_DAILY_LIMIT ? "أرسلتها فقط" : "أرسلتها ✓"}
                        </Button>
                        <Button size="large" onClick={() => record(next, "skipped")}>
                            لن أتابعها
                        </Button>
                    </Box>
                    {due.length > 1 && (
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            بعدها: {due.slice(1, 5).map((x) => x.recipient.name).join(" · ")}
                            {due.length > 5 ? ` · و${due.length - 5} أخرى` : ""}
                        </Typography>
                    )}
                </Box>
            )}

            <Box>
                <Button size="small" onClick={() => setShowText((v) => !v)}>
                    {showText ? "إخفاء نص المتابعة" : "تعديل نص المتابعة"}
                </Button>
                {showText && (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 1 }}>
                        <TextField
                            label="نص متابعة واتساب"
                            value={tpl.whatsapp}
                            onChange={(e) => setTemplate("whatsapp", e.target.value)}
                            multiline
                            minRows={3}
                            error={!!tplError.whatsapp}
                            helperText={tplError.whatsapp ?? "يقبل {name} و{issue} و{خيار1|خيار2}. سطر الإيقاف يُضاف تلقائيًا من الحملة."}
                        />
                        <TextField
                            label="نص متابعة الإيميل"
                            value={tpl.email}
                            onChange={(e) => setTemplate("email", e.target.value)}
                            multiline
                            minRows={3}
                            error={!!tplError.email}
                            helperText={tplError.email ?? "العنوان يكون «Re:» + عنوان الرسالة الأولى فيظهر في نفس المحادثة."}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
