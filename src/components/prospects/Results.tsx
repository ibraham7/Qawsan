// Results: active-filter chips, live count and the people / companies table.

import { Box, Checkbox, Chip, LinearProgress, Link, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

import { CONTACT_STAGES, EMAIL_STATUS, statusOf } from "../../lib/prospects/options";
import type { Opt } from "../../lib/prospects/options";
import type { Chip as ChipT } from "../../lib/prospects/state";
import type { CompanyRow, Filters, PersonRow, Tab } from "../../lib/prospects/types";

const short = (opts: Opt[], v: string) => opts.find((o) => o.value === v)?.label.split(" · ")[1] ?? v;
const nf = new Intl.NumberFormat("en-US");

export function ActiveChips({ chips, filters, onChange, onClearAll }: { chips: ChipT[]; filters: Filters; onChange: (f: Filters) => void; onClearAll: () => void }) {
    if (!chips.length) return null;
    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }} role="list" aria-label="الفلاتر المفعّلة">
            {chips.map((c) => (
                <Chip
                    key={c.id}
                    role="listitem"
                    size="small"
                    label={c.exclude ? `ليس ${c.label}` : c.label}
                    color={c.exclude ? "error" : "primary"}
                    variant="outlined"
                    onDelete={() => onChange(c.remove(filters))}
                    sx={{ maxWidth: 320, ...(c.exclude && { textDecoration: "none" }) }}
                />
            ))}
            <Chip size="small" label="مسح الكل" onClick={onClearAll} variant="filled" sx={{ fontWeight: 700 }} />
        </Box>
    );
}

function Score({ v }: { v: number | null }) {
    if (v === null) return <Typography sx={{ color: "text.disabled", fontSize: 13 }}>—</Typography>;
    const color = v >= 80 ? "success.main" : v >= 60 ? "primary.main" : v >= 40 ? "warning.main" : "text.secondary";
    return <Typography sx={{ fontWeight: 700, color, fontSize: 13.5 }} dir="ltr">{v}</Typography>;
}

const place = (...parts: string[]) => parts.filter(Boolean).join("، ") || "—";

