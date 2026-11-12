// "لا ترسل": phone numbers and emails that must never be contacted.

import { useMemo, useState } from "react";
import { Alert, Box, Button, IconButton, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import type { Suppression } from "../../lib/prospects/data";

const REASON: Record<string, string> = { manual: "يدويًا", stop_reply: "ردّ بكلمة إيقاف", unsubscribe_link: "رابط إلغاء الاشتراك" };

export default function SuppressionsTab({
    items,
    onAdd,
    onRemove,
}: {
    items: Suppression[];
    onAdd: (value: string, note: string) => Promise<void>;
    onRemove: (s: Suppression) => Promise<void>;
}) {
    const [value, setValue] = useState("");
    const [note, setNote] = useState("");
    const [q, setQ] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const shown = useMemo(() => {
        const needle = q.trim().toLowerCase().replace(/^\+/, "");
        return needle ? items.filter((i) => i.value.includes(needle) || i.note.toLowerCase().includes(needle)) : items;
    }, [items, q]);

    const add = async () => {
        setBusy(true);
        setError("");
        try {
            await onAdd(value, note);
            setValue("");
            setNote("");
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: "20px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Typography component="h2" sx={{ m: 0, fontSize: 19, fontWeight: 700 }}>
                    قائمة «لا ترسل»
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: 0.5, mb: 2.5 }}>
                    أي رقم أو إيميل هنا تتجاهله كل الحملات. يُضاف يدويًا، أو تلقائيًا عند الرد بكلمة «إيقاف» أو الضغط على رابط إلغاء الاشتراك (مع الحملات).
                </Typography>
                <Box
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        add();
                    }}
                    sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr auto" }, gap: 1.5, alignItems: "start" }}
                >
                    <TextField label="رقم دولي أو إيميل" value={value} onChange={(e) => setValue(e.target.value)} placeholder="+90 5xx xxx xx xx" slotProps={{ htmlInput: { dir: "ltr", maxLength: 320 } }} />
                    <TextField label="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} slotProps={{ htmlInput: { maxLength: 300 } }} />
                    <Button type="submit" variant="contained" size="large" disabled={busy || !value.trim()} sx={{ height: 56 }}>
                        إضافة
                    </Button>
                </Box>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Box>

            <Box sx={{ borderRadius: "16px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 700 }}>{items.length} محظور</Typography>
                    <Box sx={{ flex: 1 }} />
                    <TextField
                        size="small"
                        placeholder="بحث"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
                    />
                </Box>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 560 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>القيمة</TableCell>
                                <TableCell>النوع</TableCell>
                                <TableCell>السبب</TableCell>
                                <TableCell>ملاحظة</TableCell>
                                <TableCell>التاريخ</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shown.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                                        {items.length ? "لا توجد نتائج." : "القائمة فارغة."}
                                    </TableCell>
                                </TableRow>
                            )}
                            {shown.map((s) => (
                                <TableRow key={s.id} hover>
                                    <TableCell dir="ltr" sx={{ textAlign: "end", fontVariantNumeric: "tabular-nums" }}>
                                        {s.kind === "phone" ? `+${s.value}` : s.value}
                                    </TableCell>
                                    <TableCell>{s.kind === "phone" ? "هاتف" : "إيميل"}</TableCell>
                                    <TableCell>{REASON[s.reason] ?? s.reason}</TableCell>
                                    <TableCell sx={{ color: "text.secondary" }}>{s.note || "—"}</TableCell>
                                    <TableCell dir="ltr" sx={{ textAlign: "end", whiteSpace: "nowrap" }}>
                                        {new Date(s.created_at).toLocaleDateString("en-GB")}
                                    </TableCell>
                                    <TableCell padding="checkbox">
                                        <Tooltip title="إزالة من القائمة">
                                            <IconButton size="small" onClick={() => onRemove(s)} aria-label={`إزالة ${s.value}`}>
                                                <DeleteOutlineRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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
