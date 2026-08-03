/**
 * AIJobAgentScreen
 *
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │  [BG] Animated gradient glow (top-left)     │
 * │                                             │
 * │  ┌─────────────────────────────────────┐    │
 * │  │  AIJobAgent                         │    │
 * │  │  - CV upload & AI analysis          │    │
 * │  │  - Job matching & scoring           │    │
 * │  │  - Skill gap recommendations        │    │
 * │  └─────────────────────────────────────┘    │
 * └─────────────────────────────────────────────┘
 */
import { AIJobAgent } from "./AIJobAgent";

export default function AIJobAgentScreen() {
  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
      {/* Subtle animated background gradient */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse opacity-50 -z-10" />

      <AIJobAgent />
    </div>
  );
}
