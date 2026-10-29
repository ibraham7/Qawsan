import { useEffect } from "react";

import { Box, Container, Typography } from "@mui/material";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { formatDate, postsByLocale } from "../data/blog";
import type { BlogPost } from "../data/blog";
import { useI18n } from "../i18n";

interface Props {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

export function PostMeta({ post }: { post: BlogPost }) {
  const { t } = useI18n();
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
      <time dateTime={post.date}>{formatDate(post.date, post.locale)}</time>
      <span aria-hidden="true">·</span>
      <span>{t.blog.readTime(post.readingMinutes)}</span>
    </Box>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  const { to, dir } = useI18n();
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
        overflow: "hidden",
        transition:
          "border-color 300ms ease, transform 450ms cubic-bezier(.2,.7,.2,1), box-shadow 450ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(120% 70% at 0% 0%, rgba(0,208,132,0.10), transparent 55%)",
          opacity: 0,
          transition: "opacity 400ms ease",
          pointerEvents: "none",
        },
        "& .post-arrow": {
          transition: "transform 350ms cubic-bezier(.2,.7,.2,1), color 250ms ease",
        },
        "&:hover": {
          borderColor: "rgba(0,208,132,0.5)",
          transform: "translateY(-6px)",
          boxShadow: "0 26px 60px -30px rgba(0,208,132,0.45)",
        },
        "&:hover::before": { opacity: 1 },
        "&:hover h2 a": { color: "primary.main" },
        "&:hover .post-arrow": { transform: "translateX(6px)", color: "primary.main" },
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
          href={to(`/blog/${post.slug}`)}
          sx={{
            color: "text.primary",
            textDecoration: "none",
            transition: "color 250ms ease",
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
      <Box
        className="post-arrow"
        aria-hidden="true"
        sx={{ mt: "auto", pt: 1, fontSize: 20, lineHeight: 1, color: "text.secondary", fontFamily: "Inter, sans-serif" }}
      >
        {dir === "rtl" ? "←" : "→"}
      </Box>
    </Box>
  );
}

function Blog({ mode, onToggleTheme }: Props) {
  const { t, locale } = useI18n();
  const posts = postsByLocale[locale];

  useEffect(() => {
    document.title = t.meta.blogTitle;
  }, [t.meta.blogTitle]);

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
            {t.blog.title1}{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {t.blog.title2}
            </Box>
          </Typography>
          <Typography
            sx={{ m: 0, mx: "auto", maxWidth: 620, color: "text.secondary", fontSize: { xs: 15, md: 17 }, lineHeight: 1.9 }}
          >
            {t.blog.lead}
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
