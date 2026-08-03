"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let raf: number;
    let mouseX = -999;
    let mouseY = -999;
    let currentX = -999;
    let currentY = -999;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const update = () => {
      currentX = lerp(currentX, mouseX, 0.08);
      currentY = lerp(currentY, mouseY, 0.08);
      glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="cursor-glow pointer-events-none fixed left-0 top-0 z-[9998] h-[400px] w-[400px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
      style={{
        background:
          "radial-gradient(circle at center, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
      }}
    />
  );
}
