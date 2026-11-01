import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Chip, CircularProgress, Typography } from "@mui/material";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import { supabase } from "../../lib/supabase";

interface Row {
    id: string;
    name: string;
    role: string;
    rating: number;
    text: string;
    locale: string;
    approved: boolean;
    created_at: string;
}

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

/** Moderation of the reviews customers send from /review: approve, hide or delete. */
function ReviewsAdmin() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(
        () =>
            supabase
                .from("qawsan_reviews")
                .select("id, name, role, rating, text, locale, approved, created_at")
                .order("created_at", { ascending: false })
                .then(({ data, error: err }) => {
                    if (err) setError(`تعذر تحميل التقييمات: ${err.message}`);
                    else {
                        setRows((data ?? []) as Row[]);
                        setError("");
                    }
                    setLoading(false);
                }),
        []
    );

    useEffect(() => {
        load();
    }, [load]);

    const setApproved = async (id: string, approved: boolean) => {
        setBusy(id);
        const { error: err } = await supabase
            .from("qawsan_reviews")
            .update({ approved, updated_at: new Date().toISOString() })
            .eq("id", id);
        if (err) setError(`تعذر الحفظ: ${err.message}`);
        setBusy(null);
        load();
    };

    const remove = async (id: string) => {
        if (!window.confirm("حذف هذا التقييم نهائيًا؟")) return;
        setBusy(id);
        const { error: err } = await supabase.from("qawsan_reviews").delete().eq("id", id);
        if (err) setError(`تعذر الحذف: ${err.message}`);
        setBusy(null);
        load();
    };

    const pending = rows.filter((r) => !r.approved).length;

    return (
        <Box sx={{ mt: 8 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography component="h2" sx={{ m: 0, fontSize: { xs: 22, md: 28 }, fontWeight: 700 }}>
                    تقييمات العملاء
                </Typography>
                {pending > 0 && <Chip color="warning" size="small" label={`${pending} بانتظار الموافقة`} />}
            </Box>
            <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3 }}>
                رابط التقييم الذي ترسله لعملائك:{" "}
                <Box component="span" dir="ltr" sx={{ fontWeight: 600 }}>
                    qawsan.website/review
                </Box>
                . لا يظهر أي تقييم للزوار قبل أن توافق عليه هنا.
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : rows.length === 0 ? (
                <Typography sx={{ color: "text.secondary" }}>لا توجد تقييمات بعد.</Typography>
            ) : (
                <Box sx={{ display: "grid", gap: 1.5 }}>
                    {rows.map((r) => (
                        <Box
                            key={r.id}
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: r.approved ? "divider" : "warning.main",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 1 }}>
                                <Typography sx={{ color: "#FFC83D", letterSpacing: 2 }} dir="ltr">
                                    {stars(r.rating)}
                                </Typography>
                                <Typography sx={{ fontWeight: 600 }}>{r.name}</Typography>
                                {r.role && <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{r.role}</Typography>}
                                <Chip size="small" variant="outlined" label={r.locale.toUpperCase()} />
                                <Chip size="small" color={r.approved ? "success" : "warning"} label={r.approved ? "منشور" : "بانتظار الموافقة"} />
                                <Typography sx={{ color: "text.secondary", fontSize: 12.5, marginInlineStart: "auto" }} dir="ltr">
                                    {new Date(r.created_at).toLocaleString()}
                                </Typography>
                            </Box>

                            <Typography sx={{ m: 0, mb: 2, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{r.text}</Typography>

                            <Box sx={{ display: "flex", gap: 1 }}>
                                {r.approved ? (
                                    <Button size="small" startIcon={<VisibilityOffRoundedIcon />} disabled={busy === r.id} onClick={() => setApproved(r.id, false)}>
                                        إخفاء
                                    </Button>
                                ) : (
                                    <Button size="small" variant="contained" startIcon={<CheckRoundedIcon />} disabled={busy === r.id} onClick={() => setApproved(r.id, true)}>
                                        موافقة ونشر
                                    </Button>
                                )}
                                <Button size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} disabled={busy === r.id} onClick={() => remove(r.id)}>
                                    حذف
                                </Button>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default ReviewsAdmin;
