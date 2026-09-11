import { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";

import App from "./App";
import { rtlCache } from "./theme/rtl";
import { createQawsanTheme } from "./theme/theme";

import "./index.css";

function Root() {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const theme = useMemo(
    () => createQawsanTheme(mode),
    [mode]
  );

  const handleToggleTheme = () => {
    setMode((currentMode) =>
      currentMode === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <App
          mode={mode}
          onToggleTheme={handleToggleTheme}
        />
      </ThemeProvider>
    </CacheProvider>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <Root />
);