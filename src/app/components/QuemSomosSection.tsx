import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import aline from "@/assets/img-aline.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

export function QuemSomosSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const frameY = useTransform(scrollYProgress, [0, 1], ["24px", "-24px"]);
  const markY = useTransform(scrollYProgress, [0, 1], ["8%", "-12%"]);

  return (
    <section
      id="quem-somos"
      ref={ref}
      className="relative py-28 md:py-40 bg-[#050808] px-6 md:px-16 overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -left-40 top-1/4 w-[640px] h-[640px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(181,159,120,0.10) 0%, transparent 65%)" }}
      />

      {/* Giant outlined watermark */}
      <motion.div
        aria-hidden
        style={{ y: markY, WebkitTextStroke: "1px rgba(181,159,120,0.14)", fontWeight: 300 }}
        className="pointer-events-none select-none absolute right-[-2%] top-[8%] text-[clamp(220px,34vw,520px)] leading-none text-transparent tracking-[-0.06em]"
      >
        AM
      </motion.div>

      <div className="relative max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
        {/* Portrait — arch frame */}
        <div className="lg:col-span-5 flex justify-center lg:justify-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease }}
            className="relative w-full max-w-[460px]"
          >
            {/* Offset gold outline arch */}
            <motion.div
              aria-hidden
              style={{ y: frameY }}
              className="absolute inset-0 translate-x-5 translate-y-5 md:translate-x-8 md:translate-y-8 rounded-t-[999px] rounded-b-[24px] border border-[#B59F78]/40"
            />

            {/* Arch image */}
            <div className="relative aspect-[3/4] rounded-t-[999px] rounded-b-[24px] overflow-hidden bg-[#0C1111]">
              <motion.img
                src={aline}
                alt="Aline, da A.M Arquitetura"
                loading="lazy"
                style={{ y: imgY }}
                className="absolute inset-0 w-full h-[112%] -top-[6%] object-cover object-[50%_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050808]/70 via-transparent to-transparent" />
            </div>

            {/* Floating glass badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5, ease }}
              className="absolute -left-2 md:-left-8 bottom-10 px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/10"
            >
              <div className="text-[#B59F78] text-[10px] tracking-[0.2em] uppercase" style={{ fontWeight: 500 }}>
                Arquitetura de Interiores
              </div>
              <div className="text-[#F2F0EA] text-lg mt-1" style={{ fontWeight: 400 }}>
                Aline · A.M
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Text */}
        <div className="lg:col-span-7 lg:pl-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-12 bg-[#B59F78]" />
            <span className="text-[#B59F78] text-[11px] tracking-[0.2em] uppercase" style={{ fontWeight: 500 }}>
              Quem Somos
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-[44px] md:text-[68px] text-[#F2F0EA] mb-10"
            style={{ fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.03em" }}
          >
            No que a{" "}
            <span className="text-[#B59F78] italic" style={{ fontWeight: 300 }}>
              AM
            </span>
            <br />
            acredita
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="text-[#F2F0EA]/90 text-xl md:text-2xl max-w-2xl mb-8"
            style={{ fontWeight: 300, lineHeight: 1.55 }}
          >
            Acreditamos que cada projeto carrega uma história. Por isso, criamos ambientes que vão além da estética,
            traduzindo a rotina, a personalidade e os desejos de quem vive neles.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="text-[#A7A39B] text-lg max-w-2xl mb-12"
            style={{ fontWeight: 400, lineHeight: 1.75 }}
          >
            Buscamos unir acolhimento, conforto, identidade e bem-estar, sempre guiados por nossos valores:{" "}
            <span className="text-[#F2F0EA]">ética, respeito, transparência, responsabilidade e comprometimento.</span>
          </motion.p>

          {/* Closing statement */}
          <motion.blockquote
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className="relative max-w-2xl pl-8 border-l border-[#B59F78]/60"
          >
            <p className="text-[#F2F0EA] text-xl md:text-2xl" style={{ fontWeight: 300, lineHeight: 1.5 }}>
              Para nós, o resultado importa, mas a forma como cada etapa é conduzida{" "}
              <span className="text-[#B59F78] italic">também faz parte do projeto.</span>
            </p>
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}
