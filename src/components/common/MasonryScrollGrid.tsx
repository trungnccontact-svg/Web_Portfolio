"use client";

import Image from "next/image";

const IMAGES = [
  { src: "/images/masonry_01.png", alt: "Abstract nebula art" },
  { src: "/images/masonry_02.png", alt: "Cyberpunk cityscape" },
  { src: "/images/masonry_03.png", alt: "Bioluminescent ocean" },
  { src: "/images/masonry_04.png", alt: "Architectural light" },
  { src: "/images/masonry_05.png", alt: "Crystal structures" },
  { src: "/images/masonry_06.png", alt: "Data visualization" },
  { src: "/images/masonry_07.png", alt: "Futuristic portrait" },
];

// Each column gets a different subset, staggered for visual variety
const COL_1 = [IMAGES[0], IMAGES[2], IMAGES[4], IMAGES[6], IMAGES[1], IMAGES[3], IMAGES[5]];
const COL_2 = [IMAGES[3], IMAGES[5], IMAGES[1], IMAGES[0], IMAGES[6], IMAGES[2], IMAGES[4]];
const COL_3 = [IMAGES[6], IMAGES[1], IMAGES[3], IMAGES[5], IMAGES[0], IMAGES[4], IMAGES[2]];

interface ColumnProps {
  images: typeof IMAGES;
  direction: "up" | "down";
  duration: number;
  className?: string;
}

function InfiniteColumn({ images, direction, duration, className = "" }: ColumnProps) {
  // Double the images to create seamless loop
  const doubled = [...images, ...images];

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="flex flex-col gap-3"
        style={{
          animation: `${direction === "up" ? "scrollUp" : "scrollDown"} ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((img, i) => (
          // padding-bottom trick: creates real height for Next.js fill images
          <div
            key={i}
            className="group relative w-full overflow-hidden rounded-xl bg-white/5"
            style={{ paddingBottom: "125%" /* 4:5 ratio = 100/(4/5)*100 */ }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 33vw, 20vw"
              className="object-cover opacity-70 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MasonryScrollGrid() {
  return (
    <div className="absolute inset-0 flex gap-3 px-3 overflow-hidden" aria-hidden="true">
      {/* Column 1 — scroll up, slow */}
      <InfiniteColumn images={COL_1} direction="up" duration={60} className="flex-1" />
      {/* Column 2 — scroll down, medium */}
      <InfiniteColumn images={COL_2} direction="down" duration={75} className="flex-1 mt-[-8rem]" />
      {/* Column 3 — scroll up, faster */}
      <InfiniteColumn images={COL_3} direction="up" duration={50} className="flex-1 mt-[-4rem]" />
      {/* Column 4 — scroll down, slowest (optional 4th col on wide screens) */}
      <InfiniteColumn images={COL_1} direction="down" duration={85} className="hidden xl:flex flex-1 mt-[-12rem]" />
    </div>
  );
}
