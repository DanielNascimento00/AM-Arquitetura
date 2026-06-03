import { useEffect } from "react";
import { LiquidGlassNavbar } from "./components/LiquidGlassNavbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { ServicesSection } from "./components/ServicesSection";
import { PortfolioGrid } from "./components/PortfolioGrid";
import { CTASection } from "./components/CTASection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { CustomCursor } from "./components/CustomCursor";

function App() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(
          anchor.getAttribute("href") as string
        );
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#050808] overflow-x-hidden" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <CustomCursor />
      <LiquidGlassNavbar />
      <HeroSection />
      <PortfolioGrid />
      <CTASection />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
