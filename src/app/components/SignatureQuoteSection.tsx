import { motion, useReducedMotion } from "motion/react";

const PHRASE = "Transformamos sonhos em espaços, ideias em realidade e ambientes em cenários para novas histórias.";
const words = PHRASE.split(" ");

const ease = [0.22, 1, 0.36, 1] as const;
const START = 0.35;
const WHITE = "#F2F0EA";
const GOLD = "#D9BE86";
const GLOW = "0 0 18px rgba(217,190,134,0.55)";
const NO_GLOW = "0 0 0px rgba(217,190,134,0)";
const HIDDEN = "inset(-25% 100% -25% -8%)";
const FULL = "inset(-25% -8% -25% -8%)";
const durationOf = (w: string) => 0.3 + w.length * 0.045;

// Cada palavra é "escrita" da esquerda para a direita, uma após a outra.
const timings = words.reduce<{ delay: number; duration: number }[]>((acc, w) => {
  const prev = acc[acc.length - 1];
  const delay = prev ? prev.delay + prev.duration * 0.85 : START;
  acc.push({ delay, duration: durationOf(w) });
  return acc;
}, []);

export function SignatureQuoteSection() {
  const reduce = useReducedMotion();

  return (
    <section id="signature" className="py-20 md:py-28 bg-[#050808] px-6 md:px-16">
      <div className="max-w-[1440px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease }}
          className="relative px-6 py-12 md:py-20"
        >
          {/* Aspas decorativas */}
          <span
            aria-hidden
            className="pointer-events-none select-none absolute -left-2 -top-10 md:left-6 md:-top-14 text-[#B59F78]/[0.07] leading-none"
            style={{ fontFamily: "Georgia, serif", fontSize: "clamp(180px, 22vw, 320px)" }}
          >
            “
          </span>

          <blockquote className="relative mx-auto max-w-[920px] text-center">
            <p className="sr-only">{PHRASE}</p>
            <p
              aria-hidden
              style={{
                fontFamily: "'Parisienne', cursive",
                fontSize: "clamp(34px, 5vw, 64px)",
                lineHeight: 1.45,
                letterSpacing: "0.01em",
              }}
            >
              {words.map((word, i) => (
                <span key={i}>
                  <motion.span
                    className="inline-block"
                    style={{ padding: "0 0.08em" }}
                    initial={{
                      clipPath: reduce ? FULL : HIDDEN,
                      color: WHITE,
                      textShadow: NO_GLOW,
                    }}
                    whileInView={{
                      clipPath: FULL,
                      // dourado enquanto é escrita, depois assenta em branco
                      color: reduce ? WHITE : [GOLD, GOLD, WHITE],
                      textShadow: reduce ? NO_GLOW : [GLOW, GLOW, NO_GLOW],
                    }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{
                      clipPath: { duration: reduce ? 0 : timings[i].duration, delay: reduce ? 0 : timings[i].delay, ease: "easeOut" },
                      color: { duration: 1.1, delay: reduce ? 0 : timings[i].delay + timings[i].duration * 0.5, times: [0, 0.35, 1], ease: "easeInOut" },
                      textShadow: { duration: 1.1, delay: reduce ? 0 : timings[i].delay + timings[i].duration * 0.5, times: [0, 0.35, 1], ease: "easeInOut" },
                    }}
                  >
                    {word}
                  </motion.span>
                  {i < words.length - 1 && " "}
                </span>
              ))}
            </p>

            {/* Assinatura */}
            <div
              className="mt-12 flex items-center justify-center gap-4"
            >
              <span className="h-px w-8 bg-[#B59F78]" />
              <span className="text-[#B59F78] text-[11px] tracking-[0.2em] uppercase" style={{ fontWeight: 500 }}>
                A.M Arquitetura
              </span>
              <span className="h-px w-8 bg-[#B59F78]" />
            </div>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
