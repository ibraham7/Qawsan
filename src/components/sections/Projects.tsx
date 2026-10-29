import { useEffect, useRef, useState } from "react";

import { Box, Button, Container, Dialog, IconButton, Typography } from "@mui/material";

import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomOutMapRoundedIcon from "@mui/icons-material/ZoomOutMapRounded";

import { localize, useProjects } from "../../data/projects";
import type { Project } from "../../data/projects";
import { useI18n } from "../../i18n";

/*
 * Positions are written LTR-style: stylis-plugin-rtl mirrors left/right/padding on Arabic pages.
 * Arrow icons are not CSS, so they follow `dir` explicitly: the "start" side button always
 * means previous, and its chevron points toward that side.
 */

const pad = (n: number) => String(n).padStart(2, "0");

function hostOf(link: string) {
    try {
        return new URL(link).hostname.replace(/^www\./, "");
    } catch {
        return "";
    }
}

const navButtonSx = {
    width: 44,
    height: 44,
    border: "1px solid rgba(255,255,255,0.18)",
    bgcolor: "rgba(11, 15, 14, 0.62)",
    color: "#F8FAF9",
    backdropFilter: "blur(10px)",
    transition: "background-color 250ms ease, border-color 250ms ease, transform 250ms ease, opacity 250ms ease",
    "&:hover": { bgcolor: "primary.main", borderColor: "primary.main", color: "#04110C", transform: "scale(1.08)" },
    "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
} as const;

const pageButtonSx = {
    width: { xs: 44, md: 52 },
    height: { xs: 44, md: 52 },
    border: "1px solid",
    borderColor: "divider",
    color: "text.primary",
    "&:hover": { borderColor: "primary.main", color: "primary.main", bgcolor: "rgba(0, 208, 132, 0.08)" },
} as const;

function useChevrons() {
    const { dir } = useI18n();
    const Prev = dir === "rtl" ? ChevronRightRoundedIcon : ChevronLeftRoundedIcon;
    const Next = dir === "rtl" ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;
    return { Prev, Next };
}

function Lightbox({
    open,
    onClose,
    images,
    index,
    setIndex,
    title,
}: {
    open: boolean;
    onClose: () => void;
    images: string[];
    index: number;
    setIndex: (i: number) => void;
    title: string;
}) {
    const { t, dir } = useI18n();
    const { Prev, Next } = useChevrons();
    const count = images.length;
    const step = (s: 1 | -1) => setIndex((index + s + count) % count);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            aria-label={title}
            onKeyDown={(e) => {
                if (count < 2) return;
                const leftIsPrev = dir === "ltr";
                if (e.key === "ArrowLeft") step(leftIsPrev ? -1 : 1);
                if (e.key === "ArrowRight") step(leftIsPrev ? 1 : -1);
            }}
            slotProps={{
                backdrop: { sx: { bgcolor: "rgba(4, 8, 7, 0.9)", backdropFilter: "blur(6px)" } },
                paper: {
                    sx: {
                        m: { xs: 1, md: 3 },
                        maxHeight: "calc(100% - 16px)",
                        bgcolor: "transparent",
                        backgroundImage: "none",
                        boxShadow: "none",
                        overflow: "visible",
                    },
                },
            }}
        >
            <Box sx={{ position: "relative", display: "grid", placeItems: "center" }}>
                <Box
                    component="img"
                    src={images[index]}
                    alt={`${title} — ${t.projects.image(index + 1, count)}`}
                    sx={{
                        maxWidth: "100%",
                        maxHeight: "82vh",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "0 40px 120px -30px rgba(0,0,0,0.8)",
                        bgcolor: "#0B0F0E",
                    }}
                />

                <IconButton
                    onClick={onClose}
                    aria-label={t.projects.close}
                    sx={{ ...navButtonSx, position: "absolute", top: -12, right: -4, zIndex: 3 }}
                >
                    <CloseRoundedIcon />
                </IconButton>

                {count > 1 && (
                    <>
                        <IconButton
                            onClick={() => step(-1)}
                            aria-label={t.projects.prevImage}
                            sx={{ ...navButtonSx, position: "absolute", top: "50%", left: 12, mt: -2.75 }}
                        >
                            <Prev />
                        </IconButton>
                        <IconButton
                            onClick={() => step(1)}
                            aria-label={t.projects.nextImage}
                            sx={{ ...navButtonSx, position: "absolute", top: "50%", right: 12, mt: -2.75 }}
                        >
                            <Next />
                        </IconButton>
                        <Typography
                            dir="ltr"
                            sx={{
                                position: "absolute",
                                bottom: 14,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 99,
                                bgcolor: "rgba(11,15,14,0.7)",
                                color: "#F8FAF9",
                                fontFamily: "Inter, sans-serif",
                                fontSize: 13,
                            }}
                        >
                            {index + 1} / {count}
                        </Typography>
                    </>
                )}
            </Box>
        </Dialog>
    );
}

