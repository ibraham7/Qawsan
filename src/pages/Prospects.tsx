// /prospects: private lead-generation search with Apollo-style filters.
// Admins only (same sign-in as /admin). In development, /prospects?demo uses generated
// demo records and skips the sign-in so the filters can be tried without a database.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Snackbar,
    Tab as MuiTab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import BookmarksRoundedIcon from "@mui/icons-material/BookmarksRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import AdminGate from "../components/admin/AdminGate";
import Logo from "../components/common/Logo";
import CompanyDrawer from "../components/prospects/CompanyDrawer";
import DiscoverDialog from "../components/prospects/DiscoverDialog";
import FilterSidebar from "../components/prospects/FilterSidebar";
import Results, { ActiveChips } from "../components/prospects/Results";
import { Select } from "../components/prospects/controls";
import { runEnrich } from "../lib/discovery/client";
import type { EnrichOutcome, SearchOutcome } from "../lib/discovery/client";
import { supabaseBackend } from "../lib/prospects/data";
import type { Backend, Meta, Sort } from "../lib/prospects/data";
import { PRESETS } from "../lib/prospects/options";
import { activeCount, chips, clean, decodeState, encodeState, pickPersona } from "../lib/prospects/state";
import type { UrlState } from "../lib/prospects/state";
import type { CompanyRow, Filters, PersonRow, SavedSearch, Tab } from "../lib/prospects/types";
import { supabase } from "../lib/supabase";

const SIDEBAR = 340;
const NO_META: Meta = { lists: [], sequences: [], owners: [], searches: [] };
const nf = new Intl.NumberFormat("en-US");

const SORTS = [
    { value: "newest", label: "الأحدث" },
    { value: "score", label: "الأعلى تقييمًا" },
    { value: "name", label: "بالاسم" },
];

