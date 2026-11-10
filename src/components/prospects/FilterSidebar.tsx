// Collapsible filter sidebar: search over filter names, grouped sections, personas,
// active count and "clear all".

import { useMemo, useState } from "react";
import { Box, Button, Chip, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import type { Meta } from "../../lib/prospects/data";
import { FILTERS, GROUPS, activeCount, isActive, metaFor } from "../../lib/prospects/state";
import type { FilterKey, Filters, SavedSearch, Tab } from "../../lib/prospects/types";
import { Section } from "./controls";
import { FilterEditor } from "./FilterEditors";

export default function FilterSidebar({
    tab,
    filters,
    meta,
    personas,
    onChange,
    onClearAll,
    onApplyPersona,
    onSavePersona,
    onDeletePersona,
    onClose,
}: {
    tab: Tab;
    filters: Filters;
    meta: Meta;
    personas: SavedSearch[];
    onChange: (f: Filters) => void;
    onClearAll: () => void;
    onApplyPersona: (p: SavedSearch) => void;
    onSavePersona: () => void;
    onDeletePersona: (p: SavedSearch) => void;
    onClose: () => void;
}) {
    const [q, setQ] = useState("");
    const count = activeCount(filters, tab);

    const set = <K extends FilterKey>(key: K, v: Filters[K] | undefined) => {
        const next = { ...filters };
        if (v === undefined) delete next[key];
        else next[key] = v;
        onChange(next);
    };

    const visible = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return FILTERS.filter((m) => m.tabs.includes(tab)).filter((m) => {
            if (!needle) return true;
            return metaFor(m.key, tab).label.toLowerCase().includes(needle) || m.key.toLowerCase().includes(needle);
        });
    }, [q, tab]);

    return (
        <Box
            component="aside"
            aria-label="الفلاتر"
            sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, bgcolor: "background.paper" }}
        >
            <Box sx={{ px: 2, pt: 2, pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography component="h2" sx={{ m: 0, fontSize: 17, fontWeight: 700 }}>
                    الفلاتر
                </Typography>
                {count > 0 && <Chip size="small" color="primary" label={`${count} مفعّل`} sx={{ fontWeight: 700, height: 22 }} />}
                <Box sx={{ flex: 1 }} />
                <Button size="small" onClick={onClearAll} disabled={!count}>
                    مسح الكل
                </Button>
                <Tooltip title="إخفاء الفلاتر">
                    <IconButton size="small" onClick={onClose} aria-label="إخفاء الفلاتر">
                        <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ px: 2, pb: 1.5 }}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="ابحث عن فلتر…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", borderTop: "1px solid", borderColor: "divider" }}>
                {tab === "people" && !q && (
                    <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <PersonSearchRoundedIcon fontSize="small" color="primary" />
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>Personas</Typography>
                            <Button size="small" onClick={onSavePersona} disabled={!FILTERS.some((m) => m.group === "person" && isActive(filters, m.key))}>
                                حفظ الحالية
                            </Button>
                        </Box>
                        {personas.length ? (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                {personas.map((p) => (
                                    <Chip key={p.id} size="small" label={p.name} onClick={() => onApplyPersona(p)} onDelete={() => onDeletePersona(p)} variant="outlined" />
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                احفظ فلاتر الشخص الحالية باسم (مثل «مدراء التسويق») لتستدعيها لاحقًا.
                            </Typography>
                        )}
                    </Box>
                )}

                {GROUPS.map((g) => {
                    const items = visible.filter((m) => m.group === g.id);
                    if (!items.length) return null;
                    const label = tab === "companies" && g.id === "company" ? "فلاتر الشركات" : g.id === "company" ? "فلاتر شركة الشخص" : g.label;
                    return (
                        <Box key={g.id}>
                            <Typography
                                sx={{ px: 2, pt: 2, pb: 0.75, fontSize: 11.5, fontWeight: 700, color: "primary.main", letterSpacing: 0.2 }}
                            >
                                {label}
                            </Typography>
                            {items.map((m) => (
                                <Section
                                    key={`${tab}-${m.key}`}
                                    label={metaFor(m.key, tab).label}
                                    active={isActive(filters, m.key)}
                                    onClear={() => set(m.key, undefined)}
                                    defaultOpen={!!q}
                                >
                                    <FilterEditor k={m.key} f={filters} tab={tab} meta={meta} set={set} />
                                </Section>
                            ))}
                        </Box>
                    );
                })}
                {!visible.length && (
                    <Typography sx={{ p: 3, textAlign: "center", color: "text.secondary", fontSize: 13 }}>لا يوجد فلتر بهذا الاسم.</Typography>
                )}
            </Box>
        </Box>
    );
}
