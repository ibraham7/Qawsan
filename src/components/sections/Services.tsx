import { Fragment, useEffect, useRef, useState } from "react";

import { Box, IconButton, Container, Typography, useTheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BrandingWatermarkOutlinedIcon from "@mui/icons-material/BrandingWatermarkOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

import ScrollReveal from "../common/ScrollReveal";
import { useI18n } from "../../i18n";
import { EASE, GREEN, fade } from "../../theme/motion";
import { breathe, floatTilt, shimmerText, spin } from "../../theme/animations";

const AUTOPLAY_MS = 5200;

const steps = [
    { key: "idea", number: "01", title: "IDEA", label: "DEFINE", icon: LightbulbOutlinedIcon },
    { key: "brand", number: "02", title: "BRAND", label: "IDENTITY", icon: BrandingWatermarkOutlinedIcon },
    { key: "uiux", number: "03", title: "UI / UX", label: "EXPERIENCE", icon: DesignServicesOutlinedIcon },
    { key: "code", number: "04", title: "CODE", label: "BUILD", icon: CodeOutlinedIcon },
    { key: "test", number: "05", title: "TEST", label: "REFINE", icon: CheckCircleOutlineOutlinedIcon },
    { key: "launch", number: "06", title: "LAUNCH", label: "SHIP", icon: RocketLaunchOutlinedIcon },
] as const;

const fill = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const enter = keyframes`
  from { opacity: 0; translate: 0 18px; filter: blur(6px); }
  to { opacity: 1; translate: 0 0; filter: blur(0); }
`;

/*
 * The process is one big panel that shows a single stage at a time, with a rail of the six
 * stages above it. Nothing is hidden below a row of cards any more: click or point at a stage
 * in the rail (or use the arrows) and the panel changes. It also advances by itself, paused
 * while the pointer is over it.
 */
function IdeaToProduct() {
    const { t, dir } = useI18n();
    const isDark = useTheme().palette.mode === "dark";
    const rtl = dir === "rtl";

    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const go = (i: number) => setActive((i + steps.length) % steps.length);
    const step = steps[active];
    const Icon = step.icon;
    // "forward" follows the reading direction
    const Prev = rtl ? ArrowForwardRoundedIcon : ArrowBackRoundedIcon;
    const Next = rtl ? ArrowBackRoundedIcon : ArrowForwardRoundedIcon;

    return (
        <Box
            component="section"
            id="services"
            ref={sectionRef}
            sx={{ position: "relative", py: { xs: 8, sm: 10, md: 16 }, bgcolor: "transparent" }}
        >
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
                        {"{ OUR PROCESS }"}
                    </Typography>

                    <Typography
                        component="h2"
                        sx={{
                            m: 0,
                            fontSize: { xs: 32, sm: 44, md: 58 },
                            lineHeight: { xs: 1.3, md: 1.2 },
                            fontWeight: 700,
                            letterSpacing: "-0.025em",
                            color: "text.primary",
                        }}
                    >
                        {t.process.title1}
                        <Box component="span" sx={{ display: "block", ...(isDark ? shimmerText() : shimmerText("#00A86B", "#00D084")) }}>
                            {t.process.title2}
                        </Box>
                    </Typography>

                    <Typography
                        sx={{ m: 0, mx: "auto", mt: 2.5, maxWidth: 640, fontSize: { xs: 15, md: 17.5 }, lineHeight: 1.9, color: "text.secondary" }}
                    >
                        {t.process.lead}
                    </Typography>
                </Box>

                <Box onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
                    {/* rail */}
                    <Box
                        dir={dir}
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: { xs: 3, md: 4 },
                            overflowX: "auto",
                            pb: 1,
                            px: 0.5,
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {steps.map((s, i) => {
                            const done = i < active;
                            const on = i === active;
                            return (
                                <Fragment key={s.key}>
                                    {i > 0 && (
                                        <Box sx={{ flex: "1 0 18px", height: 2, mt: "22px", minWidth: 18, borderRadius: 2, bgcolor: "divider", overflow: "hidden" }}>
                                            <Box
                                                style={{ transformOrigin: rtl ? "100% 50%" : "0% 50%" }}
                                                sx={{
                                                    height: "100%",
                                                    background: "linear-gradient(90deg, #00D084, #8CFAD3)",
                                                    transform: `scaleX(${i <= active ? 1 : 0})`,
                                                    transition: `transform 900ms ${EASE}`,
                                                }}
                                            />
                                        </Box>
                                    )}
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={s.title}
                                        aria-current={on ? "step" : undefined}
                                        onClick={() => go(i)}
                                        onPointerEnter={(e) => e.pointerType === "mouse" && go(i)}
                                        sx={{
                                            all: "unset",
                                            cursor: "pointer",
                                            flexShrink: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 1,
                                            px: 0.75,
                                            py: 0.5,
                                            "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", borderRadius: 2 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: 46,
                                                height: 46,
                                                borderRadius: "50%",
                                                display: "grid",
                                                placeItems: "center",
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: 13,
                                                fontWeight: 700,
                                                border: "1.5px solid",
                                                borderColor: on || done ? "primary.main" : "divider",
                                                bgcolor: on ? "primary.main" : done ? `rgba(${GREEN}, 0.14)` : "background.paper",
                                                color: on ? "#04110C" : done ? "primary.main" : "text.secondary",
                                                boxShadow: on ? `0 0 0 6px rgba(${GREEN}, 0.14), 0 12px 28px -10px rgba(${GREEN}, 0.7)` : "none",
                                                transition: fade(["background-color", "border-color", "color", "box-shadow"], 600),
                                                "&::after": {
                                                    content: '""',
                                                    position: "absolute",
                                                    inset: -2,
                                                    borderRadius: "50%",
                                                    border: "1.5px solid",
                                                    borderColor: "primary.main",
                                                    opacity: on ? 1 : 0,
                                                    animation: on ? `${breathe} 2.2s ease-in-out infinite` : "none",
                                                },
                                            }}
                                        >
                                            {s.number}
                                        </Box>
                                        <Box
                                            component="span"
                                            dir="ltr"
                                            sx={{
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                letterSpacing: "0.12em",
                                                whiteSpace: "nowrap",
                                                color: on ? "primary.main" : "text.secondary",
                                                transition: fade(["color"], 500),
                                            }}
                                        >
                                            {s.title}
                                        </Box>
                                    </Box>
                                </Fragment>
                            );
                        })}
                    </Box>

                    {/* the stage panel */}
                    <ScrollReveal variant="scale">
                        <Box
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: { xs: "26px", md: "36px" },
                                border: "1px solid",
                                borderColor: `rgba(${GREEN}, 0.3)`,
                                bgcolor: "background.paper",
                                boxShadow: `0 40px 90px -50px rgba(${GREEN}, 0.55)`,
                            }}
                        >
                            <Box
                                key={step.key}
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
                                    alignItems: "center",
                                    gap: { xs: 4, md: 6 },
                                    px: { xs: 3, sm: 5, md: 8 },
                                    pt: { xs: 5, md: 8 },
                                    pb: { xs: 11, md: 11 }, // room for the arrows
                                    minHeight: { md: 360 },
                                }}
                            >
                                <Box sx={{ animation: `${enter} 700ms ${EASE} both` }}>
                                    {/* outer flex boxes keep these Latin blocks at the reading start in Arabic */}
                                    <Box sx={{ display: "flex", mb: 2.5 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} dir="ltr">
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 99,
                                                border: "1px solid",
                                                borderColor: `rgba(${GREEN}, 0.35)`,
                                                bgcolor: `rgba(${GREEN}, 0.08)`,
                                                color: "primary.main",
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                letterSpacing: "0.14em",
                                            }}
                                        >
                                            {step.label}
                                        </Box>
                                        <Box sx={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "text.secondary", letterSpacing: "0.08em" }}>
                                            {step.number} / 06
                                        </Box>
                                    </Box>
                                    </Box>

                                    <Box sx={{ display: "flex" }}>
                                    <Typography
                                        component="h3"
                                        dir="ltr"
                                        sx={{
                                            m: 0,
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: { xs: 52, sm: 68, md: 92 },
                                            fontWeight: 800,
                                            lineHeight: 1,
                                            letterSpacing: "-0.04em",
                                            color: "text.primary",
                                        }}
                                    >
                                        {step.title}
                                    </Typography>
                                    </Box>

                                    <Typography
                                        sx={{ m: 0, mt: { xs: 2.5, md: 3.5 }, maxWidth: 520, fontSize: { xs: 17, md: 21 }, lineHeight: 1.85, color: "text.secondary" }}
                                    >
                                        {t.process.steps[step.key]}
                                    </Typography>
                                </Box>

                                {/* the stage as a glowing icon */}
                                <Box
                                    dir="ltr"
                                    aria-hidden="true"
                                    sx={{ position: "relative", mx: "auto", width: { xs: 190, md: 280 }, height: { xs: 190, md: 280 }, animation: `${enter} 800ms ${EASE} 100ms both` }}
                                >
                                    <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px dashed", borderColor: `rgba(${GREEN}, 0.3)`, animation: `${spin} 40s linear infinite` }}>
                                        <Box style={{ position: "absolute", top: -5, left: "50%", marginLeft: -5 }} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#8CFAD3", boxShadow: `0 0 14px 3px rgba(${GREEN}, 0.8)` }} />
                                    </Box>
                                    <Box sx={{ position: "absolute", inset: "14%", borderRadius: "50%", background: `radial-gradient(circle, rgba(${GREEN}, 0.4), rgba(${GREEN}, 0) 70%)`, animation: `${breathe} 4s ease-in-out infinite` }} />
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            inset: "27%",
                                            borderRadius: "30%",
                                            display: "grid",
                                            placeItems: "center",
                                            color: "primary.main",
                                            bgcolor: `rgba(${GREEN}, 0.12)`,
                                            border: "1px solid",
                                            borderColor: `rgba(${GREEN}, 0.45)`,
                                            boxShadow: `0 24px 60px -24px rgba(${GREEN}, 0.8)`,
                                            animation: `${floatTilt} 7s ease-in-out infinite`,
                                        }}
                                    >
                                        <Icon sx={{ fontSize: { xs: 56, md: 84 } }} />
                                    </Box>
                                </Box>
                            </Box>

                            {/* arrows */}
                            <Box
                                dir="ltr"
                                sx={{ position: "absolute", bottom: { xs: 16, md: 24 }, display: "flex", gap: 1 }}
                                style={rtl ? { left: 24 } : { right: 24 }}
                            >
                                {[
                                    { label: "prev", onClick: () => go(active + (rtl ? 1 : -1)), Cmp: rtl ? Next : Prev },
                                    { label: "next", onClick: () => go(active + (rtl ? -1 : 1)), Cmp: rtl ? Prev : Next },
                                ].map(({ label, onClick, Cmp }) => (
                                    <IconButton
                                        key={label}
                                        onClick={onClick}
                                        aria-label={label === "prev" ? t.projects.prev : t.projects.next}
                                        sx={{ width: 46, height: 46, border: "1px solid", borderColor: "divider", color: "text.primary" }}
                                    >
                                        <Cmp />
                                    </IconButton>
                                ))}
                            </Box>

                            {/* autoplay progress; finishing the bar moves to the next stage */}
                            <Box sx={{ position: "absolute", insetInline: 0, bottom: 0, height: 3, bgcolor: "divider" }}>
                                <Box
                                    key={`${step.key}-${active}`}
                                    style={{ transformOrigin: rtl ? "100% 50%" : "0% 50%", animationPlayState: paused || !inView ? "paused" : "running" }}
                                    onAnimationEnd={() => go(active + 1)}
                                    sx={{
                                        height: "100%",
                                        background: "linear-gradient(90deg, #00D084, #8CFAD3)",
                                        animation: `${fill} ${AUTOPLAY_MS}ms linear forwards`,
                                    }}
                                />
                            </Box>
                        </Box>
                    </ScrollReveal>
                </Box>
            </Container>
        </Box>
    );
}

export default IdeaToProduct;
