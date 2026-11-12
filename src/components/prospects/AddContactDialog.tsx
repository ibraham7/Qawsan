// "إضافة جهة يدويًا": a company you found yourself, saved with status "needs review".

import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";

import type { NewCompany } from "../../lib/prospects/data";

const EMPTY: NewCompany = { name: "", phone: "", email: "", website: "", country: "", city: "", notes: "" };

export default function AddContactDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (c: NewCompany) => Promise<void> }) {
    const [v, setV] = useState<NewCompany>(EMPTY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const set = (k: keyof NewCompany) => (e: React.ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

    const emailBad = !!v.email.trim() && !/^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i.test(v.email.trim());
    const ok = v.name.trim().length >= 2 && (v.phone.trim() || v.email.trim()) && !emailBad;

    const close = () => {
        if (busy) return;
        setV(EMPTY);
        setError("");
        onClose();
    };
    const save = async () => {
        setBusy(true);
        setError("");
        try {
            await onSave(v);
            setV(EMPTY);
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
            <DialogTitle>إضافة جهة يدويًا</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>تُحفظ بحالة «يحتاج مراجعة». اكتب رقم الهاتف بصيغة دولية (مثل ‎+90 5xx…‎) ليُعرف إن كان جوالًا.</Typography>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField label="الاسم *" value={v.name} onChange={set("name")} autoFocus slotProps={{ htmlInput: { maxLength: 200 } }} />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField label="رقم الهاتف" value={v.phone} onChange={set("phone")} slotProps={{ htmlInput: { dir: "ltr", inputMode: "tel", maxLength: 40 } }} />
                    <TextField label="الإيميل" value={v.email} onChange={set("email")} error={emailBad} helperText={emailBad ? "إيميل غير صحيح" : " "} slotProps={{ htmlInput: { dir: "ltr", inputMode: "email", maxLength: 320 } }} />
                    <TextField label="الموقع الإلكتروني" value={v.website} onChange={set("website")} slotProps={{ htmlInput: { dir: "ltr", maxLength: 500 } }} />
                    <TextField label="الدولة" value={v.country} onChange={set("country")} placeholder="Türkiye" />
                    <TextField label="المدينة" value={v.city} onChange={set("city")} placeholder="Istanbul" />
                </Box>
                <TextField label="ملاحظات" value={v.notes} onChange={set("notes")} multiline minRows={2} slotProps={{ htmlInput: { maxLength: 2000 } }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={close} disabled={busy}>
                    إلغاء
                </Button>
                <Button variant="contained" onClick={save} disabled={busy || !ok}>
                    حفظ
                </Button>
            </DialogActions>
        </Dialog>
    );
}
