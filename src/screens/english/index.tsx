/**
 * EnglishScreen
 *
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │  [BG] Emerald glow (top-left)               │
 * │  [BG] Cyan glow    (bottom-right)           │
 * │                                             │
 * │  ┌─────────────────────────────────────┐    │
 * │  │  EnglishLearning                    │    │
 * │  │  - Worksheet scanner (camera/file)  │    │
 * │  │  - Grammar & vocabulary analysis    │    │
 * │  │  - AI-powered explanations          │    │
 * │  └─────────────────────────────────────┘    │
 * └─────────────────────────────────────────────┘
 */
import { EnglishLearning } from "./EnglishLearning";

export default function EnglishScreen() {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Premium glowing background elements */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse opacity-40 -z-10" />
      <div className="absolute bottom-0 -right-1/4 w-[150%] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse opacity-40 -z-10" />

      <EnglishLearning />
    </div>
  );
}
