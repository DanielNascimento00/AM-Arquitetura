import { useState } from "react";
import { motion } from "motion/react";
import imageAfter from "figma:asset/a01f676131d80bd2e6ecfa7344e0968c8da1b8a6.png";
import imageBefore from "figma:asset/bb8f4df7fe30c3682c65b1a1f490b8f65ab26582.png";

export function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-[#F5F5F7] px-6 md:px-20">
      <div className="max-w-[1440px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#0A0A0A' }}>
            A Arte da Renovação
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Da obra bruta ao projeto finalizado - Transformação completa com design contemporâneo
          </p>
        </motion.div>

        {/* Before/After Slider Container (.slider-deck) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full max-w-6xl mx-auto"
        >
          <div
            className="slider-deck relative w-full h-[400px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-[40px] shadow-2xl cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleTouchMove}
          >
            {/* Image After - Base Layer (Modern Finished House) */}
            <img
              src={imageAfter}
              alt="Depois - Casa moderna finalizada com acabamento contemporâneo"
              className="image-after absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 1 }}
              draggable={false}
            />

            {/* Image Before - Overlay Layer (Construction Phase) with Dynamic Width Mask */}
            <div
              className="image-before absolute inset-0 overflow-hidden"
              style={{
                zIndex: 2,
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <img
                src={imageBefore}
                alt="Antes - Casa em fase de construção com estrutura aparente"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Drag Handle - Top Layer */}
            <div
              className="drag-handle absolute top-0 bottom-0 w-1 bg-white shadow-2xl transition-all duration-100"
              style={{
                zIndex: 3,
                left: `${sliderPosition}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Handle Circle with Arrows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-[#D4AF37] cursor-grab active:cursor-grabbing">
                <div className="flex gap-2 items-center">
                  {/* Left Arrow */}
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 1L2 7L9 13" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  
                  <div className="w-0.5 h-5 bg-[#0A0A0A] rounded-full" />
                  
                  {/* Right Arrow */}
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L8 7L1 13" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Labels ANTES and DEPOIS */}
            <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 pointer-events-none" style={{ zIndex: 4 }}>
              <span className="text-white text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
                ANTES
              </span>
            </div>
            <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-[#D4AF37]/40 pointer-events-none" style={{ zIndex: 4 }}>
              <span className="text-[#0A0A0A] text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.1em' }}>
                DEPOIS
              </span>
            </div>
          </div>

          {/* Description Below Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {/* Before Description */}
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[24px] border border-gray-200">
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#0A0A0A' }}>
                Antes da Transformação
              </h3>
              <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Estrutura em fase de construção com tijolos aparentes, concreto bruto e acabamento inicial. Um projeto em estado bruto aguardando a visão arquitetônica para se tornar realidade.
              </p>
            </div>

            {/* After Description */}
            <div className="bg-[#0A0A0A] p-8 rounded-[24px] border border-[#D4AF37]/30">
              <h3 className="text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#F5F5F7' }}>
                Depois da Transformação
              </h3>
              <p className="text-gray-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Residência moderna de alto padrão com fachada em tons grafite e branco, design minimalista contemporâneo, acabamentos premium, paisagismo planejado e arquitetura que valoriza cada detalhe.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}