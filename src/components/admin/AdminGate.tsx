// Shared sign-in + admin check for the private pages (/admin, /prospects).

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";

import Logo from "../common/Logo";
import { supabase } from "../../lib/supabase";

function LoginForm({ title }: { title: string }) {
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
                {title}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField label="البريد الإلكتروني" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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

/** renders children(session) only for a signed-in qawsan admin */
export default function AdminGate({ title, children }: { title: string; children: (session: Session) => ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    // admin check result, remembered per user so a new sign-in re-checks
    const [adminCheck, setAdminCheck] = useState<{ userId: string; ok: boolean } | null>(null);
    const [ready, setReady] = useState(false);
    const userId = session?.user.id;
    const isAdmin = adminCheck && adminCheck.userId === userId ? adminCheck.ok : null;

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setReady(true);
        });
        const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => data.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;
        supabase.rpc("is_qawsan_admin").then(({ data }) => setAdminCheck({ userId, ok: data === true }));
    }, [userId]);

    if (!ready || (session && isAdmin === null)) {
        return (
            <Box sx={{ display: "grid", placeItems: "center", py: 20 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (!session) return <LoginForm title={title} />;
    if (!isAdmin) {
        return (
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
        );
    }
    return <>{children(session)}</>;
}
