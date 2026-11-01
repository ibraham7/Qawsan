import { useEffect } from "react";

import { Box, Button, Container, Typography } from "@mui/material";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { findPost, postsByLocale } from "../data/blog";
import { useI18n } from "../i18n";
import { PostCard, PostMeta } from "./Blog";

interface Props {
  slug: string;
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

// typography for the Markdown body. Sides are written LTR-style: stylis-plugin-rtl
// mirrors them (pl -> padding-right, borderLeft -> border-right, left -> right)
const articleSx = {
  fontSize: { xs: 16, md: 17.5 },
  lineHeight: 2,
  color: "text.primary",
  "& h2": { fontSize: { xs: 23, md: 28 }, fontWeight: 700, lineHeight: 1.5, mt: 6, mb: 2 },
  "& h3": { fontSize: { xs: 19, md: 21 }, fontWeight: 600, lineHeight: 1.6, mt: 4, mb: 1.5 },
  "& p": { my: 2, color: "text.secondary" },
  "& strong": { color: "text.primary", fontWeight: 600 },
  "& a": { color: "primary.main", textUnderlineOffset: "4px" },
  "& ul, & ol": { my: 2, pl: 3, pr: 0, color: "text.secondary" },
  "& li": { my: 1 },
  "& li::marker": { color: "primary.main" },
  "& blockquote": {
    my: 3,
    mx: 0,
    px: 3,
    py: 0.5,
    borderLeft: "3px solid",
    borderColor: "primary.main",
    bgcolor: "action.hover",
    borderRadius: "0 12px 12px 0",
  },
  "& code": {
    fontFamily: "ui-monospace, Consolas, monospace",
    fontSize: "0.88em",
    px: 0.75,
    py: 0.25,
    borderRadius: "6px",
    bgcolor: "action.hover",
    unicodeBidi: "isolate",
  },
  "& pre": {
    my: 3,
    p: 2.5,
    overflowX: "auto",
    borderRadius: "14px",
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    lineHeight: 1.7,
    "& code": { p: 0, bgcolor: "transparent", fontSize: 14 },
  },
  "& table": { width: "100%", my: 3, borderCollapse: "collapse", fontSize: 15 },
  "& th, & td": { p: 1.5, border: "1px solid", borderColor: "divider", textAlign: "left" },
  "& th": { bgcolor: "action.hover", fontWeight: 600 },
  "& hr": { my: 5, border: 0, borderTop: "1px solid", borderColor: "divider" },
} as const;

function BlogPost({ slug, mode, onToggleTheme }: Props) {
  const { t, to, locale } = useI18n();
  const post = findPost(locale, slug);
  const related = postsByLocale[locale].filter((p) => p.slug !== slug).slice(0, 3);

  useEffect(() => {
    document.title = post
      ? `${post.title} | ${t.meta.postSuffix}`
      : `${t.blog.notFound} | Qawsan`;
  }, [post, t]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Navbar mode={mode} onToggleTheme={onToggleTheme} />

      <Container
        component="main"
        maxWidth={false}
        sx={{ maxWidth: 780, px: { xs: 2.5, sm: 3 }, pt: { xs: 14, md: 18 }, pb: { xs: 6, md: 8 } }}
      >
        <Box
          component="nav"
          aria-label={t.blog.breadcrumb}
          sx={{ mb: 3, fontSize: 14, color: "text.secondary", "& a": { color: "inherit" } }}
        >
          <a href={to("/")}>{t.nav.home}</a>
          <Box component="span" aria-hidden="true" sx={{ mx: 1 }}>/</Box>
          <a href={to("/blog")}>{t.nav.blog}</a>
        </Box>

        {post ? (
          <Box component="article">
            <Box component="header" sx={{ mb: { xs: 4, md: 5 } }}>
              <Typography
                component="h1"
                sx={{ m: 0, mb: 2.5, fontWeight: 700, fontSize: { xs: 28, sm: 36, md: 42 }, lineHeight: 1.4 }}
              >
                {post.title}
              </Typography>
              <PostMeta post={post} />
            </Box>

            <Box sx={articleSx} dangerouslySetInnerHTML={{ __html: post.html }} />

            <Box
              sx={{
                mt: { xs: 6, md: 8 },
                p: { xs: 3, md: 4 },
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "primary.main",
                background: "linear-gradient(135deg, rgba(0,208,132,0.12), rgba(0,208,132,0.02))",
                textAlign: "center",
              }}
            >
              <Typography component="h2" sx={{ m: 0, mb: 1, fontSize: { xs: 21, md: 24 }, fontWeight: 700 }}>
                {t.blog.ctaTitle}
              </Typography>
              <Typography sx={{ m: 0, mb: 3, color: "text.secondary", lineHeight: 1.9 }}>
                {t.blog.ctaText}
              </Typography>
              <Button href={to("/start-project")} variant="contained" size="large" sx={{ px: 4 }}>
                {t.nav.start}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography component="h1" sx={{ m: 0, mb: 2, fontSize: 32, fontWeight: 700 }}>
              {t.blog.notFound}
            </Typography>
            <Button href={to("/blog")} variant="outlined">
              {t.blog.back}
            </Button>
          </Box>
        )}
      </Container>

      {post && related.length > 0 && (
        <Container
          component="aside"
          aria-label={t.blog.related}
          maxWidth={false}
          sx={{ maxWidth: 1180, px: { xs: 2.5, sm: 3, md: 4 }, pb: { xs: 8, md: 12 } }}
        >
          <Typography component="h2" sx={{ m: 0, mb: 3, fontSize: { xs: 22, md: 26 }, fontWeight: 700 }}>
            {t.blog.related}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
              gap: { xs: 2.5, md: 3 },
            }}
          >
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </Box>
        </Container>
      )}

      <Footer />
    </Box>
  );
}

export default BlogPost;
