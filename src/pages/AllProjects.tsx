import { useEffect, useState } from "react";

import { Box, Container, Pagination, Typography } from "@mui/material";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ProjectCard from "../components/common/ProjectCard";
import { allProjects } from "../data/projects";

interface Props {
    mode: "light" | "dark";
    onToggleTheme: () => void;
}

const PAGE_SIZE = 3;

function AllProjects({ mode, onToggleTheme }: Props) {
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(allProjects.length / PAGE_SIZE);
    const visible = allProjects.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    useEffect(() => {
        document.title = "جميع المشاريع | قوسان";
    }, []);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Navbar mode={mode} onToggleTheme={onToggleTheme} />

            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 1280,
                    px: { xs: 2.5, sm: 3, md: 4 },
                    pt: { xs: 14, md: 18 },
                    pb: { xs: 8, md: 12 },
                }}
            >
                <Box
                    sx={{
                        mb: { xs: 5, md: 8 },
                        textAlign: "center",
                        direction: "rtl",
                    }}
                >
                    <Typography
                        component="h1"
                        sx={{
                            m: 0,
                            fontSize: { xs: 30, sm: 40, md: 52 },
                            fontWeight: 700,
                            letterSpacing: "-0.025em",
                            color: "text.primary",
                            unicodeBidi: "plaintext",
                        }}
                    >
                        جميع{" "}
                        <Box
                            component="span"
                            sx={{
                                color: "primary.main",
                                unicodeBidi: "plaintext",
                            }}
                        >
                            المشاريع.
                        </Box>
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gap: { xs: 3, md: 4 },
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                    }}
                >
                    {visible.map((project) => (
                        <ProjectCard key={project.number} project={project} />
                    ))}
                </Box>

                {pageCount > 1 && (
                    <Box
                        sx={{
                            mt: 6,
                            display: "flex",
                            justifyContent: "center",
                            direction: "ltr",
                        }}
                    >
                        <Pagination
                            count={pageCount}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Container>

            <Footer />
        </Box>
    );
}

export default AllProjects;
