// "استيراد من CSV": add a list of companies you already have (a sheet, another tool's export). The file is
// read in the browser; the person checks which column is which and sees what will be added and what is
// skipped (and why) before anything is saved. Companies come in as "needs review". Rules: lib/prospects/csvimport.ts.

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import { COUNTRIES, FIELDS, FIELD_LABEL, MAX_FILE_BYTES, MAX_ROWS, detectColumns, parseCsv, planImport } from "../../lib/prospects/csvimport";
import type { Existing, Field, Mapping } from "../../lib/prospects/csvimport";
import type { Backend } from "../../lib/prospects/data";

const NONE = "-1";

export default function ImportCsvDialog({ backend, open, onClose, onDone }: { backend: Backend; open: boolean; onClose: () => void; onDone: (added: number) => void }) {
    const input = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");
    const [table, setTable] = useState<string[][] | null>(null);
    const [mapping, setMapping] = useState<Mapping>({});
    const [country, setCountry] = useState("Saudi Arabia");
    const [existing, setExisting] = useState<Existing | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    // what is already saved, to skip duplicates (loaded when the dialog opens)
    useEffect(() => {
        if (!open) return;
        let live = true;
        backend.existingKeys().then(
            (x) => live && setExisting(x),
            (e: Error) => live && setError(e.message)
        );
        return () => {
            live = false;
        };
    }, [open, backend]);

    const headers = table?.[0] ?? [];
    const rows = useMemo(() => table?.slice(1) ?? [], [table]);
    const plan = useMemo(() => (existing && rows.length ? planImport(rows, mapping, country, existing) : null), [rows, mapping, country, existing]);

    const reset = () => {
        setFileName("");
        setTable(null);
        setMapping({});
        setError("");
    };
    const close = () => {
        if (busy) return;
        reset();
        onClose();
    };

    const pick = async (file: File | undefined) => {
        if (!file) return;
        setError("");
        if (file.size > MAX_FILE_BYTES) return setError("الملف كبير (الحد 1 ميغابايت). قسّمه إلى ملفين.");
        const parsed = parseCsv(await file.text());
        if (parsed.length < 2) return setError("لم أجد صفوفًا في الملف. تأكد أن السطر الأول عناوين الأعمدة وأن الملف بصيغة CSV.");
        setFileName(file.name);
        setTable(parsed);
        setMapping(detectColumns(parsed[0]));
    };

    const save = async () => {
        if (!plan?.add.length) return;
        setBusy(true);
        setError("");
        try {
            const n = await backend.importCompanies(plan.add);
            reset();
            onDone(n);
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const nameMissing = mapping.name === undefined;

    return (
        <Dialog open={open} onClose={close} fullWidth maxWidth="md">
            <DialogTitle>استيراد جهات من ملف CSV</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
                <Alert severity="info">
                    السطر الأول في الملف عناوين الأعمدة (الاسم، الهاتف، الإيميل، الموقع…). تُضاف الجهات بحالة «بحاجة لمراجعة»، ثم تعتمدها وتعمل لها «إثراء» و«فحص جودة الموقع». لا يُحفظ شيء قبل أن تراجع المعاينة وتؤكد. الحد {MAX_ROWS} صف في المرة الواحدة.
                </Alert>
                {error && <Alert severity="error">{error}</Alert>}

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                    <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={() => input.current?.click()} disabled={busy}>
                        {fileName ? "اختيار ملف آخر" : "اختيار ملف CSV"}
                    </Button>
                    <input
                        ref={input}
                        type="file"
                        accept=".csv,.txt,text/csv,text/plain"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            void pick(f);
                        }}
                    />
                    {fileName && (
                        <Typography sx={{ fontSize: 14 }}>
                            <bdi>{fileName}</bdi> · <bdi>{rows.length}</bdi> صف
                        </Typography>
                    )}
                </Box>

                {table && !existing && !error && <LinearProgress />}

                {table && (
                    <>
                        <Box>
                            <Typography sx={{ fontWeight: 700, mb: 1 }}>أي عمود هو أي؟</Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
                                {FIELDS.map((f: Field) => (
                                    <TextField
                                        key={f}
                                        select
                                        size="small"
                                        label={FIELD_LABEL[f]}
                                        value={mapping[f] === undefined ? NONE : String(mapping[f])}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setMapping((m) => {
                                                const next = { ...m };
                                                if (v === NONE) delete next[f];
                                                else next[f] = Number(v);
                                                return next;
                                            });
                                        }}
                                        error={f === "name" && nameMissing}
                                    >
                                        <MenuItem value={NONE}>— لا يوجد —</MenuItem>
                                        {headers.map((h, i) => (
                                            <MenuItem key={i} value={String(i)}>
                                                {h.trim() || `عمود ${i + 1}`}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                ))}
                                <TextField select size="small" label="الدولة الافتراضية" value={country} onChange={(e) => setCountry(e.target.value)} helperText="للأرقام المحلية وعند غياب عمود الدولة">
                                    {COUNTRIES.map((c) => (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                            {nameMissing && <Alert severity="warning" sx={{ mt: 1.5 }}>اختر عمود «الاسم» ليمكن الاستيراد.</Alert>}
                        </Box>

                        {plan && !nameMissing && (
                            <Box>
                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                                    ستُضاف <bdi>{plan.add.length}</bdi> جهة · يُتخطّى <bdi>{plan.skipped.length}</bdi>
                                </Typography>
                                {plan.tooMany && <Alert severity="warning" sx={{ mb: 1 }}>الملف فيه أكثر من {MAX_ROWS} صف: سيُستورد أول {MAX_ROWS} فقط. استورد الباقي في ملف ثانٍ.</Alert>}
                                {plan.add.length > 0 && (
                                    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "12px", overflow: "auto", maxHeight: 220 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>الاسم</TableCell>
                                                    <TableCell>الهاتف</TableCell>
                                                    <TableCell>الإيميل</TableCell>
                                                    <TableCell>الموقع</TableCell>
                                                    <TableCell>المدينة</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {plan.add.slice(0, 8).map((c, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                                                        <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.phone || "—"}</TableCell>
                                                        <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.email || "—"}</TableCell>
                                                        <TableCell dir="ltr" sx={{ textAlign: "end" }}>{c.website.replace(/^https?:\/\//, "") || "—"}</TableCell>
                                                        <TableCell>{c.city || "—"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                                {plan.add.length > 8 && <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.5 }}>أول 8 من {plan.add.length}.</Typography>}
                                {plan.skipped.length > 0 && (
                                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 1, lineHeight: 1.9 }}>
                                        المتخطّاة: {plan.skipped.slice(0, 8).map((s) => `سطر ${s.line} «${s.name}»: ${s.reason}`).join(" · ")}
                                        {plan.skipped.length > 8 ? ` · و${plan.skipped.length - 8} أخرى` : ""}
                                    </Typography>
                                )}
                                {plan.warnings.length > 0 && (
                                    <Typography sx={{ fontSize: 12.5, color: "warning.main", mt: 1, lineHeight: 1.9 }}>
                                        تنبيهات ({plan.warnings.length}): {plan.warnings.slice(0, 4).map((w) => `سطر ${w.line}: ${w.text}`).join(" · ")}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={close} disabled={busy}>
                    إلغاء
                </Button>
                <Button variant="contained" onClick={save} disabled={busy || nameMissing || !plan?.add.length}>
                    {busy ? "جارٍ الاستيراد…" : `استيراد ${plan?.add.length ?? 0} جهة`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
