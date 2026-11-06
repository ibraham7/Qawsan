import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Box, Button, Switch, Typography } from "@mui/material";

import { useI18n } from "../../i18n";
import { LEGAL } from "../../i18n/legal";
import { TRACKING } from "../../lib/analytics";
import { onConsentChange, onOpenConsentSettings, readConsent, saveConsent } from "../../lib/consent";

/*
 * The cookie notice. It appears only when at least one optional tool is configured (otherwise
 * there is nothing to ask about), until the visitor chooses. "Reject" is as easy to reach as
 * "Accept". The footer's "Cookie settings" link reopens it on the detail view so the choice can
 * be changed or withdrawn at any time.
 */
function ConsentBanner() {
  const { t, to, locale } = useI18n();
  const legal = LEGAL[locale].ui;
  const c = t.consent;

  // true until the visitor has chosen; false on the server so the prerendered HTML has no banner
  const undecided = useSyncExternalStore(
    onConsentChange,
    () => TRACKING.any && !readConsent(),
    () => false
  );
  const [reopened, setReopened] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);
  const open = undecided || reopened;
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // the footer link reopens the banner on the detail view, with the saved choice filled in
  useEffect(
    () =>
      onOpenConsentSettings(() => {
        const saved = readConsent();
        setAnalytics(saved?.analytics ?? false);
        setMarketing(saved?.marketing ?? false);
        setDetails(true);
        setReopened(true);
      }),
    []
  );

  // when reopened from the footer, move keyboard focus into the panel
  useEffect(() => {
    if (reopened) panel.current?.focus();
  }, [reopened]);

  if (!open) return null;

  const choose = (next: { analytics: boolean; marketing: boolean }) => {
    saveConsent({
      analytics: TRACKING.analytics && next.analytics,
      marketing: TRACKING.marketing && next.marketing,
    });
    setReopened(false);
    setDetails(false);
  };

  const row = (
    id: string,
    title: string,
    text: string,
    control: React.ReactNode
  ) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, py: 1.25 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography id={id} sx={{ fontSize: 15.5, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: "text.secondary" }}>{text}</Typography>
      </Box>
      {control}
    </Box>
  );

  return (
    <Box
      ref={panel}
      tabIndex={-1}
      onKeyDown={(e) => {
        // Escape only closes the settings view the visitor opened; it never counts as a choice
        if (e.key === "Escape" && reopened) {
          setReopened(false);
          setDetails(false);
        }
      }}
      role="dialog"
      aria-modal="false"
      aria-label={c.title}
      sx={{
        position: "fixed",
        zIndex: 1450,
        bottom: { xs: 12, md: 20 },
        insetInline: { xs: 12, md: "auto" },
        insetInlineStart: { md: 20 },
        width: { md: 560 },
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
        outline: "none",
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 24px 64px -20px rgba(0,0,0,0.55)",
      }}
    >
      <Typography sx={{ fontSize: { xs: 19, md: 22 }, fontWeight: 700, mb: 1 }}>{c.title}</Typography>
      <Typography sx={{ fontSize: { xs: 14.5, md: 16 }, lineHeight: 1.9, color: "text.secondary" }}>{c.text}</Typography>
      <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 2, fontSize: 13.5 }}>
        {[
          { label: legal.cookies, href: to("/cookies") },
          { label: legal.privacy, href: to("/privacy") },
        ].map((l) => (
          <Box key={l.href} component="a" href={l.href} sx={{ color: "primary.main", textUnderlineOffset: 3 }}>
            {l.label}
          </Box>
        ))}
      </Box>

      {details && (
        <Box sx={{ mt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
          {row(
            "consent-necessary",
            c.necessary,
            c.necessaryText,
            <Switch checked disabled slotProps={{ input: { "aria-labelledby": "consent-necessary" } }} />
          )}
          {TRACKING.analytics &&
            row(
              "consent-analytics",
              c.analytics,
              c.analyticsText,
              <Switch
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                slotProps={{ input: { "aria-labelledby": "consent-analytics" } }}
              />
            )}
          {TRACKING.marketing &&
            row(
              "consent-marketing",
              c.marketing,
              c.marketingText,
              <Switch
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                slotProps={{ input: { "aria-labelledby": "consent-marketing" } }}
              />
            )}
        </Box>
      )}

      {/* accept is the big button; reject and customize are smaller but still plain to see */}
      <Box sx={{ display: "grid", gap: 1.25, mt: 2.5 }}>
        {details && (
          <Button
            variant="contained"
            size="large"
            onClick={() => choose({ analytics, marketing })}
            sx={{ py: 1.4, fontSize: 16, fontWeight: 700 }}
          >
            {c.save}
          </Button>
        )}
        <Button
          variant={details ? "outlined" : "contained"}
          size="large"
          onClick={() => choose({ analytics: true, marketing: true })}
          sx={{ py: 1.4, fontSize: 16, fontWeight: 700 }}
        >
          {c.acceptAll}
        </Button>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          <Button size="small" variant="outlined" onClick={() => choose({ analytics: false, marketing: false })} sx={{ fontSize: 13 }}>
            {c.rejectAll}
          </Button>
          {!details && (
            <Button size="small" onClick={() => setDetails(true)} sx={{ fontSize: 13 }}>
              {c.customize}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default ConsentBanner;
