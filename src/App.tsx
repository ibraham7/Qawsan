import { Box } from "@mui/material";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Projects from "./components/sections/Projects";
import WhyQawsan from "./components/sections/WhyQawsan";
import About from "./components/sections/About";
import CTA from "./components/sections/CTA";
import Footer from "./components/layout/Footer";

interface AppProps {
  mode: "light" | "dark";
  onToggleTheme: () => void;
}

function App({
  mode,
  onToggleTheme,
}: AppProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Navbar
        mode={mode}
        onToggleTheme={onToggleTheme}
      />

      <Hero />
      <Services />
      <Projects />
      <WhyQawsan />
      <About />
      <CTA />
      <Footer />
    </Box>
  );
}

export default App;