import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Analytics } from "@vercel/analytics/react";
import { LiquidGlassNavbar } from "./components/LiquidGlassNavbar";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { QuemSomosSection } from "./components/QuemSomosSection";
import { SignatureQuoteSection } from "./components/SignatureQuoteSection";
import { ServicesSection } from "./components/ServicesSection";
import { PortfolioGrid } from "./components/PortfolioGrid";
import { CTASection } from "./components/CTASection";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { CustomCursor } from "./components/CustomCursor";
import { LoginPage } from "./pages/LoginPage";
import { AdminPage } from "./pages/AdminPage";
import { AddProjectPage } from "./pages/admin/AddProjectPage";
import { GalleryPage } from "./pages/admin/GalleryPage";
import { AnalyticsPage } from "./pages/admin/AnalyticsPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CookieConsent } from "./components/CookieConsent";
import { useConsent } from "./consent";

function LandingPage() {
  const consent = useConsent();

  // Contagem de visitas só após o aceite de cookies de análise
  useEffect(() => {
    if (consent !== "all") return;
    fetch("/api/track", { method: "POST" }).catch(() => {});
  }, [consent]);

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href") as string);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-[#050808] overflow-x-hidden"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <CustomCursor />
      <LiquidGlassNavbar />
      <HeroSection />
      <PortfolioGrid />
      <CTASection />
      <SignatureQuoteSection />
      <ServicesSection />
      <QuemSomosSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  const consent = useConsent();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>}>
          <Route index element={<Navigate to="adicionar" replace />} />
          <Route path="adicionar" element={<AddProjectPage />} />
          <Route path="galeria" element={<GalleryPage />} />
          <Route path="analitico" element={<AnalyticsPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin/adicionar" replace />} />
        </Route>
      </Routes>
      {consent === "all" && <Analytics />}
      <CookieConsent />
    </BrowserRouter>
  );
}

export default App;
