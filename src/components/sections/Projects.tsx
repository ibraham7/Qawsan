import { useEffect, useRef, useState } from "react";

import { Box, Button, Container, Dialog, IconButton, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomOutMapRoundedIcon from "@mui/icons-material/ZoomOutMapRounded";

import ScrollReveal from "../common/ScrollReveal";
import { localize, useProjects } from "../../data/projects";
import type { Project } from "../../data/projects";
import { useI18n } from "../../i18n";
import { bob, drift, shimmerText } from "../../theme/animations";
import { EASE, GREEN, fade } from "../../theme/motion";

/** how long each screenshot stays before the next one (and then the next project) */
const STEP_MS = 5500;

const pad = (n: number) => String(n).padStart(2, "0");

// a new screenshot arrives: slightly zoomed and soft, then settles
const shotIn = keyframes`
    from { opacity: 0; scale: 1.08; filter: blur(10px); }
    to { opacity: 1; scale: 1; filter: blur(0); }
`;
// the caption changes: rises into place
const textIn = keyframes`
    from { opacity: 0; translate: 0 18px; }
    to { opacity: 1; translate: 0 0; }
`;
const barFill = keyframes`
    from { scale: 0 1; }
    to { scale: 1 1; }
`;
const pan = keyframes`
    from { translate: 0 0; scale: 1; }
    to { translate: 0 -0.6%; scale: 1.012; }
`;
const sheen = keyframes`
    0%, 70% { translate: -130% 0; }
    100% { translate: 130% 0; }
`;

/** the host of a link, for the address bar of the browser frame */
const hostOf = (link: string) => {
    try {
        return new URL(link).host;
    } catch {
        return link;
    }
};

/* ── the list of projects ─────────────────────────────────────────────────────────────── */

function ProjectTab({
    project,
    number,
    active,
    onSelect,
}: {
    project: Project;
    number: number;
    active: boolean;
    onSelect: () => void;
}) {
    const { locale } = useI18n();
    const text = localize(project, locale);

    return (
        <Box
            component="button"
            type="button"
            onClick={onSelect}
            aria-current={active}
            sx={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                flex: { xs: "0 0 auto", md: "0 0 auto" },
                minWidth: { xs: 170, md: 0 },
                position: "relative",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                alignItems: "center",
                columnGap: 1.75,
                px: 2.25,
                py: { xs: 1.5, md: 1.9 },
                borderRadius: "18px",
                border: "1px solid",
                borderColor: active ? `rgba(${GREEN}, 0.5)` : "divider",
                bgcolor: active ? `rgba(${GREEN}, 0.07)` : "transparent",
                overflow: "hidden",
                scrollSnapAlign: "center",
                transition: fade(["background-color", "border-color", "transform", "box-shadow"], 420),
                "&:hover": {
                    borderColor: `rgba(${GREEN}, 0.45)`,
                    bgcolor: `rgba(${GREEN}, 0.05)`,
                    transform: "translateY(-3px)",
                    boxShadow: `0 18px 40px -26px rgba(${GREEN}, 0.5)`,
                },
                "&:hover .tab-num": { color: "primary.main" },
                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 3 },
            }}
        >
            <Typography
                className="tab-num"
                dir="ltr"
                sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: active ? "primary.main" : "text.disabled",
                    transition: fade(["color"], 380),
                }}
            >
                {pad(number)}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        m: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.4,
                        color: active ? "text.primary" : "text.secondary",
                        transition: fade(["color"], 380),
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <bdi>{text.title}</bdi>
                </Typography>
                <Typography
                    sx={{
                        m: 0,
                        mt: 0.25,
                        fontFamily: "Inter, sans-serif",
                        fontSize: 11.5,
                        letterSpacing: "0.03em",
                        color: "text.secondary",
                        opacity: 0.8,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    <bdi>{text.category}</bdi>
                </Typography>
            </Box>
        </Box>
    );
}

/* ── the stage: browser frame that follows the pointer ────────────────────────────────── */

