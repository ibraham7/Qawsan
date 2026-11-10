// Results: active-filter chips, live count and the people / companies table.

import { Box, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

import { ACCOUNT_STAGES, CONTACT_STAGES, EMAIL_STATUS } from "../../lib/prospects/options";
import type { Opt } from "../../lib/prospects/options";
import type { Chip as ChipT } from "../../lib/prospects/state";
import type { CompanyRow, Filters, PersonRow, Tab } from "../../lib/prospects/types";

const short = (opts: Opt[], v: string) => opts.find((o) => o.value === v)?.label.split(" · ")[1] ?? v;
const nf = new Intl.NumberFormat("en-US");
const money = (v: number | null) =>
    v === null ? "—" : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${v}`;

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
}: {
    tab: Tab;
    rows: (PersonRow | CompanyRow)[];
    count: number;
    loading: boolean;
    page: number;
    size: number;
    onPage: (p: number) => void;
    onSize: (s: number) => void;
}) {
    const head = tab === "people"
        ? ["الاسم", "المسمى", "الشركة", "الموقع", "التواصل", "المرحلة", "التقييم"]
        : ["الشركة", "القطاع", "الموظفون", "المقر", "التقنيات", "الإيرادات", "المرحلة", "التقييم"];

    return (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "14px", overflow: "hidden", bgcolor: "background.paper", position: "relative" }}>
            <Box sx={{ height: 3 }}>{loading && <LinearProgress />}</Box>
            <TableContainer sx={{ maxWidth: "100%" }}>
                <Table size="small" sx={{ minWidth: 860, "& th": { fontWeight: 700, color: "text.secondary", fontSize: 12.5, whiteSpace: "nowrap" }, "& td": { fontSize: 13.5, py: 1.2 } }}>
                    <TableHead>
                        <TableRow>
                            {head.map((h) => (
                                <TableCell key={h}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={head.length} sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
                                    لا توجد نتائج لهذه الفلاتر.
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
                            : (rows as CompanyRow[]).map((c) => (
                                  <TableRow key={c.id} hover>
                                      <TableCell>
                                          <Box sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{c.name}</Box>
                                          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}><bdi>{c.domain}</bdi></Typography>
                                      </TableCell>
                                      <TableCell><bdi>{c.industry || "—"}</bdi></TableCell>
                                      <TableCell><bdi>{c.employees !== null ? nf.format(c.employees) : "—"}</bdi></TableCell>
                                      <TableCell><bdi>{place(c.hq_city, c.hq_country)}</bdi></TableCell>
                                      <TableCell>
                                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, maxWidth: 220 }}>
                                              {c.technologies.slice(0, 3).map((t) => (
                                                  <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
                                              ))}
                                              {c.technologies.length > 3 && <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>+{c.technologies.length - 3}</Typography>}
                                          </Box>
                                      </TableCell>
                                      <TableCell><bdi>{money(c.revenue_usd)}</bdi></TableCell>
                                      <TableCell sx={{ whiteSpace: "nowrap" }}>{short(ACCOUNT_STAGES, c.account_stage)}</TableCell>
                                      <TableCell><Score v={c.lead_score} /></TableCell>
                                  </TableRow>
                              ))}
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
