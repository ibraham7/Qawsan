import { useRef, useState } from "react";

import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import { useProjects } from "../../data/projects";
import type { Project } from "../../data/projects";

const slideFrom = (offset: number) => keyframes`
    from { opacity: 0; transform: translateX(${offset}px); }
    to { opacity: 1; transform: translateX(0); }
`;
// RTL: "next" content comes in from the left, "previous" from the right
const enterNext = slideFrom(-48);
const enterPrev = slideFrom(48);

const pad = (n: number) => String(n).padStart(2, "0");

function ProjectSlide({
    project,
    number,
    direction,
}: {
    project: Project;
    number: number;
    direction: 1 | -1;
}) {
    const [imageIndex, setImageIndex] = useState(0);
    const [failed, setFailed] = useState<Record<string, boolean>>({});
    const images = project.images.length ? project.images : [""];
    const current = images[Math.min(imageIndex, images.length - 1)];

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.45fr 1fr" },
                overflow: "hidden",
                borderRadius: { xs: "18px", md: "24px" },
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                animation: `${direction === 1 ? enterNext : enterPrev} 450ms cubic-bezier(.2,.7,.2,1)`,
                transition:
                    "border-color 300ms ease, transform 400ms cubic-bezier(.2,.7,.2,1), box-shadow 400ms ease",
                "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-6px)",
                    boxShadow:
                        "0 28px 70px -20px rgba(0, 208, 132, 0.28), 0 0 0 1px rgba(0, 208, 132, 0.25)",
                },
                "&:hover .project-image": { transform: "scale(1.04)" },
                // stylis-plugin-rtl mirrors this, so +4px ends up moving the arrow left (its pointing direction)
                "&:hover .project-link svg": { transform: "translateX(4px)" },
                "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                    "&:hover": { transform: "none" },
                    "&:hover .project-image": { transform: "none" },
                },
            }}
        >
            {/* IMAGE */}
            <Box
                sx={{
                    position: "relative",
                    aspectRatio: "16 / 10",
                    overflow: "hidden",
                    background:
                        "linear-gradient(135deg, rgba(0,208,132,0.16), rgba(0,208,132,0.02))",
                }}
            >
                {current && !failed[current] ? (
                    <Box
                        key={current}
                        component="img"
                        className="project-image"
                        src={current}
                        alt={project.title}
                        decoding="async"
                        onError={() =>
                            setFailed((f) => ({ ...f, [current]: true }))
                        }
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top center",
                            transition: "transform 700ms cubic-bezier(.2,.7,.2,1)",
                            userSelect: "none",
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
                        {project.title}
                    </Box>
                )}

                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        px: 1.25,
                        py: 0.5,
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: "8px",
                        bgcolor: "rgba(11, 15, 14, 0.72)",
                        backdropFilter: "blur(10px)",
                        color: "#F8FAF9",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                    }}
                >
                    {pad(number)}
                </Box>

                {/* image switcher for projects with several screenshots */}
                {images.length > 1 && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 14,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 0.75,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 99,
                            bgcolor: "rgba(11, 15, 14, 0.6)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        {images.map((src, i) => (
                            <Box
                                key={src + i}
                                component="button"
                                type="button"
                                aria-label={`صورة ${i + 1}`}
                                onClick={() => setImageIndex(i)}
                                sx={{
                                    width: i === imageIndex ? 22 : 8,
                                    height: 8,
                                    p: 0,
                                    border: 0,
                                    borderRadius: 99,
                                    cursor: "pointer",
                                    bgcolor:
                                        i === imageIndex
                                            ? "primary.main"
                                            : "rgba(255,255,255,0.45)",
                                    transition: "all 250ms ease",
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {/* INFO */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: { xs: 1.25, md: 2 },
                    p: { xs: 3, md: 5 },
                }}
            >
                {/* page is RTL already; bdi keeps the Latin category in its own order */}
                <Typography
                    sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "0.04em",
                        color: "primary.main",
                    }}
                >
                    <bdi>{project.category}</bdi>
                </Typography>

                <Typography
                    component="h3"
                    sx={{
                        m: 0,
                        fontSize: { xs: 24, md: 34 },
                        lineHeight: 1.3,
                        fontWeight: 700,
                        color: "text.primary",
                    }}
                >
                    <bdi>{project.title}</bdi>
                </Typography>

                <Typography
                    sx={{
                        m: 0,
                        fontSize: { xs: 14, md: 16 },
                        lineHeight: 1.9,
                        color: "text.secondary",
                        unicodeBidi: "plaintext",
                    }}
                >
                    {project.description}
                </Typography>

                {project.link && project.link !== "#" && (
                    <Button
                        component="a"
                        className="project-link"
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        endIcon={<ArrowBackRoundedIcon />}
                        sx={{
                            mt: { xs: 1, md: 2 },
                            alignSelf: "flex-start",
                            px: 3,
                            py: 1,
                            fontSize: 15,
                            gap: 1,
                            "& .MuiButton-endIcon": { m: 0 },
                            "& svg": { transition: "transform 250ms ease" },
                        }}
                    >
                        زيارة المشروع
                    </Button>
                )}
            </Box>
        </Box>
    );
}

