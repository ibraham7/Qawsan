// /prospects: "التسويق". Discover companies on Google Maps, review and approve them, keep a
// do-not-contact list. Campaigns, email and reports arrive in later stages.
// Admins only (same sign-in as /admin). In development, /prospects?demo uses generated demo
// records and skips the sign-in so the page can be tried without a database.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    ButtonBase,
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
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import BookmarksRoundedIcon from "@mui/icons-material/BookmarksRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import AdminGate from "../components/admin/AdminGate";
import Logo from "../components/common/Logo";
import AddContactDialog from "../components/prospects/AddContactDialog";
import ComingSoon from "../components/prospects/ComingSoon";
import CompanyDrawer from "../components/prospects/CompanyDrawer";
import DiscoverCard from "../components/prospects/DiscoverCard";
import FilterSidebar from "../components/prospects/FilterSidebar";
import Results, { ActiveChips } from "../components/prospects/Results";
import SettingsTab from "../components/prospects/SettingsTab";
import SuppressionsTab from "../components/prospects/SuppressionsTab";
import { Select } from "../components/prospects/controls";
import { runEnrich } from "../lib/discovery/client";
import type { EnrichOutcome, SearchOutcome } from "../lib/discovery/client";
import { supabaseBackend } from "../lib/prospects/data";
import type { Backend, Meta, Sort, Suppression } from "../lib/prospects/data";
import { PRESETS, STATUSES } from "../lib/prospects/options";
import { activeCount, chips, clean, decodeState, encodeState, pickPersona } from "../lib/prospects/state";
import type { UrlState } from "../lib/prospects/state";
import type { CompanyRow, Filters, PersonRow, SavedSearch, Tab } from "../lib/prospects/types";
import { supabase } from "../lib/supabase";

const NO_META: Meta = { lists: [], sequences: [], owners: [], searches: [] };
const nf = new Intl.NumberFormat("en-US");

const SORTS = [
    { value: "newest", label: "الأحدث" },
    { value: "score", label: "الأعلى تقييمًا" },
    { value: "name", label: "بالاسم" },
];

type View = "discover" | "campaigns" | "email" | "reports" | "suppressions" | "settings";
const VIEWS: { id: View; label: string }[] = [
    { id: "discover", label: "اكتشاف العملاء" },
    { id: "campaigns", label: "الحملات" },
    { id: "email", label: "الإيميل" },
    { id: "reports", label: "التقارير" },
    { id: "suppressions", label: "لا ترسل" },
    { id: "settings", label: "الإعدادات" },
];
const readView = (): View => {
    const v = new URLSearchParams(window.location.search).get("view");
    return VIEWS.some((x) => x.id === v) ? (v as View) : "discover";
};

/* ------------------------------------------------------------------ */
/* discovery tab                                                        */

