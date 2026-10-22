import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, X, Star } from "lucide-react";
import { useToast } from "@/app/components/Toast";
import { authHeaders } from "@/app/auth";
import {
  MEDIA_ACCEPT, MAX_SUB_MEDIA, emptyFileSlots, emptyPreviewSlots, readFile,
  MediaPreview, categoryConfig, prepareMedia, describeProjectError, MAX_UPLOAD_BYTES, normalizeProject, appendProjectFormData,
  useAdmin, type ApiProject, type PhotoCategory,
} from "./shared";

export function AddProjectPage() {
  const { projects, setProjects, projectsLoading, handleUnauthorized } = useAdmin();
  const toast = useToast();
  const [projectSaving, setProjectSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [subFiles, setSubFiles] = useState<(File | null)[]>(emptyFileSlots);
  const [subPreviews, setSubPreviews] = useState<(string | null)[]>(emptyPreviewSlots);
  const [activeSubSlot, setActiveSubSlot] = useState<number | null>(null);
  const [photoForm, setPhotoForm] = useState({ title: "", description: "", category: "arquitetura" as PhotoCategory, order: 1, featured: false });
  const mainFileRef = useRef<HTMLInputElement>(null);
  const subFileRef = useRef<HTMLInputElement>(null);

  // Sugere a próxima ordem assim que os projetos carregam
  useEffect(() => {
    if (!projectsLoading) setPhotoForm((prev) => ({ ...prev, order: projects.length + 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsLoading]);

  const handleMainFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "video/mp4") return;
    const prepared = await prepareMedia(file);
    setMainFile(prepared);
    setMainPreview(await readFile(prepared));
  }, []);

  const onDropMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleMainFile(file);
  }, [handleMainFile]);

  const openSubSlot = (slot: number) => {
    setActiveSubSlot(slot);
    subFileRef.current?.click();
  };

  const handleSubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSubSlot === null) return;
    const prepared = await prepareMedia(file);
    const url = await readFile(prepared);
    setSubFiles((prev) => prev.map((p, i) => i === activeSubSlot ? prepared : p));
    setSubPreviews((prev) => prev.map((p, i) => i === activeSubSlot ? url : p));
    e.target.value = "";
  };

  const removeSubPreview = (slot: number) => {
    setSubFiles((prev) => prev.map((p, i) => i === slot ? null : p));
    setSubPreviews((prev) => prev.map((p, i) => i === slot ? null : p));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainFile || projectSaving) return;

    const formData = new FormData();
    appendProjectFormData(formData, photoForm);
    formData.set("mainPhoto", mainFile);
    subFiles.forEach((file) => {
      if (file) formData.append("subPhotos", file);
    });

    const totalSize = [mainFile, ...subFiles].reduce((sum, file) => sum + (file?.size ?? 0), 0);
    if (totalSize > MAX_UPLOAD_BYTES) {
      toast.error(`Os arquivos somam ${(totalSize / 1024 / 1024).toFixed(1).replace(".", ",")} MB e o limite por envio é 4,5 MB. Use imagens menores ou menos submídias.`);
      return;
    }

    setProjectSaving(true);
    let response: Response | null = null;
    try {
      response = await fetch("/api/projects", { method: "POST", body: formData, headers: authHeaders() });
      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new Error("project_create_failed");
      const result = await response.json() as { data: ApiProject };
      const newProject = normalizeProject(result.data);
      setProjects((prev) => [...prev.filter((p) => p.id !== newProject.id), newProject].sort((a, b) => a.order - b.order));
      toast.success("Projeto adicionado à galeria com sucesso!", { action: { label: "Ver na galeria", to: "/admin/galeria" } });
      setMainFile(null);
      setMainPreview(null);
      setSubFiles(emptyFileSlots());
      setSubPreviews(emptyPreviewSlots());
      setPhotoForm({ title: "", description: "", category: "arquitetura", order: projects.length + 2, featured: false });
    } catch {
      toast.error(await describeProjectError(response && !response.ok ? response : null));
    } finally {
      setProjectSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={subFileRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="hidden"
        onChange={handleSubFileChange}
      />

      {/* Upload card */}
      <div
        className="p-6 lg:p-8 rounded-[20px] border"
        style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>
          NOVO PROJETO
        </p>
        <h2 className="text-[#F2F0EA] text-xl mb-6" style={{ fontWeight: 400 }}>
          Adicionar ao portfólio
        </h2>

        <form onSubmit={handleProjectSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT: foto principal + subfotos */}
            <div className="space-y-3">
              {/* Main photo drop zone */}
              <p className="text-[#A7A39B] text-xs tracking-wide uppercase" style={{ fontWeight: 500 }}>Foto Principal</p>
              <div
                className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden"
                style={{
                  minHeight: "200px",
                  borderColor: isDragging ? "#B59F78" : "rgba(181,159,120,0.25)",
                  background: isDragging ? "rgba(181,159,120,0.05)" : "rgba(255,255,255,0.02)",
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDropMain}
                onClick={() => mainFileRef.current?.click()}
              >
                {mainPreview ? (
                  <>
                    <MediaPreview src={mainPreview} alt="Foto principal" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Upload size={22} />
                        <span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(181,159,120,0.1)" }}>
                      <Upload size={20} style={{ color: "#B59F78" }} />
                    </div>
                    <p className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>Arraste ou clique</p>
                    <p className="text-[#A7A39B] text-xs">PNG, JPG, WEBP ou MP4 - ate 100MB</p>
                  </div>
                )}
                <input ref={mainFileRef} type="file" accept={MEDIA_ACCEPT} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainFile(f); }} />
              </div>

              {/* Sub-photos 2×2 grid */}
              <p className="text-[#A7A39B] text-xs tracking-wide uppercase pt-1" style={{ fontWeight: 500 }}>
                Submidias <span style={{ color: "rgba(167,163,155,0.5)", textTransform: "none", letterSpacing: 0 }}>(ate {MAX_SUB_MEDIA})</span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: MAX_SUB_MEDIA }, (_, slot) => {
                  const preview = subPreviews[slot];
                  return (
                    <div key={slot} className="relative group">
                      <div
                        className="relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 border"
                        style={{
                          aspectRatio: "1/1",
                          background: preview ? "transparent" : "rgba(255,255,255,0.03)",
                          borderColor: preview ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)",
                          borderStyle: preview ? "solid" : "dashed",
                        }}
                        onClick={() => openSubSlot(slot)}
                      >
                        {preview ? (
                          <MediaPreview src={preview} alt={`Subfoto ${slot + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span style={{ color: "rgba(181,159,120,0.4)", fontSize: "20px", lineHeight: 1 }}>+</span>
                          </div>
                        )}
                      </div>
                      {preview && (
                        <button
                          type="button"
                          onClick={() => removeSubPreview(slot)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                          style={{ background: "#f87171", zIndex: 10 }}
                        >
                          <X size={10} style={{ color: "#fff" }} />
                        </button>
                      )}
                      <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded"
                        style={{ background: "rgba(0,0,0,0.55)", color: "#A7A39B", fontWeight: 500 }}>
                        {slot + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: form fields */}
            <div className="space-y-4">
              {/* Title */}
              <div className="relative">
                <input type="text" id="proj-title" value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  placeholder=" "
                  className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                  style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
                  required />
                <label htmlFor="proj-title"
                  className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                  style={{ fontWeight: 400 }}>Título do projeto</label>
              </div>

              {/* Description */}
              <div className="relative">
                <textarea id="proj-desc" value={photoForm.description}
                  onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                  placeholder=" " rows={3}
                  className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none resize-none peer transition-all duration-200"
                  style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                <label htmlFor="proj-desc"
                  className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                  style={{ fontWeight: 400 }}>Descrição</label>
              </div>

              {/* Category */}
              <div className="flex gap-3">
                {(["arquitetura", "marcenaria"] as PhotoCategory[]).map((cat) => {
                  const active = photoForm.category === cat;
                  const cfg = categoryConfig[cat];
                  return (
                    <button key={cat} type="button"
                      onClick={() => setPhotoForm({ ...photoForm, category: cat })}
                      className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
                      style={{
                        background: active ? cfg.bg : "#0E1414",
                        border: `1px solid ${active ? cfg.color + "55" : "rgba(255,255,255,0.06)"}`,
                        color: active ? cfg.color : "#A7A39B",
                        fontWeight: active ? 500 : 400,
                      }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {/* Order + Featured */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input type="number" id="proj-order" value={photoForm.order} min={1}
                    onChange={(e) => setPhotoForm({ ...photoForm, order: Number(e.target.value) })}
                    placeholder=" "
                    className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                    style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                  <label htmlFor="proj-order"
                    className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                    style={{ fontWeight: 400 }}>Ordem</label>
                </div>
                <button type="button"
                  onClick={() => setPhotoForm({ ...photoForm, featured: !photoForm.featured })}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] transition-all duration-300 flex-shrink-0"
                  style={{
                    background: photoForm.featured ? "rgba(181,159,120,0.12)" : "#0E1414",
                    border: `1px solid ${photoForm.featured ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                  }}>
                  <Star size={16} style={{ color: photoForm.featured ? "#B59F78" : "#A7A39B", fill: photoForm.featured ? "#B59F78" : "none" }} />
                  <span className="text-sm whitespace-nowrap" style={{ color: photoForm.featured ? "#B59F78" : "#A7A39B", fontWeight: photoForm.featured ? 500 : 400 }}>
                    Destaque
                  </span>
                </button>
              </div>

              {/* Submit */}
              <motion.button type="submit"
                whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                disabled={!mainFile || projectSaving}
                className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300"
                style={{
                  background: mainFile && !projectSaving ? "#B59F78" : "rgba(181,159,120,0.2)",
                  color: mainFile && !projectSaving ? "#050808" : "#B59F78",
                  fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em",
                  boxShadow: mainFile && !projectSaving ? "0 10px 30px rgba(181,159,120,0.2)" : "none",
                  cursor: mainFile && !projectSaving ? "pointer" : "not-allowed",
                }}>
                <Upload size={16} />
                Adicionar ao portfólio
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
