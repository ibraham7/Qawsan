import { createTheme } from "@mui/material/styles";
import { darkColors, lightColors } from "./colors";

export const createQawsanTheme = (
  mode: "light" | "dark"
) => {
  const colors =
    mode === "dark"
      ? darkColors
      : lightColors;

  return createTheme({
    direction: "rtl",

    palette: {
      mode,

      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
      },

      background: {
        default: colors.background,
        paper: colors.surface,
      },

      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },

      divider: colors.border,

      action: {
        hover:
          mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(11, 23, 19, 0.05)",
      },
    },

    typography: {
      fontFamily:
        '"IBM Plex Sans Arabic", sans-serif',

      h1: {
        fontWeight: 700,
      },

      h2: {
        fontWeight: 700,
      },

      h3: {
        fontWeight: 600,
      },

      h4: {
        fontWeight: 600,
      },

      body1: {
        fontWeight: 400,
      },

      body2: {
        fontWeight: 300,
      },

      button: {
        fontWeight: 500,
        textTransform: "none",
      },
    },

    shape: {
      borderRadius: 16,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor:
              colors.background,

            color: colors.textPrimary,

            transition:
              "background-color 250ms ease, color 250ms ease",
          },

          "#root": {
            minHeight: "100vh",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });
};