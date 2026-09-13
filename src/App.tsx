import { Box } from "@mui/material";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Projects from "./components/sections/Projects";
import WhyQawsan from "./components/sections/WhyQawsan";
import About from "./components/sections/About";
import CTA from "./components/sections/CTA";
import Footer from "./components/layout/Footer";

import ScrollReveal from "./components/common/ScrollReveal";

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
      {/* Main green glow - top right */}

      <Box
        sx={{
          position: "absolute",
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

        overflow: "hidden",
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

        {/* HERO */}

        <Hero />

        {/* SERVICES */}

        <ScrollReveal direction="up">
          <Services />
        </ScrollReveal>

        {/* PROJECTS */}

        <ScrollReveal
          direction="up"
          delay={80}
        >
          <Projects />
        </ScrollReveal>

        {/* WHY QAWSAN */}

        <ScrollReveal
          direction="up"
          delay={80}
        >
          <WhyQawsan />
        </ScrollReveal>

        {/* ABOUT */}

        <ScrollReveal
          direction="up"
          delay={80}
        >
          <About />
        </ScrollReveal>

        {/* CTA */}

        <ScrollReveal
          direction="up"
          delay={80}
        >
          <CTA />
        </ScrollReveal>

        <Footer />
      </Box>
    </Box>
  );
}

export default App;