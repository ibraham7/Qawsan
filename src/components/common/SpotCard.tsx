import type { PointerEvent, ReactNode } from "react";

import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

import { EASE, GREEN, cardHover } from "../../theme/motion";

// spotlight that follows the pointer (inline custom properties: physical, never mirrored)
const follow = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

/** A rounded card that lifts on hover and lights up under the pointer. */
function SpotCard({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      onPointerMove={follow}
      sx={[
        {
          position: "relative",
          overflow: "hidden",
          height: "100%",
          borderRadius: { xs: "22px", md: "28px" },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          p: { xs: 3, md: 4 },
          textAlign: "start",
          ...cardHover,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), rgba(${GREEN}, 0.13), transparent 60%)`,
            opacity: 0,
            transition: `opacity 500ms ${EASE}`,
            pointerEvents: "none",
          },
          "&:hover::before": { opacity: 1 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export default SpotCard;
