import { motion, AnimatePresence } from "motion/react";
import { Cookie } from "lucide-react";
import { setConsent, useConsent } from "@/app/consent";

export function CookieConsent() {
  const consent = useConsent();

  return (
    <AnimatePresence>
      {consent === null && (
        <motion.div
          role="dialog"
          aria-label="Aviso de cookies"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-[460px] z-[100] p-5 md:p-6 rounded-[20px] border"
          style={{
            background: "rgba(12,17,17,0.95)",
            backdropFilter: "blur(16px)",
            borderColor: "rgba(181,159,120,0.2)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            fontFamily: "Manrope, sans-serif",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(181,159,120,0.12)" }}
            >
              <Cookie size={17} style={{ color: "#B59F78" }} />
            </div>
            <div>
              <p className="text-[#F2F0EA] text-sm mb-1" style={{ fontWeight: 500 }}>
                Nós usamos cookies
              </p>
              <p className="text-[#A7A39B] text-xs leading-relaxed" style={{ fontWeight: 400 }}>
                Usamos cookies essenciais para o funcionamento do site e, com a sua permissão, cookies de
                análise para entender como ele é utilizado e melhorar a sua experiência.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConsent("essential")}
              className="flex-1 py-2.5 rounded-full text-sm transition-all duration-200 hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#A7A39B", fontWeight: 500 }}
            >
              Somente essenciais
            </button>
            <button
              type="button"
              onClick={() => setConsent("all")}
              className="flex-1 py-2.5 rounded-full text-sm transition-all duration-200 hover:bg-[#C8B28A]"
              style={{ background: "#B59F78", color: "#050808", fontWeight: 500 }}
            >
              Aceitar todos
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