function Discovery({
    backend,
    blocked,
    state,
    setState,
    onCampaign,
}: {
    backend: Backend;
    blocked: Set<string>;
    state: UrlState;
    setState: React.Dispatch<React.SetStateAction<UrlState>>;
    onCampaign: () => void;
}) {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));

    const [sidebar, setSidebar] = useState(true);
    const [drawer, setDrawer] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(25);
    const [sort, setSort] = useState<Sort>("newest");
    // results remember their tab so a tab switch never renders people rows as companies
    const [result, setResult] = useState<{ tab: Tab; rows: (PersonRow | CompanyRow)[]; count: number; warnings: string[] }>({ tab: "companies", rows: [], count: 0, warnings: [] });
    // key of the last search that finished; loading = the current search has not
    const [doneKey, setDoneKey] = useState("");
    const [error, setError] = useState("");
    const [meta, setMeta] = useState<Meta>(NO_META);
    const [saved, setSaved] = useState<SavedSearch[]>([]);
    const [savedMenu, setSavedMenu] = useState<HTMLElement | null>(null);
    const [statusMenu, setStatusMenu] = useState<HTMLElement | null>(null);
    const [naming, setNaming] = useState<null | "search" | "persona">(null);
    const [name, setName] = useState("");
    const [toast, setToast] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [opened, setOpened] = useState<CompanyRow | null>(null);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [busy, setBusy] = useState(false);
    // bumped to re-run the current search after data changed on the server
    const [reload, setReload] = useState(0);

    const { tab } = state;
    const filters = state[tab];

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

    const run = async (fn: () => Promise<void>, done?: string) => {
        setBusy(true);
        try {
            await fn();
            if (done) setToast(done);
            setReload((x) => x + 1);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

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
        setBusy(true);
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
            setBusy(false);
        }
    };

    const removeSaved = async (s: SavedSearch) => {
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
            onDeletePersona={removeSaved}
            onClose={() => (wide ? setSidebar(false) : setDrawer(false))}
        />
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <DiscoverCard demo={backend.demo} onDone={afterDiscovery} />

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button variant="outlined" size="large" startIcon={<AddRoundedIcon />} onClick={() => setAdding(true)}>
                    إضافة جهة يدويًا
                </Button>
                <Button variant="contained" size="large" startIcon={<CampaignRoundedIcon />} onClick={onCampaign}>
                    إنشاء حملة من المعتمدين
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {result.warnings.map((w) => (
                <Alert key={w} severity="info">
                    {w}
                </Alert>
            ))}

            <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                {wide && sidebar && (
                    <Box
                        sx={{
                            width: 320,
                            flex: "none",
                            position: "sticky",
                            top: 16,
                            height: "calc(100vh - 32px)",
                            borderRadius: "20px",
                            border: "1px solid",
                            borderColor: "divider",
                            overflow: "hidden",
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

                <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* toolbar */}
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                        {(!wide || !sidebar) && (
                            <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => (wide ? setSidebar(true) : setDrawer(true))}>
                                الفلاتر{count ? ` (${count})` : ""}
                            </Button>
                        )}
                        <ToggleButtonGroup exclusive size="small" value={tab} onChange={(_, v) => v && setTab(v)} aria-label="نوع السجلات">
                            <ToggleButton value="companies" sx={{ px: 2 }}>
                                الجهات
                            </ToggleButton>
                            <ToggleButton value="people" sx={{ px: 2 }}>
                                الأشخاص
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Typography sx={{ fontSize: 15, color: "text.secondary" }} aria-live="polite">
                            <Box component="span" sx={{ fontSize: 18, fontWeight: 700, color: "text.primary" }}>
                                {result.tab === tab ? nf.format(result.count) : "…"}
                            </Box>{" "}
                            {tab === "people" ? "شخص" : "جهة"}
                        </Typography>
                        <Box sx={{ flex: 1 }} />
                        <Box sx={{ width: 150 }}>
                            <Select label="الترتيب" value={sort} onChange={(v) => setSort((v ?? "newest") as Sort)} options={SORTS} none={null} />
                        </Box>
                        <Tooltip title="البحوث المحفوظة والقوالب">
                            <IconButton onClick={(e) => setSavedMenu(e.currentTarget)} aria-label="البحوث المحفوظة والقوالب">
                                <BookmarksRoundedIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="حفظ البحث">
                            <span>
                                <IconButton onClick={() => setNaming("search")} disabled={!count} aria-label="حفظ البحث">
                                    <BookmarkAddRoundedIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
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
                            sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, p: 1.5, borderRadius: "14px", border: "1px solid", borderColor: "primary.main", bgcolor: "action.hover" }}
                        >
                            <Typography sx={{ fontWeight: 700, mx: 1 }}>{selected.size} محدد</Typography>
                            <Button variant="contained" startIcon={<LabelRoundedIcon />} onClick={(e) => setStatusMenu(e.currentTarget)} disabled={busy}>
                                تغيير الحالة
                            </Button>
                            <Tooltip title={selected.size > 25 ? "الحد 25 جهة في المرة الواحدة" : backend.demo ? "غير متاح في الوضع التجريبي" : "يستخرج الإيميل والسوشيال والواتساب من موقع كل جهة. مجاني."}>
                                <span>
                                    <Button variant="outlined" startIcon={<AutoFixHighRoundedIcon />} onClick={enrich} disabled={busy || backend.demo || selected.size > 25}>
                                        {busy ? "جارٍ العمل…" : "إثراء من المواقع"}
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setDeleting(true)} disabled={busy}>
                                حذف نهائي
                            </Button>
                            <Button onClick={() => setSelected(new Set())} disabled={busy}>
                                إلغاء التحديد
                            </Button>
                        </Box>
                    )}

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
                        blocked={blocked}
                    />
                </Box>
            </Box>

            {/* status menu: only the statuses an admin may set by hand */}
            <Menu anchorEl={statusMenu} open={!!statusMenu} onClose={() => setStatusMenu(null)}>
                <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: 12, color: "text.secondary" }}>«اعتماد» لا يرسل شيئًا، بل يجعل الجهة قابلة للدخول في حملة.</Typography>
                {STATUSES.filter((s) => s.manual).map((s) => (
                    <MenuItem
                        key={s.value}
                        onClick={() => {
                            setStatusMenu(null);
                            const ids = [...selected];
                            run(async () => {
                                await backend.setStatus(ids, s.value);
                                setSelected(new Set());
                            }, `تم: ${s.label} (${ids.length})`);
                        }}
                    >
                        {s.label}
                    </MenuItem>
                ))}
            </Menu>

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
                        <ListItemText primary={p.name} secondary={p.tab === "people" ? "الأشخاص" : "الجهات"} />
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
                        <ListItemText primary={s.name} secondary={s.kind === "people" ? "الأشخاص" : "الجهات"} />
                        <IconButton
                            size="small"
                            aria-label={`حذف ${s.name}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                removeSaved(s);
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
                        {naming === "persona" ? "تُحفظ فلاتر الشخص فقط (المسمى، المستوى، القسم، الموقع…)." : `يُحفظ ${count} فلتر من تبويب ${tab === "people" ? "الأشخاص" : "الجهات"}.`}
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

            <Dialog open={deleting} onClose={() => !busy && setDeleting(false)} maxWidth="xs" fullWidth>
                <DialogTitle>حذف {selected.size} جهة نهائيًا؟</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14 }}>لا يمكن التراجع. الأرقام والإيميلات الموجودة في قائمة «لا ترسل» تبقى محفوظة فيها.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleting(false)} disabled={busy}>
                        إلغاء
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        disabled={busy}
                        onClick={() => {
                            const ids = [...selected];
                            run(async () => {
                                await backend.removeCompanies(ids);
                                setSelected(new Set());
                                setDeleting(false);
                            }, `حُذفت ${ids.length} جهة`);
                        }}
                    >
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>

            <AddContactDialog
                open={adding}
                onClose={() => setAdding(false)}
                onSave={async (c) => {
                    await backend.addCompany(c);
                    apply("companies", {});
                    setSort("newest");
                    setReload((x) => x + 1);
                    setToast("أُضيفت الجهة");
                }}
            />
            <CompanyDrawer company={opened} onClose={() => setOpened(null)} />

            <Snackbar open={!!toast} autoHideDuration={toast.startsWith("الإثراء") ? 8000 : 2500} onClose={() => setToast("")} message={toast} />
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* page shell                                                           */

function Marketing({ backend, email }: { backend: Backend; email: string | null }) {
    const [view, setView] = useState<View>(readView);
    const [state, setState] = useState<UrlState>(() => decodeState(window.location.search));
    const [blockedList, setBlockedList] = useState<Suppression[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const qs = encodeState(state) + (view !== "discover" ? `&view=${view}` : "") + (backend.demo ? "&demo" : "");
        const url = `${window.location.pathname}?${qs}`;
        if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, "", url);
    }, [state, view, backend.demo]);

    const loadBlocked = useCallback(() => {
        backend.suppressions().then(setBlockedList, (e: Error) => setError(e.message));
    }, [backend]);
    useEffect(loadBlocked, [loadBlocked]);
    const blocked = useMemo(() => new Set(blockedList.map((b) => b.value)), [blockedList]);

    const back = () => setView("discover");

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Box
                component="header"
                sx={{ display: "flex", alignItems: "center", gap: 2, px: { xs: 2, md: 4 }, height: 60, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
            >
                <Box component="a" href="/admin" aria-label="لوحة الإدارة" sx={{ display: "flex" }}>
                    <Logo />
                </Box>
                <Box sx={{ flex: 1 }} />
                {email && (
                    <Typography sx={{ fontSize: 12.5, color: "text.secondary", display: { xs: "none", md: "block" } }} dir="ltr">
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

            <Box component="main" sx={{ maxWidth: 1560, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: "16px", display: "grid", placeItems: "center", bgcolor: "rgba(0,208,132,0.12)", color: "primary.main", flex: "none" }}>
                        <TrackChangesRoundedIcon sx={{ fontSize: 30 }} />
                    </Box>
                    <Box>
                        <Typography component="h1" sx={{ m: 0, fontSize: { xs: 26, md: 32 }, fontWeight: 700, lineHeight: 1.2 }}>
                            التسويق
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 14.5 }}>اكتشف جهات جديدة، راجعها واعتمد من تريد التواصل معه. لا يُرسل شيء قبل اعتمادك.</Typography>
                    </Box>
                </Box>

                <Box
                    role="tablist"
                    aria-label="أقسام التسويق"
                    sx={{ display: "flex", gap: 0.5, p: 0.75, borderRadius: "16px", bgcolor: "action.hover", alignSelf: "flex-start", maxWidth: "100%", overflowX: "auto" }}
                >
                    {VIEWS.map((v) => {
                        const on = v.id === view;
                        return (
                            <ButtonBase
                                key={v.id}
                                role="tab"
                                aria-selected={on}
                                onClick={() => setView(v.id)}
                                sx={{
                                    px: 2.25,
                                    py: 1,
                                    borderRadius: "12px",
                                    fontSize: 15,
                                    fontWeight: on ? 700 : 500,
                                    whiteSpace: "nowrap",
                                    color: on ? "text.primary" : "text.secondary",
                                    bgcolor: on ? "background.paper" : "transparent",
                                    boxShadow: on ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                                    "&:hover": { color: "text.primary" },
                                    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
                                }}
                            >
                                {v.label}
                            </ButtonBase>
                        );
                    })}
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                {view === "discover" && <Discovery backend={backend} blocked={blocked} state={state} setState={setState} onCampaign={() => setView("campaigns")} />}
                {view === "campaigns" && (
                    <ComingSoon
                        title="حملات واتساب"
                        stage="المرحلة الثانية: قيد البناء"
                        onBack={back}
                        points={[
                            "حملة من الجهات المعتمدة فقط، مع استبعاد قائمة «لا ترسل» والأرقام الثابتة تلقائيًا.",
                            "رسالة واحدة بأكثر من صيغة واسم الجهة تلقائيًا.",
                            "الصفحة تفتح محادثة كل جهة والرسالة جاهزة، وأنت تضغط «إرسال» بنفسك.",
                            "عدّاد يومي تحدده أنت، وتحديث الحالة إلى «تم التواصل» تلقائيًا.",
                        ]}
                    />
                )}
                {view === "email" && (
                    <ComingSoon
                        title="حملات الإيميل"
                        stage="المرحلة الثالثة"
                        onBack={back}
                        points={["ربط صندوق بريد (SMTP) باختبار قبل الحفظ وحد يومي.", "موضوع ونص مع اسم الجهة، ورابط إلغاء اشتراك تلقائي.", "اعتماد نهائي منك قبل أي إرسال."]}
                    />
                )}
                {view === "reports" && (
                    <ComingSoon title="التقارير" stage="المرحلة الثالثة" onBack={back} points={["لكل حملة: أُرسل، ردّ، ألغى الاشتراك، فشل.", "قائمة المهتمين للمتابعة."]} />
                )}
                {view === "suppressions" && (
                    <SuppressionsTab
                        items={blockedList}
                        onAdd={async (v, note) => {
                            await backend.suppress(v, note);
                            loadBlocked();
                        }}
                        onRemove={async (s) => {
                            try {
                                await backend.unsuppress(s.id);
                                loadBlocked();
                            } catch (e) {
                                setError((e as Error).message);
                            }
                        }}
                    />
                )}
                {view === "settings" && <SettingsTab demo={backend.demo} />}
            </Box>
        </Box>
    );
}

export default function Prospects() {
    const [demo, setDemo] = useState<Backend | null>(null);
    const wantDemo = import.meta.env.DEV && new URLSearchParams(window.location.search).has("demo");

    useEffect(() => {
        document.title = "التسويق | قوسان";
        if (!wantDemo) return;
        // the demo module is only reachable in development builds
        Promise.all([import("../lib/prospects/demo"), import("../lib/prospects/data")]).then(([d, data]) => setDemo(data.demoBackend(d.makeDemo())));
    }, [wantDemo]);

    if (wantDemo) return demo ? <Marketing backend={demo} email={null} /> : null;
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AdminGate title="التسويق">{(session) => <Marketing backend={supabaseBackend} email={session.user.email ?? null} />}</AdminGate>
        </Box>
    );
}
