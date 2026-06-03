import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-2.png";
import videoSource from "@/imports/architectural-visualization.mp4";

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-[#050808] flex overflow-hidden"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      {/* ─── LEFT PANEL ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col"
      >
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          aria-hidden="true"
        >
          <source src={videoSource} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to right, rgba(5,8,8,0.25) 0%, rgba(5,8,8,0.65) 100%), linear-gradient(to bottom, rgba(5,8,8,0.55) 0%, transparent 35%, rgba(5,8,8,0.88) 100%)",
          }}
        />

        {/* "A.M" watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
            className="select-none leading-none tracking-tighter"
            style={{
              fontSize: "clamp(180px, 28vw, 420px)",
              fontWeight: 700,
              color: "#F2F0EA",
              opacity: 0.045,
            }}
          >
            A.M
          </motion.span>
        </div>

        {/* Top logo */}
        <div className="relative z-30 p-10">
          <ImageWithFallback
            src={logoImg}
            alt="A.M Arquitetura e Marcenaria"
            className="h-11 w-auto object-contain"
          />
        </div>

        {/* Floating quote card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 mx-10 my-auto p-8 rounded-[20px] border border-white/8"
          style={{
            background: "rgba(12, 17, 17, 0.55)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-start gap-3 mb-5">
            <div
              className="w-1 rounded-full flex-shrink-0 mt-1"
              style={{ height: "52px", background: "linear-gradient(to bottom, #B59F78, rgba(181,159,120,0.2))" }}
            />
            <p
              className="text-[#F2F0EA] text-xl leading-snug"
              style={{ fontWeight: 300, letterSpacing: "-0.01em" }}
            >
              "Cada espaço conta uma história. A nossa missão é fazer com que a sua seja inesquecível."
            </p>
          </div>
          <div className="flex items-center gap-3 pl-4">
            <div className="w-8 h-px bg-[#B59F78]/60" />
            <span className="text-[#B59F78] text-xs tracking-[0.12em] uppercase" style={{ fontWeight: 500 }}>
              A.M Arquitetura & Marcenaria
            </span>
          </div>
        </motion.div>

        {/* Bottom content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-30 p-10 pt-6"
        >
          <p
            className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase mb-4"
            style={{ fontWeight: 500 }}
          >
            PORTAL DO CLIENTE
          </p>
          <h2
            className="text-[#F2F0EA] text-4xl xl:text-[44px] mb-4"
            style={{ fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.18 }}
          >
            Acompanhe seu projeto com exclusividade.
          </h2>
          <p className="text-[#A7A39B] text-base leading-relaxed max-w-[480px]" style={{ fontWeight: 400 }}>
            Plantas, cronogramas, materiais e o progresso completo do seu ambiente em um só lugar.
          </p>

          {/* Stats row */}
          <div className="mt-8 flex items-center gap-8">
            {[
              { value: "320+", label: "Projetos" },
              { value: "12+", label: "Anos" },
              { value: "98%", label: "Satisfação" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-[#B59F78] text-2xl" style={{ fontWeight: 400 }}>
                  {s.value}
                </div>
                <div className="text-[#A7A39B] text-xs tracking-wide uppercase mt-0.5" style={{ fontWeight: 400 }}>
                  {s.label}
                </div>
              </motion.div>
            ))}
            <div className="h-8 w-px bg-white/10 mx-2" />
            <span className="text-[#A7A39B] text-xs" style={{ fontWeight: 400 }}>
              São Paulo, Brasil
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── RIGHT PANEL ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-[42%] flex flex-col relative"
        style={{
          background: "linear-gradient(160deg, #080e0e 0%, #050808 55%)",
        }}
      >
        {/* Mobile video tint */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover" aria-hidden="true">
            <source src={videoSource} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#050808]/88" />
        </div>

        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 80% 0%, rgba(181,159,120,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 md:px-12 py-8">
          <Link
            to="/"
            className="group flex items-center gap-2 text-sm transition-all duration-300 hover:text-[#B59F78]"
            style={{ color: "#A7A39B", fontWeight: 500 }}
          >
            <motion.span whileHover={{ x: -3 }} transition={{ duration: 0.2 }}>
              <ArrowLeft size={16} />
            </motion.span>
            Voltar ao site
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden">
            <ImageWithFallback src={logoImg} alt="A.M Arquitetura" className="h-9 w-auto" />
          </div>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-12 xl:px-16 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <p
              className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase mb-5"
              style={{ fontWeight: 500 }}
            >
              PORTAL DO CLIENTE
            </p>
            <h1
              className="text-[#F2F0EA] text-[38px] md:text-[44px] mb-3"
              style={{ fontWeight: 300, letterSpacing: "-0.025em", lineHeight: 1.12 }}
            >
              Bem-vindo
              <br />
              <span style={{ color: "#B59F78", fontWeight: 400 }}>de volta.</span>
            </h1>
            <p className="text-[#A7A39B] text-base mt-2" style={{ fontWeight: 400 }}>
              Acesse sua conta para acompanhar seu projeto.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Email */}
            <div className="relative group">
              <div
                className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300"
                style={{ color: focused.email || form.email ? "#B59F78" : "#A7A39B" }}
              >
                <Mail size={16} />
              </div>
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused({ ...focused, email: true })}
                onBlur={() => setFocused({ ...focused, email: form.email !== "" })}
                className="w-full pl-[46px] pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] transition-all duration-300 focus:outline-none"
                style={{
                  background: focused.email || form.email ? "#0E1414" : "#0C1111",
                  border: `1px solid ${focused.email ? "rgba(181,159,120,0.45)" : "rgba(255,255,255,0.05)"}`,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "15px",
                }}
                required
              />
              <label
                htmlFor="email"
                className={`absolute left-[46px] pointer-events-none transition-all duration-300 ${
                  focused.email || form.email
                    ? "top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78]"
                    : "top-1/2 -translate-y-1/2 text-[15px] text-[#A7A39B]"
                }`}
                style={{ fontWeight: 400 }}
              >
                Endereço de Email
              </label>
            </div>

            {/* Password */}
            <div className="relative group">
              <div
                className="absolute left-5 top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors duration-300"
                style={{ color: focused.password || form.password ? "#B59F78" : "#A7A39B" }}
              >
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused({ ...focused, password: true })}
                onBlur={() => setFocused({ ...focused, password: form.password !== "" })}
                className="w-full pl-[46px] pr-14 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] transition-all duration-300 focus:outline-none"
                style={{
                  background: focused.password || form.password ? "#0E1414" : "#0C1111",
                  border: `1px solid ${focused.password ? "rgba(181,159,120,0.45)" : "rgba(255,255,255,0.05)"}`,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: "15px",
                }}
                required
              />
              <label
                htmlFor="password"
                className={`absolute left-[46px] pointer-events-none transition-all duration-300 ${
                  focused.password || form.password
                    ? "top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78]"
                    : "top-1/2 -translate-y-1/2 text-[15px] text-[#A7A39B]"
                }`}
                style={{ fontWeight: 400 }}
              >
                Senha
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors duration-300 hover:text-[#B59F78]"
                style={{ color: "#A7A39B" }}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end pt-1">
              <a
                href="#"
                className="text-sm transition-colors duration-300 hover:text-[#B59F78]"
                style={{ color: "#A7A39B", fontWeight: 400 }}
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              className="w-full py-[15px] rounded-full flex items-center justify-center gap-3 transition-all duration-300 mt-2"
              style={{
                backgroundColor: "#B59F78",
                color: "#050808",
                fontWeight: 500,
                fontSize: "15px",
                letterSpacing: "0.04em",
                boxShadow: "0 12px 40px rgba(181,159,120,0.28)",
                opacity: isLoading ? 0.85 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    className="inline-block w-[18px] h-[18px] border-2 rounded-full"
                    style={{ borderColor: "rgba(5,8,8,0.25)", borderTopColor: "#050808" }}
                  />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na Conta
                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex items-center gap-4 my-7"
          >
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <span
              className="text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "#A7A39B", fontWeight: 400 }}
            >
              ou
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
          </motion.div>

          {/* Register CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="text-center"
          >
            <p className="text-sm mb-2" style={{ color: "#A7A39B", fontWeight: 400 }}>
              Ainda não tem uma conta?
            </p>
            <a
              href="/#contact"
              className="text-sm transition-colors duration-300 hover:text-[#C8B28A]"
              style={{ color: "#B59F78", fontWeight: 500 }}
            >
              Inicie seu projeto conosco →
            </a>
          </motion.div>
        </div>

        {/* Bottom footer */}
        <div
          className="relative z-10 px-8 md:px-12 py-6 border-t"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <p className="text-center text-xs" style={{ color: "rgba(167,163,155,0.5)", fontWeight: 400 }}>
            © 2024 A.M Arquitetura & Marcenaria. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
