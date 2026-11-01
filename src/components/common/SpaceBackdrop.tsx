import { useEffect, useRef } from "react";

import { Box, useTheme } from "@mui/material";
import { keyframes } from "@mui/material/styles";

import { seeded } from "../../theme/animations";

/*
 * A quiet space-and-technology backdrop for every page: twinkling stars, a slowly turning
 * galaxy, two wireframe planets, a small constellation drawn like a network, and now and then
 * a shooting star. It is fixed to the viewport behind the content, so it carries through every
 * section without a seam, and the stars drift a little against the scroll for depth.
 *
 * Everything is deterministic (seeded) so the prerendered HTML matches the browser, and only
 * opacity / translate / rotate are animated, so it stays cheap. Colours follow the theme: white
 * stars on dark, deep green on light.
 */

const f = (n: number) => Number(n.toFixed(2));

const twinkle = keyframes`
  0%, 100% { opacity: var(--lo, 0.25); }
  50% { opacity: var(--hi, 1); }
`;
const turn = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;
const turnBack = keyframes`
  from { rotate: 360deg; }
  to { rotate: 0deg; }
`;
const float = keyframes`
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -16px; }
`;
const shoot = keyframes`
  0% { opacity: 0; translate: 0 0; }
  2% { opacity: 1; }
  9% { opacity: 0; translate: 520px 360px; }
  100% { opacity: 0; translate: 520px 360px; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 0.35; scale: 1; }
  50% { opacity: 0.95; scale: 1.5; }
`;

/* ── data ─────────────────────────────────────────────────────────────────────────────── */

const STARS = Array.from({ length: 120 }, (_, i) => ({
  x: f(seeded(i, 3) * 1000),
  y: f(seeded(i, 5) * 1000),
  r: f(0.5 + seeded(i, 7) ** 2 * 1.3),
  delay: -f(seeded(i, 11) * 9),
  dur: f(3 + seeded(i, 13) * 6),
  lo: f(0.12 + seeded(i, 17) * 0.25),
  group: i % 3,
}));

/** a logarithmic spiral arm as one line */
const arm = (offset: number) =>
  Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    const theta = offset + t * 5.4;
    const radius = 10 + 180 * t ** 1.05;
    return `${i ? "L" : "M"} ${f(200 + Math.cos(theta) * radius)} ${f(200 + Math.sin(theta) * radius)}`;
  }).join(" ");
const ARMS = [arm(0), arm(Math.PI)];

const NODES: [number, number][] = [
  [60, 90],
  [140, 40],
  [230, 110],
  [190, 190],
  [90, 200],
  [300, 60],
];
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [2, 5],
];

/* ── pieces ───────────────────────────────────────────────────────────────────────────── */

/* every body is drawn as a thin line, no fills and no glow */
const LINE = { fill: "none", stroke: "rgb(var(--sp-accent))", strokeWidth: 0.8 } as const;

function Galaxy() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" aria-hidden="true">
      <g {...LINE}>
        {[34, 78, 124, 172].map((r) => (
          <circle key={r} cx="200" cy="200" r={r} opacity={0.35} strokeDasharray={r % 2 ? "2 8" : undefined} />
        ))}
        {ARMS.map((d, i) => (
          <path key={i} d={d} opacity={0.7} />
        ))}
        <circle cx="200" cy="200" r="5" opacity={0.9} />
      </g>
    </svg>
  );
}

function WirePlanet() {
  const lat = [-3, -2, -1, 0, 1, 2, 3].map((k) => {
    const y = k * 28;
    const rx = Math.sqrt(110 * 110 - y * y);
    return { y: f(150 + y), rx: f(rx), ry: f(rx * 0.2) };
  });
  const lon = [0, 30, 60, 90, 120, 150].map((deg) => f(Math.abs(Math.cos((deg * Math.PI) / 180)) * 110));
  const orbit = "M 330 150 a 180 46 0 1 1 -360 0 a 180 46 0 1 1 360 0";
  return (
    <svg viewBox="0 0 300 300" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <g {...LINE} opacity="0.55">
        <circle cx="150" cy="150" r="110" />
        {lat.map((l) => (
          <ellipse key={l.y} cx="150" cy={l.y} rx={l.rx} ry={l.ry} opacity="0.7" />
        ))}
        {lon.map((rx) => (
          <ellipse key={rx} cx="150" cy="150" rx={rx} ry="110" opacity="0.55" />
        ))}
      </g>
      <g transform="rotate(-22 150 150)">
        <path d={orbit} {...LINE} strokeDasharray="3 7" opacity="0.55" />
        <circle r="5" {...LINE} strokeWidth="1.2">
          <animateMotion dur="38s" repeatCount="indefinite" path={orbit} />
        </circle>
      </g>
    </svg>
  );
}

