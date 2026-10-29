import { Suspense, lazy, useMemo, useState } from "react";
import { CacheProvider } from "@emotion/react";
import type { EmotionCache } from "@emotion/cache";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { rtlCache } from "./theme/rtl";
import { createQawsanTheme } from "./theme/theme";

const StartProject = lazy(() => import("./pages/StartProject"));
const Admin = lazy(() => import("./pages/Admin"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

interface RootProps {
  path: string;
  // the prerender passes a fresh cache per page so it can collect the CSS
  cache?: EmotionCache;
}

function Root({ path, cache = rtlCache }: RootProps) {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("qawsan-mode");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* storage unavailable (or prerendering) */
    }
    return "dark";
  });

  const theme = useMemo(() => createQawsanTheme(mode), [mode]);

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

  const route = path.replace(/\/+$/, "");
  const isStartProject = route === "/start-project";
  const isAdmin = route === "/admin";
  const isBlog = route === "/blog";
  const postSlug = route.startsWith("/blog/") ? route.slice("/blog/".length) : null;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {isAdmin ? (
          <Suspense fallback={null}>
            <Admin />
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
  );
}

export default Root;
