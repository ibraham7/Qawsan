// SMTP sending for the email campaigns. The mailbox is configured ONLY through Vercel
// environment variables (never in the database, never in the browser):
//
//   SMTP_USER       required  the mailbox address (e.g. you@gmail.com)
//   SMTP_PASS       required  its password. For Gmail: an App Password, not your normal password
//   SMTP_HOST       optional  default smtp.gmail.com
//   SMTP_PORT       optional  default 465 (SSL); 587 uses STARTTLS
//   SMTP_FROM       optional  sender address, default SMTP_USER (Gmail only allows its own address)
//   SMTP_FROM_NAME  optional  sender name, default "قوسان"
//   SITE_URL        optional  default https://qawsan.website (used in the unsubscribe link)
//   SEND_TIMEZONE   optional  default Europe/Istanbul (where "today" starts for the daily limit)

import nodemailer from "nodemailer";

import { classifyError, shortError } from "../../src/lib/prospects/sending.js";

export interface MailConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
}

export function mailConfig(): MailConfig | null {
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s+/g, ""); // Google shows App Passwords in groups of four
    if (!user || !pass) return null;
    return {
        host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 465,
        user,
        pass,
        from: process.env.SMTP_FROM?.trim() || user,
        fromName: process.env.SMTP_FROM_NAME?.trim() || "قوسان",
    };
}

export const siteUrl = () => (process.env.SITE_URL?.trim() || "https://qawsan.website").replace(/\/+$/, "");
export const sendTimezone = () => process.env.SEND_TIMEZONE?.trim() || "Europe/Istanbul";

export interface Outgoing {
    to: string;
    subject: string;
    text: string;
    /** one-click unsubscribe URL (adds the List-Unsubscribe headers mail apps show as a button) */
    unsubscribe?: string;
}

export type SendResult = { ok: true } | { ok: false; kind: "auth" | "permanent" | "temporary"; error: string };

export function createSender(cfg: MailConfig) {
    const transport = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.port === 465,
        auth: { user: cfg.user, pass: cfg.pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
    });
    return {
        async send(m: Outgoing): Promise<SendResult> {
            try {
                await transport.sendMail({
                    from: { name: cfg.fromName, address: cfg.from },
                    to: m.to,
                    replyTo: cfg.from,
                    subject: m.subject,
                    text: m.text,
                    headers: m.unsubscribe ? { "List-Unsubscribe": `<${m.unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
                });
                return { ok: true };
            } catch (e) {
                const err = e as { code?: string; responseCode?: number; message?: string };
                return { ok: false, kind: classifyError(err), error: shortError(err) };
            }
        },
        async verify(): Promise<SendResult> {
            try {
                await transport.verify();
                return { ok: true };
            } catch (e) {
                const err = e as { code?: string; responseCode?: number; message?: string };
                return { ok: false, kind: classifyError(err), error: shortError(err) };
            }
        },
    };
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
