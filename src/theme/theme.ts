import { createTheme } from "@mui/material/styles";
import { darkColors, lightColors } from "./colors";
import { GREEN, fade } from "./motion";

export const createQawsanTheme = (
  mode: "light" | "dark",
  dir: "rtl" | "ltr" = "rtl"
) => {
  const colors =
    mode === "dark"
      ? darkColors
      : lightColors;

  return createTheme({
    direction: dir,

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
      // Latin pages lead with Inter; Plex Arabic stays as the fallback for Arabic names
      fontFamily:
        dir === "rtl"
          ? '"IBM Plex Sans Arabic", sans-serif'
          : 'Inter, "IBM Plex Sans Arabic", sans-serif',

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

        styleOverrides: {
          // every button moves, glows and tints the same gentle way
          root: {
            transition: fade(
              ["transform", "box-shadow", "background-color", "border-color", "color", "filter"],
              420
            ),
            "&:active": {
              transform: "translateY(0)",
              transition: fade(["transform"], 120),
            },
          },
          contained: {
            "&:hover": {
              // keep the brand green on hover (MUI would switch to the dark primary)
              backgroundColor: colors.primary,
              transform: "translateY(-2px)",
              filter: "brightness(1.05)",
              boxShadow: `0 14px 32px -16px rgba(${GREEN}, 0.6)`,
            },
          },
          outlined: {
            "&:hover": {
              transform: "translateY(-2px)",
              borderColor: `rgba(${GREEN}, 0.55)`,
              backgroundColor: `rgba(${GREEN}, 0.06)`,
              boxShadow: `0 12px 28px -18px rgba(${GREEN}, 0.45)`,
            },
          },
          text: {
            "&:hover": {
              backgroundColor: `rgba(${GREEN}, 0.06)`,
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: fade(
              ["transform", "background-color", "border-color", "color", "box-shadow"],
              360
            ),
            "&:hover": {
              backgroundColor: `rgba(${GREEN}, 0.08)`,
            },
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: fade(["background-color", "color", "padding"], 300),
            "&:hover": {
              backgroundColor: `rgba(${GREEN}, 0.08)`,
            },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: fade(["background-color", "color"], 320),
          },
        },
      },
    },
  });
};