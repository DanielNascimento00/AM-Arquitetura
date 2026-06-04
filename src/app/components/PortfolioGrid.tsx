import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import React from "react";
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

import alphaImg1 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.57.jpeg";
import alphaImg2 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.58.jpeg";
import alphaImg3 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.58__1_.jpeg";
import alphaImg4 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.58__2_.jpeg";
import alphaImg5 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.59__1_.jpeg";
import alphaImg6 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.59__2_.jpeg";
import alphaImg7 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.59__3_.jpeg";
import alphaImg8 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.59__4_.jpeg";
import alphaImg9 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.59__5_.jpeg";

import spImg1 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.27.jpeg";
import spImg2 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.27__2_.jpeg";
import spImg3 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.28.jpeg";
import spImg4 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.28__1_.jpeg";
import spImg5 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.28__2_.jpeg";
import spImg6 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.29.jpeg";
import spImg7 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.29__1_.jpeg";
import spImg8 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.29__2_.jpeg";
import spImg9 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.29__3_.jpeg";
import spImg10 from "@/imports/WhatsApp_Image_2026-05-25_at_16.31.30__4_.jpeg";

import aaImg1 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.48.jpeg";
import aaImg2 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.48__1_.jpeg";
import aaImg3 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.48__2_.jpeg";
import aaImg4 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.48__3_.jpeg";
import aaImg5 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.49.jpeg";
import aaImg6 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.49__1_.jpeg";
import aaImg7 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.49__2_.jpeg";
import aaImg8 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.49__3_.jpeg";
import aaImg9 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.49__4_.jpeg";
import aaImg10 from "@/imports/WhatsApp_Image_2026-05-25_at_16.30.50__1_.jpeg";

import arbiImg1 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.45.jpeg";
import arbiImg2 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.45__1_.jpeg";
import arbiImg3 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.45__2_.jpeg";
import arbiImg4 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.46.jpeg";
import arbiImg5 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.46__1_.jpeg";
import arbiImg6 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.46__2_.jpeg";
import arbiImg7 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.46__3_.jpeg";
import arbiImg8 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.46__4_.jpeg";
import arbiImg9 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.47__1_.jpeg";
import arbiImg10 from "@/imports/WhatsApp_Image_2026-05-25_at_16.28.47__2_.jpeg";

type ProjectCategory = "arquitetura" | "marcenaria";

interface Project {
  id: number;
  name: string;
  category: ProjectCategory;
  description: string;
  images: (string | typeof alphaImg1)[];
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

const defaultProjects: Project[] = [
  {
    id: 1,
    name: "Residencial Alphaville",
    category: "arquitetura",
    description: "Residência de alto padrão com cozinha integrada, jardim vertical e marcenaria autoral em madeira natural.",
    images: [alphaImg1, alphaImg2, alphaImg3, alphaImg4, alphaImg5, alphaImg6, alphaImg7, alphaImg8, alphaImg9],
  },
  {
    id: 2,
    name: "Residencial São Paulo",
    category: "arquitetura",
    description: "Apartamento sofisticado com marcenaria autoral, adega integrada e ambientes de alto padrão em São Paulo.",
    images: [spImg1, spImg2, spImg3, spImg4, spImg5, spImg6, spImg7, spImg8, spImg9, spImg10],
  },
  {
    id: 3,
    name: "Decorado Arthur Alvim",
    category: "arquitetura",
    description: "Apartamento decorado com design contemporâneo, marcenaria planejada e ambientes integrados de alto padrão.",
    images: [aaImg1, aaImg2, aaImg3, aaImg4, aaImg5, aaImg6, aaImg7, aaImg8, aaImg9, aaImg10],
  },
  {
    id: 9,
    name: "Studio ARBI - São Paulo",
    category: "arquitetura",
    description: "Studio compacto e sofisticado com soluções inteligentes de marcenaria e design contemporâneo em São Paulo.",
    images: [arbiImg1, arbiImg2, arbiImg3, arbiImg4, arbiImg5, arbiImg6, arbiImg7, arbiImg8, arbiImg9, arbiImg10],
  },
  {
    id: 4,
    name: "Living Premium",
    category: "arquitetura",
    description: "Espaço amplo com integração entre ambientes e materiais premium.",
    images: [
      "https://images.unsplash.com/photo-1628745277866-ff9305ac52cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxsdXh1cnklMjBtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzc2ODc3MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1760072513442-9872656c1b07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxsdXh1cnklMjBtb2Rlcm4lMjBsaXZpbmclMjByb29tJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzc2ODc3MTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1776482128172-dd265ad0cb49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxNHx8bHV4dXJ5JTIwbW9kZXJuJTIwbGl2aW5nJTIwcm9vbSUyMGludGVyaW9yJTIwZGVzaWdufGVufDF8fHx8MTc3Njg3NzE0N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  {
    id: 5,
    name: "Closet Atelier",
    category: "marcenaria",
    description: "Marcenaria sob medida com organização inteligente e acabamento premium.",
    images: [
      "https://images.unsplash.com/photo-1770573322210-204dea84450f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxjdXN0b20lMjB3b29kd29yayUyMGNhcnBlbnRyeSUyMGludGVyaW9yfGVufDF8fHx8MTc3Njg3NjIxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1770573318949-bd4f75d1f9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxjdXN0b20lMjB3b29kd29yayUyMGNhcnBlbnRyeSUyMGludGVyaW9yfGVufDF8fHx8MTc3Njg3NjIxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1682450195449-32ab08ddf7e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxjdXN0b20lMjB3b29kd29yayUyMGNhcnBlbnRyeSUyMGludGVyaW9yfGVufDF8fHx8MTc3Njg3NjIxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  {
    id: 6,
    name: "Painel Vértice",
    category: "marcenaria",
    description: "Composição autoral com painel ripado e nichos integrados.",
    images: [
      "https://images.unsplash.com/photo-1757344454271-bad02eff9fda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3IlMjBsdXh1cnklMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc3Njg3NzE0OHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1757344454333-cc666252e596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3IlMjBsdXh1cnklMjBtaW5pbWFsaXN0fGVufDF8fHx8MTc3Njg3NzE0OHww&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  {
    id: 7,
    name: "Gourmet Linea",
    category: "marcenaria",
    description: "Marcenaria para cozinha com ilha central e design limpo.",
    images: [
      "https://images.unsplash.com/photo-1638541363822-6f4c189b5cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MXx8fHwxNzc2ODc2MjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1639173925921-5d5fd027713c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MXx8fHwxNzc2ODc2MjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1639405069836-f82aa6dcb900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxtb2Rlcm4lMjBraXRjaGVuJTIwaW50ZXJpb3IlMjBsdXh1cnl8ZW58MXx8fHwxNzc2ODc2MjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  {
    id: 8,
    name: "Home Office Premium",
    category: "marcenaria",
    description: "Marcenaria funcional com estantes integradas e painel de madeira natural.",
    images: [
      "https://images.unsplash.com/photo-1634253539560-692feb6aeebb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxMHx8Y3VzdG9tJTIwd29vZHdvcmslMjBjYXJwZW50cnklMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzY4NzYyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1765862835282-cd3d9190d246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxMnx8bW9kZXJuJTIwYmVkcm9vbSUyMGludGVyaW9yJTIwbHV4dXJ5JTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3NzY4NzcxNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
];

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
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
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
          setProjects([...defaultProjects, ...apiProjects]);
          setCurrentIndex(0);
          setMobileIndex(0);
        }
      } catch {
        if (active) setProjects(defaultProjects);
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
