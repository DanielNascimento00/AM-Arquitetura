import { motion } from "motion/react";
import { ArrowUp, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-4.png";

const ease = [0.22, 1, 0.36, 1] as const;

const navLinks = [
  { name: "Início", href: "#home" },
  { name: "Portfólio", href: "#portfolio" },
  { name: "Serviços", href: "#services" },
  { name: "Quem Somos", href: "#quem-somos" },
  { name: "Sobre", href: "#about" },
  { name: "Contato", href: "#contact" },
];

const services = [
  "Arquitetura de Interiores",
  "Marcenaria Sob Medida",
  "Emissão de RRT",
  "Reforma Completa",
];

const WHATSAPP = "5511994997722";
const EMAIL = "amarqemarcenaria@gmail.com";
const INSTAGRAM = "https://www.instagram.com/arqalinemartins";

const contacts = [
  { icon: Phone, label: "+55 (11) 99499-7722", href: `https://wa.me/${WHATSAPP}` },
  { icon: Mail, label: EMAIL, href: `mailto:${EMAIL}` },
  { icon: Instagram, label: "@arqalinemartins", href: INSTAGRAM },
  { icon: MapPin, label: "São Paulo, Brasil" },
];

const headingClass = "text-[#F2F0EA] text-[11px] tracking-[0.2em] uppercase mb-6";
const linkClass = "text-[#A7A39B] hover:text-[#B59F78] transition-colors duration-300";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050808] border-t border-white/5 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        {/* Colunas */}
        <div className="py-16 md:py-20 grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-2 lg:col-span-4">
            <ImageWithFallback src={logoImg} alt="A.M Arquitetura e Marcenaria" className="h-16 w-auto object-contain mb-6" />
            <p className="text-[#A7A39B] max-w-sm mb-8" style={{ fontSize: "15px", fontWeight: 400, lineHeight: 1.7 }}>
              Criando ambientes sofisticados através de arquitetura de interiores e marcenaria sob medida para espaços de alto padrão.
            </p>
            <div className="flex items-center gap-3">
              <motion.a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#B59F78] flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[#F2F0EA]" />
              </motion.a>
              <motion.a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#B59F78] flex items-center justify-center transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#F2F0EA]" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </motion.a>
            </div>
          </div>

          <nav aria-label="Navegação do rodapé" className="lg:col-span-2 lg:col-start-6">
            <h3 className={headingClass} style={{ fontWeight: 500 }}>Navegação</h3>
            <ul className="space-y-3" style={{ fontSize: "15px" }}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={linkClass}>{l.name}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h3 className={headingClass} style={{ fontWeight: 500 }}>Serviços</h3>
            <ul className="space-y-3" style={{ fontSize: "15px" }}>
              {services.map((s) => (
                <li key={s}>
                  <a href="#services" className={linkClass}>{s}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-3">
            <h3 className={headingClass} style={{ fontWeight: 500 }}>Contato</h3>
            <ul className="space-y-4" style={{ fontSize: "15px" }}>
              {contacts.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  <c.icon className="w-4 h-4 mt-1 text-[#B59F78] flex-shrink-0" />
                  {c.href ? (
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className={`${linkClass} break-all`}
                    >
                      {c.label}
                    </a>
                  ) : (
                    <span className="text-[#A7A39B]">{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra final */}
        <div className="py-8 border-t border-white/5 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
            <p className="text-[#A7A39B]/70 text-sm">© {currentYear} A.M Arquitetura. Todos os direitos reservados.</p>
            <p className="text-[#A7A39B]/70 text-sm">Projetado com paixão em São Paulo, Brasil</p>
          </div>
          <a
            href="#home"
            className="group inline-flex items-center gap-3 text-[#A7A39B] hover:text-[#B59F78] transition-colors duration-300 text-sm"
          >
            Voltar ao topo
            <span className="w-9 h-9 rounded-full border border-white/10 group-hover:border-[#B59F78]/60 flex items-center justify-center transition-colors duration-300">
              <ArrowUp className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
