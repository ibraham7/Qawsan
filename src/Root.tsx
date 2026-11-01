import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { CacheProvider } from "@emotion/react";
import type { EmotionCache } from "@emotion/cache";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { I18nProvider, LOCALE_META, splitLocale } from "./i18n";
import { cacheFor } from "./theme/rtl";
import { createQawsanTheme } from "./theme/theme";

const StartProject = lazy(() => import("./pages/StartProject"));
const Admin = lazy(() => import("./pages/Admin"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Review = lazy(() => import("./pages/Review"));

interface RootProps {
  path: string;
  // the prerender passes a fresh cache per page so it can collect the CSS
  cache?: EmotionCache;
}

function Root({ path, cache }: RootProps) {
  const { locale, path: route } = splitLocale(path);
  const dir = LOCALE_META[locale].dir;

  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("qawsan-mode");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* storage unavailable (or prerendering) */
    }
    return "dark";
  });

  const theme = useMemo(() => createQawsanTheme(mode, dir), [mode, dir]);

  // the prerendered HTML already carries these; keep them right after client-side changes too
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const handleToggleTheme = () => {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("qawsan-mode", next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const isStartProject = route === "/start-project";
  const isAdmin = route === "/admin";
  const isBlog = route === "/blog";
  const isReview = route === "/review";
  const postSlug = route.startsWith("/blog/") ? route.slice("/blog/".length) : null;

  return (
    <I18nProvider locale={locale} path={route}>
      <CacheProvider value={cache ?? cacheFor(locale)}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {isAdmin ? (
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          ) : isReview ? (
            <Suspense fallback={null}>
              <Review mode={mode} onToggleTheme={handleToggleTheme} />
            </Suspense>
          ) : isBlog ? (
            <Suspense fallback={null}>
              <Blog mode={mode} onToggleTheme={handleToggleTheme} />
            </Suspense>
          ) : postSlug ? (
            <Suspense fallback={null}>
              <BlogPost slug={postSlug} mode={mode} onToggleTheme={handleToggleTheme} />
            </Suspense>
          ) : isStartProject ? (
            <Suspense fallback={null}>
              <StartProject mode={mode} onToggleTheme={handleToggleTheme} />
            </Suspense>
          ) : (
            <App mode={mode} onToggleTheme={handleToggleTheme} />
          )}
        </ThemeProvider>
      </CacheProvider>
    </I18nProvider>
  );
}

export default Root;
