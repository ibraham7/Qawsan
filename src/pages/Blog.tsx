import { useEffect } from "react";

import { Box, Container, Typography } from "@mui/material";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { formatDate, posts } from "../data/blog";
import type { BlogPost } from "../data/blog";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

// Arabic counted noun: دقيقة / دقيقتان / 3–10 دقائق / 11+ دقيقة
const minutesLabel = (n: number) =>
  n === 1 ? "دقيقة" : n === 2 ? "دقيقتان" : n <= 10 ? `${n} دقائق` : `${n} دقيقة`;

export function PostMeta({ post }: { post: BlogPost }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        fontSize: 13,
        color: "text.secondary",
      }}
    >
      <Box component="span" sx={{ color: "primary.main", fontWeight: 500 }}>
        {post.category}
      </Box>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>قراءة {minutesLabel(post.readingMinutes)}</span>
    </Box>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Box
      component="article"
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        p: { xs: 3, md: 3.5 },
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        transition: "border-color 250ms ease, transform 300ms ease",
        "&:hover": { borderColor: "primary.main", transform: "translateY(-4px)" },
        "&:focus-within": { borderColor: "primary.main" },
        "@media (prefers-reduced-motion: reduce)": {
          "&:hover": { transform: "none" },
        },
      }}
    >
      <PostMeta post={post} />
      <Typography
        component="h2"
        sx={{ m: 0, fontSize: { xs: 20, md: 22 }, fontWeight: 700, lineHeight: 1.5 }}
      >
        {/* the whole card is clickable through this link's ::after */}
        <Box
          component="a"
          href={`/blog/${post.slug}`}
          sx={{
            color: "text.primary",
            textDecoration: "none",
            "&::after": { content: '""', position: "absolute", inset: 0 },
            "&:focus-visible": { outline: "none" },
          }}
        >
          {post.title}
        </Box>
      </Typography>
      <Typography sx={{ m: 0, color: "text.secondary", lineHeight: 1.9, fontSize: 15 }}>
        {post.description}
      </Typography>
    </Box>
  );
}

function Blog({ mode, onToggleTheme }: Props) {
  useEffect(() => {
    document.title = "المدونة | قوسان — Qawsan Studio";
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />

      <Container
        component="main"
        maxWidth={false}
        sx={{ maxWidth: 1180, px: { xs: 2.5, sm: 3, md: 4 }, pt: { xs: 14, md: 18 }, pb: { xs: 8, md: 12 } }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Typography
            component="span"
            dir="ltr"
            sx={{
              display: "block",
              mb: 2,
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "primary.main",
            }}
          >
            {"{ BLOG }"}
          </Typography>
          <Typography
            component="h1"
            sx={{ m: 0, mb: 2, fontWeight: 700, fontSize: { xs: 32, sm: 42, md: 52 }, lineHeight: 1.25 }}
          >
            مدونة{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              قوسان
            </Box>
          </Typography>
          <Typography
            sx={{ m: 0, mx: "auto", maxWidth: 620, color: "text.secondary", fontSize: { xs: 15, md: 17 }, lineHeight: 1.9 }}
          >
            أدلة عملية لأصحاب المشاريع والمصممين والمطورين: من الفكرة والهوية
            وتجربة المستخدم، إلى التطوير والإطلاق.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}

export default Blog;
