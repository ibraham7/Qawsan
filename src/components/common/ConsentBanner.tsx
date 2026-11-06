import { useEffect, useState, useSyncExternalStore } from "react";

import { Box, Button, Switch, Typography } from "@mui/material";

import { useI18n } from "../../i18n";
import { TRACKING } from "../../lib/analytics";
import { onConsentChange, onOpenConsentSettings, readConsent, saveConsent } from "../../lib/consent";

/*
 * The cookie notice. It appears only when at least one optional tool is configured (otherwise
 * there is nothing to ask about), until the visitor chooses. "Reject" is as easy to reach as
 * "Accept". The footer's "Cookie settings" link reopens it on the detail view so the choice can
 * be changed or withdrawn at any time.
 */
function ConsentBanner() {
  const { t } = useI18n();
  const c = t.consent;

  // true until the visitor has chosen; false on the server so the prerendered HTML has no banner
  const undecided = useSyncExternalStore(
    onConsentChange,
    () => TRACKING.any && !readConsent(),
    () => false
  );
  const [reopened, setReopened] = useState(false);
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
        <Typography id={id} sx={{ fontSize: 14, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12.5, lineHeight: 1.8, color: "text.secondary" }}>{text}</Typography>
      </Box>
      {control}
    </Box>
  );

  return (
    <Box
      role="dialog"
      aria-modal="false"
      aria-label={c.title}
      sx={{
        position: "fixed",
        zIndex: 1450,
        bottom: { xs: 12, md: 20 },
        insetInline: { xs: 12, md: "auto" },
        insetInlineStart: { md: 20 },
        width: { md: 460 },
        maxHeight: "calc(100vh - 24px)",
        overflowY: "auto",
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 24px 64px -20px rgba(0,0,0,0.55)",
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 0.75 }}>{c.title}</Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.9, color: "text.secondary" }}>{c.text}</Typography>

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

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
        {details ? (
          <Button variant="contained" onClick={() => choose({ analytics, marketing })} sx={{ flex: "1 1 120px" }}>
            {c.save}
          </Button>
        ) : (
          <Button variant="outlined" onClick={() => setDetails(true)} sx={{ flex: "1 1 100%", order: 3 }}>
            {c.customize}
          </Button>
        )}
        <Button variant="contained" onClick={() => choose({ analytics: true, marketing: true })} sx={{ flex: "1 1 120px" }}>
          {c.acceptAll}
        </Button>
        <Button variant="outlined" onClick={() => choose({ analytics: false, marketing: false })} sx={{ flex: "1 1 120px" }}>
          {c.rejectAll}
        </Button>
      </Box>
    </Box>
  );
}

export default ConsentBanner;
