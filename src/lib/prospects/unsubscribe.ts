// Signed links for "stop sending me emails". The token proves the link came from us, without
// storing anything: HMAC of the recipient id with a secret that only the server knows.
// Runs on the server (Node crypto); imported by the API functions only.

import { createHmac, timingSafeEqual } from "node:crypto";

const sig = (secret: string, recipientId: string) => createHmac("sha256", `unsubscribe:${secret}`).update(recipientId).digest("base64url").slice(0, 32);

export function unsubscribeUrl(site: string, secret: string, recipientId: string): string {
    return `${site.replace(/\/+$/, "")}/api/unsubscribe?r=${encodeURIComponent(recipientId)}&t=${sig(secret, recipientId)}`;
}

export function verifyToken(secret: string, recipientId: string, token: string): boolean {
    if (!/^[0-9a-f-]{36}$/i.test(recipientId) || token.length !== 32) return false;
    const a = Buffer.from(sig(secret, recipientId));
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
}

/** the lines appended to every email: the stop line, then the unsubscribe link */
export function withFooter(body: string, url: string): string {
    return `${body}\n\nلإلغاء الاشتراك بضغطة واحدة: ${url}`;
}
