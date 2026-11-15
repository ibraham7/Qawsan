// "ردود جاهزة": answers to what clinics usually reply, ready to copy or send in one click. Opened for a
// specific clinic (its name, WhatsApp number and confirmed website problem fill the text) or without one
// (copy only). Your own replies and your starting price are kept in this browser. Texts: lib/prospects/replies.ts.

import { useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import { gmailLink, waLink } from "../../lib/prospects/campaigns";
import { CUSTOM_KEY, PRICE_KEY, REPLIES, parseCustom, renderReply, withCustom } from "../../lib/prospects/replies";
import type { CustomReply, Reply } from "../../lib/prospects/replies";

export interface ReplyTarget {
    name: string;
    phone?: string;
    email?: string;
    /** the confirmed website problem written for this clinic */
    issue?: string;
    /** subject for a Gmail reply */
    subject?: string;
}

const read = (key: string) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};
const write = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* storage unavailable: kept until the page is closed */
    }
};

async function copy(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export default function QuickReplies({ open, onClose, target }: { open: boolean; onClose: () => void; target?: ReplyTarget | null }) {
    const [price, setPrice] = useState(() => read(PRICE_KEY) ?? "");
    const [custom, setCustom] = useState<CustomReply[]>(() => parseCustom(read(CUSTOM_KEY)));
    const [copied, setCopied] = useState("");
    const [adding, setAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");

    const changePrice = (v: string) => {
        setPrice(v);
        write(PRICE_KEY, v);
    };
    const saveCustom = (list: CustomReply[]) => {
        setCustom(list);
        write(CUSTOM_KEY, JSON.stringify(list));
    };
    const addCustom = () => {
        if (!title.trim() || !text.trim()) return;
        saveCustom(withCustom(custom, { title, text }, crypto.randomUUID()));
        setTitle("");
        setText("");
        setAdding(false);
    };

    const all: (Reply & { custom?: boolean })[] = [...custom.map((c) => ({ id: c.id, title: c.title, hint: "ردّ من كتابتك.", text: c.text, custom: true })), ...REPLIES];

    const send = (r: string) => {
        if (!target) return;
        const url = target.phone ? waLink(target.phone, r) : gmailLink(target.email ?? "", target.subject ?? "", r);
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>ردود جاهزة{target ? ` · ${target.name}` : ""}</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
                <Alert severity="info">اختر الرد المناسب لما كتبته العيادة. {target ? "«فتح» يفتح محادثتها والرد جاهز، وأنت تضغط «إرسال» بنفسك." : "«نسخ» ينسخ الرد لتلصقه في المحادثة."} راجع النص قبل الإرسال.</Alert>

                <TextField
                    size="small"
                    label="سعر البداية: المبلغ فقط (يأتي بعد «نبدأ عادةً من» في رد السعر)"
                    placeholder="مثال: 3,000 ريال (بدون كلمة من)"
                    value={price}
                    onChange={(e) => changePrice(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 60 } }}
                />

                {all.map((reply) => {
                    const r = renderReply(reply.text, { name: target?.name, price, issue: target?.issue });
                    const canOpen = !!target && !!(target.phone || target.email);
                    return (
                        <Box key={reply.id} sx={{ p: 2, borderRadius: "14px", border: "1px solid", borderColor: reply.stop ? "error.main" : "divider", display: "flex", flexDirection: "column", gap: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                <Typography sx={{ fontWeight: 700, flex: 1 }}>{reply.title}</Typography>
                                {reply.stop && <Chip size="small" color="error" variant="outlined" label="تنهي المحادثة" />}
                                {reply.custom && (
                                    <IconButton size="small" aria-label="حذف الرد" onClick={() => saveCustom(custom.filter((c) => c.id !== reply.id))}>
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{reply.hint}</Typography>
                            <Box sx={{ p: 1.5, borderRadius: "10px", bgcolor: "action.hover", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8 }}>{r.text}</Box>
                            {r.missing.length > 0 && (
                                <Typography sx={{ fontSize: 12.5, color: "warning.main" }}>
                                    {r.missing.includes("price") && "اكتب سعر البداية أعلاه، أو عدّل [السعر] بنفسك. "}
                                    {r.missing.includes("issue") && "لا يوجد عيب مؤكد لهذه الجهة: عدّل [العيب] بنفسك أو لا تستخدم هذا الرد."}
                                </Typography>
                            )}
                            {reply.stop && <Typography sx={{ fontSize: 12.5, color: "error.main" }}>بعد إرسالها سجّل «طلب الإيقاف» لهذه الجهة حتى لا تُراسَل مجددًا.</Typography>}
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<ContentCopyRoundedIcon />}
                                    onClick={async () => {
                                        setCopied((await copy(r.text)) ? reply.id : "");
                                        setTimeout(() => setCopied(""), 1800);
                                    }}
                                >
                                    {copied === reply.id ? "تم النسخ ✓" : "نسخ"}
                                </Button>
                                {canOpen && (
                                    <Button size="small" variant="contained" startIcon={target?.phone ? <WhatsAppIcon /> : <EmailRoundedIcon />} onClick={() => send(r.text)}>
                                        {target?.phone ? "فتح واتساب بهذا الرد" : "فتح Gmail بهذا الرد"}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    );
                })}

                {adding ? (
                    <Box sx={{ p: 2, borderRadius: "14px", border: "1px dashed", borderColor: "divider", display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <TextField size="small" label="عنوان الرد" value={title} onChange={(e) => setTitle(e.target.value)} slotProps={{ htmlInput: { maxLength: 60 } }} />
                        <TextField label="نص الرد" value={text} onChange={(e) => setText(e.target.value)} multiline minRows={3} helperText="يقبل {name} اسم الجهة، و{price} سعر البداية، و{issue} عيب موقعها المؤكد." slotProps={{ htmlInput: { maxLength: 1000 } }} />
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button variant="contained" size="small" onClick={addCustom} disabled={!title.trim() || !text.trim()}>
                                حفظ الرد
                            </Button>
                            <Button size="small" onClick={() => setAdding(false)}>
                                إلغاء
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Button sx={{ alignSelf: "flex-start" }} onClick={() => setAdding(true)}>
                        + رد جديد من كتابتي (يُحفظ في هذا المتصفح)
                    </Button>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>إغلاق</Button>
            </DialogActions>
        </Dialog>
    );
}
