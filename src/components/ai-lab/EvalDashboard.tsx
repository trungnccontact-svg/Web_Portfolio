'use client';

import React, { useState } from 'react';
import { AreaChart, HelpCircle, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface EvalMetric {
  name: string;
  value: number; // 0 to 1
  label: string;
  description: string;
}

interface InteractionLog {
  query: string;
  responseSummary: string;
  faithfulness: number;
  relevance: number;
  coherence: number;
  latency: number;
  delta: number;
  timestamp: string;
}

const DEFAULT_METRICS: EvalMetric[] = [
  { name: "Faithfulness", value: 0.92, label: "0.92 / 1.0", description: "Evaluates context grounding. High score means all assertions are backed strictly by source documents, with zero model hallucinations." },
  { name: "Relevance", value: 0.88, label: "0.88 / 1.0", description: "Evaluates search query alignment. High relevance signifies that the answer directly answers the query without drifting into irrelevant text." },
  { name: "Coherence", value: 0.85, label: "0.85 / 1.0", description: "Evaluates syntax fluency and logic. Measures consistency in sentence length distribution and transitions using semantic heuristics." },
  { name: "Latency Score", value: 0.95, label: "95 / 100", description: "Evaluates model responsiveness. Measures time-to-first-token. Streaming pipelines score higher due to near-instant first-word prefill." },
  { name: "Optim. Delta", value: 0.78, label: "+78% Delta", description: "Measures quality delta in optimization loops. Calculates the score gap between the original raw input code and final self-improved code." }
];

const RECENT_INTERACTIONS: InteractionLog[] = [
  { query: "Explain LoRA fine-tuning parameters", responseSummary: "LoRA freezes weights, injects rank matrix (r=8) in attention to compress fine-tune cost.", faithfulness: 0.95, relevance: 0.92, coherence: 0.88, latency: 1240, delta: 0, timestamp: "17:01:22" },
  { query: "fibonacci optimization task", responseSummary: "Replaced O(2^N) recursion with O(N) iterative tabulation storing state locally.", faithfulness: 0.85, relevance: 0.88, coherence: 0.90, latency: 980, delta: 0.45, timestamp: "16:58:10" },
  { query: "Explain vector nearest neighbor index", responseSummary: "HNSW builds layered graphs representing index points as navigable nodes like skip-lists.", faithfulness: 0.90, relevance: 0.85, coherence: 0.82, latency: 1450, delta: 0, timestamp: "16:54:40" },
  { query: "sortArray bubble sort upgrade", responseSummary: "Synthesized standard fast sorting method bypassingcustom inefficient iteration loops.", faithfulness: 0.80, relevance: 0.95, coherence: 0.85, latency: 1100, delta: 0.78, timestamp: "16:50:15" }
];

export default function EvalDashboard() {
  const [metrics, setMetrics] = useState<EvalMetric[]>(DEFAULT_METRICS);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  // SVG Radar Coordinates calculator
  // Pentagon: 5 axes. Center at (100, 100), radius 70.
  const getRadarCoordinates = (valList: number[]) => {
    const center = 100;
    const maxRadius = 75;
    
    // Angles for 5-sided pentagon (in radians): 72 degrees each
    const angles = [-Math.PI / 2, -Math.PI / 2 + (2 * Math.PI) / 5, -Math.PI / 2 + (4 * Math.PI) / 5, -Math.PI / 2 + (6 * Math.PI) / 5, -Math.PI / 2 + (8 * Math.PI) / 5];
    
    const points = valList.map((val, idx) => {
      const radius = val * maxRadius;
      const x = center + radius * Math.cos(angles[idx]);
      const y = center + radius * Math.sin(angles[idx]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return points.join(' ');
  };

  const activePoints = getRadarCoordinates(metrics.map(m => m.value));
  const grid100Points = getRadarCoordinates([1, 1, 1, 1, 1]);
  const grid75Points = getRadarCoordinates([0.75, 0.75, 0.75, 0.75, 0.75]);
  const grid50Points = getRadarCoordinates([0.5, 0.5, 0.5, 0.5, 0.5]);
  const grid25Points = getRadarCoordinates([0.25, 0.25, 0.25, 0.25, 0.25]);

  return (
    <section id="eval-dashboard" className="py-16 bg-gray-950/40 border-b border-gray-900 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold flex items-center gap-2">
            <AreaChart className="w-6 h-6 text-indigo-400" />
            LLM / RAG Real-Time Evaluation Dashboard
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Inspect live heuristics evaluating the quality and speed of AI completions. production systems use these schemas to prevent semantic drift.
          </p>
        </div>

        {/* Evaluation Metrics Main Visual Board */}
        <div className="grid md:grid-cols-12 gap-6 items-center">
          
          {/* Left Side: Glowing SVG Radar Chart */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 shadow-inner relative h-[320px] select-none">
            <span className="absolute top-3 left-4 text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
              🕸️ Metric Vector Alignment
            </span>

            {/* Polygon Chart */}
            <svg viewBox="0 0 200 200" className="w-56 h-56 transform translate-y-2 drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              {/* Radar Grid Levels */}
              <polygon points={grid100Points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <polygon points={grid75Points} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3" />
              <polygon points={grid50Points} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <polygon points={grid25Points} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3" />
              
              {/* Pentagon Axes Rays */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
                const tx = 100 + 75 * Math.cos(angle);
                const ty = 100 + 75 * Math.sin(angle);
                return (
                  <line 
                    key={i} 
                    x1="100" 
                    y1="100" 
                    x2={tx.toFixed(1)} 
                    y2={ty.toFixed(1)} 
                    stroke="rgba(255,255,255,0.06)" 
                    strokeWidth="0.8" 
                  />
                );
              })}

              {/* Glowing Metric Score Area */}
              <polygon 
                points={activePoints} 
                fill="rgba(99, 102, 241, 0.25)" 
                stroke="rgba(129, 140, 248, 0.85)" 
                strokeWidth="1.8" 
              />

              {/* Data Vertex Indicator Rings */}
              {activePoints.split(' ').map((pt, idx) => {
                const coords = pt.split(',');
                return (
                  <circle 
                    key={idx} 
                    cx={coords[0]} 
                    cy={coords[1]} 
                    r="3" 
                    fill="#818cf8" 
                    stroke="#1e1b4b" 
                    strokeWidth="1" 
                    className="hover:scale-150 transition-transform cursor-pointer"
                  />
                );
              })}

              {/* Labels overlay */}
              {[
                { name: "Faith", x: 100, y: 15, align: "middle" as const },
                { name: "Relevance", x: 172, y: 76, align: "start" as const },
                { name: "Coherence", x: 146, y: 170, align: "start" as const },
                { name: "Latency", x: 54, y: 170, align: "end" as const },
                { name: "Delta", x: 28, y: 76, align: "end" as const }
              ].map((lbl, i) => (
                <text
                  key={i}
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor={lbl.align}
                  fill="rgba(255,255,255,0.45)"
                  className="font-mono font-bold text-[8.5px] select-none"
                >
                  {lbl.name}
                </text>
              ))}
            </svg>
          </div>

          {/* Right Side: Interactive Score Accordions */}
          <div className="md:col-span-7 bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 space-y-2.5 h-[320px] overflow-y-auto custom-scrollbar shadow-inner">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono block mb-2 px-1">
              📊 Core Framework Metrics
            </span>
            
            {metrics.map((metric, idx) => (
              <div 
                key={idx}
                className="bg-gray-950/40 rounded-xl border border-gray-900 overflow-hidden transition-all duration-300"
              >
                {/* Header Action Trigger */}
                <button
                  onClick={() => setActiveTooltip(activeTooltip === idx ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-indigo-950/60 text-indigo-400 flex items-center justify-center font-bold text-[10.5px]">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-200">{metric.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/20">
                      {metric.label}
                    </span>
                    {activeTooltip === idx ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </button>

                {/* Collapsible details content */}
                {activeTooltip === idx && (
                  <div className="px-4 pb-3 pt-1 border-t border-gray-900 text-[11px] text-gray-400 leading-relaxed font-sans bg-gray-950/80 animate-in slide-in-from-top-2 duration-200">
                    {metric.description}
                    <div className="mt-2 text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      Production Deployment Standard
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Interaction Logs Table */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex justify-between items-center font-mono">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              Evaluation History Log (Last 4 Queries)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10.5px]">
              <thead className="bg-gray-950/60 text-gray-400 border-b border-gray-850">
                <tr>
                  <th className="p-3">Query</th>
                  <th className="p-3">Completion Summary</th>
                  <th className="p-3 text-center">Faith.</th>
                  <th className="p-3 text-center">Relevance</th>
                  <th className="p-3 text-center">Coherence</th>
                  <th className="p-3 text-center">Latency</th>
                  <th className="p-3 text-center">Loop Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850/60 text-gray-300">
                {RECENT_INTERACTIONS.map((log, idx) => (
                  <tr key={idx} className="hover:bg-gray-900/20 transition-colors">
                    <td className="p-3 font-sans font-semibold text-gray-200 max-w-[140px] truncate" title={log.query}>
                      {log.query}
                    </td>
                    <td className="p-3 text-gray-400 font-sans max-w-[220px] truncate" title={log.responseSummary}>
                      {log.responseSummary}
                    </td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{log.faithfulness}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{log.relevance}</td>
                    <td className="p-3 text-center text-emerald-400 font-bold">{log.coherence}</td>
                    <td className="p-3 text-center text-indigo-400">{log.latency}ms</td>
                    <td className="p-3 text-center font-bold text-indigo-400">
                      {log.delta > 0 ? `+${(log.delta * 100).toFixed(0)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
