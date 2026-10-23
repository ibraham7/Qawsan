import { Box, Button, Container, Typography } from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import ProjectCard from "../common/ProjectCard";
import { featuredProjects } from "../../data/projects";

const gridSx = {
    display: "grid",
    gap: { xs: 3, md: 4 },
    direction: "ltr",
};

function Projects() {
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

                {/* FEATURED PROJECTS */}

                <Box
                    sx={{
                        ...gridSx,
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                    }}
                >
                    {featuredProjects.map((project) => (
                        <ProjectCard
                            key={project.number}
                            project={project}
                        />
                    ))}
                </Box>

                {/* ALL PROJECTS LINK */}

                <Box
                    sx={{
                        mt: { xs: 5, md: 7 },
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        component="a"
                        href="/projects"
                        variant="outlined"
                        endIcon={<ArrowBackRoundedIcon />}
                        sx={{ px: 4, py: 1.25, fontSize: 15 }}
                    >
                        عرض جميع المشاريع
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

export default Projects;
