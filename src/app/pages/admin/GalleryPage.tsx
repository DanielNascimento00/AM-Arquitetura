import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Star, Trash2, Pencil, X, GripVertical, Search } from "lucide-react";
import { authHeaders } from "@/app/auth";
import { useToast, friendlyMessage, UserFacingError } from "@/app/components/Toast";
import {
  MEDIA_ACCEPT, MAX_SUB_MEDIA, emptyFileSlots, emptySubPhotoSlots, readFile,
  MediaPreview, categoryConfig, prepareMedia, describeProjectError, normalizeProject, appendProjectFormData,
  useAdmin, type ApiProject, type PhotoCategory, type Project, type SubPhoto,
} from "./shared";

export function GalleryPage() {
  const { projects, setProjects, projectsLoading, handleUnauthorized } = useAdmin();
  const toast = useToast();
  const [projectSaving, setProjectSaving] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<PhotoCategory | "todos">("todos");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Edit modal state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editMainFile, setEditMainFile] = useState<File | null>(null);
  const [editMainPreview, setEditMainPreview] = useState<string | null>(null);
  const [editMainGradient, setEditMainGradient] = useState<string>("");
  const [editSubSlots, setEditSubSlots] = useState<(SubPhoto | null)[]>(emptySubPhotoSlots);
  const [editSubFiles, setEditSubFiles] = useState<(File | null)[]>(emptyFileSlots);
  const [editActiveSubSlot, setEditActiveSubSlot] = useState<number | null>(null);
  const [editIsDragging, setEditIsDragging] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "arquitetura" as PhotoCategory, order: 1, featured: false });
  const editMainFileRef = useRef<HTMLInputElement>(null);
  const editSubFileRef = useRef<HTMLInputElement>(null);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects
      .filter((p) => galleryFilter === "todos" || p.category === galleryFilter)
      .filter((p) => !term || p.title.toLowerCase().includes(term))
      .sort((a, b) => a.order - b.order);
  }, [projects, galleryFilter, search]);

  const saveProject = async (project: Project, form: typeof editForm, main: File | null, subSlots: (SubPhoto | null)[], slotFiles: (File | null)[]) => {
    const formData = new FormData();
    formData.set("id", String(project.id));
    appendProjectFormData(formData, form);
    if (main) formData.set("mainPhoto", main);
    formData.set("keptSubPhotoIds", JSON.stringify(subSlots.map((sub) => sub?.id ?? null)));
    slotFiles.forEach((file, slot) => {
      if (file) formData.set(`subPhoto_${slot}`, file);
    });

    const response = await fetch("/api/projects", { method: "PATCH", body: formData, headers: authHeaders() });
    if (response.status === 401) { handleUnauthorized(); return undefined; }
    if (!response.ok) throw new UserFacingError(await describeProjectError(response));
    const result = await response.json() as { data: ApiProject };
    const updated = normalizeProject(result.data);
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p).sort((a, b) => a.order - b.order));
    return updated;
  };

  const toggleFeatured = async (id: number) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const previousProjects = projects;
    setProjects((prev) => prev.map((p) => ({ ...p, featured: p.id === id ? !p.featured : p.featured })));

    try {
      await saveProject(project, { title: project.title, description: project.description, category: project.category, order: project.order, featured: !project.featured }, null, project.subPhotos, emptyFileSlots());
      toast.success(project.featured ? "Projeto removido dos destaques." : "Projeto marcado como destaque.");
    } catch (error) {
      setProjects(previousProjects);
      toast.error(friendlyMessage(error));
    }
  };

  const deleteProject = async (id: number) => {
    const previousProjects = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);

    try {
      const response = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ id }),
      });
      if (response.status === 401) { handleUnauthorized(); return; }
      if (!response.ok) throw new UserFacingError(await describeProjectError(response, "excluir"));
      toast.success("Projeto excluído com sucesso.");
    } catch (error) {
      setProjects(previousProjects);
      toast.error(friendlyMessage(error));
    }
  };

  const openEdit = (project: Project) => {
    setEditMainFile(null);
    setEditMainPreview(project.mainPhoto.preview);
    setEditMainGradient(project.mainPhoto.gradient);
    const slots = emptySubPhotoSlots();
    project.subPhotos.forEach((sub, i) => { if (i < MAX_SUB_MEDIA) slots[i] = sub; });
    setEditSubSlots(slots);
    setEditSubFiles(emptyFileSlots());
    setEditForm({ title: project.title, description: project.description, category: project.category, order: project.order, featured: project.featured });
    setEditingProject(project);
  };

  const handleEditMainFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "video/mp4") return;
    const prepared = await prepareMedia(file);
    setEditMainFile(prepared);
    setEditMainPreview(await readFile(prepared));
    setEditMainGradient("");
  }, []);

  const openEditSubSlot = (slot: number) => {
    setEditActiveSubSlot(slot);
    editSubFileRef.current?.click();
  };

  const handleEditSubFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editActiveSubSlot === null) return;
    const prepared = await prepareMedia(file);
    const url = await readFile(prepared);
    const newSub: SubPhoto = { id: Date.now(), preview: url, gradient: "" };
    setEditSubSlots((prev) => prev.map((s, i) => i === editActiveSubSlot ? newSub : s));
    setEditSubFiles((prev) => prev.map((s, i) => i === editActiveSubSlot ? prepared : s));
    e.target.value = "";
  };

  const removeEditSubSlot = (slot: number) => {
    setEditSubSlots((prev) => prev.map((s, i) => i === slot ? null : s));
    setEditSubFiles((prev) => prev.map((s, i) => i === slot ? null : s));
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || projectSaving) return;

    setProjectSaving(true);
    try {
      await saveProject(editingProject, editForm, editMainFile, editSubSlots, editSubFiles);
      setEditingProject(null);
      toast.success("Projeto atualizado com sucesso.");
    } catch (error) {
      toast.error(friendlyMessage(error));
    } finally {
      setProjectSaving(false);
    }
  };

  return (
    <>
    <div className="space-y-6">
      {/* Projects grid */}
      <div>
        {/* Filter + count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="relative basis-full sm:basis-64 sm:order-last">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#A7A39B" }} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título"
                  aria-label="Buscar projetos por título"
                  className="w-full pl-10 pr-4 py-2 rounded-full text-sm text-[#F2F0EA] focus:outline-none"
                  style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif" }}
                />
              </div>
              <div className="flex items-center gap-2">
            {([
              { id: "todos",       label: "Todos",       count: projects.length },
              { id: "arquitetura", label: "Arquitetura", count: projects.filter((p) => p.category === "arquitetura").length },
              { id: "marcenaria",  label: "Marcenaria",  count: projects.filter((p) => p.category === "marcenaria").length },
            ] as { id: PhotoCategory | "todos"; label: string; count: number }[]).map((tab) => {
              const active = galleryFilter === tab.id;
              return (
                <button key={tab.id} onClick={() => setGalleryFilter(tab.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all duration-200"
                  style={{
                    background: active ? "rgba(181,159,120,0.12)" : "transparent",
                    border: `1px solid ${active ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.07)"}`,
                    color: active ? "#B59F78" : "#A7A39B",
                    fontWeight: active ? 500 : 400,
                  }}>
                  {tab.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{ background: active ? "rgba(181,159,120,0.2)" : "rgba(255,255,255,0.06)", color: active ? "#B59F78" : "#A7A39B" }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <GripVertical size={14} style={{ color: "#A7A39B" }} />
            <span className="text-[#A7A39B] text-xs hidden sm:block" style={{ fontWeight: 400 }}>
              {projectsLoading ? "Carregando projetos..." : "Ordene pelo campo Ordem"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!projectsLoading && filteredProjects.length === 0 && (
            <div
              className="sm:col-span-2 lg:col-span-3 py-12 text-center rounded-[16px] border"
              style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-[#A7A39B] text-sm" style={{ fontWeight: 400 }}>
                {projects.length === 0 ? "Nenhum projeto cadastrado." : "Nenhum projeto encontrado para os filtros atuais."}
              </p>
            </div>
          )}
          {filteredProjects.map((project, i) => {
              const isExpanded = expandedId === project.id;
              const catCfg = categoryConfig[project.category];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group rounded-[16px] overflow-hidden border transition-all duration-300 hover:border-[#B59F78]/20"
                  style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                >
                  {/* Main photo */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    {project.mainPhoto.preview ? (
                      <MediaPreview src={project.mainPhoto.preview} alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        style={{ background: project.mainPhoto.gradient }} />
                    )}

                    {/* Hover controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button onClick={() => toggleFeatured(project.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ background: "rgba(181,159,120,0.25)", backdropFilter: "blur(8px)" }} title="Alternar destaque">
                        <Star size={16} style={{ color: "#B59F78", fill: project.featured ? "#B59F78" : "none" }} />
                      </button>
                      <button onClick={() => openEdit(project)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }} title="Editar projeto">
                        <Pencil size={15} style={{ color: "#F2F0EA" }} />
                      </button>
                      <button onClick={() => setDeleteTarget(project)}
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ background: "rgba(248,113,113,0.25)", backdropFilter: "blur(8px)" }} title="Excluir projeto">
                        <Trash2 size={16} style={{ color: "#f87171" }} />
                      </button>
                    </div>

                    {/* Featured badge */}
                    {project.featured && (
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: "rgba(181,159,120,0.9)", backdropFilter: "blur(8px)" }}>
                        <Star size={10} style={{ color: "#050808", fill: "#050808" }} />
                        <span className="text-[10px] text-[#050808]" style={{ fontWeight: 600 }}>Destaque</span>
                      </div>
                    )}

                    {/* Order */}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(5,8,8,0.7)", backdropFilter: "blur(8px)" }}>
                      <span className="text-[#A7A39B] text-xs" style={{ fontWeight: 600 }}>{project.order}</span>
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full"
                      style={{ background: catCfg.bg, backdropFilter: "blur(8px)" }}>
                      <span className="text-[10px]" style={{ color: catCfg.color, fontWeight: 600 }}>{catCfg.label}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 pb-3">
                    <p className="text-[#F2F0EA] text-sm mb-1 truncate" style={{ fontWeight: 500 }}>{project.title}</p>
                    <p className="text-[#A7A39B] text-xs leading-relaxed line-clamp-2" style={{ fontWeight: 400 }}>{project.description}</p>
                  </div>

                  {/* Sub-photos strip + toggle */}
                  <div className="px-4 pb-4 space-y-3">
                    {/* Thumbnails row */}
                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((slot) => {
                        const sub = project.subPhotos[slot];
                        return (
                          <div key={slot}
                            className="rounded-[6px] overflow-hidden flex-1 border"
                            style={{ aspectRatio: "1/1", background: sub ? "transparent" : "rgba(255,255,255,0.03)", borderColor: sub ? "rgba(181,159,120,0.2)" : "rgba(255,255,255,0.05)" }}>
                            {sub?.preview ? (
                              <MediaPreview src={sub.preview} className="w-full h-full object-cover" />
                            ) : sub ? (
                              <div className="w-full h-full" style={{ background: sub.gradient }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "12px" }}>+</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : project.id)}
                        className="flex-shrink-0 ml-1 text-xs px-2.5 py-1.5 rounded-[8px] transition-all duration-200 whitespace-nowrap"
                        style={{
                          background: isExpanded ? "rgba(181,159,120,0.12)" : "rgba(255,255,255,0.04)",
                          color: isExpanded ? "#B59F78" : "#A7A39B",
                          border: `1px solid ${isExpanded ? "rgba(181,159,120,0.25)" : "rgba(255,255,255,0.06)"}`,
                          fontWeight: 500,
                        }}>
                        {project.subPhotos.length} midia{project.subPhotos.length !== 1 ? "s" : ""}
                      </button>
                    </div>

                    {/* Expanded sub-photos */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                            <p className="text-[#A7A39B] text-[10px] tracking-widest uppercase mb-2" style={{ fontWeight: 500 }}>
                              Submidias do projeto
                            </p>
                            {project.subPhotos.length > 0 ? (
                              <div className="grid grid-cols-2 gap-1.5">
                                {project.subPhotos.map((sub) => (
                                  <div key={sub.id} className="rounded-[8px] overflow-hidden" style={{ aspectRatio: "4/3" }}>
                                    {sub.preview ? (
                                      <MediaPreview src={sub.preview} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full" style={{ background: sub.gradient }} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[#A7A39B]/50 text-xs text-center py-3" style={{ fontWeight: 400 }}>
                                Nenhuma submidia adicionada
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>

    {/* ── Edit Modal ── */}
    <AnimatePresence>
      {editingProject && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditingProject(null)}
            className="fixed inset-0 z-50 bg-black/70"
            style={{ backdropFilter: "blur(8px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] border pointer-events-auto"
              style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-[#B59F78] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>EDITAR PROJETO</p>
                  <h2 className="text-[#F2F0EA] text-xl" style={{ fontWeight: 400 }}>{editingProject.title}</h2>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                  style={{ color: "#A7A39B" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Hidden inputs */}
              <input ref={editMainFileRef} type="file" accept={MEDIA_ACCEPT} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditMainFile(f); }} />
              <input ref={editSubFileRef} type="file" accept={MEDIA_ACCEPT} className="hidden"
                onChange={handleEditSubFileChange} />

              {/* Form */}
              <form onSubmit={handleEditSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* LEFT: fotos */}
                  <div className="space-y-3">
                    <p className="text-[#A7A39B] text-xs tracking-wide uppercase" style={{ fontWeight: 500 }}>Foto Principal</p>
                    <div
                      className="relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden"
                      style={{ minHeight: "180px", borderColor: editIsDragging ? "#B59F78" : "rgba(181,159,120,0.25)", background: editIsDragging ? "rgba(181,159,120,0.05)" : "rgba(255,255,255,0.02)" }}
                      onDragOver={(e) => { e.preventDefault(); setEditIsDragging(true); }}
                      onDragLeave={() => setEditIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setEditIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleEditMainFile(f); }}
                      onClick={() => editMainFileRef.current?.click()}
                    >
                      {editMainPreview ? (
                        <>
                          <MediaPreview src={editMainPreview} alt="Foto principal" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="flex flex-col items-center gap-2 text-white"><Upload size={20} /><span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span></div>
                          </div>
                        </>
                      ) : editMainGradient ? (
                        <>
                          <div className="absolute inset-0" style={{ background: editMainGradient }} />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <div className="flex flex-col items-center gap-2 text-white"><Upload size={20} /><span className="text-sm" style={{ fontWeight: 500 }}>Trocar</span></div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-3 p-6 text-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(181,159,120,0.1)" }}>
                            <Upload size={18} style={{ color: "#B59F78" }} />
                          </div>
                          <p className="text-[#F2F0EA] text-sm" style={{ fontWeight: 500 }}>Arraste ou clique</p>
                        </div>
                      )}
                    </div>

                    <p className="text-[#A7A39B] text-xs tracking-wide uppercase pt-1" style={{ fontWeight: 500 }}>
                      Submidias <span style={{ color: "rgba(167,163,155,0.5)", textTransform: "none", letterSpacing: 0 }}>(ate {MAX_SUB_MEDIA})</span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: MAX_SUB_MEDIA }, (_, slot) => {
                        const sub = editSubSlots[slot];
                        return (
                          <div key={slot} className="relative group">
                            <div
                              className="relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 border"
                              style={{ aspectRatio: "1/1", background: sub ? "transparent" : "rgba(255,255,255,0.03)", borderColor: sub ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)", borderStyle: sub ? "solid" : "dashed" }}
                              onClick={() => openEditSubSlot(slot)}
                            >
                              {sub?.preview ? (
                                <MediaPreview src={sub.preview} className="w-full h-full object-cover" />
                              ) : sub?.gradient ? (
                                <div className="w-full h-full" style={{ background: sub.gradient }} />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span style={{ color: "rgba(181,159,120,0.4)", fontSize: "20px", lineHeight: 1 }}>+</span>
                                </div>
                              )}
                            </div>
                            {sub && (
                              <button type="button" onClick={() => removeEditSubSlot(slot)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                                style={{ background: "#f87171", zIndex: 10 }}>
                                <X size={10} style={{ color: "#fff" }} />
                              </button>
                            )}
                            <span className="absolute bottom-1 left-1 text-[9px] px-1 rounded"
                              style={{ background: "rgba(0,0,0,0.55)", color: "#A7A39B", fontWeight: 500 }}>{slot + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: campos */}
                  <div className="space-y-4">
                    <div className="relative">
                      <input type="text" id="edit-title" value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder=" "
                        className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                        style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }}
                        required />
                      <label htmlFor="edit-title"
                        className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                        style={{ fontWeight: 400 }}>Título do projeto</label>
                    </div>

                    <div className="relative">
                      <textarea id="edit-desc" value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder=" " rows={3}
                        className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none resize-none peer transition-all duration-200"
                        style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                      <label htmlFor="edit-desc"
                        className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-5 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                        style={{ fontWeight: 400 }}>Descrição</label>
                    </div>

                    <div className="flex gap-3">
                      {(["arquitetura", "marcenaria"] as PhotoCategory[]).map((cat) => {
                        const active = editForm.category === cat;
                        const cfg = categoryConfig[cat];
                        return (
                          <button key={cat} type="button"
                            onClick={() => setEditForm({ ...editForm, category: cat })}
                            className="flex-1 py-3 rounded-[14px] text-sm transition-all duration-200"
                            style={{ background: active ? cfg.bg : "#0E1414", border: `1px solid ${active ? cfg.color + "55" : "rgba(255,255,255,0.06)"}`, color: active ? cfg.color : "#A7A39B", fontWeight: active ? 500 : 400 }}>
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <input type="number" id="edit-order" value={editForm.order} min={1}
                          onChange={(e) => setEditForm({ ...editForm, order: Number(e.target.value) })}
                          placeholder=" "
                          className="w-full pl-5 pr-5 pt-6 pb-3 rounded-[14px] text-[#F2F0EA] focus:outline-none peer transition-all duration-200"
                          style={{ background: "#0E1414", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "Manrope, sans-serif", fontSize: "15px" }} />
                        <label htmlFor="edit-order"
                          className="absolute left-5 top-[9px] text-[10px] tracking-[0.08em] text-[#B59F78] pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-placeholder-shown:text-[#A7A39B] peer-placeholder-shown:tracking-normal transition-all duration-300"
                          style={{ fontWeight: 400 }}>Ordem</label>
                      </div>
                      <button type="button"
                        onClick={() => setEditForm({ ...editForm, featured: !editForm.featured })}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-[14px] transition-all duration-300 flex-shrink-0"
                        style={{ background: editForm.featured ? "rgba(181,159,120,0.12)" : "#0E1414", border: `1px solid ${editForm.featured ? "rgba(181,159,120,0.3)" : "rgba(255,255,255,0.06)"}` }}>
                        <Star size={16} style={{ color: editForm.featured ? "#B59F78" : "#A7A39B", fill: editForm.featured ? "#B59F78" : "none" }} />
                        <span className="text-sm whitespace-nowrap" style={{ color: editForm.featured ? "#B59F78" : "#A7A39B", fontWeight: editForm.featured ? 500 : 400 }}>Destaque</span>
                      </button>
                    </div>

                    <motion.button type="submit"
                      whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
                      disabled={projectSaving}
                      className="w-full py-[14px] rounded-full flex items-center justify-center gap-2 transition-all duration-300 mt-2"
                      style={{ background: projectSaving ? "rgba(181,159,120,0.2)" : "#B59F78", color: projectSaving ? "#B59F78" : "#050808", fontWeight: 500, fontSize: "15px", letterSpacing: "0.03em", boxShadow: projectSaving ? "none" : "0 10px 30px rgba(181,159,120,0.2)", cursor: projectSaving ? "not-allowed" : "pointer" }}>
                      Salvar alterações
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* ── Delete confirmation ── */}
    <AnimatePresence>
      {deleteTarget && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 z-50 bg-black/70"
            style={{ backdropFilter: "blur(8px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-title"
              className="w-full max-w-md rounded-[24px] border p-8 pointer-events-auto"
              style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
            >
              <p className="text-[#f87171] text-[11px] tracking-[0.12em] uppercase mb-1" style={{ fontWeight: 500 }}>EXCLUIR PROJETO</p>
              <h2 id="delete-title" className="text-[#F2F0EA] text-xl mb-3" style={{ fontWeight: 400 }}>{deleteTarget.title}</h2>
              <p className="text-[#A7A39B] text-sm leading-relaxed mb-6" style={{ fontWeight: 400 }}>
                Esta ação remove o projeto e suas mídias do portfólio e não pode ser desfeita. Deseja continuar?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 rounded-full text-sm transition-all duration-200 hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#A7A39B", fontWeight: 500 }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => { const id = deleteTarget.id; setDeleteTarget(null); deleteProject(id); }}
                  className="flex-1 py-3 rounded-full text-sm transition-all duration-200"
                  style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", color: "#f87171", fontWeight: 600 }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