function Stage({
    project,
    imageIndex,
    paused,
    onAdvance,
    onZoom,
}: {
    project: Project;
    imageIndex: number;
    paused: boolean;
    onAdvance: () => void;
    onZoom: () => void;
}) {
    const { t, locale } = useI18n();
    const text = localize(project, locale);
    const frame = useRef<HTMLDivElement | null>(null);
    const [failed, setFailed] = useState<Record<string, boolean>>({});
    const images = project.images;
    const current = images[Math.min(imageIndex, images.length - 1)] ?? "";

    // the frame leans toward the pointer and a soft highlight follows it (mouse only)
    const lean = (e: React.PointerEvent) => {
        const el = frame.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transform = `rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg)`;
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    };
    const rest = () => {
        if (frame.current) frame.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    return (
        <Box sx={{ position: "relative", perspective: "1600px" }}>
            {/* soft light behind the frame */}
            <Box
                aria-hidden="true"
                sx={{
                    position: "absolute",
                    insetInline: "8%",
                    top: "10%",
                    height: "80%",
                    borderRadius: "50%",
                    background: `radial-gradient(closest-side, rgba(${GREEN}, 0.35), transparent)`,
                    filter: "blur(40px)",
                    animation: `${drift} 14s ease-in-out infinite`,
                    pointerEvents: "none",
                }}
            />

            <Box
                ref={frame}
                onPointerMove={lean}
                onPointerLeave={rest}
                sx={{
                    position: "relative",
                    borderRadius: { xs: "16px", md: "22px" },
                    border: "1px solid",
                    borderColor: `rgba(${GREEN}, 0.28)`,
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    boxShadow: `0 40px 90px -40px rgba(${GREEN}, 0.45), 0 2px 0 rgba(255,255,255,0.04) inset`,
                    transition: `transform 600ms ${EASE}, box-shadow 500ms ${EASE}, border-color 500ms ${EASE}`,
                    transformStyle: "preserve-3d",
                    willChange: "transform",
                    "&:hover": { borderColor: `rgba(${GREEN}, 0.5)` },
                    "&:hover .glare": { opacity: 1 },
                    "&:hover .zoom": { opacity: 1, translate: "0 0" },
                }}
            >
                {/* browser bar */}
                <Box
                    dir="ltr"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        height: 34,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "rgba(127,127,127,0.06)",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 0.75 }}>
                        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                            <Box key={c} sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c, opacity: 0.85 }} />
                        ))}
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            maxWidth: 360,
                            mx: "auto",
                            px: 1.5,
                            py: 0.4,
                            borderRadius: 99,
                            bgcolor: "rgba(127,127,127,0.1)",
                            fontFamily: "Inter, sans-serif",
                            fontSize: 12,
                            color: "text.secondary",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {hostOf(project.link)}
                    </Box>
                    <Typography
                        sx={{ m: 0, fontFamily: "Inter, sans-serif", fontSize: 12, color: "text.secondary", minWidth: 44, textAlign: "end" }}
                    >
                        {pad(imageIndex + 1)}/{pad(images.length || 1)}
                    </Typography>
                </Box>

                {/* timer for the current screenshot; when it ends the next one arrives */}
                <Box sx={{ height: 3, bgcolor: "rgba(127,127,127,0.12)", overflow: "hidden" }}>
                    <Box
                        key={`${project.id}-${imageIndex}`}
                        onAnimationEnd={onAdvance}
                        sx={{
                            height: "100%",
                            bgcolor: "primary.main",
                            transformOrigin: "left center",
                            animation: `${barFill} ${STEP_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                        }}
                    />
                </Box>

                {/* screenshot */}
                <Box
                    onClick={onZoom}
                    role="button"
                    tabIndex={0}
                    aria-label={t.projects.open}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onZoom();
                        }
                    }}
                    sx={{
                        position: "relative",
                        aspectRatio: "1.97 / 1",
                        overflow: "hidden",
                        cursor: "zoom-in",
                        outline: "none",
                        background: `linear-gradient(135deg, rgba(${GREEN}, 0.16), rgba(${GREEN}, 0.02))`,
                        "&:focus-visible": { boxShadow: `inset 0 0 0 2px rgba(${GREEN}, 0.8)` },
                    }}
                >
                    {current && !failed[current] ? (
                        <Box
                            key={current}
                            component="img"
                            src={current}
                            alt={`${text.title} — ${t.projects.image(imageIndex + 1, images.length)}`}
                            decoding="async"
                            draggable={false}
                            onError={() => setFailed((f) => ({ ...f, [current]: true }))}
                            sx={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "right top",
                                userSelect: "none",
                                // arrives with a soft zoom, then keeps panning slowly
                                animation: `${shotIn} 900ms ${EASE} both, ${pan} 18s ease-in-out 900ms infinite alternate`,
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                display: "grid",
                                placeItems: "center",
                                fontSize: 28,
                                fontWeight: 700,
                                color: "primary.main",
                            }}
                        >
                            {text.title}
                        </Box>
                    )}

                    {/* light sweeping across the glass now and then */}
                    <Box
                        aria-hidden="true"
                        sx={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            background:
                                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.09) 50%, transparent 60%)",
                            animation: `${sheen} 7s ease-in-out infinite`,
                        }}
                    />
                    {/* highlight that follows the pointer */}
                    <Box
                        className="glare"
                        aria-hidden="true"
                        sx={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            opacity: 0,
                            transition: fade(["opacity"], 500),
                            background:
                                "radial-gradient(circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.16), transparent 45%)",
                        }}
                    />

                    <Box
                        className="zoom"
                        aria-hidden="true"
                        sx={{
                            position: "absolute",
                            insetBlockEnd: 14,
                            insetInlineEnd: 14,
                            display: "grid",
                            placeItems: "center",
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            color: "#F8FAF9",
                            bgcolor: "rgba(11, 15, 14, 0.62)",
                            backdropFilter: "blur(8px)",
                            opacity: 0,
                            translate: "0 6px",
                            transition: fade(["opacity", "translate"], 420),
                        }}
                    >
                        <ZoomOutMapRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

/* ── full-size viewer ─────────────────────────────────────────────────────────────────── */

function Lightbox({
    project,
    index,
    onIndex,
    onClose,
}: {
    project: Project | null;
    index: number;
    onIndex: (i: number) => void;
    onClose: () => void;
}) {
    const { t, locale, dir } = useI18n();
    const ltr = dir === "ltr";
    const images = project?.images ?? [];
    const count = images.length;
    const step = (s: 1 | -1) => count && onIndex((index + s + count) % count);

    useEffect(() => {
        if (!project) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") step(ltr ? -1 : 1);
            if (e.key === "ArrowRight") step(ltr ? 1 : -1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project, index, ltr, count]);

    const nav = {
        position: "absolute",
        top: "50%",
        translate: "0 -50%",
        width: 48,
        height: 48,
        color: "#F8FAF9",
        bgcolor: "rgba(11, 15, 14, 0.6)",
        border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(8px)",
        transition: fade(["background-color", "border-color"], 360),
        "&:hover": { bgcolor: "rgba(11, 15, 14, 0.85)", borderColor: `rgba(${GREEN}, 0.6)` },
    } as const;

    return (
        <Dialog
            open={!!project}
            onClose={onClose}
            maxWidth={false}
            slotProps={{
                backdrop: { sx: { backdropFilter: "blur(10px)", bgcolor: "rgba(4, 8, 7, 0.82)" } },
                paper: { sx: { bgcolor: "transparent", boxShadow: "none", m: { xs: 1.5, md: 4 }, overflow: "visible" } },
            }}
        >
            {project && (
                <Box sx={{ position: "relative", width: "min(1200px, 92vw)" }}>
                    <Box
                        key={images[index]}
                        component="img"
                        src={images[index]}
                        alt={`${localize(project, locale).title} — ${t.projects.image(index + 1, count)}`}
                        sx={{
                            display: "block",
                            width: "100%",
                            maxHeight: "82vh",
                            objectFit: "contain",
                            borderRadius: "16px",
                            border: "1px solid rgba(255,255,255,0.14)",
                            bgcolor: "background.paper",
                            animation: `${shotIn} 500ms ${EASE} both`,
                        }}
                    />
                    <IconButton
                        aria-label={t.projects.close}
                        onClick={onClose}
                        sx={{ ...nav, top: -22, insetInlineEnd: -10, translate: "0 0", width: 42, height: 42 }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                    {count > 1 && (
                        <>
                            <IconButton aria-label={t.projects.prevImage} onClick={() => step(-1)} sx={{ ...nav, insetInlineStart: 12 }}>
                                {ltr ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}
                            </IconButton>
                            <IconButton aria-label={t.projects.nextImage} onClick={() => step(1)} sx={{ ...nav, insetInlineEnd: 12 }}>
                                {ltr ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
                            </IconButton>
                        </>
                    )}
                    <Typography
                        dir="ltr"
                        sx={{ m: 0, mt: 1.5, textAlign: "center", color: "#F8FAF9", fontFamily: "Inter, sans-serif", fontSize: 13 }}
                    >
                        {pad(index + 1)} / {pad(count)}
                    </Typography>
                </Box>
            )}
        </Dialog>
    );
}

/* ── the section ──────────────────────────────────────────────────────────────────────── */

function Projects() {
    const { t, locale, dir } = useI18n();
    const ltr = dir === "ltr";
    const projects = useProjects();
    const [index, setIndex] = useState(0);
    const [imageIndex, setImageIndex] = useState(0);
    const [hover, setHover] = useState(false);
    const [zoomed, setZoomed] = useState(false);
    const touchX = useRef<number | null>(null);

    const count = projects.length;
    const safeIndex = count ? index % count : 0;
    const project = projects[safeIndex];
    const imageCount = project?.images.length || 1;
    const text = project ? localize(project, locale) : null;

    const selectProject = (i: number) => {
        setIndex((i + count) % count);
        setImageIndex(0);
    };
    const selectImage = (i: number) => setImageIndex(i);

    // after the last screenshot of a project, move on to the next project
    const advance = () => {
        if (imageIndex + 1 < imageCount) setImageIndex(imageIndex + 1);
        else if (count > 1) selectProject(safeIndex + 1);
        else setImageIndex(0);
    };

    return (
        <Box component="section" id="projects" sx={{ py: { xs: 8, sm: 10, md: 16 }, bgcolor: "transparent" }}>
            <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 2.5, sm: 3, md: 4 } }}>
                {/* SECTION HEADER */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: { xs: 2, sm: 2.5, md: 3 },
                        mb: { xs: 5, sm: 6, md: 8 },
                        width: "100%",
                        textAlign: "center",
                    }}
                >
                    <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 700, md: 800 }, direction: "rtl", textAlign: "center" }}>
                        <Typography
                            component="span"
                            sx={{
                                display: "block",
                                mb: { xs: 1.5, md: 2 },
                                fontFamily: "Inter, sans-serif",
                                fontSize: { xs: 11, sm: 12, md: 13 },
                                fontWeight: 500,
                                letterSpacing: "0.12em",
                                color: "primary.main",
                                direction: "ltr",
                                textAlign: "center",
                            }}
                        >
                            {"{ SELECTED WORK }"}
                        </Typography>

                        <Typography
                            component="h2"
                            sx={{
                                m: 0,
                                fontSize: { xs: 30, sm: 40, md: 52 },
                                lineHeight: { xs: 1.3, md: 1.2 },
                                fontWeight: 700,
                                letterSpacing: "-0.025em",
                                color: "text.primary",
                                direction: "rtl",
                                unicodeBidi: "plaintext",
                                textAlign: "center",
                            }}
                        >
                            {t.projects.title1}{" "}
                            <Box component="span" sx={{ ...shimmerText(), direction: "rtl", unicodeBidi: "plaintext" }}>
                                {t.projects.title2}
                            </Box>
                        </Typography>
                    </Box>

                    <Typography
                        component="p"
                        sx={{
                            m: 0,
                            width: "100%",
                            maxWidth: { xs: 340, sm: 560, md: 620 },
                            fontSize: { xs: 14, sm: 15, md: 17 },
                            lineHeight: 1.9,
                            color: "text.secondary",
                            direction: "rtl",
                            unicodeBidi: "plaintext",
                            textAlign: "center",
                        }}
                    >
                        {t.projects.lead}
                    </Typography>
                </Box>

                {project && text && (
                    <ScrollReveal variant="up">
                        <Box
                            role="region"
                            aria-roledescription="carousel"
                            aria-label={t.projects.carousel}
                            tabIndex={0}
                            onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
                            onPointerLeave={() => setHover(false)}
                            onFocus={() => setHover(true)}
                            onBlur={() => setHover(false)}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowLeft") selectProject(safeIndex + (ltr ? -1 : 1));
                                if (e.key === "ArrowRight") selectProject(safeIndex + (ltr ? 1 : -1));
                            }}
                            onTouchStart={(e) => {
                                touchX.current = e.touches[0].clientX;
                            }}
                            onTouchEnd={(e) => {
                                if (touchX.current === null) return;
                                const dx = e.changedTouches[0].clientX - touchX.current;
                                touchX.current = null;
                                if (Math.abs(dx) > 50) selectProject(safeIndex + ((dx > 0) !== ltr ? 1 : -1));
                            }}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "300px minmax(0, 1fr)" },
                                gap: { xs: 3, md: 5 },
                                alignItems: "start",
                                outline: "none",
                            }}
                        >
                            {/* project list: a column on desktop, a swipeable row on phones */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "row", md: "column" },
                                    gap: 1.5,
                                    overflowX: { xs: "auto", md: "visible" },
                                    scrollSnapType: { xs: "x proximity", md: "none" },
                                    py: { xs: 1, md: 0 },
                                    mx: { xs: -2.5, sm: -3, md: 0 },
                                    px: { xs: 2.5, sm: 3, md: 0 },
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                }}
                            >
                                {projects.map((p, i) => (
                                    <ProjectTab
                                        key={p.id}
                                        project={p}
                                        number={i + 1}
                                        active={i === safeIndex}
                                        onSelect={() => selectProject(i)}
                                    />
                                ))}
                            </Box>

                            {/* stage + caption */}
                            <Box sx={{ minWidth: 0 }}>
                                <Stage
                                    key={project.id}
                                    project={project}
                                    imageIndex={imageIndex}
                                    paused={hover || zoomed}
                                    onAdvance={advance}
                                    onZoom={() => setZoomed(true)}
                                />

                                {/* screenshots of this project */}
                                {project.images.length > 1 && (
                                    <Box
                                        role="group"
                                        aria-label={t.projects.gallery}
                                        sx={{ display: "flex", justifyContent: "center", gap: 1.25, mt: { xs: 2.5, md: 3 } }}
                                    >
                                        {project.images.map((src, i) => (
                                            <Box
                                                key={src + i}
                                                component="button"
                                                type="button"
                                                aria-label={t.projects.image(i + 1, project.images.length)}
                                                aria-current={i === imageIndex}
                                                onClick={() => selectImage(i)}
                                                sx={{
                                                    p: 0,
                                                    width: { xs: 56, sm: 76 },
                                                    aspectRatio: "1.97 / 1",
                                                    borderRadius: "10px",
                                                    overflow: "hidden",
                                                    cursor: "pointer",
                                                    border: "2px solid",
                                                    borderColor: i === imageIndex ? "primary.main" : "transparent",
                                                    opacity: i === imageIndex ? 1 : 0.55,
                                                    bgcolor: "background.paper",
                                                    transition: fade(["opacity", "transform", "border-color", "box-shadow"], 380),
                                                    boxShadow: i === imageIndex ? `0 10px 26px -12px rgba(${GREEN}, 0.7)` : "none",
                                                    "&:hover": { opacity: 1, transform: "translateY(-3px)" },
                                                    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={src}
                                                    alt=""
                                                    loading="lazy"
                                                    decoding="async"
                                                    draggable={false}
                                                    sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                <Box
                                    key={`${project.id}-caption`}
                                    sx={{
                                        mt: { xs: 3, md: 4 },
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        justifyContent: "space-between",
                                        gap: { xs: 2.5, sm: 4 },
                                        animation: `${textIn} 650ms ${EASE} both`,
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography
                                            sx={{
                                                m: 0,
                                                mb: 0.75,
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: 13,
                                                fontWeight: 500,
                                                letterSpacing: "0.04em",
                                                color: "primary.main",
                                                animation: `${bob} 5s ease-in-out infinite`,
                                                width: "fit-content",
                                            }}
                                        >
                                            <bdi>{text.category}</bdi>
                                        </Typography>
                                        <Typography
                                            component="h3"
                                            sx={{ m: 0, mb: 1.25, fontSize: { xs: 26, md: 34 }, lineHeight: 1.3, fontWeight: 700, color: "text.primary" }}
                                        >
                                            <bdi>{text.title}</bdi>
                                        </Typography>
                                        <Typography
                                            sx={{
                                                m: 0,
                                                maxWidth: 640,
                                                fontSize: { xs: 14, md: 16 },
                                                lineHeight: 1.9,
                                                color: "text.secondary",
                                                unicodeBidi: "plaintext",
                                            }}
                                        >
                                            {text.description}
                                        </Typography>
                                    </Box>

                                    {project.link && project.link !== "#" && (
                                        <Button
                                            component="a"
                                            className="project-link"
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="outlined"
                                            endIcon={ltr ? <ArrowForwardRoundedIcon /> : <ArrowBackRoundedIcon />}
                                            sx={{
                                                flex: "0 0 auto",
                                                px: 3,
                                                py: 1.1,
                                                fontSize: 15,
                                                gap: 1,
                                                whiteSpace: "nowrap",
                                                "& .MuiButton-endIcon": { m: 0 },
                                                "& svg": { transition: fade(["transform"], 380) },
                                                // stylis-plugin-rtl mirrors this, so +4px moves the arrow the way it points
                                                "&:hover svg": { transform: "translateX(4px)" },
                                            }}
                                        >
                                            {t.projects.visit}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </ScrollReveal>
                )}
            </Container>

            <Lightbox
                project={zoomed ? project : null}
                index={imageIndex}
                onIndex={selectImage}
                onClose={() => setZoomed(false)}
            />
        </Box>
    );
}

export default Projects;
