import { Suspense, lazy, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { rtlCache } from "./theme/rtl";
import { createQawsanTheme } from "./theme/theme";

import "./index.css";

const StartProject = lazy(() => import("./pages/StartProject"));
const AllProjects = lazy(() => import("./pages/AllProjects"));

export function Root() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("qawsan-mode");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* storage unavailable */
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

  const path = window.location.pathname.replace(/\/+$/, "");
  const isStartProject = path === "/start-project";
  const isAllProjects = path === "/projects";

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {isAllProjects ? (
          <Suspense fallback={null}>
            <AllProjects mode={mode} onToggleTheme={handleToggleTheme} />
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

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
