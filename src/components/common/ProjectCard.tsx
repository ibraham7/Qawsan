import { useState } from "react";

import { Box, Button, Typography } from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import type { Project } from "../../data/projects";

function ProjectCard({ project }: { project: Project }) {
    const [imageFailed, setImageFailed] = useState(false);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                height: "100%",
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                transition:
                    "border-color 250ms ease, transform 300ms ease, box-shadow 300ms ease",
                "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 50px rgba(0, 208, 132, 0.06)",
                },
                "&:hover img": { transform: "scale(1.03)" },
            }}
        >
            {/* IMAGE */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 10",
                    overflow: "hidden",
                    background:
                        project.bg ??
                        "linear-gradient(135deg, rgba(0,208,132,0.16), rgba(0,208,132,0.02))",
                }}
            >
                {imageFailed ? (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            px: 2,
                            textAlign: "center",
                            fontSize: 22,
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                        {project.title}
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={project.image}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        onError={() => setImageFailed(true)}
                        sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            display: "block",
                            objectFit: project.fit ?? "cover",
                            objectPosition: project.position ?? "center center",
                            transition: "transform 500ms ease",
                            userSelect: "none",
                        }}
                    />
                )}

                <Box
                    sx={{
                        position: "absolute",
                        top: 14,
                        left: 14,
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
                        zIndex: 2,
                    }}
                >
                    {project.number}
                </Box>
            </Box>

            {/* INFO */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    gap: 1,
                    p: { xs: 2.5, md: 3 },
                    direction: "rtl",
                    textAlign: "right",
                }}
            >
                <Typography
                    component="h3"
                    sx={{
                        m: 0,
                        fontSize: { xs: 18, md: 22 },
                        lineHeight: 1.4,
                        fontWeight: 600,
                        color: "text.primary",
                        unicodeBidi: "plaintext",
                    }}
                >
                    {project.title}
                </Typography>

                <Typography
                    sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: "0.03em",
                        color: "primary.main",
                        direction: "ltr",
                        textAlign: "right",
                    }}
                >
                    {project.category}
                </Typography>

                <Typography
                    sx={{
                        m: 0,
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: "text.secondary",
                        unicodeBidi: "plaintext",
                    }}
                >
                    {project.description}
                </Typography>

                {project.link !== "#" && (
                    <Button
                        component="a"
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<ArrowForwardRoundedIcon />}
                        sx={{
                            mt: "auto",
                            pt: 1,
                            px: 0,
                            minWidth: "auto",
                            alignSelf: "flex-start",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "primary.main",
                            direction: "ltr",
                            "&:hover": {
                                backgroundColor: "transparent",
                                color: "primary.main",
                            },
                        }}
                    >
                        زيارة المشروع
                    </Button>
                )}
            </Box>
        </Box>
    );
}

export default ProjectCard;
