import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Link, useNavigate, Navigate } from "react-router";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import logoImg from "@/imports/image-4.png";
import { login, isAuthenticated } from "@/app/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  if (isAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    const ok = await login(form.email, form.password);
    if (ok) {
      navigate("/admin", { replace: true });
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-[#050808] overflow-hidden"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex min-h-screen w-full flex-col"
        style={{
          background: "linear-gradient(160deg, #080e0e 0%, #050808 55%)",
        }}
      >
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

          <div>
            <ImageWithFallback src={logoImg} alt="A.M Arquitetura" className="h-9 w-auto" />
          </div>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex flex-1 items-center justify-center px-8 md:px-12 xl:px-16 pt-6 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[540px] rounded-[28px] border px-6 py-7 md:px-8 md:py-9"
            style={{
              background: "linear-gradient(180deg, rgba(16,22,22,0.94) 0%, rgba(9,13,13,0.92) 100%)",
              borderColor: "rgba(255,255,255,0.08)",
              boxShadow: "0 28px 90px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.02) inset",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* Header */}
            <div className="mb-10">
              <p
                className="text-[#B59F78] text-[11px] tracking-[0.15em] uppercase mb-5"
                style={{ fontWeight: 500 }}
              >
                PORTAL DO ADMINISTRADOR
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
                Acesse o painel para gerenciar projetos e clientes.
              </p>
            </div>

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

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-[12px]"
                  style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)" }}
                >
                  <AlertCircle size={15} style={{ color: "#f87171", flexShrink: 0 }} />
                  <p className="text-sm" style={{ color: "#f87171", fontWeight: 400 }}>
                    Email ou senha incorretos.
                  </p>
                </motion.div>
              )}

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
          </motion.div>
        </div>

        {/* Bottom footer */}
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-8 md:px-12 py-6 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "linear-gradient(180deg, rgba(5,8,8,0) 0%, rgba(5,8,8,0.92) 35%, rgba(5,8,8,0.98) 100%)",
            backdropFilter: "blur(10px)",
          }}
        >
          <p className="text-center text-xs" style={{ color: "rgba(167,163,155,0.5)", fontWeight: 400 }}>
            © {new Date().getFullYear()} A.M Arquitetura & Marcenaria. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
