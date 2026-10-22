import { Component, type ReactNode } from "react";

/** Evita a tela em branco quando algo inesperado quebra a interface. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 bg-[#050808] text-center"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <div className="max-w-md">
          <h1 className="text-[#F2F0EA] text-3xl mb-3" style={{ fontWeight: 300 }}>
            Algo deu errado
          </h1>
          <p className="text-[#A7A39B] text-base mb-8 leading-relaxed" style={{ fontWeight: 400 }}>
            Não foi possível exibir esta página agora. Atualize a página para tentar de novo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full text-sm"
            style={{ background: "#B59F78", color: "#050808", fontWeight: 500 }}
          >
            Atualizar página
          </button>
        </div>
      </div>
    );
  }
}