const arrowSx = {
    width: { xs: 44, md: 52 },
    height: { xs: 44, md: 52 },
    border: "1px solid",
    borderColor: "divider",
    color: "text.primary",
    transition: "all 250ms ease",
    "&:hover": {
        borderColor: "primary.main",
        color: "primary.main",
        bgcolor: "rgba(0, 208, 132, 0.08)",
    },
};

function Projects() {
    const projects = useProjects();
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const touchX = useRef<number | null>(null);

    const count = projects.length;
    const safeIndex = count ? index % count : 0;
    const project = projects[safeIndex];

    const go = (step: 1 | -1) => {
        if (count < 2) return;
        setDirection(step);
        setIndex((i) => (i + step + count) % count);
    };

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
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 1280,
                    px: { xs: 2.5, sm: 3, md: 4 },
                }}
            >
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
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: { xs: "100%", sm: 700, md: 800 },
                            direction: "rtl",
                            textAlign: "center",
                        }}
                    >
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
                            أعمال تُترجم{" "}
                            <Box
                                component="span"
                                sx={{
                                    color: "primary.main",
                                    direction: "rtl",
                                    unicodeBidi: "plaintext",
                                }}
                            >
                                الأفكار.
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
                        مجموعة من المشاريع التي تعكس طريقة تفكيرنا في
                        التصميم والتقنية وبناء التجارب الرقمية.
                    </Typography>
                </Box>

                {/* PROJECT SLIDER */}

                {project && (
                    <Box
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="المشاريع"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowLeft") go(1);
                            if (e.key === "ArrowRight") go(-1);
                        }}
                        onTouchStart={(e) => {
                            touchX.current = e.touches[0].clientX;
                        }}
                        onTouchEnd={(e) => {
                            if (touchX.current === null) return;
                            const dx = e.changedTouches[0].clientX - touchX.current;
                            touchX.current = null;
                            if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
                        }}
                        sx={{ outline: "none" }}
                    >
                        <ProjectSlide
                            key={project.id}
                            project={project}
                            number={safeIndex + 1}
                            direction={direction}
                        />

                        {count > 1 && (
                            <Box
                                sx={{
                                    mt: { xs: 3, md: 4 },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: { xs: 2, md: 3 },
                                }}
                            >
                                <IconButton
                                    aria-label="المشروع السابق"
                                    onClick={() => go(-1)}
                                    sx={arrowSx}
                                >
                                    <ChevronRightRoundedIcon />
                                </IconButton>

                                <Box sx={{ display: "flex", gap: 1 }}>
                                    {projects.map((p, i) => (
                                        <Box
                                            key={p.id}
                                            component="button"
                                            type="button"
                                            aria-label={p.title}
                                            onClick={() => {
                                                setDirection(i > safeIndex ? 1 : -1);
                                                setIndex(i);
                                            }}
                                            sx={{
                                                width: i === safeIndex ? 28 : 8,
                                                height: 8,
                                                p: 0,
                                                border: 0,
                                                borderRadius: 99,
                                                cursor: "pointer",
                                                bgcolor:
                                                    i === safeIndex
                                                        ? "primary.main"
                                                        : "divider",
                                                transition: "all 300ms ease",
                                            }}
                                        />
                                    ))}
                                </Box>

                                <IconButton
                                    aria-label="المشروع التالي"
                                    onClick={() => go(1)}
                                    sx={arrowSx}
                                >
                                    <ChevronLeftRoundedIcon />
                                </IconButton>
                            </Box>
                        )}

                        <Typography
                            dir="ltr"
                            sx={{
                                mt: 1.5,
                                textAlign: "center",
                                fontFamily: "Inter, sans-serif",
                                fontSize: 13,
                                color: "text.secondary",
                                unicodeBidi: "isolate",
                            }}
                        >
                            {pad(safeIndex + 1)} / {pad(count)}
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default Projects;
