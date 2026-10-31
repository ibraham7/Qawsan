import { Box, Container, Typography, useTheme } from "@mui/material";

import CountUp from "../common/CountUp";
import ScrollReveal from "../common/ScrollReveal";
import SpotCard from "../common/SpotCard";
import { useProjects } from "../../data/projects";
import { LOCALES, useI18n } from "../../i18n";
import { bob, breathe, drift, seeded, shimmerText, spin } from "../../theme/animations";
import { EASE, GREEN, fade } from "../../theme/motion";

import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

// titles and texts come from t.why.items, in this order
const reasonIcons = [LightbulbOutlinedIcon, DesignServicesOutlinedIcon, SearchOutlinedIcon, GroupsOutlinedIcon];

// the six stages of the process (see t.process.steps); articles are counted from content/blog
const STAGES = 6;
const ARTICLES = Object.keys(import.meta.glob("/content/blog/*.md")).length;

/** A number with a turning ring behind it. */
function StatTile({ value, label, index }: { value: number; label: string; index: number }) {
  return (
    <SpotCard sx={{ p: { xs: 2.5, md: 3.25 }, display: "flex", alignItems: "center", gap: { xs: 2, md: 2.5 } }}>
      <Box
        aria-hidden="true"
        dir="ltr"
        sx={{ position: "relative", flexShrink: 0, width: { xs: 64, md: 84 }, height: { xs: 64, md: 84 } }}
      >
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            animation: `${spin} ${(7 + index * 2.5).toFixed(1)}s linear ${index % 2 ? "reverse" : "normal"} infinite`,
          }}
        >
          <circle cx="50" cy="50" r="44" fill="none" stroke={`rgba(${GREEN}, 0.14)`} strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#00D084"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${60 + index * 22} 400`}
          />
          <circle cx="50" cy="6" r="3.5" fill="#8CFAD3" />
        </Box>
        <Box
          sx={{
            position: "absolute",
            inset: "26%",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(${GREEN}, 0.5), rgba(${GREEN}, 0) 70%)`,
            animation: `${breathe} ${(3.6 + index * 0.5).toFixed(1)}s ease-in-out infinite`,
          }}
        />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          dir="ltr"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: 40, md: 54 },
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "start",
            ...shimmerText(),
          }}
        >
          <CountUp to={value} />
        </Typography>
        <Typography sx={{ mt: 0.75, mb: 0, fontSize: { xs: 13, md: 14.5 }, lineHeight: 1.6, color: "text.secondary" }}>
          {label}
        </Typography>
      </Box>
    </SpotCard>
  );
}

function WhyQawsan() {
  const { t } = useI18n();
  const projects = useProjects();
  const isDark = useTheme().palette.mode === "dark";

  const stats = [
    { value: projects.length, label: t.why.stats.projects },
    { value: LOCALES.length, label: t.why.stats.languages },
    { value: STAGES, label: t.why.stats.stages },
    { value: ARTICLES, label: t.why.stats.articles },
  ];

  return (
    <Box
      component="section"
      id="why-qawsan"
      sx={{
        position: "relative",
        py: { xs: 10, md: 16 },
        bgcolor: "transparent",
      }}
    >
      {/* slow light behind the section (inline top/left/right: physical, not mirrored) */}
      {[
        { style: { top: "8%", left: "-12%" }, size: 520, d: 0, dur: 52 },
        { style: { bottom: "4%", right: "-12%" }, size: 460, d: -20, dur: 64 },
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
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Typography
            component="span"
            dir="ltr"
            sx={{
              display: "block",
              mb: 2.5,
              fontFamily: "Inter, sans-serif",
              fontSize: { xs: 11, md: 13 },
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "primary.main",
            }}
          >
            {"{ WHY QAWSAN }"}
          </Typography>

          <Typography
            component="h2"
            sx={{
              m: 0,
              mx: "auto",
              maxWidth: 820,
              fontSize: { xs: 32, sm: 42, md: 56 },
              lineHeight: { xs: 1.3, md: 1.2 },
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "text.primary",
            }}
          >
            {t.why.title1}
            <Box
              component="span"
              sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}
            >
              {t.why.title2}
            </Box>
          </Typography>

          <Typography
            sx={{ m: 0, mx: "auto", mt: 2.5, maxWidth: 620, fontSize: { xs: 15, md: 17.5 }, lineHeight: 1.9, color: "text.secondary" }}
          >
            {t.why.lead}
          </Typography>
        </Box>

        {/* numbers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
            gap: { xs: 1.75, md: 2.5 },
            mb: { xs: 2.5, md: 3.5 },
          }}
        >
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} variant={i % 2 ? "tilt" : "scale"} delay={i * 90}>
              <StatTile value={s.value} label={s.label} index={i} />
            </ScrollReveal>
          ))}
        </Box>

        {/* reasons */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
            gap: { xs: 1.75, md: 2.5 },
          }}
        >
          {t.why.items.map((reason, i) => {
            const Icon = reasonIcons[i];
            return (
              <ScrollReveal key={reason.title} variant={(["up", "blur", "tilt", "scale"] as const)[i]} delay={i * 110}>
                <SpotCard
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    // a bright line draws across the top edge on hover
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
                    "&:hover .reason-no": { color: "primary.main", opacity: 0.5 },
                  }}
                >
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box
                      className="reason-icon"
                      sx={{
                        position: "relative",
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
                      className="reason-no"
                      dir="ltr"
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 44,
                        fontWeight: 700,
                        lineHeight: 1,
                        color: "text.secondary",
                        opacity: 0.18,
                        transition: fade(["color", "opacity"], 500),
                      }}
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
      </Container>
    </Box>
  );
}

export default WhyQawsan;
