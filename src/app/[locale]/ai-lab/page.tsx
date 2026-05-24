'use client';

import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import HeroBanner from '@/components/ai-lab/HeroBanner';
import SelfImproveLoop from '@/components/ai-lab/SelfImproveLoop';
import RAGChat from '@/components/ai-lab/RAGChat';
import AgentTaskBoard from '@/components/ai-lab/AgentTaskBoard';
import EvalDashboard from '@/components/ai-lab/EvalDashboard';
import ArchitectureDiagram from '@/components/ai-lab/ArchitectureDiagram';

export default function AILabPage() {
  const pathname = usePathname();
  const localePrefix = pathname.split('/')[1] || 'en';

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/20">
      {/* Dynamic Sub-header Navigation Back to Home */}
      <div className="bg-gray-950 border-b border-gray-900 sticky top-20 z-30 px-6 py-3 shadow-sm select-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href={`/${localePrefix}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Portfolio
          </Link>
          <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/20">
            Interactive AI Lab Route
          </span>
        </div>
      </div>

      {/* Render 6 Major Sections */}
      <div className="divide-y divide-gray-900">
        {/* Section 1: Hero Banner */}
        <HeroBanner onScrollToSection={handleScrollToSection} />

        {/* Section 6: Interactive Architecture Diagram (Moved to top of content as a navigation dashboard or kept at bottom) */}
        {/* Wait, the prompt lists Section 6 as Architecture Diagram, but having it here makes it a wonderful interactive anchor maps board! Let's place it at the bottom, or render it logically. Let's keep the chronological order. */}
        
        {/* Section 2: Self-Improving AI Loop */}
        <SelfImproveLoop />

        {/* Section 3: RAG Chat Demo */}
        <RAGChat />

        {/* Section 4: AI Agent Task Board */}
        <AgentTaskBoard />

        {/* Section 5: LLM / RAG Evaluation Dashboard */}
        <EvalDashboard />

        {/* Section 6: System Architecture Diagram */}
        <ArchitectureDiagram onScrollToSection={handleScrollToSection} />
      </div>
    </div>
  );
}
