import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, Trash2 } from "lucide-react";
import { authHeaders } from "@/app/auth";
import { useToast } from "@/app/components/Toast";
import { useAdmin, type AdminProfile } from "./shared";

const AVATAR_SIZE = 256;
const MIN_PASSWORD = 8;

const inputStyle = {
  background: "#0E1414",
  border: "1px solid rgba(255,255,255,0.06)",
  fontFamily: "Manrope, sans-serif",
  fontSize: "15px",
};

const labelClass =
  "absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300";

/** Redimensiona e comprime a imagem para caber no perfil (quadrada, JPEG). */
function resizeAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_SIZE;
      canvas.height = AVATAR_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

export function SettingsPage() {
  const { profile, setProfile, handleUnauthorized } = useAdmin();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [profileSaving, setProfileSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const initial = (displayName.trim() || "Admin").charAt(0).toUpperCase();
  const profileChanged = displayName.trim() !== profile.displayName || avatar !== profile.avatar;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (PNG, JPG ou WEBP).");
      return;
    }
    try {
      setAvatar(await resizeAvatar(file));
    } catch {
      toast.error("Não foi possível ler essa imagem. Tente outro arquivo.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSaving || !profileChanged) return;

    setProfileSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ displayName: displayName.trim(), avatar }),
      });
      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new Error("profile_update_failed");
      const result = await response.json() as { data: AdminProfile };
      setProfile(result.data);
      setDisplayName(result.data.displayName);
      setAvatar(result.data.avatar);
      toast.success("Perfil atualizado com sucesso.");
    } catch {
      toast.error("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordSaving) return;

    if (newPassword.length < MIN_PASSWORD) {
      toast.error(`A nova senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não coincide com a nova senha.");
      return;
    }
    if (newPassword === currentPassword) {
      toast.error("A nova senha deve ser diferente da senha atual.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.status === 401) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        if (body.error === "invalid_current_password") {
          toast.error("A senha atual está incorreta.");
        } else {
          handleUnauthorized();
        }
        return;
      }
      if (response.status === 429) {
        toast.error("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
        return;
      }
      if (response.status === 503) {
        toast.error("O armazenamento da conta está indisponível no momento. Tente novamente em instantes.");
        return;
      }
      if (!response.ok) throw new Error("password_update_failed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso. Use a nova senha no próximo login.");
    } catch {
      toast.error("Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const passwordFields = [
    { id: "cfg-current", label: "Senha atual", value: currentPassword, set: setCurrentPassword, autoComplete: "current-password" },
    { id: "cfg-new", label: "Nova senha", value: newPassword, set: setNewPassword, autoComplete: "new-password" },
    { id: "cfg-confirm", label: "Confirmar nova senha", value: confirmPassword, set: setConfirmPassword, autoComplete: "new-password" },
  ];
  const passwordReady = currentPassword !== "" && newPassword !== "" && confirmPassword !== "";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

      {/* ── Perfil ── */}
      <div
        className="p-6 lg:p-8 rounded-[20px] border"
        style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
          PERFIL
        </p>
        <h2 className="text-[#F2F0EA] text-xl mb-6" style={{ fontWeight: 400 }}>
          Dados do administrador
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="flex items-center gap-5">
            <div
              className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 text-3xl"
              style={{ background: "rgba(181,159,120,0.15)", color: "#B59F78", fontWeight: 600, border: "1px solid rgba(181,159,120,0.25)" }}
            >
              {avatar ? (
                <img src={avatar} alt="Pré-visualização da foto de perfil" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="space-y-2 min-w-0">
              <p className="text-[#A7A39B] text-xs tracking-wide uppercase" style={{ fontWeight: 500 }}>Foto de perfil</p>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 hover:bg-white/5"
                  style={{ border: "1px solid rgba(181,159,120,0.3)", color: "#B59F78", fontWeight: 500 }}
                >
                  <Upload size={13} />
                  {avatar ? "Trocar foto" : "Enviar foto"}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 hover:bg-white/5"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#A7A39B", fontWeight: 500 }}
                  >
                    <Trash2 size={13} />
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              id="cfg-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder=" "
              maxLength={60}
              className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
              style={inputStyle}
            />
            <label htmlFor="cfg-name" className={labelClass} style={{ fontWeight: 400 }}>Nome de exibição</label>
          </div>

          <div className="relative">
            <input
              type="email"
              id="cfg-email"
              value={profile.email}
              readOnly
              placeholder=" "
              className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] focus:outline-none peer cursor-not-allowed"
              style={{ ...inputStyle, color: "#A7A39B" }}
            />
            <label htmlFor="cfg-email" className={labelClass} style={{ fontWeight: 400 }}>E-mail de login</label>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            disabled={profileSaving || !profileChanged}
            className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: profileChanged && !profileSaving ? "#B59F78" : "rgba(181,159,120,0.2)",
              color: profileChanged && !profileSaving ? "#050808" : "#B59F78",
              fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em",
              boxShadow: profileChanged && !profileSaving ? "0 10px 30px rgba(181,159,120,0.2)" : "none",
              cursor: profileChanged && !profileSaving ? "pointer" : "not-allowed",
            }}
          >
            {profileSaving ? "Salvando..." : "Salvar perfil"}
          </motion.button>
        </form>
      </div>

      {/* ── Senha ── */}
      <div
        className="p-6 lg:p-8 rounded-[20px] border"
        style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
          SEGURANÇA
        </p>
        <h2 className="text-[#F2F0EA] text-xl mb-6" style={{ fontWeight: 400 }}>
          Alterar senha
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          {passwordFields.map((field) => (
            <div key={field.id} className="relative">
              <input
                type="password"
                id={field.id}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder=" "
                autoComplete={field.autoComplete}
                className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                style={inputStyle}
              />
              <label htmlFor={field.id} className={labelClass} style={{ fontWeight: 400 }}>{field.label}</label>
            </div>
          ))}

          <p className="text-[#A7A39B]/70 text-xs leading-relaxed" style={{ fontWeight: 400 }}>
            Use pelo menos {MIN_PASSWORD} caracteres. A senha atual é conferida antes da troca.
          </p>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
            disabled={passwordSaving || !passwordReady}
            className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: passwordReady && !passwordSaving ? "#B59F78" : "rgba(181,159,120,0.2)",
              color: passwordReady && !passwordSaving ? "#050808" : "#B59F78",
              fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em",
              boxShadow: passwordReady && !passwordSaving ? "0 10px 30px rgba(181,159,120,0.2)" : "none",
              cursor: passwordReady && !passwordSaving ? "pointer" : "not-allowed",
            }}
          >
            {passwordSaving ? "Alterando..." : "Alterar senha"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
