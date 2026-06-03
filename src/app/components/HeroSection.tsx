import { motion } from "motion/react";
import heroVideo from "../../imports/anime_o_video_dessa_casa_de_lu__online-video-cutter.com_-1.mp4";

export function HeroSection() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-[#050808]">
      {/* Background Typography - "A.M" */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-[20vw] md:text-[25vw] tracking-tighter leading-none select-none"
          style={{ fontWeight: 700, color: '#F2F0EA', opacity: 0.06 }}
        >
          A.M
        </motion.h1>
      </div>

      {/* Hero Video Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute inset-0 z-10"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
          aria-label="Vídeo de arquitetura de interiores de alto padrão"
        >
          <source src={heroVideo} type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        <div className="absolute inset-0 bg-[#050808]/60" />
      </motion.div>

      {/* Overlay Gradient - Reforçado à esquerda */}
      <div className="absolute inset-0 z-20" style={{
        background: 'linear-gradient(to right, rgba(5,8,8,0.70) 0%, rgba(5,8,8,0.35) 50%, rgba(5,8,8,0.55) 100%), linear-gradient(to bottom, rgba(5,8,8,0.45) 0%, transparent 40%, rgba(5,8,8,0.75) 100%)'
      }} />

      {/* Hero Content Overlay - Alinhado à esquerda */}
      <div className="absolute inset-0 z-20 flex items-center px-6 md:px-16">
        <div className="max-w-[1440px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-[680px]"
          >
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-6"
            >
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-[#F2F0EA]" style={{ fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Projetando Interiores,{" "}
              <span style={{ color: '#B59F78', fontWeight: 400 }}>Criando Experiências</span>
            </h1>

            {/* Texto de Apoio */}
            <p className="text-lg md:text-xl mb-10 text-[#A7A39B] max-w-[580px]" style={{ fontWeight: 400, lineHeight: 1.6 }}>
              Arquitetura de interiores e marcenaria sob medida para espaços de alto padrão
            </p>

            {/* CTA Button */}
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-12 py-4 rounded-full text-base transition-all duration-300"
              style={{
                backgroundColor: '#B59F78',
                color: '#050808',
                fontWeight: 500,
                letterSpacing: '0.05em',
                boxShadow: '0 10px 30px rgba(181, 159, 120, 0.3)'
              }}
            >
              Iniciar Meu Projeto
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}