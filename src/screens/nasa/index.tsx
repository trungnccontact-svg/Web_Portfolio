/**
 * NasaScreen
 *
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │  [BG] Dark space: #02040a                       │
 * │  [BG] Blue nebula radial (top-right)            │
 * │  [BG] Purple nebula radial (bottom-left)        │
 * │  [BG] Star field dot pattern (full overlay)     │
 * │                                                 │
 * │  ┌───────────────────────────────────────────┐  │
 * │  │  NasaObservatory                          │  │
 * │  │  - Satellite orbit cockpit                │  │
 * │  │  - Multispectral imagery viewer           │  │
 * │  │  - Quadtree LOD tiling simulation         │  │
 * │  │  - Real NASA EPIC API data                │  │
 * │  └───────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────┘
 */
import { NasaObservatory } from "./NasaObservatory";

export default function NasaScreen() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#02040a] relative overflow-hidden flex flex-col justify-start text-foreground">
      {/* Immersive space starry and nebulae backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(88,28,135,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[repeat] bg-[size:100px_100px]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
        }}
      />

      <NasaObservatory />
    </div>
  );
}
