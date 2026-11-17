// /prospects: private lead-generation search with Apollo-style filters.
// Admins only (same sign-in as /admin). In development, /prospects?demo uses generated
// demo records and skips the sign-in so the filters can be tried without a database.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import SiteReport from "../components/prospects/SiteReport";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { siteList } from "../lib/prospects/export";
import { BATCH, MAX_PER_RUN, runInBatches } from "../lib/prospects/batches";
import { NEXT_STEP, VIEWS, applyView, viewOf } from "../lib/prospects/views";
import UnarchiveRoundedIcon from "@mui/icons-material/UnarchiveRounded";
import LabelRoundedIcon from "@mui/icons-material/LabelRounded";
import BookmarksRoundedIcon from "@mui/icons-material/BookmarksRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import TravelExploreRoundedIcon from "@mui/icons-material/TravelExploreRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import AdminGate from "../components/admin/AdminGate";
import Logo from "../components/common/Logo";
import AddContactDialog from "../components/prospects/AddContactDialog";
import ImportCsvDialog from "../components/prospects/ImportCsvDialog";
import CampaignsTab from "../components/prospects/CampaignsTab";
import CompanyDrawer from "../components/prospects/CompanyDrawer";
import DiscoverDialog from "../components/prospects/DiscoverDialog";
import FilterSidebar from "../components/prospects/FilterSidebar";
import Results, { ActiveChips } from "../components/prospects/Results";
import ReportsTab from "../components/prospects/ReportsTab";
import SettingsTab from "../components/prospects/SettingsTab";
import SuppressionsTab from "../components/prospects/SuppressionsTab";
import { Select } from "../components/prospects/controls";
import { runAudit, runEnrich } from "../lib/discovery/client";
import type { SearchOutcome } from "../lib/discovery/client";
import { supabaseBackend } from "../lib/prospects/data";
import type { Backend, Meta, Sort, Suppression } from "../lib/prospects/data";
import { PRESETS, PROCESSING, STATUSES, statusOf } from "../lib/prospects/options";
import { activeCount, chips, clean, decodeState, encodeState, pickPersona } from "../lib/prospects/state";
import type { UrlState } from "../lib/prospects/state";
import type { CompanyRow, Filters, PersonRow, SavedSearch, Tab } from "../lib/prospects/types";
import { supabase } from "../lib/supabase";

const SIDEBAR = 340;
const NO_META: Meta = { lists: [], sequences: [], owners: [], searches: [] };
const nf = new Intl.NumberFormat("en-US");

/** the tail of the result message when a run did not finish everything */
const runNote = (run: { notReached: string[]; stopped: boolean; error?: string }) =>
    (run.notReached.length ? ` · لم تُعالَج ${run.notReached.length} (تبقى محددة)${run.stopped ? " لأنك أوقفت العملية" : ""}` : "") + (run.error ? ` — توقفت: ${run.error}` : "");

const SORTS = [
    { value: "newest", label: "الأحدث" },
    { value: "score", label: "الأعلى أولوية" },
    { value: "name", label: "بالاسم" },
];

/** sections next to the people / companies search, in the same top bar */
type Section = "search" | "campaigns" | "email" | "reports" | "suppressions" | "settings";
const SECTIONS: { id: Exclude<Section, "search">; label: string }[] = [
    { id: "campaigns", label: "الحملات" },
    { id: "email", label: "الإيميل" },
    { id: "reports", label: "التقارير" },
    { id: "suppressions", label: "لا ترسل" },
    { id: "settings", label: "الإعدادات" },
];
const readSection = (): Section => {
    const v = new URLSearchParams(window.location.search).get("view");
    return SECTIONS.some((s) => s.id === v) ? (v as Section) : "search";
};

