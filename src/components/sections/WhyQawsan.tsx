import { useState } from "react";

import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

import CountUp from "../common/CountUp";
import ScrollReveal from "../common/ScrollReveal";
import SpotCard from "../common/SpotCard";
import { useProjects } from "../../data/projects";
import { useI18n } from "../../i18n";
import { bob, drift, seeded, shimmerText } from "../../theme/animations";
import { EASE, GREEN, fade } from "../../theme/motion";

// titles and texts come from t.why.items, in this order
const reasonIcons = [LightbulbOutlinedIcon, GroupsOutlinedIcon, DesignServicesOutlinedIcon, SearchOutlinedIcon];

const rise = keyframes`
  from { opacity: 0; translate: 0 14px; }
  to { opacity: 1; translate: 0 0; }
`;

/** One short, plain statement of what the studio has done. */
function Achievement({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: "center", px: { xs: 1, md: 3 }, py: { xs: 3, md: 4.5 } }}>
      <Typography
        component="div"
        dir="ltr"
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: { xs: 56, md: 84 },
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          ...shimmerText(),
        }}
      >
        <CountUp to={value} />
      </Typography>
      <Typography sx={{ m: 0, mt: 1.5, mx: "auto", maxWidth: 260, fontSize: { xs: 14.5, md: 16.5 }, lineHeight: 1.7, color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}

function WhyQawsan() {
  const { t, to, dir } = useI18n();
  const projects = useProjects();
  const isDark = useTheme().palette.mode === "dark";
  const [picked, setPicked] = useState(0);
  const Arrow = dir === "rtl" ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;

  const option = t.why.pick.options[picked];
  // the first number follows the real portfolio, the rest come from the dictionary
  const achievements = t.why.achievements.map((a, i) => ({ ...a, value: i === 0 ? projects.length : a.value }));

  return (
    <Box component="section" id="why-qawsan" sx={{ position: "relative", py: { xs: 10, md: 16 }, bgcolor: "transparent" }}>
      {/* slow light behind the section (inline top/left/right: physical, not mirrored) */}
      {[
        { style: { top: "6%", left: "-12%" }, size: 520, d: 0, dur: 52 },
        { style: { bottom: "6%", right: "-12%" }, size: 460, d: -20, dur: 64 },
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
            background: `radial-gradient(circle, rgba(${GREEN}, 0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
            animation: `${drift} ${b.dur}s ease-in-out ${b.d}s infinite`,
          }}
        />
      ))}

      <Container maxWidth={false} sx={{ position: "relative", maxWidth: 1280, px: { xs: 2.5, sm: 3, md: 4 } }}>
        {/* heading */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Typography
            component="span"
            dir="ltr"
            sx={{ display: "block", mb: 2.5, fontFamily: "Inter, sans-serif", fontSize: { xs: 11, md: 13 }, fontWeight: 500, letterSpacing: "0.12em", color: "primary.main" }}
          >
            {"{ WHY QAWSAN }"}
          </Typography>

          <Typography
            component="h2"
            sx={{ m: 0, mx: "auto", maxWidth: 820, fontSize: { xs: 32, sm: 42, md: 56 }, lineHeight: { xs: 1.3, md: 1.2 }, fontWeight: 700, letterSpacing: "-0.025em", color: "text.primary" }}
          >
            {t.why.title1}
            <Box component="span" sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}>
              {t.why.title2}
            </Box>
          </Typography>

          <Typography sx={{ m: 0, mx: "auto", mt: 2.5, maxWidth: 620, fontSize: { xs: 15, md: 17.5 }, lineHeight: 1.9, color: "text.secondary" }}>
            {t.why.lead}
          </Typography>
        </Box>

        {/* what we've done: three plain numbers in one band */}
        <ScrollReveal variant="scale">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              borderRadius: { xs: "26px", md: "34px" },
              border: "1px solid",
              borderColor: `rgba(${GREEN}, 0.25)`,
              bgcolor: "background.paper",
              overflow: "hidden",
              mb: { xs: 2.5, md: 3.5 },
              // thin dividers between the numbers (explicit colour: the theme token is lost in nested selectors)
              "& > *:not(:first-of-type)": {
                borderTop: { xs: `1px solid rgba(${GREEN}, 0.16)`, md: 0 },
                borderInlineStart: { md: `1px solid rgba(${GREEN}, 0.16)` },
              },
            }}
          >
            {achievements.map((a) => (
              <Achievement key={a.label} value={a.value} label={a.label} />
            ))}
          </Box>
        </ScrollReveal>

        {/* four reasons, in reading order */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: { xs: 1.75, md: 2.5 },
            mb: { xs: 2.5, md: 3.5 },
          }}
        >
          {t.why.items.map((reason, i) => {
            const Icon = reasonIcons[i];
            return (
              <ScrollReveal key={reason.title} variant={(["up", "blur", "tilt", "scale"] as const)[i]} delay={i * 100}>
                <SpotCard
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      insetInline: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #00D084, transparent)",
                      scale: "0 1",
                      transition: `scale 700ms ${EASE}`,
                    },
                    "&:hover::after": { scale: "1 1" },
                    "&:hover .reason-icon": { bgcolor: `rgba(${GREEN}, 0.16)`, borderColor: `rgba(${GREEN}, 0.5)` },
                  }}
                >
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box
                      className="reason-icon"
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "18px",
                        display: "grid",
                        placeItems: "center",
                        color: "primary.main",
                        bgcolor: `rgba(${GREEN}, 0.06)`,
                        border: "1px solid",
                        borderColor: `rgba(${GREEN}, 0.22)`,
                        transition: fade(["background-color", "border-color"], 480),
                        animation: `${bob} ${(4.4 + seeded(i, 9) * 2).toFixed(2)}s ease-in-out ${(-seeded(i, 2) * 5).toFixed(2)}s infinite`,
                      }}
                    >
                      <Icon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography
                      dir="ltr"
                      sx={{ fontFamily: "Inter, sans-serif", fontSize: 40, fontWeight: 700, lineHeight: 1, color: "text.secondary", opacity: 0.2 }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                  </Box>

                  <Box sx={{ position: "relative" }}>
                    <Typography component="h3" sx={{ m: 0, mb: 1, fontSize: { xs: 19, md: 20 }, fontWeight: 600, lineHeight: 1.4, color: "text.primary" }}>
                      {reason.title}
                    </Typography>
                    <Typography sx={{ m: 0, fontSize: { xs: 14.5, md: 15 }, lineHeight: 1.85, color: "text.secondary" }}>
                      {reason.text}
                    </Typography>
                  </Box>
                </SpotCard>
              </ScrollReveal>
            );
          })}
        </Box>

        {/* pick your project and see what you get */}
        <ScrollReveal variant="tilt">
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: { xs: 4, md: 7 },
              alignItems: "center",
              borderRadius: { xs: "28px", md: "40px" },
              border: "1px solid",
              borderColor: `rgba(${GREEN}, 0.3)`,
              bgcolor: "background.paper",
              boxShadow: `0 40px 90px -50px rgba(${GREEN}, 0.5)`,
              px: { xs: 3, sm: 5, md: 8 },
              py: { xs: 5, md: 8 },
            }}
          >
            <Box
              aria-hidden="true"
              style={{ top: "-30%", left: "-10%" }}
              sx={{
                position: "absolute",
                width: 480,
                height: 480,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(${GREEN}, 0.16), transparent 68%)`,
                filter: "blur(24px)",
                pointerEvents: "none",
                animation: `${drift} 40s ease-in-out infinite`,
              }}
            />

            <Box sx={{ position: "relative" }}>
              <Box sx={{ display: "flex", mb: 2 }}>
                <Typography component="span" sx={{ px: 1.5, py: 0.5, borderRadius: 99, border: "1px solid", borderColor: `rgba(${GREEN}, 0.35)`, bgcolor: `rgba(${GREEN}, 0.08)`, color: "primary.main", fontSize: 13, fontWeight: 600 }}>
                  {t.why.pick.label}
                </Typography>
              </Box>
              <Typography component="h3" sx={{ m: 0, fontSize: { xs: 28, md: 38 }, lineHeight: 1.3, fontWeight: 700, letterSpacing: "-0.02em", color: "text.primary" }}>
                {t.why.pick.title}
              </Typography>
              <Typography sx={{ m: 0, mt: 1.5, mb: 3, fontSize: { xs: 15, md: 17 }, lineHeight: 1.85, color: "text.secondary" }}>
                {t.why.pick.lead}
              </Typography>

              <Box role="tablist" sx={{ display: "grid", gap: 1.25 }}>
                {t.why.pick.options.map((o, i) => {
                  const on = i === picked;
                  return (
                    <Box
                      key={o.label}
                      component="button"
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setPicked(i)}
                      sx={{
                        all: "unset",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        px: 2.5,
                        py: 1.75,
                        borderRadius: "18px",
                        border: "1px solid",
                        borderColor: on ? `rgba(${GREEN}, 0.6)` : "divider",
                        bgcolor: on ? `rgba(${GREEN}, 0.1)` : "transparent",
                        color: on ? "primary.main" : "text.primary",
                        fontSize: { xs: 16, md: 17.5 },
                        fontWeight: on ? 700 : 500,
                        transition: fade(["background-color", "border-color", "color", "translate"], 420),
                        "&:hover": { borderColor: `rgba(${GREEN}, 0.5)`, translate: dir === "rtl" ? "-4px 0" : "4px 0" },
                        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                      }}
                    >
                      {o.label}
                      <Arrow sx={{ fontSize: 20, opacity: on ? 1 : 0.35, transition: fade(["opacity"], 400) }} />
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box key={picked} sx={{ position: "relative" }}>
              <Box
                sx={{
                  borderRadius: "28px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(11,23,19,0.03)",
                  p: { xs: 3, md: 4.5 },
                }}
              >
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none", display: "grid", gap: 2.5 }}>
                  {option.items.map((item, i) => (
                    <Box
                      key={item}
                      component="li"
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2, animation: `${rise} 600ms ${EASE} ${i * 120}ms both` }}
                    >
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 30,
                          height: 30,
                          mt: 0.25,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "primary.main",
                          color: "#04110C",
                          boxShadow: `0 8px 20px -8px rgba(${GREEN}, 0.8)`,
                        }}
                      >
                        <CheckRoundedIcon sx={{ fontSize: 19 }} />
                      </Box>
                      <Typography sx={{ m: 0, fontSize: { xs: 16.5, md: 19 }, lineHeight: 1.7, color: "text.primary", fontWeight: 500 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  href={to("/start-project")}
                  endIcon={<Arrow />}
                  sx={{
                    mt: 4,
                    width: { xs: "100%", sm: "auto" },
                    height: 56,
                    px: 4,
                    borderRadius: 999,
                    color: "#04110C",
                    fontSize: 16.5,
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)",
                    boxShadow: `0 18px 40px -18px rgba(${GREEN}, 0.85), inset 0 1px 0 rgba(255,255,255,0.35)`,
                    "& .MuiButton-endIcon": { m: 0, ml: 1 },
                    "&:hover": { background: "linear-gradient(135deg, #00D084 0%, #1CE9A4 100%)" },
                  }}
                >
                  {t.why.pick.cta}
                </Button>
                <Typography sx={{ m: 0, mt: 1.75, fontSize: 13.5, color: "text.secondary" }}>{t.why.pick.note}</Typography>
              </Box>
            </Box>
          </Box>
        </ScrollReveal>
      </Container>
    </Box>
  );
}

export default WhyQawsan;
