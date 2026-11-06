import { Fragment, useEffect } from "react";
import type { ReactNode } from "react";

import { Box, Button, Container, Typography } from "@mui/material";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useI18n } from "../i18n";
import { LEGAL, LEGAL_EMAIL } from "../i18n/legal";
import type { LegalKind } from "../i18n/legal";
import { TRACKING } from "../lib/analytics";
import { openConsentSettings } from "../lib/consent";

interface Props {
  kind: LegalKind;
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

/** turns "{email}" and bare https:// addresses into links; everything else stays plain text */
function inline(text: string): ReactNode {
  return text.split(/(\{email\}|https?:\/\/[^\s]+)/).map((part, i) => {
    if (part === "{email}") {
      return (
        <Box key={i} component="a" href={`mailto:${LEGAL_EMAIL}`} dir="ltr" sx={{ color: "primary.main" }}>
          {LEGAL_EMAIL}
        </Box>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <Box key={i} component="a" href={part} target="_blank" rel="noopener noreferrer" dir="ltr" sx={{ color: "primary.main", wordBreak: "break-all" }}>
          {part}
        </Box>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const body = { m: 0, mb: 1.5, fontSize: { xs: 15, md: 16 }, lineHeight: 2, color: "text.secondary" } as const;

function Legal({ kind, mode, onToggleTheme }: Props) {
  const { locale } = useI18n();
  const text = LEGAL[locale];
  const doc = text[kind];

  useEffect(() => {
    document.title = doc.metaTitle;
  }, [doc.metaTitle]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />

      <Container
        component="main"
        maxWidth={false}
        sx={{ maxWidth: 860, px: { xs: 2.5, sm: 3, md: 4 }, pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 } }}
      >
        <Typography component="h1" sx={{ m: 0, mb: 1.5, fontWeight: 700, fontSize: { xs: 30, sm: 38, md: 46 }, lineHeight: 1.3 }}>
          {doc.title}
        </Typography>
        <Typography sx={{ m: 0, mb: 2, fontSize: 14, color: "text.secondary" }}>
          {text.ui.updatedLabel}: <time>{text.ui.updatedDate}</time>
        </Typography>
        <Typography sx={{ ...body, fontSize: { xs: 16, md: 18 } }}>{doc.intro}</Typography>
        <Typography
          sx={{
            m: 0,
            my: 3,
            p: 2,
            fontSize: 14,
            lineHeight: 1.9,
            color: "text.secondary",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          {inline(text.ui.note)}
        </Typography>

        <Box
          component="nav"
          aria-label={text.ui.contents}
          sx={{ my: 4, p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Typography sx={{ m: 0, mb: 1.5, fontWeight: 700, fontSize: 15 }}>{text.ui.contents}</Typography>
          <Box component="ol" sx={{ m: 0, ps: 3, display: "grid", gap: 0.75 }}>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <Box
                  component="a"
                  href={`#${s.id}`}
                  sx={{ color: "text.secondary", textDecoration: "none", fontSize: 15, "&:hover, &:focus-visible": { color: "primary.main" } }}
                >
                  {s.title}
                </Box>
              </li>
            ))}
          </Box>
        </Box>

        {doc.sections.map((s) => (
          <Box key={s.id} component="section" id={s.id} sx={{ mt: { xs: 5, md: 6 }, scrollMarginTop: 110 }}>
            <Typography component="h2" sx={{ m: 0, mb: 1.5, fontWeight: 700, fontSize: { xs: 21, md: 24 }, lineHeight: 1.5 }}>
              {s.title}
            </Typography>
            {s.paragraphs?.map((p, i) => (
              <Typography key={i} sx={body}>
                {inline(p)}
              </Typography>
            ))}
            {s.list && (
              <Box component="ul" sx={{ m: 0, mb: 1.5, ps: 3, display: "grid", gap: 1 }}>
                {s.list.map((item, i) => (
                  <Typography key={i} component="li" sx={{ ...body, m: 0 }}>
                    {inline(item)}
                  </Typography>
                ))}
              </Box>
            )}
            {s.after?.map((p, i) => (
              <Typography key={i} sx={body}>
                {inline(p)}
              </Typography>
            ))}
          </Box>
        ))}

        {kind === "cookies" && TRACKING.any && (
          <Button variant="contained" size="large" onClick={openConsentSettings} sx={{ mt: 4 }}>
            {text.ui.openCookieSettings}
          </Button>
        )}
      </Container>

      <Footer />
    </Box>
  );
}

export default Legal;
