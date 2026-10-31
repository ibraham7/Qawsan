import type { PointerEvent, ReactNode } from "react";

import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";

import ArrowOutward from "@mui/icons-material/ArrowOutward";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

import ScrollReveal from "../common/ScrollReveal";
import { useI18n } from "../../i18n";
import { bob, breathe, drift, floatTilt, seeded, shimmerText, spin } from "../../theme/animations";
import { EASE, GREEN, fade } from "../../theme/motion";

/*
 * Closing call to action. The picture on the side is the whole idea of the studio in motion:
 * an idea in the middle, the stages orbiting it (idea, brand, code, launch), and rings of
 * light spreading outward. It is decorative text-free artwork, so it reads the same in
 * Arabic, English and Turkish; everything that reads as words comes from the dictionary.
 */

const ripple = keyframes`
  0% { scale: 0.35; opacity: 0.55; }
  100% { scale: 1; opacity: 0; }
`;

const SATELLITES = [
  { Icon: LightbulbOutlinedIcon, angle: 0 },
  { Icon: BrandingWatermarkOutlinedIcon, angle: 90 },
  { Icon: CodeOutlinedIcon, angle: 180 },
  { Icon: RocketLaunchOutlinedIcon, angle: 270 },
];

const PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  top: `${Math.round(8 + seeded(i, 11) * 84)}%`,
  left: `${Math.round(8 + seeded(i, 13) * 84)}%`,
  size: 3 + Math.round(seeded(i, 17) * 4),
  dur: 9 + seeded(i, 19) * 10,
  delay: -seeded(i, 23) * 12,
}));

