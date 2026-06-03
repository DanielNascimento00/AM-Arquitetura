import { useEffect, useState } from "react";
import { motion, useSpring } from "motion/react";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);

  const cursorX = useSpring(0, { damping: 30, stiffness: 200 });
  const cursorY = useSpring(0, { damping: 30, stiffness: 200 });

  useEffect(() => {
    // Detectar mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) {
      return () => window.removeEventListener('resize', checkMobile);
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);

      // Detectar se está sobre elemento interativo
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.style.cursor === 'pointer';

      setIsHoveringInteractive(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isMobile]);

  if (isMobile || !isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
        animate={{
          scale: isHoveringInteractive ? 1.15 : 1,
        }}
        style={{
          width: '220px',
          height: '220px',
          background: 'radial-gradient(circle, rgba(181, 159, 120, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: isHoveringInteractive ? 0.95 : 0.7,
          mixBlendMode: 'screen',
        }}
      />
    </motion.div>
  );
}
