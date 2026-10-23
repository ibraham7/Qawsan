import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import Logo from "../components/common/Logo";
import { fetchProjects } from "../data/projects";
import type { Project, ProjectInput } from "../data/projects";
import { IMAGES_BUCKET, PROJECTS_TABLE, supabase } from "../lib/supabase";

const EMPTY: ProjectInput = {
    title: "",
    category: "",
    description: "",
    link: "",
    images: [],
    sort_order: 0,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** path inside our bucket for a public URL we uploaded, or null for anything else */
function storagePath(url: string) {
    const marker = `/storage/v1/object/public/${IMAGES_BUCKET}/`;
    const at = url.indexOf(marker);
    return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}

async function removeImages(urls: string[]) {
    const paths = urls.map(storagePath).filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(IMAGES_BUCKET).remove(paths);
}

/* ------------------------------------------------------------------ */

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError("البريد أو كلمة المرور غير صحيحة.");
        setBusy(false);
    };

    return (
        <Box
            component="form"
            onSubmit={submit}
            sx={{
                width: "100%",
                maxWidth: 420,
                mx: "auto",
                mt: { xs: 8, md: 14 },
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Logo />
            </Box>
            <Typography component="h1" sx={{ m: 0, fontSize: 24, fontWeight: 700, textAlign: "center" }}>
                لوحة الإدارة
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
                label="البريد الإلكتروني"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                label="كلمة المرور"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" size="large" disabled={busy}>
                {busy ? <CircularProgress size={22} color="inherit" /> : "تسجيل الدخول"}
            </Button>
        </Box>
    );
}

/* ------------------------------------------------------------------ */

function ProjectForm({
    initial,
    onCancel,
    onSaved,
}: {
    initial: Project | null;
    onCancel: () => void;
    onSaved: () => void;
}) {
    const [values, setValues] = useState<ProjectInput>(
        initial ? { ...initial } : EMPTY
    );
    const [uploaded, setUploaded] = useState<string[]>([]); // uploaded during this edit
    const [removed, setRemoved] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
        setValues((v) => ({ ...v, [key]: value }));

    const upload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploading(true);
        setError("");
        const urls: string[] = [];
        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/")) continue;
            if (file.size > MAX_IMAGE_BYTES) {
                setError(`الصورة ${file.name} أكبر من 5MB.`);
                continue;
            }
            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `${crypto.randomUUID()}.${ext}`;
            const { error } = await supabase.storage
                .from(IMAGES_BUCKET)
                .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
            if (error) {
                setError(`تعذر رفع ${file.name}: ${error.message}`);
                continue;
            }
            urls.push(supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl);
        }
        setUploaded((u) => [...u, ...urls]);
        setValues((v) => ({ ...v, images: [...v.images, ...urls] }));
        setUploading(false);
    };

    const removeAt = (i: number) => {
        const url = values.images[i];
        setRemoved((r) => [...r, url]);
        set("images", values.images.filter((_, j) => j !== i));
    };

    // RTL list: "earlier" sits on the right
    const move = (i: number, step: -1 | 1) => {
        const j = i + step;
        if (j < 0 || j >= values.images.length) return;
        const next = [...values.images];
        [next[i], next[j]] = [next[j], next[i]];
        set("images", next);
    };

    const cancel = async () => {
        await removeImages(uploaded); // don't leave orphans from an abandoned edit
        onCancel();
    };

    const save = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        const payload = {
            ...values,
            title: values.title.trim(),
            link: values.link.trim(),
            sort_order: Number(values.sort_order) || 0,
        };
        const { error } = initial
            ? await supabase.from(PROJECTS_TABLE).update(payload).eq("id", initial.id)
            : await supabase.from(PROJECTS_TABLE).insert(payload);
        if (error) {
            setError(`تعذر الحفظ: ${error.message}`);
            setSaving(false);
            return;
        }
        await removeImages(removed.filter((url) => !payload.images.includes(url)));
        onSaved();
    };

    return (
        <Dialog open fullWidth maxWidth="md" onClose={cancel} dir="rtl">
            <Box component="form" onSubmit={save}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {initial ? "تعديل المشروع" : "مشروع جديد"}
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="عنوان المشروع"
                        required
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                        value={values.title}
                        onChange={(e) => set("title", e.target.value)}
                    />
                    <TextField
                        label="التصنيف"
                        placeholder="Branding · UI/UX · Development"
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                        value={values.category}
                        onChange={(e) => set("category", e.target.value)}
                    />
                    <TextField
                        label="الوصف"
                        multiline
                        minRows={3}
                        slotProps={{ htmlInput: { maxLength: 1000 } }}
                        value={values.description}
                        onChange={(e) => set("description", e.target.value)}
                    />
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 140px" }, gap: 2 }}>
                        <TextField
                            label="رابط المشروع"
                            type="url"
                            placeholder="https://"
                            slotProps={{ htmlInput: { maxLength: 500, dir: "ltr" } }}
                            value={values.link}
                            onChange={(e) => set("link", e.target.value)}
                        />
                        <TextField
                            label="الترتيب"
                            type="number"
                            value={values.sort_order}
                            onChange={(e) => set("sort_order", Number(e.target.value))}
                        />
                    </Box>

                    {/* IMAGES */}
                    <Box>
                        <Typography sx={{ mb: 1, fontWeight: 600 }}>
                            الصور ({values.images.length}) — الأولى هي صورة الغلاف
                        </Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                                gap: 1.5,
                            }}
                        >
                            {values.images.map((src, i) => (
                                <Box
                                    key={src}
                                    sx={{
                                        position: "relative",
                                        aspectRatio: "16 / 10",
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                        border: "2px solid",
                                        borderColor: i === 0 ? "primary.main" : "divider",
                                    }}
                                >
                                    <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            insetInline: 0,
                                            bottom: 0,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            bgcolor: "rgba(0,0,0,0.55)",
                                            "& button": { color: "#fff" },
                                        }}
                                    >
                                        <IconButton size="small" aria-label="تقديم" onClick={() => move(i, -1)} disabled={i === 0}>
                                            <ChevronRightRoundedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" aria-label="حذف الصورة" onClick={() => removeAt(i)}>
                                            <CloseRoundedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            aria-label="تأخير"
                                            onClick={() => move(i, 1)}
                                            disabled={i === values.images.length - 1}
                                        >
                                            <ChevronLeftRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}

                            <Button
                                component="label"
                                variant="outlined"
                                disabled={uploading}
                                sx={{
                                    aspectRatio: "16 / 10",
                                    flexDirection: "column",
                                    gap: 0.5,
                                    borderStyle: "dashed",
                                    borderRadius: "10px",
                                }}
                            >
                                {uploading ? <CircularProgress size={24} /> : <CloudUploadRoundedIcon />}
                                {uploading ? "جارٍ الرفع…" : "إضافة صور"}
                                <input
                                    hidden
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/avif"
                                    multiple
                                    onChange={(e) => {
                                        upload(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={cancel} disabled={saving}>
                        إلغاء
                    </Button>
                    <Button type="submit" variant="contained" disabled={saving || uploading}>
                        {saving ? <CircularProgress size={22} color="inherit" /> : "حفظ"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

/* ------------------------------------------------------------------ */

function Dashboard({ session }: { session: Session }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState<Project | null | "new">(null);
    const [deleting, setDeleting] = useState<Project | null>(null);
    const [busyDelete, setBusyDelete] = useState(false);

    const load = useCallback(
        () =>
            fetchProjects()
                .then((rows) => {
                    setProjects(rows);
                    setError("");
                })
                .catch((e: Error) => setError(`تعذر تحميل المشاريع: ${e.message}`))
                .finally(() => setLoading(false)),
        []
    );

    useEffect(() => {
        load();
    }, [load]);

    const confirmDelete = async () => {
        if (!deleting) return;
        setBusyDelete(true);
        const { error } = await supabase.from(PROJECTS_TABLE).delete().eq("id", deleting.id);
        if (error) setError(`تعذر الحذف: ${error.message}`);
        else await removeImages(deleting.images);
        setBusyDelete(false);
        setDeleting(null);
        load();
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box>
                    <Typography component="h1" sx={{ m: 0, fontSize: { xs: 24, md: 32 }, fontWeight: 700 }}>
                        المشاريع
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 14 }} dir="ltr">
                        {session.user.email}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditing("new")}>
                        مشروع جديد
                    </Button>
                    <Tooltip title="تسجيل الخروج">
                        <IconButton onClick={() => supabase.auth.signOut()} aria-label="تسجيل الخروج">
                            <LogoutRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : projects.length === 0 ? (
                <Typography sx={{ textAlign: "center", color: "text.secondary", py: 10 }}>
                    لا توجد مشاريع بعد.
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {projects.map((p) => (
                        <Box
                            key={p.id}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "96px 1fr", sm: "160px 1fr auto" },
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                borderRadius: "14px",
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Box
                                sx={{
                                    aspectRatio: "16 / 10",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    bgcolor: "rgba(0,208,132,0.08)",
                                }}
                            >
                                {p.images[0] && (
                                    <Box component="img" src={p.images[0]} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                )}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 17 }} noWrap>
                                    {p.title}
                                </Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: 13 }} noWrap>
                                    #{p.sort_order} · {p.images.length} صور · {p.category || "—"}
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5, gridColumn: { xs: "1 / -1", sm: "auto" }, justifyContent: "flex-end" }}>
                                {p.link && (
                                    <Tooltip title="فتح الموقع">
                                        <IconButton component="a" href={p.link} target="_blank" rel="noopener noreferrer" aria-label="فتح الموقع">
                                            <OpenInNewRoundedIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="تعديل">
                                    <IconButton onClick={() => setEditing(p)} aria-label="تعديل">
                                        <EditRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="حذف">
                                    <IconButton color="error" onClick={() => setDeleting(p)} aria-label="حذف">
                                        <DeleteOutlineRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {editing && (
                <ProjectForm
                    initial={editing === "new" ? null : editing}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        load();
                    }}
                />
            )}

            <Dialog open={!!deleting} onClose={() => setDeleting(null)} dir="rtl">
                <DialogTitle>حذف المشروع؟</DialogTitle>
                <DialogContent>
                    سيتم حذف «{deleting?.title}» وصوره المرفوعة نهائيًا.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleting(null)}>إلغاء</Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={busyDelete}>
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

