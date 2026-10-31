import { keyframes } from "@mui/material/styles";

/*
 * Ambient motion for the whole site. Every keyframe animates the individual
 * `translate` / `rotate` / `scale` properties (not `transform`) so it never fights a
 * hover or reveal that already uses `transform`, and stylis-plugin-rtl leaves it alone,
 * so the motion is identical in Arabic, English and Turkish.
 */

/** gentle hover-in-the-air: up and down with a slight tilt */
export const floatTilt = keyframes`
  0%, 100% { translate: 0 0; rotate: -1.2deg; }
  50% { translate: 0 -14px; rotate: 1.2deg; }
`;

/** smaller float for icons and chips */
export const bob = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -6px; }
`;

/** wander across a small area (different phase per element via animation-delay) */
export const drift = keyframes`
  0% { translate: 0 0; scale: 1; }
  33% { translate: 18px -22px; scale: 1.06; }
  66% { translate: -16px 12px; scale: 0.96; }
  100% { translate: 0 0; scale: 1; }
`;

/** slow rotation */
export const spin = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;

/** breathing glow */
export const breathe = keyframes`
  0%, 100% { opacity: 0.55; scale: 0.96; }
  50% { opacity: 1; scale: 1.05; }
`;

/** a highlight that sweeps across gradient text every few seconds */
export const shimmer = keyframes`
  0%, 55% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;

/** logos / words sliding past (duplicate the content once and move by half) */
export const marquee = keyframes`
  from { translate: 0 0; }
  to { translate: -50% 0; }
`;

/** soft wiggle */
export const wiggle = keyframes`
  0%, 100% { rotate: 0deg; }
  25% { rotate: -6deg; }
  75% { rotate: 6deg; }
`;

/** blinking caret */
export const caret = keyframes`
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
`;

/** a bar "typing" in and out (code lines) */
export const typeBar = keyframes`
  0% { scale: 0 1; }
  45%, 70% { scale: 1 1; }
  100% { scale: 0 1; }
`;

/**
 * Deterministic pseudo-random numbers in [0, 1), so the "random" delays and durations are
 * different per element but identical on the server and in the browser (no hydration mismatch).
 */
export const seeded = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** gradient text with a moving highlight: spread into `sx` */
export const shimmerText = (from = "#00D084", via = "#8CFAD3") => ({
  background: `linear-gradient(100deg, ${from} 0%, ${from} 38%, ${via} 50%, ${from} 62%, ${from} 100%)`,
  backgroundSize: "250% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
  animation: `${shimmer} 7s ease-in-out infinite`,
});
