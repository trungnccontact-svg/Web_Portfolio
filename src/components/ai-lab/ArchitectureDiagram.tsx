'use client';

import React from 'react';
import { Network, Database, Sparkles, Terminal, Activity, HelpCircle } from 'lucide-react';

interface ArchitectureDiagramProps {
  onScrollToSection: (sectionId: string) => void;
}

export default function ArchitectureDiagram({ onScrollToSection }: ArchitectureDiagramProps) {
  return (
    <section id="architecture" className="py-16 bg-gray-950 px-6 select-none">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold flex items-center justify-center gap-2">
            <Network className="w-6 h-6 text-indigo-400" />
            Interactive System Architecture
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Click on any node to jump directly to its live sandbox module. Watch the animated dashed lines represent the flow of semantic variables.
          </p>
        </div>

        {/* Interactive SVG Diagram Board */}
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-x-auto min-h-[460px]">
          
          {/* Injecting Localized CSS styles for moving dash arrows */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes flowDash {
              to {
                stroke-dashoffset: -20;
              }
            }
            .flow-arrow-line {
              stroke-dasharray: 6, 4;
              animation: flowDash 0.8s linear infinite;
            }
            .node-group:hover rect {
              stroke: #818cf8 !important;
              fill: #1e1b4b !important;
              filter: drop-shadow(0 0 8px rgba(99,102,241,0.25));
            }
            .node-group:hover text {
              fill: #ffffff !important;
            }
            .node-group {
              cursor: pointer;
              transition: all 0.3s ease;
            }
          `}} />

          {/* SVG Diagram Canvas */}
          <svg viewBox="0 0 640 420" className="w-full max-w-[620px] h-auto shrink-0 select-none">
            {/* Defs for arrow markers */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Moving Flow Lines */}
            {/* User Input -> Prompt Eng */}
            <path d="M 320,50 L 320,100" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />
            {/* Prompt Eng -> RAG Retriever */}
            <path d="M 300,120 L 140,165" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />
            {/* RAG Retriever -> Vector Store */}
            <path d="M 140,195 L 140,240" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />
            {/* Vector Store -> LLM (OpenRouter) */}
            <path d="M 140,270 L 300,315" fill="none" stroke="#10b981" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow-green)" />
            
            {/* Prompt Eng -> Agent Planner */}
            <path d="M 340,120 L 500,165" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />
            {/* Agent Planner -> Tool Executor */}
            <path d="M 500,195 L 500,240" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />
            {/* Tool Executor -> LLM (OpenRouter) */}
            <path d="M 500,270 L 340,315" fill="none" stroke="#10b981" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow-green)" />
            
            {/* LLM (OpenRouter) -> Self-Improve */}
            <path d="M 320,340 L 320,380" fill="none" stroke="#4f46e5" strokeWidth="1.5" className="flow-arrow-line" markerEnd="url(#arrow)" />

            {/* NODES STRUCTURE */}
            {/* Node 1: User Input (Start) */}
            <g className="node-group" onClick={() => onScrollToSection('self-improve')}>
              <rect x="240" y="10" width="160" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="320" y="34" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="bold" fontFamily="monospace">
                💬 USER INPUT QUERY
              </text>
            </g>

            {/* Node 2: Prompt Layer */}
            <g className="node-group" onClick={() => onScrollToSection('self-improve')}>
              <rect x="230" y="90" width="180" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="320" y="114" textAnchor="middle" fill="#818cf8" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                📋 PROMPT ENGINEERING
              </text>
            </g>

            {/* Node 3: RAG Retriever */}
            <g className="node-group" onClick={() => onScrollToSection('rag-chat')}>
              <rect x="50" y="155" width="180" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="140" y="179" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                🔍 RAG RETRIEVER (BM25)
              </text>
            </g>

            {/* Node 4: Vector Store */}
            <g className="node-group" onClick={() => onScrollToSection('rag-chat')}>
              <rect x="50" y="230" width="180" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="140" y="250" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                🗄️ VECTOR STORE
              </text>
              <text x="140" y="262" textAnchor="middle" fill="#6b7280" fontSize="7.5" fontFamily="monospace">
                Stack: Redis / TiDB Chunks
              </text>
            </g>

            {/* Node 5: Agent Planner */}
            <g className="node-group" onClick={() => onScrollToSection('agent-board')}>
              <rect x="410" y="155" width="180" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="500" y="179" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold" fontFamily="monospace">
                🤖 AGENT PLANNER (ReAct)
              </text>
            </g>

            {/* Node 6: Tool Executor */}
            <g className="node-group" onClick={() => onScrollToSection('agent-board')}>
              <rect x="410" y="230" width="180" height="40" rx="8" fill="#030712" stroke="#374151" strokeWidth="1.5" />
              <text x="500" y="250" textAnchor="middle" fill="#a5b4fc" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                🔧 TOOL EXECUTOR
              </text>
              <text x="500" y="262" textAnchor="middle" fill="#6b7280" fontSize="7.5" fontFamily="monospace">
                Stack: WebSearch / LocalStorage
              </text>
            </g>

            {/* Node 7: LLM OpenRouter */}
            <g className="node-group" onClick={() => onScrollToSection('self-improve')}>
              <rect x="230" y="305" width="180" height="40" rx="8" fill="#030712" stroke="#4f46e5" strokeWidth="1.8" />
              <text x="320" y="325" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold" fontFamily="monospace">
                🚀 LLM ENGINE (OpenRouter)
              </text>
              <text x="320" y="337" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold" fontFamily="monospace">
                Active: Free Fallback Pool
              </text>
            </g>

            {/* Node 8: Self-Improve Loop */}
            <g className="node-group" onClick={() => onScrollToSection('self-improve')}>
              <rect x="220" y="375" width="200" height="40" rx="8" fill="#030712" stroke="#10b981" strokeWidth="1.8" />
              <text x="320" y="394" textAnchor="middle" fill="#34d399" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
                🔄 SELF-IMPROVE LOOP (Recursive)
              </text>
            </g>
          </svg>

          {/* Legend badge info */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-[10.5px] font-mono border-t border-gray-800 pt-4 w-full text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded"></span> Primary Flow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Optimized Data Payload
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 border border-indigo-500 rounded"></span> Clickable Sandboxes
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
