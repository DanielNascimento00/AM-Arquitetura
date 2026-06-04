import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import React from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";


type ProjectCategory = "arquitetura" | "marcenaria";

interface Project {
  id: number;
  name: string;
  category: ProjectCategory;
  description: string;
  images: string[];
}

interface ApiProject {
  id: number;
  title: string;
  category: ProjectCategory;
  description: string;
  order: number;
  mainPhoto: { url?: string; preview?: string | null };
  subPhotos: { url?: string; preview?: string | null }[];
}

function FullscreenModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const isImported = !src.startsWith("http");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 z-10"
      >
        <X className="w-5 h-5 text-[#F2F0EA]" />
      </button>
      <div className="w-full h-full p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {isImported ? (
          <ImageWithFallback src={src} alt={alt} className="max-w-full max-h-full object-contain" />
        ) : (
          <img src={src} alt={alt} className="max-w-full max-h-full object-contain" />
        )}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, onClick, onExpand, className = "", style }: { project: Project; onClick: () => void; onExpand: (src: string) => void; className?: string; style?: React.CSSProperties }) {
  const [isHovered, setIsHovered] = useState(false);
  const firstImage = project.images[0];
  const isImported = typeof firstImage !== "string";

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[16px] cursor-pointer bg-[#0C1111] ${className}`}
      style={style}
    >
      {isImported ? (
        <ImageWithFallback
          src={firstImage as string}
          alt={project.name}
          className="w-full h-full object-cover transition-all duration-500 ease-out"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
      ) : (
        <img
          src={firstImage as string}
          alt={project.name}
          className="w-full h-full object-cover transition-all duration-500 ease-out"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
      )}

      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: isHovered
            ? "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.5), rgba(0,0,0,0.3))"
            : "linear-gradient(to top, rgba(0,0,0,0.70), rgba(0,0,0,0.20), transparent)",
        }}
      />

      <div className="absolute top-4 left-4">
        <span
          className="inline-block px-3 py-1 text-[11px] tracking-[0.15em] uppercase bg-black/40 backdrop-blur-sm text-[#F2F0EA] rounded-full border border-white/10"
          style={{ fontWeight: 500 }}
        >
          {project.category === "arquitetura" ? "ARQUITETURA" : "MARCENARIA"}
        </span>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-end p-8"
          >
            <div>
              <div className="text-[#F2F0EA] mb-3" style={{ fontSize: "28px", fontWeight: 500, lineHeight: 1.2 }}>
                {project.name}
              </div>
              <div className="text-[#A7A39B] text-[15px] leading-relaxed border-t border-white/10 pt-3">
                {project.description}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isHovered && (
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-[#F2F0EA]" style={{ fontSize: "24px", fontWeight: 500, lineHeight: 1.3 }}>
            {project.name}
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at bottom, rgba(181, 159, 120, 0.15) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Expand button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onExpand(firstImage as string);
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-[#B59F78] backdrop-blur-sm flex items-center justify-center transition-colors duration-300 border border-white/10 hover:border-[#B59F78]"
        aria-label="Ampliar imagem"
      >
        <Maximize2 className="w-4 h-4 text-[#F2F0EA]" />
      </motion.button>
    </motion.div>
  );
}

function LightboxModal({ project, onClose, onExpand }: { project: Project; onClose: () => void; onExpand: (src: string) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);

  const currentImg = project.images[currentImageIndex];
  const isImported = typeof currentImg !== "string";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 flex-shrink-0 z-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-[#F2F0EA] text-base md:text-xl" style={{ fontWeight: 500 }}>
            {project.name}
          </h3>
          <p className="text-[#A7A39B] text-xs md:text-sm hidden md:block">{project.description}</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
        >
          <X className="w-5 h-5 text-[#F2F0EA]" />
        </button>
      </div>

      {/* Main image — fills all available space */}
      <div className="relative flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full h-full"
        >
          {isImported ? (
            <ImageWithFallback
              src={currentImg as string}
              alt={`${project.name} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover md:object-contain"
            />
          ) : (
            <img
              src={currentImg as string}
              alt={`${project.name} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover md:object-contain"
            />
          )}
        </motion.div>

        {/* Prev / Next arrows */}
        {project.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 text-[#F2F0EA]" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 text-[#F2F0EA]" />
            </button>
          </>
        )}

        {/* Expand button — bottom right */}
        <button
          onClick={() => onExpand(currentImg as string)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-[#B59F78] backdrop-blur-sm flex items-center justify-center transition-colors duration-300 border border-white/15 hover:border-[#B59F78]"
          aria-label="Ver imagem em tamanho real"
        >
          <Maximize2 className="w-4 h-4 text-[#F2F0EA]" />
        </button>
      </div>

      {/* Thumbnails strip */}
      {project.images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 py-3 flex-shrink-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {project.images.map((img, idx) => {
            const isThumb = typeof img !== "string";
            return (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  idx === currentImageIndex ? "border-[#B59F78]" : "border-white/10 hover:border-white/30"
                }`}
                style={{ width: "72px", height: "52px" }}
              >
                {isThumb ? (
                  <ImageWithFallback src={img as string} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <img src={img as string} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function MobileProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const firstImage = project.images[0];
  const isImported = typeof firstImage !== "string";

  return (
    <div
      onClick={onClick}
      className="relative w-full h-full overflow-hidden rounded-[16px] cursor-pointer bg-[#0C1111]"
    >
      {isImported ? (
        <ImageWithFallback
          src={firstImage as string}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <img src={firstImage as string} alt={project.name} className="w-full h-full object-cover" />
      )}

      {/* Gradiente fixo */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15), transparent)" }}
      />

      {/* Badge categoria */}
      <div className="absolute top-4 left-4">
        <span
          className="inline-block px-3 py-1 text-[11px] tracking-[0.15em] uppercase bg-black/40 backdrop-blur-sm text-[#F2F0EA] rounded-full border border-white/10"
          style={{ fontWeight: 500 }}
        >
          {project.category === "arquitetura" ? "ARQUITETURA" : "MARCENARIA"}
        </span>
      </div>

      {/* Nome sempre visível */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-[#F2F0EA] mb-1" style={{ fontSize: "22px", fontWeight: 500, lineHeight: 1.3 }}>
          {project.name}
        </div>
        <div className="text-[#A7A39B] text-sm">{project.description}</div>
      </div>
    </div>
  );
}

function normalizeProject(project: ApiProject): Project | null {
  const images = [
    project.mainPhoto.url ?? project.mainPhoto.preview,
    ...project.subPhotos.map((photo) => photo.url ?? photo.preview),
  ].filter((image): image is string => Boolean(image));

  if (images.length === 0) return null;

  return {
    id: project.id,
    name: project.title,
    category: project.category,
    description: project.description,
    images,
  };
}

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("arquitetura");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("projects_load_failed");
        const result = await response.json() as { data?: ApiProject[] };
        const apiProjects = Array.isArray(result.data)
          ? result.data.map(normalizeProject).filter((project): project is Project => project !== null)
          : [];

        if (active) {
          setProjects(apiProjects);
          setCurrentIndex(0);
          setMobileIndex(0);
        }
      } catch {
        if (active) setProjects([]);
      }
    }

    loadProjects();
    return () => { active = false; };
  }, []);

  const filteredProjects = projects.filter((p) => p.category === activeCategory);
  const visibleCards = 3;

  const nextSlide = () => {
    if (currentIndex < filteredProjects.length - visibleCards) setCurrentIndex(currentIndex + 1);
  };
  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  const nextMobile = () => {
    if (mobileIndex < filteredProjects.length - 1) setMobileIndex(mobileIndex + 1);
  };
  const prevMobile = () => {
    if (mobileIndex > 0) setMobileIndex(mobileIndex - 1);
  };

  return (
    <>
      <section id="portfolio" className="py-28 md:py-36 bg-[#050808] px-6 md:px-16 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <h2
              className="text-[48px] md:text-[72px] text-[#F2F0EA] mb-12"
              style={{ fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em" }}
            >
              Nossos Projetos
            </h2>

            <div className="inline-flex items-center gap-4 bg-[#0C1111] p-2 rounded-full border border-white/5">
              <button
                onClick={() => { setActiveCategory("arquitetura"); setCurrentIndex(0); setMobileIndex(0); }}
                className={`px-8 py-3 rounded-full text-[13px] tracking-[0.08em] uppercase transition-all duration-300 ${
                  activeCategory === "arquitetura"
                    ? "bg-[#B59F78] text-[#050808] shadow-lg"
                    : "bg-transparent text-[#A7A39B] hover:text-[#F2F0EA]"
                }`}
                style={{ fontWeight: 500 }}
              >
                Arquitetura
              </button>
              <button
                onClick={() => { setActiveCategory("marcenaria"); setCurrentIndex(0); setMobileIndex(0); }}
                className={`px-8 py-3 rounded-full text-[13px] tracking-[0.08em] uppercase transition-all duration-300 ${
                  activeCategory === "marcenaria"
                    ? "bg-[#B59F78] text-[#050808] shadow-lg"
                    : "bg-transparent text-[#A7A39B] hover:text-[#F2F0EA]"
                }`}
                style={{ fontWeight: 500 }}
              >
                Marcenaria
              </button>
            </div>
          </motion.div>

          {/* Mobile: carrossel com botões e indicadores */}
          {filteredProjects.length === 0 && (
            <div
              className="py-16 text-center rounded-[16px] border"
              style={{ background: "#0C1111", borderColor: "rgba(255,255,255,0.05)" }}
            >
              <p className="text-[#A7A39B] text-sm" style={{ fontWeight: 400 }}>
                Nenhum projeto cadastrado nesta categoria.
              </p>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <>
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-hidden rounded-[16px]" style={{ height: "420px" }}>
                <motion.div
                  className="flex h-full"
                  animate={{ x: `-${mobileIndex * 100}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="w-full h-full flex-shrink-0">
                      <MobileProjectCard
                        project={project}
                        onClick={() => setSelectedProject(project)}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Botão Voltar */}
              {mobileIndex > 0 && (
                <button
                  onClick={prevMobile}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 text-[#F2F0EA]" />
                </button>
              )}

              {/* Botão Avançar */}
              {mobileIndex < filteredProjects.length - 1 && (
                <button
                  onClick={nextMobile}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5 text-[#F2F0EA]" />
                </button>
              )}
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-5">
              {filteredProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === mobileIndex ? "w-8 bg-[#B59F78]" : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: carrossel animado */}
          <div className="hidden md:block relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{ x: `-${currentIndex * (450 + 24)}px` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => setSelectedProject(project)}
                    onExpand={(src) => setFullscreenSrc(src)}
                    className="flex-shrink-0"
                    style={{ width: "450px", height: "600px" } as React.CSSProperties}
                  />
                ))}
              </motion.div>
            </div>

            {currentIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 rounded-full bg-[#0C1111] hover:bg-[#B59F78] border border-white/10 hover:border-[#B59F78] flex items-center justify-center transition-all duration-300 shadow-xl"
              >
                <ChevronLeft className="w-6 h-6 text-[#F2F0EA]" />
              </button>
            )}

            {currentIndex < filteredProjects.length - visibleCards && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 rounded-full bg-[#0C1111] hover:bg-[#B59F78] border border-white/10 hover:border-[#B59F78] flex items-center justify-center transition-all duration-300 shadow-xl"
              >
                <ChevronRight className="w-6 h-6 text-[#F2F0EA]" />
              </button>
            )}

            <div className="flex justify-center gap-2 mt-12">
              {filteredProjects.slice(0, filteredProjects.length - visibleCards + 1).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-12 bg-[#B59F78]" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
            </>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedProject && (
          <LightboxModal project={selectedProject} onClose={() => setSelectedProject(null)} onExpand={(src) => setFullscreenSrc(src)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreenSrc && (
          <FullscreenModal src={fullscreenSrc} alt="Imagem ampliada" onClose={() => setFullscreenSrc(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
