import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import videoSource from "../../imports/VideoSection-1.mp4";

const VideoBlock = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0C1111] group"
      style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(181,159,120,0.1)" }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full object-cover"
          style={{ aspectRatio: "16/9", minHeight: "220px" }}
          aria-label="Visualização arquitetônica de interiores de alto padrão"
        >
          <source src={videoSource} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, rgba(181,159,120,0.08) 0%, transparent 70%)" }}
        />
      </motion.div>
    </div>
  );
};

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
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        >

          {/* ── DESKTOP ────────────────────────────────────────────── */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-16 items-center">

            {/* Coluna esquerda: eyebrow + título (2 linhas) + descrição + CTA */}
            <motion.div
              className="lg:col-span-5 flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase mb-6 block"
                style={{ fontWeight: 500 }}
              >
                ARQUITETURA INTERNA DE ALTO PADRÃO
              </span>

              <h2
                className="text-[#F2F0EA] mb-8"
                style={{ fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em", fontSize: "clamp(40px, 3.5vw, 58px)" }}
              >
                Cada ambiente pensado<br />
                para viver com elegância.
              </h2>

              <p
                className="text-[#A7A39B] mb-10"
                style={{ fontSize: "17px", fontWeight: 400, lineHeight: 1.7 }}
              >
                Projetamos interiores de alto padrão com atenção absoluta à estética, funcionalidade e marcenaria sob medida, criando espaços autorais para apartamentos, salas, cozinhas e suítes.
              </p>

              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block self-start px-10 py-4 bg-[#B59F78] text-[#050808] rounded-full transition-all duration-300 hover:bg-[#C8B28A]"
                style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "0.02em", boxShadow: "0 10px 30px rgba(181,159,120,0.3)" }}
              >
                Agendar Atendimento
              </motion.a>
            </motion.div>

            {/* Coluna direita: vídeo */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoBlock />
            </motion.div>
          </div>

          {/* ── MOBILE ─────────────────────────────────────────────── */}
          <div className="lg:hidden flex flex-col gap-8">

            {/* 1. Eyebrow + Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase mb-5 block"
                style={{ fontWeight: 500 }}
              >
                ARQUITETURA INTERNA DE ALTO PADRÃO
              </span>
              <h2
                className="text-[#F2F0EA] text-[34px]"
                style={{ fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em" }}
              >
                Cada ambiente pensado para viver com elegância.
              </h2>
            </motion.div>

            {/* 2. Vídeo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <VideoBlock />
            </motion.div>

            {/* 3. Descrição + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p
                className="text-[#A7A39B] mb-8"
                style={{ fontSize: "16px", fontWeight: 400, lineHeight: 1.7 }}
              >
                Projetamos interiores de alto padrão com atenção absoluta à estética, funcionalidade e marcenaria sob medida, criando espaços autorais para apartamentos, salas, cozinhas e suítes.
              </p>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block px-10 py-4 bg-[#B59F78] text-[#050808] rounded-full transition-all duration-300 hover:bg-[#C8B28A]"
                style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "0.02em", boxShadow: "0 10px 30px rgba(181,159,120,0.3)" }}
              >
                Agendar Atendimento
              </motion.a>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