function Gallery({ project, title }: { project: Project; title: string }) {
    const { t } = useI18n();
    const { Prev, Next } = useChevrons();
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState<Record<string, boolean>>({});
    const [zoom, setZoom] = useState(false);
    const touchX = useRef<number | null>(null);

    const images = project.images.filter(Boolean);
    const count = images.length;
    const safe = count ? Math.min(index, count - 1) : 0;
    const step = (s: 1 | -1) => count > 1 && setIndex((i) => (i + s + count) % count);
    const host = hostOf(project.link);

    return (
        <Box sx={{ minWidth: 0 }}>
            {/* browser frame */}
            <Box
                sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: { xs: "16px", md: "20px" },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 40px 90px -50px rgba(0, 208, 132, 0.4)",
                    transition: "border-color 300ms ease, box-shadow 400ms ease",
                    "&:hover": {
                        borderColor: "rgba(0,208,132,0.45)",
                        boxShadow: "0 50px 110px -50px rgba(0, 208, 132, 0.55)",
                    },
                    "&:hover .nav-btn": { opacity: 1 },
                }}
            >
                <Box
                    dir="ltr"
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.75,
                        height: 38,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                    }}
                >
                    <Box sx={{ display: "flex", gap: 0.75 }} aria-hidden="true">
                        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                            <Box key={c} sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: c, opacity: 0.8 }} />
                        ))}
                    </Box>
                    {host && (
                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                mx: { xs: 0.5, md: 3 },
                                px: 1.5,
                                py: 0.3,
                                borderRadius: 99,
                                bgcolor: "action.hover",
                                color: "text.secondary",
                                fontFamily: "Inter, sans-serif",
                                fontSize: 12,
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {host}
                        </Box>
                    )}
                </Box>

                {/* stage */}
                <Box
                    role="group"
                    aria-roledescription="carousel"
                    aria-label={t.projects.gallery}
                    onTouchStart={(e) => {
                        touchX.current = e.touches[0].clientX;
                    }}
                    onTouchEnd={(e) => {
                        if (touchX.current === null) return;
                        const dx = e.changedTouches[0].clientX - touchX.current;
                        touchX.current = null;
                        if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
                    }}
                    sx={{
                        position: "relative",
                        aspectRatio: "16 / 10",
                        overflow: "hidden",
                        cursor: count ? "zoom-in" : "default",
                        background: "linear-gradient(135deg, rgba(0,208,132,0.16), rgba(0,208,132,0.02))",
                    }}
                    onClick={() => count && setZoom(true)}
                >
                    {count === 0 || failed[images[safe]] ? (
                        <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 28, fontWeight: 700, color: "primary.main" }}>
                            {title}
                        </Box>
                    ) : null}
                    {images.map((src, i) => (
                        <Box
                            key={src}
                            component="img"
                            src={src}
                            alt={i === safe ? `${title} — ${t.projects.image(i + 1, count)}` : ""}
                            aria-hidden={i === safe ? undefined : true}
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                            onError={() => setFailed((f) => ({ ...f, [src]: true }))}
                            sx={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "top center",
                                opacity: i === safe && !failed[src] ? 1 : 0,
                                transform: i === safe ? "scale(1)" : "scale(1.035)",
                                transition: "opacity 550ms ease, transform 900ms cubic-bezier(.2,.7,.2,1)",
                                userSelect: "none",
                                "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                            }}
                        />
                    ))}

                    {count > 0 && (
                        <Box
                            aria-hidden="true"
                            className="zoom-hint"
                            sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                width: 34,
                                height: 34,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "10px",
                                bgcolor: "rgba(11,15,14,0.62)",
                                color: "#F8FAF9",
                                backdropFilter: "blur(8px)",
                                opacity: 0.85,
                            }}
                        >
                            <ZoomOutMapRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                    )}

                    {count > 1 && (
                        <>
                            <IconButton
                                className="nav-btn"
                                aria-label={t.projects.prevImage}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    step(-1);
                                }}
                                sx={{ ...navButtonSx, position: "absolute", top: "50%", left: 12, mt: -2.75, opacity: { xs: 1, md: 0 } }}
                            >
                                <Prev />
                            </IconButton>
                            <IconButton
                                className="nav-btn"
                                aria-label={t.projects.nextImage}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    step(1);
                                }}
                                sx={{ ...navButtonSx, position: "absolute", top: "50%", right: 12, mt: -2.75, opacity: { xs: 1, md: 0 } }}
                            >
                                <Next />
                            </IconButton>
                            <Typography
                                dir="ltr"
                                aria-live="polite"
                                sx={{
                                    position: "absolute",
                                    bottom: 12,
                                    left: "50%",
                                    translate: "-50% 0",
                                    px: 1.5,
                                    py: 0.4,
                                    borderRadius: 99,
                                    bgcolor: "rgba(11,15,14,0.66)",
                                    color: "#F8FAF9",
                                    backdropFilter: "blur(8px)",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: 12,
                                }}
                            >
                                {safe + 1} / {count}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* thumbnails */}
            {count > 1 && (
                <Box
                    sx={{
                        mt: 1.75,
                        display: "flex",
                        gap: 1.25,
                        overflowX: "auto",
                        pb: 0.75,
                        scrollbarWidth: "thin",
                    }}
                >
                    {images.map((src, i) => (
                        <Box
                            key={src}
                            component="button"
                            type="button"
                            aria-label={t.projects.image(i + 1, count)}
                            aria-current={i === safe ? "true" : undefined}
                            onClick={() => setIndex(i)}
                            sx={{
                                flex: "0 0 auto",
                                width: { xs: 76, md: 92 },
                                aspectRatio: "16 / 10",
                                p: 0,
                                overflow: "hidden",
                                cursor: "pointer",
                                borderRadius: "10px",
                                border: "2px solid",
                                borderColor: i === safe ? "primary.main" : "transparent",
                                outline: "1px solid",
                                outlineColor: i === safe ? "transparent" : "divider",
                                bgcolor: "background.paper",
                                opacity: i === safe ? 1 : 0.6,
                                transition: "opacity 250ms ease, border-color 250ms ease, transform 250ms ease",
                                "&:hover": { opacity: 1, transform: "translateY(-2px)" },
                                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                            }}
                        >
                            <Box
                                component="img"
                                src={src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                sx={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                            />
                        </Box>
                    ))}
                </Box>
            )}

            <Lightbox
                open={zoom}
                onClose={() => setZoom(false)}
                images={images}
                index={safe}
                setIndex={setIndex}
                title={title}
            />
        </Box>
    );
}

