import { motion } from "motion/react";
import { Award, Users, Target } from "lucide-react";

const stats = [
  { icon: Award, value: "12+", label: "Anos de Experiência" },
  { icon: Users, value: "320+", label: "Projetos Entregues" },
  { icon: Target, value: "98%", label: "Satisfação dos Clientes" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-28 md:py-36 bg-[#050808] px-6 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6">
              <span className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase" style={{ fontWeight: 500 }}>
                SOBRE A.M ARQUITETURA
              </span>
            </div>
            <h2 className="text-[42px] md:text-[56px] mb-8 text-[#F2F0EA]" style={{ fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Criando Ambientes que Inspiram
            </h2>
            <p className="text-[#A7A39B] text-lg mb-6 leading-relaxed" style={{ fontWeight: 400 }}>
              Somos especialistas em transformar espaços residenciais de alto padrão através de projetos de interiores sofisticados e marcenaria sob medida.
            </p>
            <p className="text-[#A7A39B] text-lg leading-relaxed" style={{ fontWeight: 400 }}>
              Com mais de 12 anos de experiência, combinamos design contemporâneo com funcionalidade, criando ambientes únicos que refletem a personalidade e o estilo de vida de cada cliente.
            </p>

            {/* CTA Button */}
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="mt-10 px-10 py-4 bg-[#B59F78] text-[#050808] rounded-full inline-flex items-center gap-3"
              style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.02em' }}
            >
              Conhecer Mais
              <span className="text-xl">→</span>
            </motion.a>
          </motion.div>

          {/* Right Content - Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-6 p-8 bg-[#0C1111] rounded-[16px] border border-white/5 hover:border-[#B59F78]/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-[#B59F78]/10 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-7 h-7 text-[#B59F78]" />
                </div>
                <div>
                  <div className="text-5xl mb-2 text-[#F2F0EA]" style={{ fontWeight: 400 }}>
                    {stat.value}
                  </div>
                  <div className="text-[#A7A39B] text-base" style={{ fontWeight: 400 }}>
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
