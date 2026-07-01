import { motion } from "motion/react";
import { Instagram } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-4.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/arqalinemartins", label: "Instagram" },
  ];

  return (
    <footer className="bg-[#050808] border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20">
        <div className="mb-16">
          <div className="mb-6">
            <ImageWithFallback
              src={logoImg}
              alt="A.M Arquitetura e Marcenaria"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-[#A7A39B] mb-8 leading-relaxed" style={{ fontSize: '15px', fontWeight: 400 }}>
            Criando ambientes sofisticados através de arquitetura de interiores e marcenaria sob medida para espaços de alto padrão.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#B59F78] flex items-center justify-center transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-[#F2F0EA]" />
              </motion.a>
            ))}
            <span className="text-[#A7A39B]" style={{ fontSize: '14px', fontWeight: 400 }}>
              Siga-nos no Instagram
            </span>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#A7A39B]/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            © {currentYear} A.M Arquitetura. Todos os direitos reservados.
          </p>
          <p className="text-[#A7A39B]/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Projetado com paixão em São Paulo, Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