function Projects() {
    const { t, locale, dir } = useI18n();
    const { Prev, Next } = useChevrons();
    const projects = useProjects();
    const [index, setIndex] = useState(0);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const count = projects.length;
    const safe = count ? index % count : 0;
    const project = projects[safe];
    const text = project ? localize(project, locale) : null;

    const go = (step: 1 | -1) => count > 1 && setIndex((i) => (i + step + count) % count);

    // keep the active tab in view when switching with the arrows
    useEffect(() => {
        tabRefs.current[safe]?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" });
    }, [safe]);

    return (
        <Box
            component="section"
            id="projects"
            sx={{
                py: { xs: 8, sm: 10, md: 16 },
                bgcolor: "background.default",
                overflow: "hidden",
            }}
        >
            <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 2.5, sm: 3, md: 4 } }}>
                {/* SECTION HEADER */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: { xs: 2, sm: 2.5, md: 3 },
                        mb: { xs: 4, sm: 5, md: 6 },
                        textAlign: "center",
                    }}
                >
                    <Typography
                        component="span"
                        dir="ltr"
                        sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: { xs: 11, sm: 12, md: 13 },
                            fontWeight: 500,
                            letterSpacing: "0.12em",
                            color: "primary.main",
                        }}
                    >
                        {"{ SELECTED WORK }"}
                    </Typography>

                    <Typography
                        component="h2"
                        sx={{
                            m: 0,
                            maxWidth: 800,
                            fontSize: { xs: 30, sm: 40, md: 52 },
                            lineHeight: { xs: 1.3, md: 1.2 },
                            fontWeight: 700,
                            letterSpacing: "-0.025em",
                            color: "text.primary",
                        }}
                    >
                        {t.projects.title1}{" "}
                        <Box component="span" sx={{ color: "primary.main" }}>
                            {t.projects.title2}
                        </Box>
                    </Typography>

                    <Typography
                        component="p"
                        sx={{
                            m: 0,
                            maxWidth: 620,
                            fontSize: { xs: 14, sm: 15, md: 17 },
                            lineHeight: 1.9,
                            color: "text.secondary",
                        }}
                    >
                        {t.projects.lead}
                    </Typography>
                </Box>

                {project && text && (
                    <Box
                        role="region"
                        aria-roledescription="carousel"
                        aria-label={t.projects.carousel}
                        onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            const leftIsPrev = dir === "ltr";
                            if (e.key === "ArrowLeft") go(leftIsPrev ? -1 : 1);
                            if (e.key === "ArrowRight") go(leftIsPrev ? 1 : -1);
                        }}
                        tabIndex={0}
                        sx={{ outline: "none" }}
                    >
                        {/* project tabs */}
                        {count > 1 && (
                            <Box
                                role="tablist"
                                aria-label={t.projects.carousel}
                                sx={{
                                    mb: { xs: 3, md: 4 },
                                    display: "flex",
                                    gap: 1,
                                    overflowX: "auto",
                                    pb: 1,
                                    scrollbarWidth: "none",
                                    "&::-webkit-scrollbar": { display: "none" },
                                    justifyContent: { md: "center" },
                                }}
                            >
                                {projects.map((p, i) => {
                                    const on = i === safe;
                                    return (
                                        <Box
                                            key={p.id}
                                            ref={(el: HTMLButtonElement | null) => {
                                                tabRefs.current[i] = el;
                                            }}
                                            component="button"
                                            type="button"
                                            role="tab"
                                            aria-selected={on}
                                            onClick={() => setIndex(i)}
                                            sx={{
                                                flex: "0 0 auto",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 1,
                                                px: 2,
                                                py: 1,
                                                cursor: "pointer",
                                                borderRadius: 99,
                                                border: "1px solid",
                                                borderColor: on ? "primary.main" : "divider",
                                                bgcolor: on ? "rgba(0,208,132,0.12)" : "transparent",
                                                color: on ? "primary.main" : "text.secondary",
                                                fontFamily: "inherit",
                                                fontSize: 14,
                                                fontWeight: on ? 600 : 500,
                                                whiteSpace: "nowrap",
                                                transition: "all 250ms ease",
                                                "&:hover": { borderColor: "primary.main", color: "primary.main", transform: "translateY(-2px)" },
                                                "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                                                "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } },
                                            }}
                                        >
                                            <Box
                                                component="span"
                                                dir="ltr"
                                                sx={{ fontFamily: "Inter, sans-serif", fontSize: 11, opacity: 0.7 }}
                                            >
                                                {pad(i + 1)}
                                            </Box>
                                            {localize(p, locale).title}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {/* showcase */}
                        <Box
                            key={project.id}
                            role="tabpanel"
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" },
                                gap: { xs: 3, md: 6 },
                                alignItems: "center",
                                animation: "projectIn 550ms cubic-bezier(.2,.7,.2,1) both",
                                "@keyframes projectIn": {
                                    from: { opacity: 0, transform: "translateY(16px)" },
                                    to: { opacity: 1, transform: "none" },
                                },
                                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                            }}
                        >
                            <Gallery project={project} title={text.title} />

                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.25, md: 2 }, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        letterSpacing: "0.04em",
                                        color: "primary.main",
                                    }}
                                >
                                    <bdi>{text.category}</bdi>
                                </Typography>

                                <Typography
                                    component="h3"
                                    sx={{ m: 0, fontSize: { xs: 26, md: 38 }, lineHeight: 1.25, fontWeight: 700, color: "text.primary" }}
                                >
                                    <bdi>{text.title}</bdi>
                                </Typography>

                                <Typography
                                    sx={{ m: 0, fontSize: { xs: 15, md: 16.5 }, lineHeight: 1.95, color: "text.secondary" }}
                                >
                                    {text.description}
                                </Typography>

                                {project.link && project.link !== "#" && (
                                    <Button
                                        component="a"
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outlined"
                                        endIcon={<ArrowOutwardRoundedIcon />}
                                        sx={{
                                            mt: { xs: 1, md: 1.5 },
                                            alignSelf: "flex-start",
                                            px: 3,
                                            py: 1.1,
                                            fontSize: 15,
                                            "& .MuiButton-endIcon": { ml: 1, mr: 0 },
                                            "& svg": { transition: "transform 300ms cubic-bezier(.2,.7,.2,1)" },
                                            "&:hover svg": { transform: "translate(2px, -2px)" },
                                        }}
                                    >
                                        {t.projects.visit}
                                    </Button>
                                )}

                                {count > 1 && (
                                    <Box sx={{ mt: { xs: 1.5, md: 3 }, display: "flex", alignItems: "center", gap: 2 }}>
                                        <IconButton aria-label={t.projects.prev} onClick={() => go(-1)} sx={pageButtonSx}>
                                            <Prev />
                                        </IconButton>
                                        <IconButton aria-label={t.projects.next} onClick={() => go(1)} sx={pageButtonSx}>
                                            <Next />
                                        </IconButton>
                                        <Typography
                                            dir="ltr"
                                            sx={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "text.secondary" }}
                                        >
                                            {pad(safe + 1)} / {pad(count)}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default Projects;
