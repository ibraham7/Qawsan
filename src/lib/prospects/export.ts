// A plain-text list of companies and their websites, to paste into a chat (for example to have the websites
// reviewed one by one). One line per company: number, name, website, and the audit score when there is one.

import { bucket } from "../discovery/siteaudit.ts";
import type { CompanyRow } from "./types.ts";

const LEVEL = { weak: "ضعيف", medium: "متوسط", good: "جيد", unreadable: "" } as const;

export function siteList(rows: Pick<CompanyRow, "name" | "website" | "domain" | "hq_city" | "site_score" | "site_checked_at">[]): string {
    return rows
        .map((c, i) => {
            const site = c.website || (c.domain ? `https://${c.domain}` : "");
            const parts = [`${i + 1}. ${c.name.trim()}`, site || "(بلا موقع)"];
            if (c.hq_city) parts.push(c.hq_city);
            if (c.site_checked_at && c.site_score !== null) parts.push(`فحص الأداة: ${c.site_score}/100 ${LEVEL[bucket(c.site_score)]}`.trim());
            return parts.join(" — ");
        })
        .join("\n");
}
