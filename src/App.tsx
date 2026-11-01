import { Box } from "@mui/material";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Projects from "./components/sections/Projects";
import WhyQawsan from "./components/sections/WhyQawsan";
import Reviews from "./components/sections/Reviews";
import About from "./components/sections/About";
import CTA from "./components/sections/CTA";
import Footer from "./components/layout/Footer";

import ScrollReveal from "./components/common/ScrollReveal";
import PointerGlow from "./components/common/PointerGlow";
import { drift } from "./theme/animations";
import { seeded } from "./theme/animations";

interface AppProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

function BackgroundEffects() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        mixBlendMode: "screen",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* a light that follows the pointer across every section */}
      <PointerGlow />

      {/* Main green glow - top right */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(1)*34)}s ease-in-out ${-Math.round(seeded(1,2)*30)}s infinite`,
          width: {
            xs: 350,
            md: 600,
          },
          height: {
            xs: 350,
            md: 600,
          },
          top: {
            xs: -180,
            md: -280,
          },
          right: {
            xs: -180,
            md: -250,
          },
          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(0,208,132,0.16) 0%, rgba(0,208,132,0.05) 40%, transparent 72%)",

          filter: "blur(10px)",
        }}
      />

      {/* Green glow - center */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(2)*34)}s ease-in-out ${-Math.round(seeded(2,2)*30)}s infinite`,

          width: {
            xs: 400,
            md: 700,
          },

          height: {
            xs: 400,
            md: 700,
          },

          top: "35%",
          left: "35%",

          transform: "translate(-50%, -50%)",

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(0,208,132,0.055) 0%, transparent 68%)",

          filter: "blur(25px)",
        }}
      />

      {/* Green glow - bottom left */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(3)*34)}s ease-in-out ${-Math.round(seeded(3,2)*30)}s infinite`,

          width: {
            xs: 300,
            md: 500,
          },

          height: {
            xs: 300,
            md: 500,
          },

          bottom: -180,
          left: -180,

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(0,208,132,0.10) 0%, transparent 70%)",

          filter: "blur(15px)",
        }}
      />

      {/* Large orbital circle - top left */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(4)*34)}s ease-in-out ${-Math.round(seeded(4,2)*30)}s infinite`,

          width: {
            xs: 380,
            md: 650,
          },

          height: {
            xs: 380,
            md: 650,
          },

          top: {
            xs: -260,
            md: -390,
          },

          left: {
            xs: -240,
            md: -300,
          },

          borderRadius: "50%",

          border: "1px solid",
          borderColor:
            "rgba(0,208,132,0.14)",

          boxShadow:
            "0 0 80px rgba(0,208,132,0.08)",

          background:
            "radial-gradient(circle at 70% 70%, rgba(0,208,132,0.13), transparent 55%)",
        }}
      />

      {/* Orbital ring - left */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(5)*34)}s ease-in-out ${-Math.round(seeded(5,2)*30)}s infinite`,

          width: {
            xs: 500,
            md: 850,
          },

          height: {
            xs: 500,
            md: 850,
          },

          top: "12%",
          left: {
            xs: -430,
            md: -500,
          },

          borderRadius: "50%",

          border: "1px solid",
          borderColor:
            "rgba(0,208,132,0.10)",

          transform: "rotate(-18deg)",
        }}
      />

      {/* Large circle - bottom right */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(6)*34)}s ease-in-out ${-Math.round(seeded(6,2)*30)}s infinite`,

          width: {
            xs: 360,
            md: 620,
          },

          height: {
            xs: 360,
            md: 620,
          },

          bottom: {
            xs: -220,
            md: -330,
          },

          right: {
            xs: -220,
            md: -280,
          },

          borderRadius: "50%",

          border: "1px solid",
          borderColor:
            "rgba(0,208,132,0.16)",

          background:
            "radial-gradient(circle at 30% 30%, rgba(0,208,132,0.12), transparent 58%)",

          boxShadow:
            "0 0 100px rgba(0,208,132,0.07)",
        }}
      />

      {/* Orbital ring - right */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(7)*34)}s ease-in-out ${-Math.round(seeded(7,2)*30)}s infinite`,

          width: {
            xs: 500,
            md: 900,
          },

          height: {
            xs: 500,
            md: 900,
          },

          bottom: {
            xs: -180,
            md: -400,
          },

          right: {
            xs: -350,
            md: -500,
          },

          borderRadius: "50%",

          border: "1px solid",
          borderColor:
            "rgba(0,208,132,0.09)",

          transform: "rotate(20deg)",
        }}
      />

      {/* Glowing dot - top right */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(8)*34)}s ease-in-out ${-Math.round(seeded(8,2)*30)}s infinite`,

          width: 7,
          height: 7,

          top: "18%",
          right: "12%",

          borderRadius: "50%",

          backgroundColor:
            "rgba(0,208,132,0.8)",

          boxShadow:
            "0 0 18px rgba(0,208,132,0.7)",
        }}
      />

      {/* Glowing dot - left */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(9)*34)}s ease-in-out ${-Math.round(seeded(9,2)*30)}s infinite`,

          width: 5,
          height: 5,

          top: "48%",
          left: "15%",

          borderRadius: "50%",

          backgroundColor:
            "rgba(0,208,132,0.65)",

          boxShadow:
            "0 0 14px rgba(0,208,132,0.6)",
        }}
      />

      {/* Glowing dot - bottom */}

      <Box
        sx={{
          position: "absolute",
          animation: `${drift} ${Math.round(38+seeded(10)*34)}s ease-in-out ${-Math.round(seeded(10,2)*30)}s infinite`,

          width: 6,
          height: 6,

          bottom: "18%",
          right: "28%",

          borderRadius: "50%",

          backgroundColor:
            "rgba(0,208,132,0.55)",

          boxShadow:
            "0 0 16px rgba(0,208,132,0.5)",
        }}
      />

      {/* Soft atmospheric gradient */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,

          background:
            "radial-gradient(circle at 50% 45%, transparent 0%, rgba(11,15,14,0.08) 60%, rgba(11,15,14,0.35) 100%)",
        }}
      />
    </Box>
  );
}

function App({
  mode,
  onToggleTheme,
}: AppProps) {
  return (
    <Box
      sx={{
        position: "relative",

        minHeight: "100vh",

        bgcolor: "background.default",
        color: "text.primary",

        // clip (not hidden) so the sticky header can stick
        overflowX: "clip",
      }}
    >
      {/* Background */}

      <BackgroundEffects />

      {/* Website content */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Navbar
          mode={mode}
          onToggleTheme={onToggleTheme}
        />

        <Box component="main">
          {/* HERO */}

          <Hero />

          {/* SERVICES */}

          <ScrollReveal direction="up">
            <Services />
          </ScrollReveal>

          {/* PROJECTS */}

          <ScrollReveal
            variant="scale"
            delay={80}
          >
            <Projects />
          </ScrollReveal>

          {/* WHY QAWSAN */}

          <ScrollReveal
            variant="blur"
            delay={80}
          >
            <WhyQawsan />
          </ScrollReveal>

          {/* REVIEWS: only renders when there are reviews */}

          <Reviews />

          {/* ABOUT */}

          <ScrollReveal
            direction="up"
            delay={80}
          >
            <About />
          </ScrollReveal>

          {/* CTA */}

          <ScrollReveal
            variant="scale"
            delay={80}
          >
            <CTA />
          </ScrollReveal>
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}

export default App;