function Workspace({ backend, email }: { backend: Backend; email: string | null }) {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));

    const [state, setState] = useState<UrlState>(() => decodeState(window.location.search));
    const [sidebar, setSidebar] = useState(true);
    const [drawer, setDrawer] = useState(false);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(25);
    // the most worth-contacting first (priority); "newest" after adding companies so they are seen
    const [sort, setSort] = useState<Sort>("score");
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
    const [auditing, setAuditing] = useState(false);
    const [auditDone, setAuditDone] = useState(0);
    const [enrichDone, setEnrichDone] = useState(0);
    // companies in the current enrich / audit run, and the flag the stop button sets
    const [runTotal, setRunTotal] = useState(0);
    const stopRun = useRef(false);
    // bumped to re-run the current search after data changed on the server
    const [reload, setReload] = useState(0);
    const [section, setSection] = useState<Section>(readSection);
    const [blockedList, setBlockedList] = useState<Suppression[]>([]);
    const [statusMenu, setStatusMenu] = useState<HTMLElement | null>(null);
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [busy, setBusy] = useState(false);

    const { tab } = state;
    const filters = state[tab];

    /* ---- url ---- */
    useEffect(() => {
        const qs = encodeState(state) + (section !== "search" ? `&view=${section}` : "") + (backend.demo ? "&demo" : "");
        const url = `${window.location.pathname}?${qs}`;
        if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, "", url);
    }, [state, section, backend.demo]);

    /* ---- do-not-contact list (badges in the table + its own section) ---- */
    const loadBlocked = useCallback(() => {
        backend.suppressions().then(setBlockedList, (e: Error) => setError(e.message));
    }, [backend]);
    useEffect(loadBlocked, [loadBlocked]);
    const blocked = useMemo(() => new Set(blockedList.map((b) => b.value)), [blockedList]);

    /** runs a change on the server, then refreshes the results */
    const run = async (fn: () => Promise<void>, done: string) => {
        setBusy(true);
        try {
            await fn();
            setToast(done);
            setReload((x) => x + 1);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

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

    // how many companies each view holds under the other filters in force
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
    useEffect(() => {
        if (tab !== "companies") return;
        let live = true;
        const base = JSON.parse(filterKey) as Filters;
        Promise.all(VIEWS.map((v) => backend.search("companies", applyView(base, v.id), 0, 1, "newest").then((r) => [v.id, r.count] as const))).then(
            (pairs) => live && setViewCounts(Object.fromEntries(pairs)),
            () => {}
        );
        return () => {
            live = false;
        };
    }, [backend, tab, filterKey, reload]);
    const view = viewOf(filters);

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
    const targets = saved.filter((s) => s.kind === tab);
    const activeTargetId = targets.find((t) => JSON.stringify(clean(t.filters, tab)) === filterKey)?.id ?? null;

    const saveNamed = async () => {
        const n = name.trim();
        if (!n || !naming) return;
        try {
            if (naming === "persona") await backend.savedCreate(n, "persona", pickPersona(state.people));
            else await backend.savedCreate(n, tab, clean(filters, tab));
            setToast(naming === "persona" ? "حُفظت الـ Persona" : "حُفظ الاستهداف");
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
        apply("companies", { searches: r.searchIds ?? [r.searchId] });
        setReload((n) => n + 1);
    };

    // companies on this page that were already enriched (the table only knows its own rows)
    const enrichedIds = new Set(result.tab === "companies" ? (result.rows as CompanyRow[]).filter((c) => c.enriched_at).map((c) => c.id) : []);
    const fresh = [...selected].filter((id) => !enrichedIds.has(id));
    const alreadyDone = selected.size - fresh.length;

    const enrich = async (again = false) => {
        const ids = (again ? [...selected] : fresh).slice(0, MAX_PER_RUN);
        if (!ids.length) {
            setToast("كل المحدد تم إثراؤه من قبل.");
            return;
        }
        setEnriching(true);
        setEnrichDone(0);
        setRunTotal(ids.length);
        stopRun.current = false;
        try {
            // sent in batches of 25 (the server's time limit), asking again for what it did not reach
            const run = await runInBatches(ids, runEnrich, { shouldStop: () => stopRun.current, onProgress: (done) => setEnrichDone(done) });
            const n = (st: string) => run.results.filter((x) => x.status === st).length;
            setToast(`الإثراء: ${n("done")} وجدنا إيميل/واتساب · ${n("socials_only")} سوشيال فقط · ${n("nothing_found")} بلا بيانات · ${n("no_website")} بلا موقع · ${n("failed")} تعذّر فتحها${runNote(run)}`);
            // what was not processed stays selected, to continue with one more click
            setSelected(new Set(run.notReached));
            setReload((x) => x + 1);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setEnriching(false);
        }
    };

    // website audit: same flow as enrichment, skipping sites already checked unless asked again
    const checkedIds = new Set(result.tab === "companies" ? (result.rows as CompanyRow[]).filter((c) => c.site_checked_at).map((c) => c.id) : []);
    const unchecked = [...selected].filter((id) => !checkedIds.has(id));
    const alreadyChecked = selected.size - unchecked.length;

    const audit = async (again = false) => {
        const ids = (again ? [...selected] : unchecked).slice(0, MAX_PER_RUN);
        if (!ids.length) {
            setToast("كل المحدد تم فحص موقعه من قبل.");
            return;
        }
        setAuditing(true);
        setAuditDone(0);
        setRunTotal(ids.length);
        stopRun.current = false;
        try {
            // same batching as enrichment; Google measures slowly, so the server may hand back some of each batch
            const run = await runInBatches(ids, runAudit, { shouldStop: () => stopRun.current, onProgress: (done) => setAuditDone(done) });
            const speedConfigured = run.last?.speedConfigured ?? true;
            const n = (q: string) => run.results.filter((x) => x.quality === q).length;
            const speed = (sp: string) => run.results.filter((x) => x.speed === sp).length;
            const notes = [
                !speedConfigured && "قياس السرعة من Google غير مفعّل (أضف مفتاحًا في Vercel)",
                speed("blocked") > 0 && "مفتاح Google لا يسمح بـ PageSpeed: فعّل PageSpeed Insights API وأضفه لقيود المفتاح",
                speed("quota") > 0 && "انتهت حصة PageSpeed اليوم، وأُكمل الفحص بدون قياس السرعة",
                speed("failed") > 0 && `${speed("failed")} موقع تعذّر قياس سرعته`,
            ].filter(Boolean);
            setToast(`فحص المواقع: ${n("weak")} ضعيف · ${n("medium")} متوسط · ${n("good")} جيد · ${n("unreadable")} تعذّر الحكم · ${n("no_website")} بلا موقع${notes.length ? ` — ${notes.join(" — ")}` : ""}${runNote(run)}`);
            setSelected(new Set(run.notReached));
            setReload((x) => x + 1);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setAuditing(false);
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
            targets={targets}
            activeTargetId={activeTargetId}
            onApplyTarget={(t) => apply(tab, t.filters)}
            onSaveTarget={() => setNaming("search")}
            onDeleteTarget={(t) => {
                if (window.confirm(`حذف «${t.name}» من الاستهدافات المحفوظة؟ الشركات نفسها لا تُحذف.`)) remove(t);
            }}
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
                <Tabs
                    value={section === "search" ? tab : section}
                    onChange={(_, v) => {
                        if (v === "people" || v === "companies") {
                            setSection("search");
                            setTab(v);
                        } else setSection(v);
                    }}
                    variant="scrollable"
                    scrollButtons={false}
                    sx={{ minHeight: 64, minWidth: 0, "& .MuiTab-root": { minHeight: 64, fontWeight: 700, minWidth: 0, px: 2 } }}
                >
                    <MuiTab value="people" label="الأشخاص" />
                    <MuiTab value="companies" label="الشركات" />
                    {SECTIONS.map((s) => (
                        <MuiTab key={s.id} value={s.id} label={s.label} />
                    ))}
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

            {section !== "search" && (
                <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, maxWidth: 1200, width: "100%", mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {section === "campaigns" && <CampaignsTab backend={backend} channel="whatsapp" blocked={blocked} onStatusChanged={() => {
                        setReload((x) => x + 1);
                        loadBlocked(); // a "stop" reply adds the number to do-not-contact
                    }} />}
                    {section === "email" && (
                        <>
                            <Alert severity="info" icon={false} sx={{ alignItems: "center" }}>
                                الإرسال اليدوي: تفتح لك الصفحة الرسالة جاهزة في Gmail أو برنامج البريد وتضغط «إرسال» بنفسك. والإرسال التلقائي المتدرّج
                                يعمل إن أضفت صندوق SMTP في Vercel (الخطوات في «الإعدادات»)، وفيه رابط إلغاء اشتراك بضغطة في كل رسالة.
                            </Alert>
                            <CampaignsTab backend={backend} channel="email" blocked={blocked} onStatusChanged={() => {
                                setReload((x) => x + 1);
                                loadBlocked();
                            }} />
                        </>
                    )}
                    {section === "reports" && <ReportsTab backend={backend} onStatusChanged={() => setReload((x) => x + 1)} />}
                    {section === "suppressions" && (
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
                    {section === "settings" && <SettingsTab demo={backend.demo} />}
                </Box>
            )}

            <Box sx={{ flex: 1, display: section === "search" ? "flex" : "none", minHeight: 0 }}>
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
                        <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setAdding(true)}>
                            إضافة جهة يدويًا
                        </Button>
                        <Button variant="outlined" startIcon={<UploadFileRoundedIcon />} onClick={() => setImporting(true)}>
                            استيراد CSV
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

                    {tab === "companies" && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Box role="tablist" aria-label="مراحل الجهات" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {VIEWS.map((v) => (
                                    <Chip
                                        key={v.id}
                                        role="tab"
                                        aria-selected={view === v.id}
                                        label={`${v.label}${viewCounts[v.id] === undefined ? "" : ` (${viewCounts[v.id]})`}`}
                                        color={view === v.id ? "primary" : "default"}
                                        variant={view === v.id ? "filled" : "outlined"}
                                        onClick={() => {
                                            setSelected(new Set());
                                            setFilters(applyView(filters, v.id));
                                        }}
                                        sx={{ fontWeight: 700 }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>المعالجة:</Typography>
                                {PROCESSING.map((p) => {
                                    const on = (filters.processing ?? []).includes(p.value);
                                    return (
                                        <Chip
                                            key={p.value}
                                            size="small"
                                            label={p.label}
                                            color={on ? "primary" : "default"}
                                            variant={on ? "filled" : "outlined"}
                                            onClick={() => setFilters({ ...filters, processing: on ? (filters.processing ?? []).filter((x) => x !== p.value) : [...(filters.processing ?? []), p.value] })}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}
                    <ActiveChips chips={activeChips} filters={filters} onChange={setFilters} onClearAll={clearAll} />

                    {tab === "companies" && selected.size > 0 && (
                        <Box
                            role="region"
                            aria-label="الجهات المحددة"
                            sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5, p: 1.5, borderRadius: "12px", border: "1px solid", borderColor: "primary.main", bgcolor: "action.hover" }}
                        >
                            <Typography sx={{ fontWeight: 700 }}>{selected.size} محدد</Typography>
                            <Button variant="contained" startIcon={<AutoFixHighRoundedIcon />} onClick={() => enrich()} disabled={enriching || auditing || backend.demo || fresh.length > MAX_PER_RUN || fresh.length === 0}>
                                {enriching ? `جارٍ الإثراء… (${enrichDone}/${runTotal})` : alreadyDone ? `إثراء الجديدة فقط (${fresh.length})` : "إثراء من المواقع"}
                            </Button>
                            {alreadyDone > 0 && (
                                <Button variant="text" onClick={() => enrich(true)} disabled={enriching || auditing || backend.demo || selected.size > MAX_PER_RUN}>
                                    إعادة إثراء الكل ({selected.size})
                                </Button>
                            )}
                            <Button variant="outlined" startIcon={<FactCheckRoundedIcon />} onClick={() => audit()} disabled={enriching || auditing || backend.demo || unchecked.length > MAX_PER_RUN || unchecked.length === 0}>
                                {auditing ? `جارٍ الفحص… (${auditDone}/${runTotal})` : alreadyChecked ? `فحص الموقع للجديدة فقط (${unchecked.length})` : "فحص جودة الموقع"}
                            </Button>
                            {alreadyChecked > 0 && (
                                <Button variant="text" onClick={() => audit(true)} disabled={enriching || auditing || backend.demo || selected.size > MAX_PER_RUN}>
                                    إعادة فحص الكل ({selected.size})
                                </Button>
                            )}
                            {(enriching || auditing) && (
                                <Button color="error" variant="outlined" onClick={() => (stopRun.current = true)}>
                                    إيقاف بعد الدفعة الحالية
                                </Button>
                            )}
                            <Button variant="outlined" startIcon={<LabelRoundedIcon />} onClick={(e) => setStatusMenu(e.currentTarget)} disabled={enriching || auditing || busy}>
                                تغيير الحالة
                            </Button>
                            {NEXT_STEP[view] && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    disabled={enriching || auditing || busy}
                                    onClick={() => {
                                        const ids = [...selected];
                                        const step = NEXT_STEP[view];
                                        run(async () => {
                                            await backend.setStatus(ids, step.status);
                                            setSelected(new Set());
                                        }, `${step.label}: انتقلت ${ids.length} جهة إلى صفحتها (${statusOf(step.status).label})`);
                                    }}
                                >
                                    {NEXT_STEP[view].label} ({selected.size})
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                startIcon={<ContentCopyRoundedIcon />}
                                onClick={async () => {
                                    // only the companies on this page are known here
                                    const rows = (result.rows as CompanyRow[]).filter((c) => selected.has(c.id));
                                    if (!rows.length) return setToast("حدّد جهات من هذه الصفحة أولًا.");
                                    try {
                                        await navigator.clipboard.writeText(siteList(rows));
                                        setToast(`نُسخت ${rows.length} جهة مع روابطها`);
                                    } catch {
                                        setError("تعذّر النسخ: اسمح للموقع بالوصول للحافظة.");
                                    }
                                }}
                            >
                                نسخ الروابط
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={filters.showArchived === "only" ? <UnarchiveRoundedIcon /> : <ArchiveRoundedIcon />}
                                disabled={enriching || auditing || busy}
                                onClick={() => {
                                    const ids = [...selected];
                                    const restore = filters.showArchived === "only";
                                    run(async () => {
                                        await backend.setArchived(ids, !restore);
                                        setSelected(new Set());
                                    }, restore ? `أُعيدت ${ids.length} جهة من الأرشيف` : `أُرشفت ${ids.length} جهة (تجدها في فلتر «الأرشيف»)`);
                                }}
                            >
                                {filters.showArchived === "only" ? "إلغاء الأرشفة" : "أرشفة"}
                            </Button>
                            <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setDeleting(true)} disabled={enriching || auditing || busy}>
                                حذف نهائي
                            </Button>
                            <Button onClick={() => setSelected(new Set())} disabled={enriching || auditing}>
                                إلغاء التحديد
                            </Button>
                            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                                {fresh.length > MAX_PER_RUN
                                    ? `الحد ${MAX_PER_RUN} جهة في المرة الواحدة.`
                                    : Math.max(fresh.length, unchecked.length) > BATCH && !enriching && !auditing
                                      ? `سيُعالَج حتى ${Math.max(fresh.length, unchecked.length)} جهة على ${Math.ceil(Math.max(fresh.length, unchecked.length) / BATCH)} دفعات (نحو نصف دقيقة لكل دفعة). أبقِ الصفحة مفتوحة، ويمكنك الإيقاف في أي وقت.`
                                    : alreadyDone
                                      ? `${alreadyDone} منها مُثراة من قبل وسنتجاوزها.`
                                    : backend.demo
                                      ? "الإثراء غير متاح في الوضع التجريبي."
                                      : "«إثراء» يستخرج الإيميل والسوشيال والواتساب، و«فحص جودة الموقع» يقيّم الموقع (جوال، سرعة، تصميم). كلاهما مجاني ولا يستخدم Google."}
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
                        blocked={blocked}
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
                <DialogTitle>{naming === "persona" ? "حفظ Persona" : "حفظ استهداف"}</DialogTitle>
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

            {/* only the statuses an admin may set by hand */}
            <Menu anchorEl={statusMenu} open={!!statusMenu} onClose={() => setStatusMenu(null)}>
                <Typography sx={{ px: 2, pt: 1, pb: 0.5, fontSize: 12, color: "text.secondary", maxWidth: 280 }}>«معتمد» لا يرسل شيئًا، بل يجعل الجهة قابلة للدخول في حملة.</Typography>
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

            <ImportCsvDialog
                backend={backend}
                open={importing}
                onClose={() => setImporting(false)}
                onDone={(n) => {
                    apply("companies", {});
                    setSort("newest");
                    setReload((x) => x + 1);
                    backend.meta().then(setMeta).catch(() => {});
                    setToast(`تم استيراد ${n} جهة بحالة «بحاجة لمراجعة»`);
                }}
            />

            <DiscoverDialog open={discover} demo={backend.demo} onClose={() => setDiscover(false)} onDone={afterDiscovery} />
            <CompanyDrawer
                company={opened}
                onClose={() => setOpened(null)}
                onSetWhatsapp={async (c, number) => {
                    await backend.setWhatsapp(c.id, number);
                    setOpened({ ...c, whatsapp: number });
                    setReload((x) => x + 1);
                    setToast(number ? "حُفظ رقم الواتساب: صارت الجهة مؤهلة لحملات واتساب إن كانت معتمدة" : "حُذف رقم الواتساب");
                }}
            />

            <Snackbar open={!!toast} autoHideDuration={toast.startsWith("الإثراء") ? 8000 : toast.startsWith("فحص المواقع") ? 14000 : 2500} onClose={() => setToast("")} message={toast} />
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

    // ?report=<company id> opens that company's printable website report instead of the workspace
    const reportId = new URLSearchParams(window.location.search).get("report");
    if (wantDemo) return demo ? reportId ? <SiteReport backend={demo} id={reportId} /> : <Workspace backend={demo} email={null} /> : null;
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AdminGate title="العملاء المحتملون">
                {(session) => (reportId ? <SiteReport backend={supabaseBackend} id={reportId} /> : <Workspace backend={supabaseBackend} email={session.user.email ?? null} />)}
            </AdminGate>
        </Box>
    );
}
