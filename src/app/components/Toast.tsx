import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

interface ToastAction {
  label: string;
  to: string;
}

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  action?: ToastAction;
}

interface ToastOptions {
  action?: ToastAction;
  duration?: number;
}

interface ToastApi {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const kindStyle: Record<ToastKind, { color: string; tint: string; Icon: typeof Info }> = {
  success: { color: "#4ade80", tint: "rgba(74,222,128,0.14)", Icon: CheckCircle2 },
  error:   { color: "#f87171", tint: "rgba(248,113,113,0.14)", Icon: AlertCircle },
  info:    { color: "#B59F78", tint: "rgba(181,159,120,0.14)", Icon: Info },
};

/** Erro cuja mensagem já foi escrita para o usuário final. */
export class UserFacingError extends Error {}

const GENERIC_ERROR = "Algo deu errado. Tente novamente em instantes.";
const MAX_VISIBLE = 3;

/** Converte qualquer erro técnico em uma mensagem simples para o usuário. */
export function friendlyMessage(error: unknown, fallback = GENERIC_ERROR): string {
  if (error instanceof UserFacingError) return error.message;
  const text = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(text)) {
    return "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
  }
  return fallback;
}

/** Mensagem amigável a partir do status HTTP de uma resposta. */
export function messageForStatus(status: number, fallback = GENERIC_ERROR): string {
  if (status === 401 || status === 403) return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 413) return "O arquivo é grande demais para ser enviado. Use um arquivo menor.";
  if (status === 429) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (status >= 500) return "O servidor está com instabilidade no momento. Tente novamente em instantes.";
  return fallback;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, message: string, options?: ToastOptions) => {
    setToasts((prev) => {
      // Evita empilhar a mesma mensagem repetida
      if (prev.some((t) => t.message === message && t.kind === kind)) return prev;
      const id = ++counter.current;
      const duration = options?.duration ?? (options?.action ? 8000 : kind === "error" ? 7000 : 5000);
      timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
      return [...prev, { id, kind, message, action: options?.action }].slice(-MAX_VISIBLE);
    });
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    success: (m, o) => push("success", m, o),
    error: (m, o) => push("error", m, o),
    info: (m, o) => push("info", m, o),
  }), [push]);

  // Erros inesperados nunca chegam ao usuário como texto técnico
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      // Erros de carregamento de recursos (imagens etc.) não merecem alerta
      if (event.target && event.target !== window) return;
      push("error", GENERIC_ERROR);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      push("error", friendlyMessage(event.reason));
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed top-4 left-0 right-0 z-[120] flex flex-col items-center gap-3 px-4 pointer-events-none"
        style={{ fontFamily: "Manrope, sans-serif" }}
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const { color, tint, Icon } = kindStyle[toast.kind];
            return (
              <motion.div
                key={toast.id}
                layout
                role={toast.kind === "error" ? "alert" : "status"}
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-[520px] flex items-center gap-3 pl-4 pr-3 py-3 rounded-[20px]"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%), ${tint}`,
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                <Icon size={20} style={{ color, flexShrink: 0 }} />
                <p className="flex-1 text-sm leading-snug text-[#F2F0EA]" style={{ fontWeight: 400 }}>
                  {toast.message}
                </p>
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => { const to = toast.action!.to; dismiss(toast.id); navigate(to); }}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs transition-all duration-200 hover:brightness-110"
                    style={{ background: "#B59F78", color: "#050808", fontWeight: 600 }}
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Fechar notificação"
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                  style={{ color: "#A7A39B" }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
