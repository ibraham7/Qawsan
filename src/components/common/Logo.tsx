import { Box, Typography } from "@mui/material";

interface LogoProps {
  showEnglish?: boolean;
  size?: "small" | "medium" | "large";
}

const sizes = {
  small: {
    brace: 22,
    arabic: 20,
    english: 8,
  },
  medium: {
    brace: 28,
    arabic: 24,
    english: 9,
  },
  large: {
    brace: 42,
    arabic: 36,
    english: 12,
  },
};

function Logo({
  showEnglish = false,
  size = "medium",
}: LogoProps) {
  const currentSize = sizes[size];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Left Brace */}

      <Box
        component="span"
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: currentSize.brace,
          fontWeight: 600,
          lineHeight: 1,
          color: "primary.main",
        }}
      >
        {"{"}
      </Box>

      {/* Logo Text */}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography
          sx={{
            fontSize: currentSize.arabic,
            fontWeight: 600,
            lineHeight: 1.1,
            color: "text.primary",
          }}
        >
          قوسان
        </Typography>

        {showEnglish && (
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: currentSize.english,
              fontWeight: 600,
              letterSpacing: "0.35em",
              color: "text.secondary",
              lineHeight: 1.2,
              mt: 0.4,
            }}
          >
            QAWSAN
          </Typography>
        )}
      </Box>

      {/* Right Brace */}

      <Box
        component="span"
        sx={{
          fontFamily: "Inter, sans-serif",
          fontSize: currentSize.brace,
          fontWeight: 600,
          lineHeight: 1,
          color: "primaryDark",
        }}
      >
        {"}"}
      </Box>
    </Box>
  );
}

export default Logo;