/* ------------------------------------------------------------------ */

function Admin() {
    const [session, setSession] = useState<Session | null>(null);
    // admin check result, remembered per user so a new sign-in re-checks
    const [adminCheck, setAdminCheck] = useState<{ userId: string; ok: boolean } | null>(null);
    const [ready, setReady] = useState(false);
    const userId = session?.user.id;
    const isAdmin = adminCheck && adminCheck.userId === userId ? adminCheck.ok : null;

    useEffect(() => {
        document.title = "لوحة الإدارة | قوسان";
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setReady(true);
        });
        const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;
        supabase
            .rpc("is_qawsan_admin")
            .then(({ data }) => setAdminCheck({ userId, ok: data === true }));
    }, [userId]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
                {!ready || (session && isAdmin === null) ? (
                    <Box sx={{ display: "grid", placeItems: "center", py: 20 }}>
                        <CircularProgress />
                    </Box>
                ) : !session ? (
                    <LoginForm />
                ) : !isAdmin ? (
                    <Box sx={{ maxWidth: 520, mx: "auto", mt: 14, textAlign: "center" }}>
                        <Alert severity="warning" sx={{ mb: 2, textAlign: "right" }}>
                            هذا الحساب لا يملك صلاحية الإدارة.
                        </Alert>
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }} dir="ltr">
                            {session.user.id}
                        </Typography>
                        <Button sx={{ mt: 2 }} onClick={() => supabase.auth.signOut()}>
                            تسجيل الخروج
                        </Button>
                    </Box>
                ) : (
                    <Dashboard session={session} />
                )}
            </Container>
        </Box>
    );
}

export default Admin;
