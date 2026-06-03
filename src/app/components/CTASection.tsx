import { motion } from "motion/react";
import videoSource from "../../imports/architectural-visualization.mp4";

export function CTASection() {
  return (
    <section className="py-28 md:py-36 bg-[#050808] px-6 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#0B1010] border border-white/8 rounded-[24px] p-8 md:p-16 overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Eyebrow + Título — sempre primeiro */}
            <div className="lg:col-span-5 order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-6">
                  <span
                    className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase"
                    style={{ fontWeight: 500 }}
                  >
                    ARQUITETURA INTERNA DE ALTO PADRÃO
                  </span>
                </div>
                <h2
                  className="text-[#F2F0EA] text-[36px] md:text-[52px] mb-0"
                  style={{ fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em' }}
                >
                  Cada ambiente pensado para viver com elegância.
                </h2>
              </motion.div>
            </div>

            {/* Vídeo — mobile: order-2 (logo após o título), desktop: coluna direita */}
            <motion.div
              className="lg:col-span-7 order-2 lg:order-3 lg:row-span-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0C1111] group"
                style={{
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(181, 159, 120, 0.1)',
                }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full object-cover"
                    style={{
                      aspectRatio: '16/9',
                      minHeight: '280px',
                      maxHeight: '600px',
                    }}
                    aria-label="Visualização arquitetônica de interiores de alto padrão"
                  >
                    <source src={videoSource} type="video/mp4" />
                    Seu navegador não suporta vídeos HTML5.
                  </video>

                  {/* Glow Effect on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(181, 159, 120, 0.08) 0%, transparent 70%)',
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Descrição + Botão — mobile: order-3, desktop: abaixo do título */}
            <div className="lg:col-span-5 order-3 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="text-[#A7A39B] text-[17px] md:text-[18px] mb-10 leading-relaxed mt-6 lg:mt-0"
                  style={{ fontWeight: 400, lineHeight: 1.7 }}
                >
                  Projetamos interiores de alto padrão com atenção absoluta à estética, funcionalidade e marcenaria sob medida, criando espaços autorais para apartamentos, salas, cozinhas e suítes.
                </p>
                <motion.a
                  href="#contact"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block px-10 py-4 bg-[#B59F78] text-[#050808] rounded-full transition-all duration-300 hover:bg-[#C8B28A]"
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    boxShadow: '0 10px 30px rgba(181, 159, 120, 0.3)',
                  }}
                >
                  Agendar Atendimento
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
