// Small input pieces used by the prospect filter sidebar.

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    Autocomplete,
    Box,
    ButtonBase,
    Chip,
    Collapse,
    IconButton,
    MenuItem,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

import { EMPTY_IE } from "../../lib/prospects/options";
import type { Opt } from "../../lib/prospects/options";
import type { IncExc, Range } from "../../lib/prospects/types";

/* ------------------------------------------------------------------ */

export function Section({
    label,
    active,
    onClear,
    children,
    defaultOpen,
}: {
    label: string;
    active: boolean;
    onClear: () => void;
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(!!defaultOpen || active);
    return (
        <Box sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <ButtonBase
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    sx={{
                        flex: 1,
                        justifyContent: "flex-start",
                        gap: 1,
                        py: 1.3,
                        px: 2,
                        fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        color: active ? "text.primary" : "text.secondary",
                        textAlign: "start",
                        "&:hover": { color: "text.primary" },
                        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 },
                    }}
                >
                    {active && <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main", flex: "none" }} />}
                    <Box component="span" sx={{ flex: 1 }}>{label}</Box>
                    <ExpandMoreRoundedIcon fontSize="small" sx={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none", opacity: 0.6 }} />
                </ButtonBase>
                {active && (
                    <Tooltip title="مسح هذا الفلتر">
                        <IconButton size="small" onClick={onClear} aria-label={`مسح ${label}`} sx={{ mx: 0.5 }}>
                            <RestartAltRoundedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Collapse in={open} unmountOnExit>
                <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>{children}</Box>
            </Collapse>
        </Box>
    );
}

/* ------------------------------------------------------------------ */

const labelFor = (opts: Opt[] | undefined, v: string) => opts?.find((o) => o.value === v)?.label ?? v;

/** multi-select with search; free text allowed when `free` */
export function Multi({
    label,
    value,
    onChange,
    options,
    free,
    exclude,
    placeholder,
}: {
    label: string;
    value: string[];
    onChange: (v: string[]) => void;
    options?: Opt[];
    free?: boolean;
    exclude?: boolean;
    placeholder?: string;
}) {
    return (
        <Autocomplete
            multiple
            size="small"
            freeSolo={free}
            disableCloseOnSelect
            filterSelectedOptions
            options={(options ?? []).map((o) => o.value)}
            getOptionLabel={(v) => labelFor(options, v)}
            value={value}
            onChange={(_, v) => onChange((v as string[]).map((x) => x.trim()).filter(Boolean))}
            noOptionsText={free ? "اكتب واضغط Enter" : "لا توجد خيارات"}
            renderValue={(vals, getItemProps) =>
                vals.map((v, i) => {
                    const { key, ...rest } = getItemProps({ index: i });
                    return (
                        <Chip
                            key={key}
                            {...rest}
                            size="small"
                            label={labelFor(options, v).split(" · ")[0]}
                            color={exclude ? "error" : "primary"}
                            variant="outlined"
                        />
                    );
                })
            }
            renderInput={(p) => <TextField {...p} label={label} placeholder={value.length ? "" : placeholder} />}
        />
    );
}

/** include + exclude pair */
export function IncExcInput({
    value,
    onChange,
    options,
    free,
    noun,
}: {
    value: IncExc | undefined;
    onChange: (v: IncExc) => void;
    options?: Opt[];
    free?: boolean;
    noun?: string;
}) {
    const v = value ?? EMPTY_IE;
    const left = (options ?? []).filter((o) => !v.inc.includes(o.value) && !v.exc.includes(o.value));
    return (
        <>
            <Multi
                label="يشمل أيًا من"
                value={v.inc}
                onChange={(inc) => onChange({ ...v, inc })}
                options={options && [...left, ...(options.filter((o) => v.inc.includes(o.value)))]}
                free={free}
                placeholder={noun}
            />
            <Multi
                label="يستثني"
                value={v.exc}
                onChange={(exc) => onChange({ ...v, exc })}
                options={options && [...left, ...(options.filter((o) => v.exc.includes(o.value)))]}
                free={free}
                exclude
            />
        </>
    );
}

/** small option sets shown as toggle chips */
export function Toggles({ options, value, onChange }: { options: Opt[]; value: string[]; onChange: (v: string[]) => void }) {
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {options.map((o) => {
                const on = value.includes(o.value);
                return (
                    <Chip
                        key={o.value}
                        label={o.label}
                        size="small"
                        clickable
                        aria-pressed={on}
                        color={on ? "primary" : "default"}
                        variant={on ? "filled" : "outlined"}
                        onClick={() => onChange(on ? value.filter((x) => x !== o.value) : [...value, o.value])}
                        sx={{ fontWeight: on ? 700 : 500 }}
                    />
                );
            })}
        </Box>
    );
}

const num = (s: string) => (s.trim() === "" || Number.isNaN(Number(s)) ? null : Number(s));

export function RangeInput({
    value,
    onChange,
    unit,
    minLabel = "من",
    maxLabel = "إلى",
}: {
    value: Range | undefined;
    onChange: (v: Range) => void;
    unit?: string;
    minLabel?: string;
    maxLabel?: string;
}) {
    const v = value ?? {};
    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
                size="small"
                type="number"
                label={minLabel}
                value={v.min ?? ""}
                onChange={(e) => onChange({ ...v, min: num(e.target.value) })}
                slotProps={{ htmlInput: { dir: "ltr", inputMode: "decimal" } }}
            />
            <TextField
                size="small"
                type="number"
                label={maxLabel}
                value={v.max ?? ""}
                onChange={(e) => onChange({ ...v, max: num(e.target.value) })}
                slotProps={{ htmlInput: { dir: "ltr", inputMode: "decimal" } }}
            />
            {unit && <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>{unit}</Typography>}
        </Box>
    );
}

export function Select({
    label,
    value,
    onChange,
    options,
    none = "الكل",
}: {
    label: string;
    value: string | undefined;
    onChange: (v: string | undefined) => void;
    options: Opt[];
    none?: string | null;
}) {
    return (
        <TextField select size="small" label={label || undefined} value={value ?? ""} onChange={(e) => onChange(e.target.value || undefined)} fullWidth slotProps={{ select: { displayEmpty: none !== null }, inputLabel: { shrink: true } }}>
            {none !== null && <MenuItem value="">{none}</MenuItem>}
            {options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                    {o.label}
                </MenuItem>
            ))}
        </TextField>
    );
}

/** reads a CSV / text file and returns the first column of every row */
export function CsvButton({ onValues, label = "رفع قائمة CSV" }: { onValues: (v: string[]) => void; label?: string }) {
    const input = useRef<HTMLInputElement>(null);
    return (
        <>
            <Chip
                icon={<UploadFileRoundedIcon />}
                label={label}
                variant="outlined"
                clickable
                onClick={() => input.current?.click()}
                sx={{ alignSelf: "flex-start" }}
            />
            <input
                ref={input}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                hidden
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file || file.size > 1024 * 1024) return;
                    const text = await file.text();
                    const values = text
                        .split(/\r?\n/)
                        .map((line) => line.split(/[,;\t]/)[0]?.replace(/^"|"$/g, "").trim() ?? "")
                        .filter((v) => v && !/^(name|company|domain|website)$/i.test(v));
                    onValues([...new Set(values)].slice(0, 500));
                }}
            />
        </>
    );
}
