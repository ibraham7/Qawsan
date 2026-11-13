// Compiles the email API handlers, then runs the end-to-end flow against a fake SMTP server and an
// in-memory database. No real mail is sent and nothing leaves this computer.
// Run: node scripts/test-smtp.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const out = resolve("node_modules/.tmp/smtpout");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
execFileSync(
    process.execPath,
    [
        "node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--skipLibCheck", "--target", "es2023", "--module", "nodenext", "--moduleResolution", "nodenext",
        "--rewriteRelativeImportExtensions", "--types", "node", "--rootDir", ".", "--outDir", out,
        "api/prospects/email-send.ts", "api/prospects/email-status.ts", "api/unsubscribe.ts",
    ],
    { stdio: "inherit" }
);
writeFileSync(resolve(out, "package.json"), '{"type":"module"}');
copyFileSync("scripts/test-smtp-flow.mjs", resolve(out, "flow.mjs"));
execFileSync(process.execPath, [resolve(out, "flow.mjs"), out], { stdio: "inherit" });