function Workspace({ backend, email }: { backend: Backend; email: string | null }) {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));

    const [state, setState] = useState<UrlState>(() => decodeState(window.location.search));
    const [sidebar, setSidebar] = useState(true);
    const [drawer, setDrawer] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(25);
    const [sort, setSort] = useState<Sort>("newest");
    // results remember their tab so a tab switch never renders people rows as companies
    const [result, setResult] = useState<{ tab: Tab; rows: (PersonRow | CompanyRow)[]; count: number; warnings: string[] }>({ tab: "people", rows: [], count: 0, warnings: [] });
    // key of the last search that finished; loading = the current search has not
    const [doneKey, setDoneKey] = useState("");
    const [error, setError] = useState("");
    const [meta, setMeta] = useState<Meta>(NO_META);
    const [saved, setSaved] = useState<SavedSearch[]>([]);
    const [savedMenu, setSavedMenu] = useState<HTMLElement | null>(null);
    const [naming, setNaming] = useState<null | "search" | "persona">(null);
    const [name, setName] = useState("");
    const [toast, setToast] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [opened, setOpened] = useState<CompanyRow | null>(null);
    const [discover, setDiscover] = useState(false);
    const [enriching, setEnriching] = useState(false);
    // bumped to re-run the current search after data changed on the server
    const [reload, setReload] = useState(0);

    const { tab } = state;
    const filters = state[tab];

    /* ---- url ---- */
    useEffect(() => {
        const qs = encodeState(state) + (backend.demo ? "&demo" : "");
        const url = `${window.location.pathname}?${qs}`;
        if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, "", url);
    }, [state, backend.demo]);

    /* ---- reference data ---- */
    const loadSaved = useCallback(() => {
        backend.savedList().then(setSaved).catch((e: Error) => setError(e.message));
    }, [backend]);
    useEffect(() => {
        backend.meta().then(setMeta).catch((e: Error) => setError(e.message));
        loadSaved();
    }, [backend, loadSaved]);

    /* ---- live search: debounced, last request wins ---- */
    const filterKey = JSON.stringify(clean(filters, tab));
    const searchKey = JSON.stringify([tab, filterKey, page, size, sort, reload]);
    const loading = doneKey !== searchKey;
    const seq = useRef(0);
    useEffect(() => {
        const id = ++seq.current;
        const t = setTimeout(() => {
            backend
                .search(tab, JSON.parse(filterKey) as Filters, page, size, sort)
                .then((r) => {
                    if (id !== seq.current) return;
                    setResult({ ...r, tab });
                    setError("");
                })
                .catch((e: Error) => id === seq.current && setError(e.message))
                .finally(() => id === seq.current && setDoneKey(searchKey));
        }, 300);
        return () => clearTimeout(t);
    }, [backend, tab, filterKey, page, size, sort, reload, searchKey]);

    /* ---- actions ---- */
    const setFilters = (f: Filters) => {
        setPage(0);
        setState((s) => ({ ...s, [s.tab]: f }));
    };
    const clearAll = () => setFilters({});
    const setTab = (t: Tab) => {
        setPage(0);
        setSelected(new Set());
        setState((s) => ({ ...s, tab: t }));
    };
    const apply = (t: Tab, f: Filters) => {
        setPage(0);
        setState((s) => ({ ...s, tab: t, [t]: clean(f, t) }));
    };

    const names = useMemo(
        () => ({
            lists: Object.fromEntries(meta.lists.map((l) => [l.id, l.name])),
            sequences: Object.fromEntries(meta.sequences.map((l) => [l.id, l.name])),
            searches: Object.fromEntries(meta.searches.map((l) => [l.id, l.name])),
        }),
        [meta]
    );
    const activeChips = chips(filters, tab, names);
    const count = activeCount(filters, tab);
    const searches = saved.filter((s) => s.kind !== "persona");
    const personas = saved.filter((s) => s.kind === "persona");

    const saveNamed = async () => {
        const n = name.trim();
        if (!n || !naming) return;
        try {
            if (naming === "persona") await backend.savedCreate(n, "persona", pickPersona(state.people));
            else await backend.savedCreate(n, tab, clean(filters, tab));
            setToast(naming === "persona" ? "حُفظت الـ Persona" : "حُفظ البحث");
            setNaming(null);
            setName("");
            loadSaved();
        } catch (e) {
            setError((e as Error).message);
        }
    };
    const toggle = (id: string) =>
        setSelected((cur) => {
            const next = new Set(cur);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    const toggleAll = (ids: string[], on: boolean) =>
        setSelected((cur) => {
            const next = new Set(cur);
            ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
            return next;
        });

    const afterDiscovery = (r: SearchOutcome) => {
        backend.meta().then(setMeta).catch(() => {});
        // show exactly what this search found
        apply("companies", { searches: [r.searchId] });
        setReload((n) => n + 1);
    };

    const enrich = async () => {
        let ids = [...selected].slice(0, 25);
        setEnriching(true);
        const all: EnrichOutcome["results"] = [];
        try {
            // the server stops before its time limit and hands back what it did not reach
            for (let round = 0; round < 3 && ids.length; round++) {
                const r = await runEnrich(ids);
                all.push(...r.results);
                ids = r.pending;
            }
            const n = (s: string) => all.filter((x) => x.status === s).length;
            setToast(`الإثراء: ${n("done")} وجدنا بيانات · ${n("nothing_found")} بلا بيانات · ${n("no_website")} بلا موقع · ${n("failed")} تعذّر فتحها`);
            setSelected(new Set());
            setReload((x) => x + 1);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setEnriching(false);
        }
    };

    const remove = async (s: SavedSearch) => {
        try {
            await backend.savedRemove(s.id);
            loadSaved();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const sidebarEl = (
        <FilterSidebar
            tab={tab}
            filters={filters}
            meta={meta}
            personas={personas}
            onChange={setFilters}
            onClearAll={clearAll}
            onApplyPersona={(p) => apply("people", { ...state.people, ...p.filters })}
            onSavePersona={() => setNaming("persona")}
            onDeletePersona={remove}
            onClose={() => (wide ? setSidebar(false) : setDrawer(false))}
        />
    );

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
            {/* top bar */}
            <Box
                component="header"
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: { xs: 2, md: 3 },
                    height: 64,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}
            >
                <Box component="a" href="/admin" aria-label="لوحة الإدارة" sx={{ display: "flex" }}>
                    <Logo />
                </Box>
                <Typography component="h1" sx={{ m: 0, fontSize: 18, fontWeight: 700, display: { xs: "none", sm: "block" } }}>
                    العملاء المحتملون
                </Typography>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 64, "& .MuiTab-root": { minHeight: 64, fontWeight: 700 } }}>
                    <MuiTab value="people" label="الأشخاص" />
                    <MuiTab value="companies" label="الشركات" />
                </Tabs>
                <Box sx={{ flex: 1 }} />
                {email && (
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", display: { xs: "none", lg: "block" } }} dir="ltr">
                        {email}
                    </Typography>
                )}
                {!backend.demo && (
                    <Tooltip title="تسجيل الخروج">
                        <IconButton onClick={() => supabase.auth.signOut()} aria-label="تسجيل الخروج">
                            <LogoutRoundedIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {backend.demo && (
                <Alert severity="warning" sx={{ borderRadius: 0 }}>
                    وضع تجريبي (للتطوير فقط): البيانات مولّدة وليست عملاء حقيقيين.
                </Alert>
            )}

            <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
                {wide && sidebar && (
                    <Box
                        sx={{
                            width: SIDEBAR,
                            flex: "none",
                            borderInlineEnd: "1px solid",
                            borderColor: "divider",
                            position: "sticky",
                            top: 64,
                            height: "calc(100vh - 64px)",
                        }}
                    >
                        {sidebarEl}
                    </Box>
                )}
                {!wide && (
                    <Drawer anchor={theme.direction === "rtl" ? "right" : "left"} open={drawer} onClose={() => setDrawer(false)} slotProps={{ paper: { sx: { width: "min(92vw, 380px)" } } }}>
                        {sidebarEl}
                    </Drawer>
                )}

                <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* toolbar */}
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                        {(!wide || !sidebar) && (
                            <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => (wide ? setSidebar(true) : setDrawer(true))}>
                                الفلاتر{count ? ` (${count})` : ""}
                            </Button>
                        )}
                        <Typography sx={{ fontSize: 20, fontWeight: 700 }} aria-live="polite">
                            {result.tab === tab ? nf.format(result.count) : "…"}{" "}
                            <Box component="span" sx={{ fontSize: 14, fontWeight: 500, color: "text.secondary" }}>
                                {tab === "people" ? "شخص" : "شركة"}
                            </Box>
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained" startIcon={<TravelExploreRoundedIcon />} onClick={() => setDiscover(true)}>
                            اكتشاف من Google Maps
                        </Button>
                        <Box sx={{ width: 160 }}>
                            <Select label="الترتيب" value={sort} onChange={(v) => setSort((v ?? "newest") as Sort)} options={SORTS} none={null} />
                        </Box>
                        <Button variant="outlined" startIcon={<BookmarksRoundedIcon />} onClick={(e) => setSavedMenu(e.currentTarget)}>
                            البحوث المحفوظة
                        </Button>
                        <Button variant="outlined" startIcon={<BookmarkAddRoundedIcon />} onClick={() => setNaming("search")} disabled={!count}>
                            حفظ البحث
                        </Button>
                        <Tooltip title="نسخ رابط هذا البحث">
                            <IconButton
                                onClick={() =>
                                    navigator.clipboard.writeText(window.location.href).then(
                                        () => setToast("نُسخ الرابط"),
                                        () => setToast("تعذّر النسخ")
                                    )
                                }
                                aria-label="نسخ رابط هذا البحث"
                            >
                                <LinkRoundedIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <ActiveChips chips={activeChips} filters={filters} onChange={setFilters} onClearAll={clearAll} />

                    {tab === "companies" && selected.size > 0 && (
                        <Box
                            role="region"
                            aria-label="الجهات المحددة"
                            sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5, p: 1.5, borderRadius: "12px", border: "1px solid", borderColor: "primary.main", bgcolor: "action.hover" }}
                        >
                            <Typography sx={{ fontWeight: 700 }}>{selected.size} محدد</Typography>
                            <Button variant="contained" startIcon={<AutoFixHighRoundedIcon />} onClick={enrich} disabled={enriching || backend.demo || selected.size > 25}>
                                {enriching ? "جارٍ الإثراء…" : "إثراء من المواقع"}
                            </Button>
                            <Button onClick={() => setSelected(new Set())} disabled={enriching}>
                                إلغاء التحديد
                            </Button>
                            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                                {selected.size > 25
                                    ? "الحد 25 جهة في المرة الواحدة."
                                    : backend.demo
                                      ? "الإثراء غير متاح في الوضع التجريبي."
                                      : "يفتح موقع كل جهة ويستخرج الإيميل والسوشيال والواتساب. مجاني ولا يستخدم Google."}
                            </Typography>
                        </Box>
                    )}

                    {error && <Alert severity="error">{error}</Alert>}
                    {result.warnings.map((w) => (
                        <Alert key={w} severity="info">
                            {w}
                        </Alert>
                    ))}

                    <Results
                        tab={tab}
                        rows={result.tab === tab ? result.rows : []}
                        count={result.tab === tab ? result.count : 0}
                        loading={loading}
                        page={page}
                        size={size}
                        onPage={setPage}
                        onSize={(s) => {
                            setSize(s);
                            setPage(0);
                        }}
                        selected={selected}
                        onToggle={toggle}
                        onToggleAll={toggleAll}
                        onOpen={setOpened}
                    />
                </Box>
            </Box>

            {/* saved searches + presets */}
            <Menu anchorEl={savedMenu} open={!!savedMenu} onClose={() => setSavedMenu(null)} slotProps={{ paper: { sx: { minWidth: 300 } } }}>
                <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: 12, fontWeight: 700, color: "primary.main" }}>قوالب جاهزة</Typography>
                {PRESETS.map((p) => (
                    <MenuItem
                        key={p.id}
                        onClick={() => {
                            apply(p.tab, p.filters);
                            setSavedMenu(null);
                        }}
                    >
                        <ListItemText primary={p.name} secondary={p.tab === "people" ? "الأشخاص" : "الشركات"} />
                    </MenuItem>
                ))}
                <Divider />
                <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: 12, fontWeight: 700, color: "primary.main" }}>بحوثي المحفوظة</Typography>
                {searches.length === 0 && <Typography sx={{ px: 2, py: 1, fontSize: 13, color: "text.secondary" }}>لا توجد بحوث محفوظة بعد.</Typography>}
                {searches.map((s) => (
                    <MenuItem
                        key={s.id}
                        onClick={() => {
                            apply(s.kind as Tab, s.filters);
                            setSavedMenu(null);
                        }}
                    >
                        <ListItemText primary={s.name} secondary={s.kind === "people" ? "الأشخاص" : "الشركات"} />
                        <IconButton
                            size="small"
                            aria-label={`حذف ${s.name}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                remove(s);
                            }}
                        >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                    </MenuItem>
                ))}
            </Menu>

            <Dialog open={!!naming} onClose={() => setNaming(null)} fullWidth maxWidth="xs">
                <DialogTitle>{naming === "persona" ? "حفظ Persona" : "حفظ البحث"}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
                        {naming === "persona" ? "تُحفظ فلاتر الشخص فقط (المسمى، المستوى، القسم، الموقع…)." : `يُحفظ ${count} فلتر من تبويب ${tab === "people" ? "الأشخاص" : "الشركات"}.`}
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        label="الاسم"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveNamed()}
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNaming(null)}>إلغاء</Button>
                    <Button variant="contained" onClick={saveNamed} disabled={!name.trim()}>
                        حفظ
                    </Button>
                </DialogActions>
            </Dialog>

            <DiscoverDialog open={discover} demo={backend.demo} onClose={() => setDiscover(false)} onDone={afterDiscovery} />
            <CompanyDrawer company={opened} onClose={() => setOpened(null)} />

            <Snackbar open={!!toast} autoHideDuration={toast.startsWith("الإثراء") ? 8000 : 2500} onClose={() => setToast("")} message={toast} />
        </Box>
    );
}

export default function Prospects() {
    const [demo, setDemo] = useState<Backend | null>(null);
    const wantDemo = import.meta.env.DEV && new URLSearchParams(window.location.search).has("demo");

    useEffect(() => {
        document.title = "العملاء المحتملون | قوسان";
        if (!wantDemo) return;
        // the demo module is only reachable in development builds
        Promise.all([import("../lib/prospects/demo"), import("../lib/prospects/data")]).then(([d, data]) =>
            setDemo(data.demoBackend(d.makeDemo()))
        );
    }, [wantDemo]);

    if (wantDemo) return demo ? <Workspace backend={demo} email={null} /> : null;
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AdminGate title="العملاء المحتملون">{(session) => <Workspace backend={supabaseBackend} email={session.user.email ?? null} />}</AdminGate>
        </Box>
    );
}
