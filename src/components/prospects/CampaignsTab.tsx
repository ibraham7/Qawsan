// "الحملات": WhatsApp campaigns with assisted manual sending. The page opens a chat with the
// message filled in; the admin presses send in WhatsApp and then marks the recipient here.
// Nothing is ever sent by this page itself.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Link,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { mailStatus, sendBatch } from "../../lib/discovery/client";
import type { MailStatus, SendBatch } from "../../lib/discovery/client";
import {
    RECIPIENT_LABEL,
    SKIP_LABEL,
    STOP_LINE_DEFAULT,
    STOP_LINE_EMAIL_DEFAULT,
    eligibility,
    emailEligibility,
    gmailLink,
    mailtoLink,
    MAX_ISSUE,
    mainIssue,
    renderMessage,
    sentToday,
    usesCustom,
    usesPersonal,
    validateTemplate,
    variantCount,
    waLink,
} from "../../lib/prospects/campaigns";
import type { Campaign, Recipient } from "../../lib/prospects/campaigns";
import { PRESETS, SAVED_KEY, defaultPreset, parseSaved, withSaved } from "../../lib/prospects/templates";
import type { SavedTemplate } from "../../lib/prospects/templates";
import type { Backend } from "../../lib/prospects/data";
import QuickReplies from "./QuickReplies";
import type { ReplyTarget } from "./QuickReplies";
import type { CompanyRow } from "../../lib/prospects/types";

const CAMPAIGN_LABEL: Record<Campaign["status"], { text: string; color: "success" | "warning" | "default" }> = {
    active: { text: "نشطة", color: "success" },
    paused: { text: "متوقفة مؤقتًا", color: "warning" },
    done: { text: "مكتملة", color: "default" },
    cancelled: { text: "ملغاة", color: "default" },
};

type Channel = Campaign["channel"];

function readSaved(): SavedTemplate[] {
    try {
        return parseSaved(localStorage.getItem(SAVED_KEY));
    } catch {
        return [];
    }
}

/** the words that differ between the two channels */
const COPY: Record<Channel, { title: string; newTitle: string; intro: string; open: string; opened: string; howTo: string }> = {
    whatsapp: {
        title: "حملات واتساب",
        newTitle: "حملة واتساب جديدة",
        intro: "حملة من الجهات المعتمدة فقط. تفتح لك الصفحة محادثة كل جهة والرسالة جاهزة، وأنت تضغط «إرسال» بنفسك.",
        open: "فتح واتساب",
        opened: "اضغط «فتح واتساب»، أرسل الرسالة من هناك، ثم ارجع واضغط «أرسلتها». يُسجَّل التواصل ويتغير وضع الجهة إلى «تم التواصل».",
        howTo: "تفتح لك محادثة كل جهة والرسالة جاهزة، وأنت تضغط «إرسال» في واتساب بنفسك.",
    },
    email: {
        title: "حملات الإيميل",
        newTitle: "حملة إيميل جديدة",
        intro: "حملة من الجهات المعتمدة التي لها إيميل. تفتح لك الصفحة رسالة جاهزة في Gmail أو برنامج البريد، وأنت تضغط «إرسال» بنفسك. لا يلزم ربط أي صندوق.",
        open: "فتح في Gmail",
        opened: "اضغط «فتح في Gmail» (أو «برنامج البريد»)، أرسل الرسالة من هناك، ثم ارجع واضغط «أرسلتها». يُسجَّل التواصل ويتغير وضع الجهة إلى «تم التواصل».",
        howTo: "تفتح لك رسالة جاهزة في Gmail أو برنامج البريد، وأنت تضغط «إرسال» بنفسك.",
    },
};

/* ------------------------------------------------------------------ */
/* new campaign                                                         */

