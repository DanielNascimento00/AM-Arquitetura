import { motion } from "motion/react";
import { Building2, Home, Pencil, FileCheck } from "lucide-react";

const services = [
  {
    icon: Home,
    title: "Arquitetura de Interiores",
    description: "Projetos completos de interiores para apartamentos de alto padrão, integrando ambientes com sofisticação.",
  },
  {
    icon: Pencil,
    title: "Marcenaria Sob Medida",
    description: "Móveis planejados e marcenaria autoral com design exclusivo e acabamento premium.",
  },
  {
    icon: FileCheck,
    title: "Emissão de RRT",
    description: "Emissão de Anotação de Responsabilidade Técnica para projetos arquitetônicos com respaldo legal e segurança.",
  },
  {
    icon: Building2,
    title: "Reforma Completa",
    description: "Gerenciamento de obras e reformas com acompanhamento técnico em todas as etapas.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-28 md:py-36 bg-[#0A0F0F] px-6 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <h2 className="text-[48px] md:text-[64px] mb-4 text-[#F2F0EA]" style={{ fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Serviços
          </h2>
          <p className="text-[#A7A39B] text-lg max-w-2xl" style={{ fontWeight: 400, lineHeight: 1.6 }}>
            Soluções completas em arquitetura de interiores e marcenaria personalizada
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="group relative p-8 bg-[#0C1111] rounded-[16px] hover:bg-[#121818] transition-all duration-300 border border-white/5 hover:border-[#B59F78]/30"
            >
              {/* Icon */}
              <div className="w-14 h-14 mb-6 rounded-full bg-[#B59F78]/10 group-hover:bg-[#B59F78]/20 flex items-center justify-center transition-all duration-300">
                <service.icon className="w-7 h-7 text-[#B59F78] transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl mb-3 text-[#F2F0EA] transition-colors duration-300" style={{ fontWeight: 500, lineHeight: 1.3 }}>
                {service.title}
              </h3>
              <p className="text-[#A7A39B] group-hover:text-[#A7A39B]/90 transition-colors duration-300" style={{ fontSize: '15px', lineHeight: '1.7', fontWeight: 400 }}>
                {service.description}
              </p>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div
                  className="absolute inset-0 rounded-[16px]"
                  style={{
                    background: "radial-gradient(circle at center, rgba(181, 159, 120, 0.08) 0%, transparent 70%)",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
