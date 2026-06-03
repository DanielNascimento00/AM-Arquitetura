import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-2.png";

export function LiquidGlassNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Início", href: "#home" },
    { name: "Portfólio", href: "#portfolio" },
    { name: "Serviços", href: "#services" },
    { name: "Sobre", href: "#about" },
    { name: "Contato", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-16 py-6 transition-all duration-500">
      <div
        className="max-w-[1440px] mx-auto px-8 py-4 transition-all duration-500 ease-out"
        style={{
          backgroundColor: isScrolled ? 'rgba(10, 15, 15, 0.55)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px) saturate(180%)' : 'none',
          border: isScrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
          borderRadius: isScrolled ? '24px' : '0px',
          boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <ImageWithFallback
              src={logoImg}
              alt="A.M Arquitetura e Marcenaria"
              className="h-11 w-auto object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="text-sm transition-all duration-300 hover:text-[#B59F78]"
                  style={{
                    fontWeight: 500,
                    color: isScrolled ? '#A7A39B' : '#F2F0EA',
                    letterSpacing: '0.03em',
                    textShadow: isScrolled ? 'none' : '0 2px 12px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA Button - Desktop */}
          <a
            href="#contact"
            className="hidden md:block px-6 py-2.5 rounded-full transition-all duration-300 hover:bg-[#C8B28A]"
            style={{
              backgroundColor: '#B59F78',
              color: '#050808',
              fontWeight: 500,
              fontSize: '0.875rem',
              letterSpacing: '0.03em',
              boxShadow: isScrolled ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
          >
            Iniciar Projeto
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            aria-label="Menu"
            style={{
              filter: isScrolled ? 'none' : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.6))'
            }}
          >
            <motion.span
              animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 6 : 0 }}
              className="w-6 h-0.5 bg-[#F2F0EA] rounded-full"
            />
            <motion.span
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              className="w-6 h-0.5 bg-[#F2F0EA] rounded-full"
            />
            <motion.span
              animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -6 : 0 }}
              className="w-6 h-0.5 bg-[#F2F0EA] rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 p-6 rounded-[24px] shadow-2xl"
            style={{
              backgroundColor: 'rgba(10, 15, 15, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 text-base transition-all duration-300 hover:text-[#B59F78]"
                    style={{
                      fontWeight: 500,
                      color: '#A7A39B',
                      letterSpacing: '0.03em'
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-6 py-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: '#B59F78',
                    color: '#050808',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Iniciar Projeto
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}