function NewCampaign({ backend, channel, blocked, open, onClose, onCreated }: { backend: Backend; channel: Channel; blocked: Set<string>; open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
    const email = channel === "email";
    const [companies, setCompanies] = useState<CompanyRow[] | null>(null);
    const [name, setName] = useState("");
    const [subject, setSubject] = useState(defaultPreset("email").subject);
    const [message, setMessage] = useState(defaultPreset(channel).message);
    // the picked template: a built-in one (by id) or one the person saved in this browser
    const [templateId, setTemplateId] = useState(defaultPreset(channel).id);
    const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(readSaved);
    const [stopLine, setStopLine] = useState(email ? STOP_LINE_EMAIL_DEFAULT : STOP_LINE_DEFAULT);
    const [limit, setLimit] = useState(email ? "30" : "20");
    const [picked, setPicked] = useState<Set<string> | null>(null);
    const [ok1, setOk1] = useState(false);
    const [ok2, setOk2] = useState(false);
    const [ok3, setOk3] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        let live = true;
        backend.approvedCompanies().then(
            (c) => live && setCompanies(c),
            (e: Error) => live && setError(e.message)
        );
        return () => {
            live = false;
        };
    }, [open, backend]);

    const elig = useMemo(() => {
        const list = companies ?? [];
        if (email) {
            const r = emailEligibility(list, blocked);
            return { eligible: r.eligible.map((e) => ({ company: e.company, phone: "", email: e.email })), skipped: r.skipped };
        }
        const r = eligibility(list, blocked);
        return { eligible: r.eligible.map((e) => ({ company: e.company, phone: e.phone, email: "" })), skipped: r.skipped };
    }, [companies, blocked, email]);
    // with {issue} in the message only companies with a confirmed website problem can be written to
    const usesIssue = message.includes("{issue}") || (email && subject.includes("{issue}"));
    // {custom}: the person writes a paragraph for every company afterwards, so none is filtered out
    const custom = usesCustom(message, email ? subject : "");
    const filterByIssue = usesIssue && !custom;
    const issueOf = (e: { company: CompanyRow }) => mainIssue(e.company.site_issues ?? []);
    const withoutIssue = filterByIssue ? elig.eligible.filter((e) => !issueOf(e)).length : 0;
    const chosen = elig.eligible.filter((e) => (picked ? picked.has(e.company.id) : true) && (!filterByIssue || !!issueOf(e)));
    const skippedByReason = useMemo(() => {
        const m = new Map<string, number>();
        elig.skipped.filter((s) => s.company.status === "approved").forEach((s) => m.set(SKIP_LABEL[s.reason], (m.get(SKIP_LABEL[s.reason]) ?? 0) + 1));
        return [...m];
    }, [elig]);

    const pickTemplate = (id: string) => {
        const t = PRESETS.find((p) => p.id === id) ?? savedTemplates.find((x) => x.id === id);
        if (!t) return;
        setTemplateId(id);
        setMessage(t.message);
        if (email && t.subject) setSubject(t.subject);
    };
    const persistSaved = (list: SavedTemplate[]) => {
        setSavedTemplates(list);
        try {
            localStorage.setItem(SAVED_KEY, JSON.stringify(list));
        } catch {
            /* storage unavailable: the template lasts until the page is closed */
        }
    };
    const saveTemplate = () => {
        const name = window.prompt("اسم القالب (يُحفظ في هذا المتصفح فقط):", "")?.trim();
        if (!name) return;
        const id = crypto.randomUUID();
        persistSaved(withSaved(savedTemplates, { name, channel, subject: email ? subject : "", message }, id));
        setTemplateId(id);
    };
    const deleteTemplate = () => {
        persistSaved(savedTemplates.filter((t) => t.id !== templateId));
        setTemplateId(defaultPreset(channel).id);
    };
    const isSaved = savedTemplates.some((t) => t.id === templateId);

    const msgError = validateTemplate(message);
    const subjectError = email && subject.trim().length < 3 ? "اكتب عنوانًا للرسالة." : email && validateTemplate(`${subject} ......`) ? "أقواس { } غير متطابقة في العنوان." : null;
    const sampleName = chosen[0]?.company.name ?? "اسم الجهة";
    const sampleSeed = chosen[0]?.company.id ?? "x";
    const sampleIssue = chosen[0] ? issueOf(chosen[0]) : "";
    const preview = renderMessage(message, sampleName, stopLine, sampleSeed, sampleIssue);
    const previewSubject = renderMessage(subject, sampleName, "", sampleSeed + ":s", sampleIssue);
    const ready = !!name.trim() && !msgError && !subjectError && chosen.length > 0 && ok1 && ok2 && ok3;

    const create = async () => {
        setBusy(true);
        setError("");
        try {
            const id = await backend.createCampaign({
                name,
                channel,
                subject: email ? subject : "",
                message,
                stopLine,
                dailyLimit: Math.max(1, Math.min(200, Number(limit) || (email ? 30 : 20))),
                recipients: chosen.map((e) => ({ companyId: e.company.id, name: e.company.name, phone: e.phone, email: e.email, issue: filterByIssue ? issueOf(e) : "" })),
            });
            onCreated(id);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !busy && onClose()} fullWidth maxWidth="md">
            <DialogTitle>{COPY[channel].newTitle}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
                <Alert severity="info">لا تُرسل أي رسالة من الصفحة. {COPY[channel].howTo}</Alert>
                {error && <Alert severity="error">{error}</Alert>}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
                    <TextField label="اسم الحملة *" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: عيادات أسنان - إسطنبول" slotProps={{ htmlInput: { maxLength: 120 } }} />
                    <TextField
                        label="الحد اليومي"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        helperText="رسائل في اليوم"
                        slotProps={{ htmlInput: { min: 1, max: 200, dir: "ltr" } }}
                    />
                </Box>

                <Box>
                    <TextField
                        select
                        label="قالب جاهز"
                        value={templateId}
                        onChange={(e) => pickTemplate(e.target.value)}
                        fullWidth
                        helperText={PRESETS.find((p) => p.id === templateId)?.hint ?? "قالب حفظته أنت في هذا المتصفح."}
                        sx={{ mb: 2 }}
                    >
                        {PRESETS.filter((p) => p.channel === channel).map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.label}
                            </MenuItem>
                        ))}
                        {savedTemplates.filter((t) => t.channel === channel).map((t) => (
                            <MenuItem key={t.id} value={t.id}>
                                محفوظ: {t.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {email && (
                        <TextField
                            label="عنوان الرسالة *"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            fullWidth
                            error={!!subjectError}
                            helperText={subjectError ?? "يقبل {name} والصيغ مثل النص."}
                            sx={{ mb: 2 }}
                            slotProps={{ htmlInput: { maxLength: 200 } }}
                        />
                    )}
                    <TextField
                        label="نص الرسالة *"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                        error={!!msgError}
                        helperText={msgError ?? `{name} = اسم الجهة. {issue} = أبرز عيب مؤكد في موقعها (من «فحص جودة الموقع»). {custom} = فقرة تكتبها أنت لكل جهة. {خيار1|خيار2} = تُختار صيغة لكل جهة (${variantCount(message)} صيغة ممكنة).`}
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                        <Button size="small" onClick={saveTemplate} disabled={!!msgError}>
                            حفظ هذا النص كقالب
                        </Button>
                        {isSaved && (
                            <Button size="small" color="error" onClick={deleteTemplate}>
                                حذف القالب المحفوظ
                            </Button>
                        )}
                    </Box>
                    <TextField label="سطر الإيقاف (يُضاف في آخر كل رسالة)" value={stopLine} onChange={(e) => setStopLine(e.target.value)} fullWidth sx={{ mt: 2 }} slotProps={{ htmlInput: { maxLength: 200 } }} />
                </Box>

                <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "action.hover" }}>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}>معاينة{chosen[0] ? ` (لـ ${chosen[0].company.name})` : ""}</Typography>
                    {email && <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{previewSubject}</Typography>}
                    <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}>{preview}</Typography>
                </Box>

                <Box>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>من سيستلم الرسالة</Typography>
                    {companies === null ? (
                        <LinearProgress />
                    ) : (
                        <>
                            <Typography sx={{ fontSize: 14 }}>
                                <bdi>{chosen.length}</bdi> جهة من أصل <bdi>{elig.eligible.length}</bdi> مؤهلة. المؤهلة: «معتمد للتواصل» {email ? "ولها إيميل" : "ولها رقم جوال أو واتساب"}، وليست في «لا ترسل»، ولم يُتواصل معها.
                            </Typography>
                            {custom && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    الرسالة فيها «فقرة مخصصة». بعد إنشاء الحملة افتح كل جهة واكتب فقرتها بالقلم، ولن تُرسَل رسالة لجهة قبل أن تكتب فقرتها.
                                </Alert>
                            )}
                            {filterByIssue && (
                                <Typography sx={{ fontSize: 12.5, color: withoutIssue ? "warning.main" : "text.secondary", mt: 0.5 }}>
                                    {withoutIssue
                                        ? `${withoutIssue} جهة بلا عيب موقع مؤكد لم تُضمَّن (لا نذكر عيبًا لم نتأكد منه). اعمل لها «فحص جودة الموقع» أو أرسل لها حملة بدون {issue}.`
                                        : "كل الجهات المختارة لها عيب موقع مؤكد."}
                                </Typography>
                            )}
                            {skippedByReason.length > 0 && (
                                <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.5 }}>
                                    مُستبعدة تلقائيًا من المعتمدة: {skippedByReason.map(([k, n]) => `${n} ${k}`).join(" · ")}
                                </Typography>
                            )}
                            {elig.eligible.length === 0 ? (
                                <Alert severity="warning" sx={{ mt: 1.5 }}>
                                    لا توجد جهات مؤهلة. اعتمد جهات من «الشركات» (تغيير الحالة إلى «معتمد للتواصل») وتأكد أن {email ? "لها إيميل (استخدم «إثراء من المواقع» لجلبه)" : "لها رقم جوال"}.
                                </Alert>
                            ) : (
                                <Box sx={{ mt: 1.5, maxHeight: 200, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: "12px", p: 1 }}>
                                    {elig.eligible.map((e) => {
                                        const on = picked ? picked.has(e.company.id) : true;
                                        return (
                                            <FormControlLabel
                                                key={e.company.id}
                                                sx={{ display: "flex", mx: 0 }}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={on}
                                                        onChange={() => {
                                                            const base = picked ?? new Set(elig.eligible.map((x) => x.company.id));
                                                            const next = new Set(base);
                                                            if (on) next.delete(e.company.id);
                                                            else next.add(e.company.id);
                                                            setPicked(next);
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography sx={{ fontSize: 13.5 }}>
                                                        {e.company.name} <bdi style={{ color: "gray" }}>{email ? e.email : `+${e.phone}`}</bdi>
                                                    </Typography>
                                                }
                                            />
                                        );
                                    })}
                                </Box>
                            )}
                        </>
                    )}
                </Box>

                <Box sx={{ p: 2, borderRadius: "14px", border: "1px solid", borderColor: "primary.main" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>الاعتماد النهائي</Typography>
                    <FormControlLabel control={<Checkbox checked={ok1} onChange={(e) => setOk1(e.target.checked)} />} label="راجعت نص الرسالة والمستلمين." />
                    <FormControlLabel control={<Checkbox checked={ok2} onChange={(e) => setOk2(e.target.checked)} />} label="تواصلي مع هذه الجهات مشروع (نشاط تجاري مرتبط بعملها) وسأحترم من يطلب التوقف فورًا." />
                    <FormControlLabel control={<Checkbox checked={ok3} onChange={(e) => setOk3(e.target.checked)} />} label={email ? "أفهم أن الرسائل أرسلها بنفسي من بريدي، ولن تُرسل آليًا." : "أفهم أن الرسائل أرسلها بنفسي من واتساب، ولن تُرسل آليًا."} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>
                    إلغاء
                </Button>
                <Button variant="contained" onClick={create} disabled={!ready || busy}>
                    اعتماد وإنشاء الحملة ({chosen.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* one campaign: the sending screen                                     */

function Sending({ backend, campaign, onBack, onChanged }: { backend: Backend; campaign: Campaign; onBack: () => void; onChanged: () => void }) {
    const [rows, setRows] = useState<Recipient[] | null>(null);
    const [error, setError] = useState("");
    // the recipient whose chat was just opened: waiting for "sent" / "skip"
    const [opened, setOpened] = useState<string | null>(null);
    // editing the website problem written for one recipient
    const [editing, setEditing] = useState<{ r: Recipient; value: string } | null>(null);
    // ready replies: open, and for which recipient (null = copy only)
    const [replies, setReplies] = useState<{ target: ReplyTarget | null } | null>(null);
    // automatic sending over SMTP (email campaigns only, when the mailbox is set in Vercel)
    const [mailLive, setMailLive] = useState<MailStatus | null>(null);
    const [auto, setAuto] = useState(false);
    const [autoMsg, setAutoMsg] = useState("");
    const stopAuto = useRef(false);
    // demo mode pretends a mailbox is connected so the screen can be tried; nothing is sent
    const mail: MailStatus | null = backend.demo && campaign.channel === "email" ? { configured: true, from: "demo@example.com (تجريبي)", host: "demo" } : mailLive;
    useEffect(() => {
        if (campaign.channel !== "email" || backend.demo) return;
        mailStatus().then(setMailLive, () => setMailLive(null));
    }, [campaign.channel, backend.demo]);

    /** one batch: the real server in production, a simulation in demo mode */
    const nextBatch = async (): Promise<SendBatch> => {
        if (!backend.demo) return sendBatch(campaign.id);
        const all = await backend.recipients(campaign.id);
        const today = sentToday(all);
        const room = Math.max(0, Math.min(5, campaign.daily_limit - today));
        const pendingNow = all.filter((x) => x.status === "pending");
        if (room === 0) return { sent: 0, failed: 0, skipped: 0, sentToday: today, limit: campaign.daily_limit, pending: pendingNow.length, stopped: "limit" };
        const batch = pendingNow.slice(0, room);
        for (const x of batch) await backend.markRecipient(x, "sent");
        const left = pendingNow.length - batch.length;
        return { sent: batch.length, failed: 0, skipped: 0, sentToday: today + batch.length, limit: campaign.daily_limit, pending: left, stopped: left === 0 ? "done" : "" };
    };

    const load = useCallback(() => {
        backend.recipients(campaign.id).then(setRows, (e: Error) => setError(e.message));
    }, [backend, campaign.id]);
    useEffect(load, [load]);

    const today = rows ? sentToday(rows) : 0;
    const limitReached = today >= campaign.daily_limit;
    const personal = usesPersonal(campaign.message, campaign.subject);
    const custom = usesCustom(campaign.message, campaign.subject);
    const pending = rows?.filter((r) => r.status === "pending") ?? [];
    // with {issue} / {custom} a recipient can only be sent once its text is written
    const hasText = (r: Recipient) => !personal || !!(r.issue ?? "").trim();
    const ready = pending.filter(hasText);
    const awaiting = pending.length - ready.length;
    const next = ready[0];
    const total = rows?.length ?? 0;
    const done = total - pending.length;

    const mark = async (r: Recipient, status: Recipient["status"]) => {
        try {
            await backend.markRecipient(r, status);
            setOpened(null);
            load();
            onChanged();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const isEmail = campaign.channel === "email";
    const subjectFor = (r: Recipient) => renderMessage(campaign.subject, r.name, "", `${r.company_id ?? r.id}:s`, r.issue ?? "");
    const bodyFor = (r: Recipient) => renderMessage(campaign.message, r.name, campaign.stop_line, r.company_id ?? r.id, r.issue ?? "");

    const saveIssue = async () => {
        if (!editing || !editing.value.trim()) return;
        try {
            await backend.setRecipientIssue(editing.r.id, editing.value);
            setEditing(null);
            load();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const runAuto = async () => {
        const ok = window.confirm(
            `ستُرسل رسائل حقيقية الآن من ${mail?.from ?? "بريدك"} إلى جهات الحملة المتبقية، على دفعات صغيرة وحتى الحد اليومي (${campaign.daily_limit}). كل رسالة فيها رابط إلغاء اشتراك. أبقِ هذه الصفحة مفتوحة. هل تريد البدء؟`
        );
        if (!ok) return;
        stopAuto.current = false;
        setAuto(true);
        setError("");
        let sent = 0;
        let failed = 0;
        try {
            for (let i = 0; i < 100; i++) {
                if (stopAuto.current) {
                    setAutoMsg(`تم الإيقاف. أُرسلت ${sent} في هذه الجلسة.`);
                    break;
                }
                const r = await nextBatch();
                sent += r.sent;
                failed += r.failed;
                setAutoMsg(`أُرسلت ${sent} · فشلت ${failed} · المتبقية ${r.pending}`);
                load();
                if (r.stopped === "limit") {
                    setAutoMsg(`بلغت الحد اليومي (${r.limit}). أكمل غدًا. أُرسلت ${sent} الآن.`);
                    break;
                }
                if (r.stopped === "done") {
                    setAutoMsg(`انتهت الحملة. أُرسلت ${sent}.`);
                    break;
                }
                if (r.sent === 0 && r.failed === 0 && r.skipped === 0) break;
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setAuto(false);
            load();
            onChanged();
        }
    };

    const open = (r: Recipient, how: "primary" | "app" = "primary") => {
        if (isEmail) {
            const url = how === "app" ? mailtoLink(r.email, subjectFor(r), bodyFor(r)) : gmailLink(r.email, subjectFor(r), bodyFor(r));
            if (how === "app") window.location.assign(url);
            else window.open(url, "_blank", "noopener,noreferrer");
        } else {
            window.open(waLink(r.phone, bodyFor(r)), "_blank", "noopener,noreferrer");
        }
        setOpened(r.id);
    };

    // WhatsApp queue: one click records this chat as sent AND opens the next one. The window is
    // opened first, inside the click, so the browser does not treat it as a blocked pop-up.
    const sentAndNext = async (r: Recipient) => {
        const after = ready[1];
        const room = today + 1 < campaign.daily_limit;
        const chain = !isEmail && !!after && room;
        if (chain) window.open(waLink(after.phone, bodyFor(after)), "_blank", "noopener,noreferrer");
        try {
            await backend.markRecipient(r, "sent");
            setOpened(chain ? after.id : null);
            load();
            onChanged();
        } catch (e) {
            setError((e as Error).message);
        }
    };
    const upcoming = ready.slice(1, 5);
    const canChain = !isEmail && ready.length > 1 && today + 1 < campaign.daily_limit;

    // finishing the last pending recipient completes the campaign
    useEffect(() => {
        if (rows && rows.length > 0 && pending.length === 0 && campaign.status === "active") {
            backend.setCampaignStatus(campaign.id, "done").then(onChanged, () => {});
        }
    }, [rows, pending.length, campaign.status, campaign.id, backend, onChanged]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <IconButton onClick={onBack} aria-label="رجوع">
                    <ArrowBackRoundedIcon sx={{ transform: "scaleX(-1)" }} />
                </IconButton>
                <Typography component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 700 }}>
                    {campaign.name}
                </Typography>
                <Chip size="small" label={CAMPAIGN_LABEL[campaign.status].text} color={CAMPAIGN_LABEL[campaign.status].color} />
                <Button size="small" variant="outlined" startIcon={<ChatBubbleOutlineRoundedIcon />} onClick={() => setReplies({ target: null })}>
                    ردود جاهزة
                </Button>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    اليوم: <b dir="ltr">{today}</b> / <b dir="ltr">{campaign.daily_limit}</b>
                </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {personal && awaiting > 0 && campaign.status === "active" && (
                <Alert severity="warning">
                    {awaiting} جهة بانتظار {custom ? "فقرتها المخصصة" : "نص العيب"}. اضغط أيقونة القلم بجانب كل جهة في الجدول وأكتبها. لن تُرسَل رسالة لجهة قبل ذلك.
                </Alert>
            )}

            <Box>
                <LinearProgress variant="determinate" value={total ? (done / total) * 100 : 0} sx={{ height: 8, borderRadius: 4 }} />
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.75 }}>
                    تمت معالجة <bdi>{done}</bdi> من <bdi>{total}</bdi>
                </Typography>
            </Box>

            {isEmail && mail && !mail.configured && (
                <Alert severity="info">الإرسال التلقائي غير مفعّل: أضف إعدادات SMTP في Vercel (تبويب الإعدادات يشرح الخطوات). الإرسال اليدوي من Gmail يعمل كما هو.</Alert>
            )}
            {isEmail && mail?.configured && campaign.status === "active" && (
                <Box sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 700 }}>إرسال تلقائي</Typography>
                        <Typography sx={{ fontSize: 13, color: "text.secondary", flex: 1, minWidth: 200 }}>
                            من <bdi>{mail.from}</bdi> على دفعات من 5 رسائل، وحتى الحد اليومي. أبقِ الصفحة مفتوحة أثناء الإرسال.
                        </Typography>
                        {auto ? (
                            <Button color="error" variant="outlined" onClick={() => (stopAuto.current = true)}>
                                إيقاف بعد الدفعة الحالية
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={runAuto} disabled={limitReached || pending.length === 0}>
                                بدء الإرسال التلقائي
                            </Button>
                        )}
                    </Box>
                    {auto && <LinearProgress />}
                    {autoMsg && <Typography sx={{ fontSize: 13.5 }}>{autoMsg}</Typography>}
                </Box>
            )}

            {campaign.status === "paused" || campaign.status === "cancelled" ? (
                <Alert severity="warning">الحملة {CAMPAIGN_LABEL[campaign.status].text}. {campaign.status === "paused" ? "استأنفها من القائمة لمتابعة الإرسال." : ""}</Alert>
            ) : limitReached ? (
                <Alert severity="success">بلغت الحد اليومي ({campaign.daily_limit}). أكمل غدًا، فالتوزيع على أيام يحمي رقمك.</Alert>
            ) : next ? (
                <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: "1px solid", borderColor: "primary.main", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>الجهة التالية</Typography>
                    <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                        {next.name} <bdi style={{ fontSize: 14, color: "gray" }}>{isEmail ? next.email : `+${next.phone}`}</bdi>
                    </Typography>
                    <Box sx={{ p: 2, borderRadius: "14px", bgcolor: "action.hover", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}>
                        {isEmail && <Typography sx={{ fontWeight: 700, mb: 1 }}>{subjectFor(next)}</Typography>}
                        {bodyFor(next)}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Button variant="contained" size="large" startIcon={isEmail ? <EmailRoundedIcon /> : <WhatsAppIcon />} disabled={auto} onClick={() => open(next)}>
                            {COPY[campaign.channel].open}
                        </Button>
                        {isEmail && (
                            <Button variant="outlined" size="large" disabled={auto} onClick={() => open(next, "app")}>
                                برنامج البريد
                            </Button>
                        )}
                        {canChain ? (
                            <Button variant="contained" color="success" size="large" disabled={opened !== next.id || auto} onClick={() => sentAndNext(next)}>
                                أرسلتها ✓ وافتح التالية
                            </Button>
                        ) : (
                            <Button variant="outlined" size="large" disabled={opened !== next.id} onClick={() => mark(next, "sent")}>
                                أرسلتها ✓
                            </Button>
                        )}
                        {canChain && (
                            <Button variant="outlined" size="large" disabled={opened !== next.id || auto} onClick={() => mark(next, "sent")}>
                                أرسلتها فقط
                            </Button>
                        )}
                        <Button size="large" disabled={auto} onClick={() => mark(next, "skipped")}>
                            تخطّي
                        </Button>
                    </Box>
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{COPY[campaign.channel].opened}</Typography>
                    {canChain && upcoming.length > 0 && (
                        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                            بعدها: {upcoming.map((u) => u.name).join(" · ")}
                            {pending.length - 1 > upcoming.length ? ` · و${pending.length - 1 - upcoming.length} أخرى` : ""}
                        </Typography>
                    )}
                </Box>
            ) : awaiting > 0 ? null : rows ? (
                <Alert severity="success">انتهت الحملة: لا توجد جهات بانتظار الإرسال.</Alert>
            ) : (
                <LinearProgress />
            )}

            <Dialog open={!!editing} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
                <DialogTitle>{custom ? "الفقرة المخصصة" : "تعديل العيب"} · {editing?.r.name}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
                    <Alert severity="info">
                        {custom
                            ? "اكتب فقرة خاصة بهذه الجهة حسب حاجتها، فتحل محل {custom} في الرسالة. اكتب ما تحققت منه فعلًا ولا تخمّن."
                            : "اكتب ما تحققت منه بنفسك في موقع هذه الجهة. الجملة تكمل: «لاحظت أن موقعكم …». اكتب شيئًا رأيته فعلًا ولا تخمّن."}
                    </Alert>
                    <TextField
                        label={custom ? "الفقرة" : "العيب"}
                        value={editing?.value ?? ""}
                        onChange={(e) => editing && setEditing({ ...editing, value: e.target.value })}
                        placeholder="مثال: لا يظهر فيه زر الحجز في الشاشة الأولى على الجوال"
                        multiline
                        minRows={custom ? 5 : 2}
                        slotProps={{ htmlInput: { maxLength: MAX_ISSUE } }}
                        helperText={`${editing?.value.length ?? 0} / ${MAX_ISSUE}`}
                    />
                    {editing && editing.value.trim() && (
                        <Box sx={{ p: 2, borderRadius: "12px", bgcolor: "action.hover", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}>
                            {renderMessage(campaign.message, editing.r.name, campaign.stop_line, editing.r.company_id ?? editing.r.id, editing.value)}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditing(null)}>إلغاء</Button>
                    <Button variant="contained" onClick={saveIssue} disabled={!editing?.value.trim()}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>

            <QuickReplies open={!!replies} onClose={() => setReplies(null)} target={replies?.target} />

            <Box sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", overflow: "hidden", bgcolor: "background.paper" }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 620 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>الجهة</TableCell>
                                <TableCell>{isEmail ? "الإيميل" : "الرقم"}</TableCell>
                                <TableCell>الحالة</TableCell>
                                <TableCell>تسجيل الرد</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(rows ?? []).map((r) => (
                                <TableRow key={r.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {r.name}
                                        {personal && r.status === "pending" && (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 400, fontSize: 12.5, color: r.issue ? "text.secondary" : "warning.main" }}>
                                                <span>{custom ? "الفقرة" : "العيب"}: {r.issue ? (r.issue.length > 70 ? `${r.issue.slice(0, 70)}…` : r.issue) : "لم تُكتب بعد"}</span>
                                                <Tooltip title={custom ? "اكتب الفقرة الخاصة بهذه الجهة" : "عدّل العيب المكتوب لهذه الجهة قبل الإرسال"}>
                                                    <IconButton size="small" aria-label="تعديل العيب" onClick={() => setEditing({ r, value: r.issue ?? "" })}>
                                                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell dir="ltr" sx={{ textAlign: "end", fontVariantNumeric: "tabular-nums" }}>
                                        {isEmail ? (
                                            <Link href={`mailto:${r.email}`}>{r.email}</Link>
                                        ) : (
                                            <Link href={`https://wa.me/${r.phone}`} target="_blank" rel="noopener noreferrer">
                                                +{r.phone}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={RECIPIENT_LABEL[r.status]}
                                            title={r.error || undefined}
                                            color={r.status === "sent" ? "primary" : r.status === "replied" ? "success" : r.status === "stopped" || r.status === "failed" ? "error" : "default"}
                                            variant={r.status === "pending" || r.status === "skipped" ? "outlined" : "filled"}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                                        {(r.status === "sent" || r.status === "replied") && (
                                            <>
                                                <Tooltip title="ردود جاهزة لهذه الجهة">
                                                    <Button
                                                        size="small"
                                                        onClick={() => setReplies({ target: { name: r.name, phone: r.phone || undefined, email: r.email || undefined, issue: r.issue || undefined, subject: `Re: ${subjectFor(r)}` } })}
                                                    >
                                                        رد جاهز
                                                    </Button>
                                                </Tooltip>
                                                <Button size="small" onClick={() => mark(r, "replied")} disabled={r.status === "replied"}>
                                                    ردّ
                                                </Button>
                                                <Tooltip title="يُضاف رقمه إلى «لا ترسل» تلقائيًا">
                                                    <Button size="small" color="error" onClick={() => mark(r, "stopped")}>
                                                        طلب الإيقاف
                                                    </Button>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* list                                                                 */

export default function CampaignsTab({ backend, channel, blocked, onStatusChanged }: { backend: Backend; channel: Channel; blocked: Set<string>; onStatusChanged: () => void }) {
    const [list, setList] = useState<Campaign[] | null>(null);
    const [error, setError] = useState("");
    const [creating, setCreating] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [toDelete, setToDelete] = useState<Campaign | null>(null);

    const load = useCallback(() => {
        backend.campaigns(channel).then(setList, (e: Error) => setError(e.message));
    }, [backend, channel]);
    useEffect(load, [load]);

    const current = list?.find((c) => c.id === openId);
    if (current) {
        return (
            <Sending
                backend={backend}
                campaign={current}
                onBack={() => setOpenId(null)}
                onChanged={() => {
                    load();
                    onStatusChanged();
                }}
            />
        );
    }

    const setStatus = async (c: Campaign, status: Campaign["status"]) => {
        try {
            await backend.setCampaignStatus(c.id, status);
            load();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Typography component="h2" sx={{ m: 0, fontSize: 20, fontWeight: 700 }}>
                        {COPY[channel].title}
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5 }}>{COPY[channel].intro}</Typography>
                </Box>
                <Button variant="contained" size="large" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
                    حملة جديدة
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {list === null && !error && <LinearProgress />}
            {list?.length === 0 && (
                <Alert severity="info">لا توجد حملات بعد. اعتمد جهات من «الشركات» (تغيير الحالة إلى «معتمد للتواصل»)، ثم أنشئ حملة.</Alert>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {(list ?? []).map((c) => {
                    const total = Object.values(c.counts).reduce((a, b) => a + b, 0);
                    const done = total - c.counts.pending;
                    const st = CAMPAIGN_LABEL[c.status];
                    return (
                        <Box key={c.id} sx={{ p: 2.5, borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, flex: 1 }}>{c.name}</Typography>
                                <Chip size="small" label={st.text} color={st.color} />
                            </Box>
                            <LinearProgress variant="determinate" value={total ? (done / total) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                                أُرسلت <bdi>{c.counts.sent + c.counts.replied + c.counts.stopped}</bdi> · ردّ <bdi>{c.counts.replied}</bdi> · طلب الإيقاف <bdi>{c.counts.stopped}</bdi> · تخطّيت{" "}
                                <bdi>{c.counts.skipped}</bdi>
                                {c.counts.failed > 0 && <> · فشلت <bdi>{c.counts.failed}</bdi></>} · متبقية <bdi>{c.counts.pending}</bdi>
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Button variant="contained" size="small" onClick={() => setOpenId(c.id)}>
                                    {c.status === "active" ? "متابعة الإرسال" : "فتح"}
                                </Button>
                                {c.status === "active" && (
                                    <Button size="small" startIcon={<PauseRoundedIcon />} onClick={() => setStatus(c, "paused")}>
                                        إيقاف مؤقت
                                    </Button>
                                )}
                                {c.status === "paused" && (
                                    <Button size="small" startIcon={<PlayArrowRoundedIcon />} onClick={() => setStatus(c, "active")}>
                                        استئناف
                                    </Button>
                                )}
                                {(c.status === "active" || c.status === "paused") && (
                                    <Button size="small" color="error" onClick={() => setStatus(c, "cancelled")}>
                                        إلغاء
                                    </Button>
                                )}
                                <Tooltip title="حذف الحملة">
                                    <IconButton size="small" onClick={() => setToDelete(c)} aria-label={`حذف ${c.name}`}>
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            <NewCampaign
                key={channel}
                backend={backend}
                channel={channel}
                blocked={blocked}
                open={creating}
                onClose={() => setCreating(false)}
                onCreated={(id) => {
                    setCreating(false);
                    load();
                    setOpenId(id);
                }}
            />

            <Dialog open={!!toDelete} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>حذف «{toDelete?.name}»؟</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14 }}>تُحذف الحملة وقائمة مستلميها. وضع الجهات («تم التواصل»…) يبقى كما هو.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setToDelete(null)}>إلغاء</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={async () => {
                            const c = toDelete!;
                            setToDelete(null);
                            try {
                                await backend.deleteCampaign(c.id);
                                load();
                            } catch (e) {
                                setError((e as Error).message);
                            }
                        }}
                    >
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