export default function Results({
    tab,
    rows,
    count,
    loading,
    page,
    size,
    onPage,
    onSize,
    selected,
    onToggle,
    onToggleAll,
    onOpen,
    blocked,
}: {
    tab: Tab;
    rows: (PersonRow | CompanyRow)[];
    count: number;
    loading: boolean;
    page: number;
    size: number;
    onPage: (p: number) => void;
    onSize: (s: number) => void;
    /** company selection (companies tab only) */
    selected: Set<string>;
    onToggle: (id: string) => void;
    onToggleAll: (ids: string[], on: boolean) => void;
    onOpen: (c: CompanyRow) => void;
    /** do-not-contact values (phone digits / lower-case emails) */
    blocked: Set<string>;
}) {
    const isBlocked = (c: CompanyRow) =>
        (!!c.phone && blocked.has(c.phone.replace(/\D/g, "").replace(/^00/, ""))) ||
        (!!c.whatsapp && blocked.has(c.whatsapp.replace(/\D/g, ""))) ||
        c.emails.some((e) => blocked.has(e.toLowerCase()));
    const head = tab === "people"
        ? ["الاسم", "المسمى", "الشركة", "الموقع", "التواصل", "المرحلة", "التقييم"]
        : ["", "الجهة", "الهاتف", "الموقع", "الإيميل", "التقييم", "الحالة"];
    const pageIds = tab === "companies" ? rows.map((r) => r.id) : [];
    const allOn = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    const someOn = pageIds.some((id) => selected.has(id));

    return (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden", bgcolor: "background.paper", position: "relative" }}>
            <Box sx={{ height: 3 }}>{loading && <LinearProgress />}</Box>
            <TableContainer sx={{ maxWidth: "100%" }}>
                <Table size="small" sx={{ minWidth: tab === "companies" ? 920 : 860, "& th": { fontWeight: 700, color: "text.secondary", fontSize: 12.5, whiteSpace: "nowrap" }, "& td": { fontSize: 13.5, py: 1.2 } }}>
                    <TableHead>
                        <TableRow>
                            {head.map((h, i) =>
                                tab === "companies" && i === 0 ? (
                                    <TableCell key="sel" padding="checkbox">
                                        <Checkbox
                                            size="small"
                                            checked={allOn}
                                            indeterminate={someOn && !allOn}
                                            onChange={(e) => onToggleAll(pageIds, e.target.checked)}
                                            slotProps={{ input: { "aria-label": "تحديد كل الصفحة" } }}
                                        />
                                    </TableCell>
                                ) : (
                                    <TableCell key={h}>{h}</TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={head.length} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                                    {tab === "companies" ? "لا توجد جهات بعد لهذه الفلاتر. ابدأ ببحث في خرائط Google بالأعلى، أو أضف جهة يدويًا." : "لا توجد نتائج لهذه الفلاتر."}
                                </TableCell>
                            </TableRow>
                        )}
                        {tab === "people"
                            ? (rows as PersonRow[]).map((p) => (
                                  <TableRow key={p.id} hover>
                                      <TableCell sx={{ fontWeight: 700 }}>{p.full_name}</TableCell>
                                      <TableCell>
                                          <Box><bdi>{p.title || "—"}</bdi></Box>
                                          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }} ><bdi>{[p.seniority, p.department].filter(Boolean).join(" · ")}</bdi></Typography>
                                      </TableCell>
                                      <TableCell>
                                          {p.company ? (
                                              <>
                                                  {p.company.name}
                                                  <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                                                      <bdi>{[p.company.employees !== null ? `${nf.format(p.company.employees)} emp.` : "", p.company.domain].filter(Boolean).join(" · ")}</bdi>
                                                  </Typography>
                                              </>
                                          ) : (
                                              "—"
                                          )}
                                      </TableCell>
                                      <TableCell><bdi>{place(p.city, p.country)}</bdi></TableCell>
                                      <TableCell>
                                          <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                                              <Tooltip title={`البريد: ${short(EMAIL_STATUS, p.email_status)}`}>
                                                  <EmailRoundedIcon fontSize="small" sx={{ color: p.email_status === "verified" ? "primary.main" : p.email_status === "unavailable" ? "text.disabled" : "warning.main" }} />
                                              </Tooltip>
                                              <Tooltip title={p.phone_mobile ? "يوجد رقم جوال" : "لا يوجد رقم جوال"}>
                                                  <PhoneIphoneRoundedIcon fontSize="small" sx={{ color: p.phone_mobile ? "primary.main" : "text.disabled" }} />
                                              </Tooltip>
                                              <Tooltip title={p.phone_direct ? "يوجد رقم مباشر" : "لا يوجد رقم مباشر"}>
                                                  <PhoneRoundedIcon fontSize="small" sx={{ color: p.phone_direct ? "primary.main" : "text.disabled" }} />
                                              </Tooltip>
                                          </Box>
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: "nowrap" }}>{short(CONTACT_STAGES, p.contact_stage)}</TableCell>
                                      <TableCell><Score v={p.lead_score} /></TableCell>
                                  </TableRow>
                              ))
                            : (rows as CompanyRow[]).map((c) => {
                                  const st = statusOf(c.status);
                                  const stop = isBlocked(c);
                                  return (
                                      <TableRow key={c.id} hover selected={selected.has(c.id)} onClick={() => onOpen(c)} sx={{ cursor: "pointer" }}>
                                          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                              <Checkbox size="small" checked={selected.has(c.id)} onChange={() => onToggle(c.id)} slotProps={{ input: { "aria-label": `تحديد ${c.name}` } }} />
                                          </TableCell>
                                          <TableCell sx={{ maxWidth: 320 }}>
                                              <Box sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</Box>
                                              <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                  <bdi>{c.address || place(c.hq_city, c.hq_country)}</bdi>
                                              </Typography>
                                          </TableCell>
                                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              {c.phone ? (
                                                  <>
                                                      <Box dir="ltr" sx={{ textAlign: "end", fontVariantNumeric: "tabular-nums" }}>{c.phone}</Box>
                                                      {c.phone_kind && (
                                                          <Chip
                                                              size="small"
                                                              variant="outlined"
                                                              label={c.phone_kind === "mobile" ? "جوال" : "ثابت"}
                                                              color={c.phone_kind === "mobile" ? "primary" : "default"}
                                                              sx={{ height: 20, fontSize: 11, mt: 0.5 }}
                                                          />
                                                      )}
                                                  </>
                                              ) : (
                                                  "—"
                                              )}
                                          </TableCell>
                                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              {c.website ? (
                                                  <Link href={c.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13 }}>
                                                      <LanguageRoundedIcon sx={{ fontSize: 17 }} /> فتح
                                                  </Link>
                                              ) : (
                                                  "—"
                                              )}
                                              {c.whatsapp && (
                                                  <Box>
                                                      <Chip size="small" variant="outlined" label="واتساب" sx={{ height: 20, fontSize: 11, mt: 0.5 }} />
                                                  </Box>
                                              )}
                                          </TableCell>
                                          <TableCell sx={{ maxWidth: 200 }}>
                                              {c.emails.length ? (
                                                  <Box dir="ltr" sx={{ textAlign: "end", fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                      {c.emails[0]}
                                                      {c.emails.length > 1 && <Box component="span" sx={{ color: "text.secondary" }}> +{c.emails.length - 1}</Box>}
                                                  </Box>
                                              ) : (
                                                  "—"
                                              )}
                                          </TableCell>
                                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              {c.rating !== null ? (
                                                  <>
                                                      <Box component="span" sx={{ color: "warning.main" }}>★</Box> <bdi>{c.rating}</bdi>
                                                      {c.rating_count !== null && <Typography component="span" sx={{ fontSize: 11.5, color: "text.secondary" }}> (<bdi>{nf.format(c.rating_count)}</bdi>)</Typography>}
                                                  </>
                                              ) : (
                                                  "—"
                                              )}
                                          </TableCell>
                                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                                              <Chip size="small" label={st.label} color={st.color} variant={st.color === "default" ? "outlined" : "filled"} sx={{ fontWeight: 700, height: 24 }} />
                                              {stop && (
                                                  <Box>
                                                      <Chip size="small" label="لا ترسل" color="error" variant="outlined" sx={{ height: 20, fontSize: 11, mt: 0.5 }} />
                                                  </Box>
                                              )}
                                          </TableCell>
                                      </TableRow>
                                  );
                              })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={count}
                page={Math.min(page, Math.max(0, Math.ceil(count / size) - 1))}
                rowsPerPage={size}
                rowsPerPageOptions={[25, 50, 100]}
                onPageChange={(_, p) => onPage(p)}
                onRowsPerPageChange={(e) => onSize(Number(e.target.value))}
                labelRowsPerPage="لكل صفحة"
                labelDisplayedRows={({ from, to, count }) => `${nf.format(from)}–${nf.format(to)} من ${nf.format(count)}`}
            />
        </Box>
    );
}
