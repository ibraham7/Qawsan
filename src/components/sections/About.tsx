import { Box, Container, Typography, useTheme } from "@mui/material";
import type { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

import ScrollReveal from "../common/ScrollReveal";
import Cell from "../common/SpotCard";
import { useI18n } from "../../i18n";
import {
  bob,
  breathe,
  caret,
  drift,
  floatTilt,
  marquee,
  seeded,
  shimmerText,
  spin,
  typeBar,
} from "../../theme/animations";
import { EASE, GREEN } from "../../theme/motion";

/*
 * About: a bento grid instead of a heading plus two paragraphs. Every cell has its own small
 * living illustration; the words come from the same dictionary as before. Decorative text is
 * Latin and sits in dir="ltr" boxes, so it looks identical in Arabic, English and Turkish.
 */

// neutral ink that works on both the dark and the light theme
const ink = (a: number) => (t: Theme) => alpha(t.palette.text.primary, a);

const STEPS = ["IDEA", "BRAND", "UI / UX", "CODE", "TEST", "LAUNCH"];

/* ------------------------------------------------------------------ mini illustrations */

/** overlapping colour discs that turn and breathe, over a row of swatches */
function DesignArt() {
  const discs = [
    { c: `rgba(${GREEN}, 0.55)`, d: 0 },
    { c: "rgba(140, 250, 211, 0.4)", d: -1.4 },
    { c: "rgba(14, 90, 64, 0.85)", d: -2.8 },
  ];
  return (
    <Box dir="ltr" aria-hidden="true" sx={{ height: 150, display: "grid", placeItems: "center", gap: 1.5, alignContent: "center" }}>
      <Box sx={{ display: "flex", animation: `${spin} 26s linear infinite` }}>
        {discs.map((d, i) => (
          <Box
            key={i}
            sx={{
              width: 66,
              height: 66,
              mx: -1.25,
              borderRadius: "50%",
              bgcolor: d.c,
              mixBlendMode: "screen",
              animation: `${breathe} 4.5s ease-in-out ${d.d}s infinite`,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        {[`rgba(${GREEN}, 1)`, "#8CFAD3", "#0E5A40", "#7CF5C8", "#26312D"].map((c, i) => (
          <Box
            key={c}
            sx={{
              width: 18,
              height: 18,
              borderRadius: "6px",
              bgcolor: c,
              animation: `${bob} ${3 + seeded(i) * 2}s ease-in-out ${-seeded(i, 3) * 3}s infinite`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

/** a code window whose lines type themselves in and out */
function CodeArt() {
  const lines = [
    { w: "46%", c: `rgba(${GREEN}, 0.9)`, indent: 0 },
    { w: "70%", c: ink(0.5), indent: 14 },
    { w: "54%", c: `rgba(${GREEN}, 0.55)`, indent: 14 },
    { w: "38%", c: ink(0.35), indent: 28 },
    { w: "30%", c: `rgba(${GREEN}, 0.9)`, indent: 0 },
  ];
  return (
    <Box
      dir="ltr"
      aria-hidden="true"
      sx={{
        height: 150,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
        px: 1.75,
        py: 1.25,
      }}
    >
      <Box sx={{ display: "flex", gap: 0.6, mb: 1.4 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <Box key={c} sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: c, opacity: 0.8 }} />
        ))}
      </Box>
      <Box sx={{ display: "grid", gap: 1.05 }}>
        {lines.map((l, i) => (
          <Box key={i} style={{ paddingLeft: l.indent }} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              style={{ width: l.w, transformOrigin: "0% 50%" }}
              sx={{
                height: 7,
                borderRadius: 4,
                bgcolor: l.c,
                animation: `${typeBar} 7s ease-in-out ${i * 0.55}s infinite`,
              }}
            />
            {i === lines.length - 1 && (
              <Box sx={{ ml: 0.5, width: 2, height: 12, bgcolor: "primary.main", animation: `${caret} 1s steps(1) infinite` }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** a mini interface where a cursor glides to the button and presses it */
function ExperienceArt() {
  return (
    <Box
      dir="ltr"
      aria-hidden="true"
      sx={{
        position: "relative",
        height: 150,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
        p: 1.75,
        overflow: "hidden",
      }}
    >
      <Box sx={{ height: 8, width: "40%", borderRadius: 4, bgcolor: ink(0.5), mb: 1 }} />
      <Box sx={{ height: 6, width: "78%", borderRadius: 4, bgcolor: ink(0.18), mb: 0.7 }} />
      <Box sx={{ height: 6, width: "60%", borderRadius: 4, bgcolor: ink(0.18), mb: 1.8 }} />
      <Box
        sx={{
          width: 92,
          height: 28,
          borderRadius: 99,
          bgcolor: "primary.main",
          boxShadow: `0 8px 20px -8px rgba(${GREEN}, 0.8)`,
          animation: "press 6s ease-in-out infinite",
          "@keyframes press": {
            "0%, 46%, 60%, 100%": { scale: "1" },
            "52%": { scale: "0.92" },
          },
        }}
      />
      {/* cursor: physical position as inline style (stylis would mirror left/right) */}
      <Box
        component="svg"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        style={{ position: "absolute", top: 62, left: 20 }}
        sx={{
          fill: "#F8FAF9",
          stroke: "#0B0F0E",
          strokeWidth: 1.2,
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
          animation: "glide 6s ease-in-out infinite",
          "@keyframes glide": {
            "0%": { translate: "92px 40px", opacity: 0 },
            "12%": { translate: "92px 40px", opacity: 1 },
            "46%": { translate: "30px 22px" },
            "52%": { translate: "30px 24px" },
            "62%": { translate: "30px 22px" },
            "86%": { translate: "96px -4px", opacity: 1 },
            "100%": { translate: "96px -4px", opacity: 0 },
          },
        }}
      >
        <path d="M5 3l14 8-6 1.8L10.5 19z" />
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ marquee */

function Marquee() {
  const row = (key: string) => (
    <Box key={key} sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      {STEPS.map((s) => (
        <Box key={s} sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            component="span"
            sx={{
              mx: { xs: 3, md: 5 },
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: 44, md: 76 },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              // a faint fill (a stroke would show the font's overlapping contours)
              color: "rgba(160, 167, 163, 0.13)",
              transition: `color 600ms ${EASE}`,
              "&:hover": { color: `rgba(${GREEN}, 0.85)` },
            }}
          >
            {s}
          </Typography>
          <Box component="span" sx={{ color: "primary.main", fontSize: { xs: 20, md: 30 }, lineHeight: 1 }}>
            ✦
          </Box>
        </Box>
      ))}
    </Box>
  );
  return (
    <Box
      dir="ltr"
      aria-hidden="true"
      sx={{
        mt: { xs: 6, md: 10 },
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <Box sx={{ display: "flex", width: "max-content", animation: `${marquee} 46s linear infinite`, "&:hover": { animationPlayState: "paused" } }}>
        {row("a")}
        {row("b")}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------------ section */

function About() {
  const { t } = useI18n();
  const isDark = useTheme().palette.mode === "dark";

  const capabilities = [
    { label: "DESIGN", text: t.about.design, art: <DesignArt /> },
    { label: "DEVELOPMENT", text: t.about.development, art: <CodeArt /> },
    { label: "EXPERIENCE", text: t.about.experience, art: <ExperienceArt /> },
  ];

  return (
    <Box
      component="section"
      id="about"
      sx={{
        position: "relative",
        py: { xs: 9, sm: 11, md: 15 },
        bgcolor: "transparent",
      }}
    >
      {/* slow-moving light behind the grid (inline top/left/right: physical, not mirrored) */}
      {[
        { style: { top: "-10%", left: "-8%" }, size: 520, c: 0.12, d: 0, dur: 46 },
        { style: { top: "55%", right: "-8%" }, size: 460, c: 0.09, d: -18, dur: 58 },
      ].map((b, i) => (
        <Box
          key={i}
          aria-hidden="true"
          style={b.style}
          sx={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${GREEN}, ${b.c}) 0%, transparent 68%)`,
            filter: "blur(8px)",
            pointerEvents: "none",
            animation: `${drift} ${b.dur}s ease-in-out ${b.d}s infinite`,
          }}
        />
      ))}

      <Container maxWidth={false} sx={{ position: "relative", maxWidth: 1280, px: { xs: 2.5, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {/* statement */}
          <Box sx={{ gridColumn: { md: "span 7" } }}>
            <ScrollReveal variant="tilt">
              <Cell sx={{ minHeight: { md: 360 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Box
                  aria-hidden="true"
                  dir="ltr"
                  style={{ position: "absolute", right: 10, bottom: -60 }}
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: 190, md: 330 },
                    lineHeight: 1,
                    color: "primary.main",
                    opacity: 0.07,
                    userSelect: "none",
                    pointerEvents: "none",
                    animation: `${floatTilt} 12s ease-in-out infinite`,
                  }}
                >
                  {"{ }"}
                </Box>

                {/* the flex wrapper keeps the label at the reading start in every language */}
                <Box sx={{ display: "flex", mb: 2.5 }}>
                  <Typography
                    component="span"
                    dir="ltr"
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: { xs: 11, md: 13 },
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      color: "primary.main",
                    }}
                  >
                    {"{ ABOUT QAWSAN }"}
                  </Typography>
                </Box>

                <Typography
                  component="h2"
                  sx={{
                    m: 0,
                    position: "relative",
                    fontSize: { xs: 34, sm: 44, md: 58 },
                    lineHeight: { xs: 1.25, md: 1.18 },
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: "text.primary",
                  }}
                >
                  {t.about.title1}
                  <Box component="span" sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}>
                    {t.about.title2}
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    position: "relative",
                    mt: { xs: 2.5, md: 3.5 },
                    mb: 0,
                    maxWidth: 560,
                    fontSize: { xs: 15.5, md: 18 },
                    lineHeight: 1.95,
                    color: "text.secondary",
                  }}
                >
                  {t.about.p1}
                </Typography>
              </Cell>
            </ScrollReveal>
          </Box>

          {/* philosophy */}
          <Box sx={{ gridColumn: { md: "span 5" } }}>
            <ScrollReveal variant="tilt" delay={120}>
              <Cell sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 3 }}>
                <Box sx={{ position: "relative" }}>
                  <Box
                    aria-hidden="true"
                    dir="ltr"
                    sx={{
                      fontFamily: "Georgia, serif",
                      fontSize: 84,
                      lineHeight: 0.7,
                      height: 44,
                      color: "primary.main",
                      opacity: 0.85,
                      animation: `${breathe} 5s ease-in-out infinite`,
                    }}
                  >
                    “
                  </Box>
                  <Typography sx={{ m: 0, fontSize: { xs: 15, md: 16.5 }, lineHeight: 2, color: "text.primary" }}>
                    {t.about.p2}
                  </Typography>
                </Box>

                <Box dir="ltr" aria-hidden="true" sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {STEPS.map((s, i) => (
                    <Box
                      key={s}
                      sx={{
                        px: 1.5,
                        py: 0.55,
                        borderRadius: 99,
                        border: "1px solid",
                        borderColor: `rgba(${GREEN}, 0.28)`,
                        bgcolor: `rgba(${GREEN}, 0.07)`,
                        color: "primary.main",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        animation: `${bob} ${3.2 + seeded(i, 5) * 2.4}s ease-in-out ${-seeded(i, 7) * 4}s infinite`,
                      }}
                    >
                      {s}
                    </Box>
                  ))}
                </Box>
              </Cell>
            </ScrollReveal>
          </Box>

          {/* capabilities */}
          {capabilities.map((c, i) => (
            <Box key={c.label} sx={{ gridColumn: { md: "span 4" } }}>
              <ScrollReveal variant="scale" delay={i * 110}>
                <Cell sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ position: "relative" }}>{c.art}</Box>
                  <Box sx={{ position: "relative" }}>
                    <Box sx={{ display: "flex", mb: 0.75 }}>
                      <Typography
                        dir="ltr"
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          color: "primary.main",
                        }}
                      >
                        {c.label}
                      </Typography>
                    </Box>
                    <Typography sx={{ m: 0, fontSize: { xs: 15, md: 16 }, color: "text.secondary", lineHeight: 1.8 }}>
                      {c.text}
                    </Typography>
                  </Box>
                </Cell>
              </ScrollReveal>
            </Box>
          ))}
        </Box>

        <Marquee />
      </Container>
    </Box>
  );
}

export default About;