function OrbitArt() {
  return (
    <Box
      dir="ltr"
      aria-hidden="true"
      sx={{ position: "relative", mx: "auto", width: { xs: 270, sm: 340, md: 400 }, height: { xs: 270, sm: 340, md: 400 } }}
    >
      {/* light spreading outward */}
      {[0, 1.5, 3].map((d) => (
        <Box
          key={d}
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid",
            borderColor: `rgba(${GREEN}, 0.55)`,
            animation: `${ripple} 4.5s ease-out ${d}s infinite`,
          }}
        />
      ))}

      {/* outer ring with the four stages */}
      <Box
        sx={{
          position: "absolute",
          inset: "10%",
          borderRadius: "50%",
          border: "1.5px dashed",
          borderColor: `rgba(${GREEN}, 0.32)`,
          animation: `${spin} 38s linear infinite`,
        }}
      >
        {SATELLITES.map(({ Icon, angle }) => (
          <Box key={angle} style={{ rotate: `${angle}deg` }} sx={{ position: "absolute", inset: 0 }}>
            <Box
              style={{ position: "absolute", top: 0, left: "50%", marginLeft: -24, marginTop: -24 }}
              sx={{ width: 48, height: 48 }}
            >
              {/* cancels the ring's turn and the slot's angle so the icon stays upright */}
              <Box sx={{ width: "100%", height: "100%", animation: `${spin} 38s linear reverse infinite` }}>
                <Box
                  style={{ rotate: `${-angle}deg` }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    color: "primary.main",
                    bgcolor: (th) => alpha(th.palette.background.paper, 0.9),
                    border: "1px solid",
                    borderColor: `rgba(${GREEN}, 0.4)`,
                    boxShadow: `0 12px 30px -12px rgba(${GREEN}, 0.7)`,
                  }}
                >
                  <Icon sx={{ fontSize: 24 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* inner ring with two sparks */}
      <Box
        sx={{
          position: "absolute",
          inset: "28%",
          borderRadius: "50%",
          border: "1.5px dotted",
          borderColor: `rgba(${GREEN}, 0.4)`,
          animation: `${spin} 26s linear reverse infinite`,
        }}
      >
        {[0, 180].map((a) => (
          <Box key={a} style={{ rotate: `${a}deg` }} sx={{ position: "absolute", inset: 0 }}>
            <Box
              style={{ position: "absolute", top: -5, left: "50%", marginLeft: -5 }}
              sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#8CFAD3", boxShadow: `0 0 14px 3px rgba(${GREEN}, 0.8)` }}
            />
          </Box>
        ))}
      </Box>

      {/* the idea */}
      <Box
        sx={{
          position: "absolute",
          inset: "37%",
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: `radial-gradient(circle, rgba(${GREEN}, 0.55) 0%, rgba(${GREEN}, 0.12) 60%, transparent 72%)`,
          animation: `${breathe} 4s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: 40, md: 54 },
            fontWeight: 600,
            lineHeight: 1,
            color: "text.primary",
            animation: `${floatTilt} 7s ease-in-out infinite`,
          }}
        >
          {"{ }"}
        </Box>
      </Box>

      {/* drifting sparks */}
      {PARTICLES.map((p, i) => (
        <Box
          key={i}
          style={{ top: p.top, left: p.left }}
          sx={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            bgcolor: "primary.main",
            opacity: 0.7,
            animation: `${drift} ${p.dur.toFixed(1)}s ease-in-out ${p.delay.toFixed(1)}s infinite, ${bob} 5s ease-in-out infinite`,
          }}
        />
      ))}
    </Box>
  );
}

/** the child leans toward the pointer while it is near (physical `translate`, never mirrored) */
function Magnetic({ children }: { children: ReactNode }) {
  const move = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.translate = `${(dx * 0.22).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
  };
  const leave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.translate = "0px 0px";
  };
  return (
    <Box
      onPointerMove={move}
      onPointerLeave={leave}
      sx={{ display: "inline-block", p: 2, m: -2, transition: `translate 600ms ${EASE}` }}
    >
      {children}
    </Box>
  );
}

function CTA() {
  const { t, to } = useI18n();
  const isDark = useTheme().palette.mode === "dark";

  return (
    <Box
      component="section"
      id="contact"
      sx={{ position: "relative", py: { xs: 8, sm: 10, md: 16 }, bgcolor: "transparent" }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 2, sm: 3, md: 4 } }}>
        <ScrollReveal variant="scale">
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: `rgba(${GREEN}, 0.25)`,
              borderRadius: { xs: "28px", md: "40px" },
              bgcolor: (th) => alpha(th.palette.background.paper, 0.7),
              backdropFilter: "blur(14px)",
              px: { xs: 3, sm: 5, md: 8 },
              py: { xs: 6, md: 9 },
            }}
          >
            {/* aurora: two slow blobs of light inside the panel (inline top/left/right: physical) */}
            {[
              { style: { top: "-30%", left: "-10%" }, c: `rgba(${GREEN}, 0.22)`, dur: 34, d: 0 },
              { style: { bottom: "-40%", right: "-8%" }, c: "rgba(20, 220, 180, 0.16)", dur: 44, d: -14 },
            ].map((b, i) => (
              <Box
                key={i}
                aria-hidden="true"
                style={b.style}
                sx={{
                  position: "absolute",
                  width: { xs: 340, md: 560 },
                  height: { xs: 340, md: 560 },
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${b.c}, transparent 68%)`,
                  filter: "blur(30px)",
                  pointerEvents: "none",
                  animation: `${drift} ${b.dur}s ease-in-out ${b.d}s infinite`,
                }}
              />
            ))}

            <Box
              sx={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
                alignItems: "center",
                gap: { xs: 5, md: 6 },
              }}
            >
              <Box sx={{ textAlign: { xs: "center", md: "start" } }}>
                <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: 2.5 }}>
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
                    {"{ LET'S BUILD }"}
                  </Typography>
                </Box>

                <Typography
                  component="h2"
                  sx={{
                    m: 0,
                    fontSize: { xs: 36, sm: 48, md: 64 },
                    lineHeight: { xs: 1.25, md: 1.15 },
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "text.primary",
                  }}
                >
                  {t.cta.title1}
                  <Box
                    component="span"
                    sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}
                  >
                    {t.cta.title2}
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    m: 0,
                    mt: { xs: 2.5, md: 3 },
                    mx: { xs: "auto", md: 0 },
                    maxWidth: 520,
                    fontSize: { xs: 15, md: 18 },
                    lineHeight: 1.9,
                    color: "text.secondary",
                  }}
                >
                  {t.cta.lead}
                </Typography>

                <Box sx={{ mt: { xs: 4, md: 5 } }}>
                  <Magnetic>
                    <Button
                      component="a"
                      href={to("/start-project")}
                      endIcon={<ArrowOutward />}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        height: 60,
                        px: 4.5,
                        borderRadius: 999,
                        color: "#04110C",
                        fontSize: 17,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)",
                        boxShadow: `0 18px 44px -18px rgba(${GREEN}, 0.8), inset 0 1px 0 rgba(255,255,255,0.35)`,
                        "& .MuiButton-endIcon": { m: 0, ml: 1.25 },
                        "& .MuiButton-endIcon svg": { fontSize: 21, transition: fade(["rotate", "translate"], 420) },
                        // a band of light crosses the button on hover
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(110deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%)",
                          translate: "-130% 0",
                          transition: `translate 900ms ${EASE}`,
                          pointerEvents: "none",
                        },
                        "&:hover": {
                          background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)",
                          boxShadow: `0 24px 54px -18px rgba(${GREEN}, 0.95), inset 0 1px 0 rgba(255,255,255,0.4)`,
                        },
                        "&:hover::after": { translate: "130% 0" },
                        "&:hover .MuiButton-endIcon svg": { rotate: "45deg" },
                      }}
                    >
                      {t.cta.button}
                    </Button>
                  </Magnetic>
                </Box>
              </Box>

              <OrbitArt />
            </Box>
          </Box>
        </ScrollReveal>
      </Container>
    </Box>
  );
}

export default CTA;