function RingedPlanet() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <g transform="rotate(-24 100 100)" {...LINE}>
        <circle cx="100" cy="100" r="46" opacity="0.7" />
        <ellipse cx="100" cy="100" rx="92" ry="22" opacity="0.5" />
        <ellipse cx="100" cy="100" rx="72" ry="17" opacity="0.35" />
        <ellipse cx="100" cy="100" rx="46" ry="11" opacity="0.4" />
      </g>
    </svg>
  );
}

function Constellation() {
  return (
    <svg viewBox="0 0 340 240" width="100%" height="100%" overflow="visible" aria-hidden="true">
      <g stroke="rgb(var(--sp-accent))" strokeWidth="0.7" opacity="0.4">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          className="node"
          cx={x}
          cy={y}
          r="3"
          fill="rgb(var(--sp-accent))"
          style={{ animationDelay: `${-i * 1.3}s`, transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </svg>
  );
}

/* ── the backdrop ─────────────────────────────────────────────────────────────────────── */

function SpaceBackdrop() {
  const dark = useTheme().palette.mode === "dark";
  const root = useRef<HTMLDivElement | null>(null);

  // stars drift against the scroll: two layers at different speeds
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      el.style.setProperty("--sy", String(Math.round(window.scrollY)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <Box
      ref={root}
      aria-hidden="true"
      sx={{
        "--sp-ink": dark ? "255, 255, 255" : "11, 60, 42",
        "--sp-accent": dark ? "0, 208, 132" : "0, 140, 92",
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity: dark ? 1 : 0.55,

        // stars (two parallax layers)
        "& .stars": { position: "absolute", inset: "-4% 0", width: "100%", height: "108%" },
        "& .stars-far": { translate: "0 calc(var(--sy, 0) * -0.012px)" },
        "& .stars-near": { translate: "0 calc(var(--sy, 0) * -0.035px)" },
        "& .star": {
          fill: "rgb(var(--sp-ink))",
          animation: `${twinkle} var(--d, 5s) ease-in-out infinite`,
          "--hi": dark ? "0.95" : "0.7",
        },
        "& .node": { animation: `${pulse} 5s ease-in-out infinite` },
      }}
    >
      {[0, 1].map((layer) => (
        <Box key={layer} className={`stars ${layer ? "stars-near" : "stars-far"}`}>
          <svg viewBox="0 0 1000 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            {STARS.filter((s) => (layer ? s.group === 2 || s.group === 1 : s.group === 0)).map((s, i) => (
              <circle
                key={i}
                className="star"
                cx={s.x}
                cy={s.y}
                r={layer ? s.r * 1.25 : s.r}
                style={{ animationDelay: `${s.delay}s`, ["--d" as string]: `${s.dur}s`, ["--lo" as string]: s.lo }}
              />
            ))}
          </svg>
        </Box>
      ))}

      {/* galaxy as a line drawing, turning once in about six minutes */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 360, md: 580 },
          height: { xs: 360, md: 580 },
          top: { xs: -170, md: -230 },
          insetInlineEnd: { xs: -190, md: -210 },
          rotate: "-24deg",
          scale: "1 0.62",
          opacity: 0.6,
        }}
      >
        <Box sx={{ width: "100%", height: "100%", animation: `${turn} 360s linear infinite` }}>
          <Galaxy />
        </Box>
      </Box>

      {/* wireframe planet with a moon */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          bottom: { xs: -90, md: -110 },
          insetInlineStart: { xs: -110, md: -150 },
          opacity: 0.8,
          animation: `${float} 18s ease-in-out infinite`,
        }}
      >
        <WirePlanet />
      </Box>

      {/* small ringed planet */}
      <Box
        sx={{
          position: "absolute",
          width: { xs: 90, md: 140 },
          height: { xs: 90, md: 140 },
          top: { xs: "70%", md: "72%" },
          insetInlineEnd: { xs: -40, md: -60 },
          animation: `${float} 22s ease-in-out -6s infinite`,
        }}
      >
        <RingedPlanet />
      </Box>

      {/* a little network of stars, mid left */}
      <Box
        sx={{
          position: "absolute",
          display: { xs: "none", md: "block" },
          width: 300,
          height: 210,
          top: "26%",
          insetInlineStart: "-3%",
          opacity: 0.5,
        }}
      >
        <Box sx={{ width: "100%", height: "100%", animation: `${turnBack} 900s linear infinite` }}>
          <Constellation />
        </Box>
      </Box>

      {/* shooting stars */}
      {[
        { top: "14%", left: "18%", delay: "2s", dur: "17s" },
        { top: "58%", left: "46%", delay: "9s", dur: "23s" },
      ].map((s, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 120,
            height: 1.5,
            rotate: "35deg",
            borderRadius: 2,
            background: "linear-gradient(90deg, transparent, rgb(var(--sp-ink)))",
            opacity: 0,
            animation: `${shoot} ${s.dur} ease-out ${s.delay} infinite`,
          }}
          // physical position and origin: inline, so the Arabic mirroring leaves them alone
          style={{ top: s.top, left: s.left, transformOrigin: "left center" }}
        />
      ))}
    </Box>
  );
}

export default SpaceBackdrop;
