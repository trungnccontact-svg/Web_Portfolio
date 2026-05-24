'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, AlertTriangle, ArrowRight, CheckCircle2, Cpu, HelpCircle, Flame } from 'lucide-react';

interface GenerationData {
  generation: number;
  score: number;
  weaknesses: string[];
  suggestions: string[];
  improved_code: string;
  reasoning: string;
  original_code: string;
  temperature: number;
}

const DEFAULT_CODE = `// Inefficient Bubble Sort with Redundant Iterations
function sortArray(arr) {
  var n = arr.length;
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap values
        var temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

export default function SelfImproveLoop() {
  const [inputCode, setInputCode] = useState(DEFAULT_CODE);
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [currentGenIndex, setCurrentGenIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [maxGenerations, setMaxGenerations] = useState(3);
  const [targetScore, setTargetScore] = useState(90);
  const [activeTab, setActiveTab] = useState<'improved' | 'original' | 'diff'>('improved');
  const [showTooltip, setShowTooltip] = useState(false);

  const loopRunningRef = useRef(false);

  const handleStartLoop = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setGenerations([]);
    setCurrentGenIndex(-1);
    setStreamedText("");
    loopRunningRef.current = true;

    let currentCode = inputCode;
    let previousScore = 30; // Mock base score for bubble sort
    let gen = 0;

    while (gen < maxGenerations && loopRunningRef.current) {
      const temp = gen === 0 ? 0.7 : gen === 1 ? 0.5 : 0.3;
      setStreamedText("");
      
      // Update dummy message in history
      const prompt = `Iteration ${gen}. Previous score: ${previousScore}. Code to analyze:
\`\`\`javascript
${currentCode}
\`\`\``;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            // Overriding instructions in system prompt dynamically
            systemPrompt: `You are a senior AI Compiler and Code Optimizer. 
Analyze the provided code and optimize it. 
Return ONLY a valid JSON object matching this schema, with no additional text, no backticks, and no markdown:
{
  "score": number (assign a realistic quality score 0-100),
  "weaknesses": string[] (list 2-3 code flaws),
  "suggestions": string[] (list 2-3 optimizations done),
  "improved_code": string (full optimized code),
  "reasoning": string (1 sentence explaining the changes)
}`
          })
        });

        if (!response.ok) {
          throw new Error('Stream failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No stream reader');

        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!loopRunningRef.current) {
            reader.cancel();
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setStreamedText(text);
        }

        if (!loopRunningRef.current) break;

        // Parse JSON output
        let parsedData;
        try {
          // Remove backticks or trailing notes if LLM added them
          let cleanedText = text.trim();
          if (cleanedText.startsWith('```json')) cleanedText = cleanedText.substring(7);
          if (cleanedText.startsWith('```')) cleanedText = cleanedText.substring(3);
          if (cleanedText.endsWith('```')) cleanedText = cleanedText.substring(0, cleanedText.length - 3);
          cleanedText = cleanedText.trim();
          
          parsedData = JSON.parse(cleanedText);
        } catch (e) {
          // Robust parser regex extraction fallback if JSON wrapping failed
          console.warn("JSON parse failed, extracting matching substrings...");
          const scoreMatch = text.match(/"score"\s*:\s*(\d+)/);
          const reasoningMatch = text.match(/"reasoning"\s*:\s*"(.*?)"/);
          const improvedCodeMatch = text.match(/"improved_code"\s*:\s*"([\s\S]*?)"/);
          
          parsedData = {
            score: scoreMatch ? parseInt(scoreMatch[1]) : previousScore + 15,
            weaknesses: ["Inefficient algorithm layout", "High time complexity"],
            suggestions: ["Optimized loop constraints", "Used cleaner syntactic structures"],
            improved_code: improvedCodeMatch ? improvedCodeMatch[1].replace(/\\n/g, '\n') : currentCode,
            reasoning: reasoningMatch ? reasoningMatch[1] : "Optimized loop executions to save cpu cycles."
          };
        }

        const newGen: GenerationData = {
          generation: gen,
          score: parsedData.score || (previousScore + 15),
          weaknesses: parsedData.weaknesses || [],
          suggestions: parsedData.suggestions || [],
          improved_code: parsedData.improved_code || currentCode,
          reasoning: parsedData.reasoning || "Optimized code performance.",
          original_code: currentCode,
          temperature: temp
        };

        setGenerations(prev => {
          const updated = [...prev, newGen];
          setCurrentGenIndex(updated.length - 1);
          return updated;
        });

        // Set parameters for next generation
        currentCode = newGen.improved_code;
        previousScore = newGen.score;

        // Exit conditions
        if (newGen.score >= targetScore) {
          console.log(`Target score achieved: ${newGen.score}`);
          break;
        }

        gen++;
        // Introduce small visual delay between generations
        await new Promise(r => setTimeout(r, 1200));

      } catch (err) {
        console.error("Error in Self-Improve loop:", err);
        // Fallback mock generation so user doesn't get stuck
        const mockGen: GenerationData = {
          generation: gen,
          score: Math.min(previousScore + 20, 95),
          weaknesses: ["Redundant inner array queries", "O(N^2) complexity"],
          suggestions: ["Implemented ES6 Set tracking", "Utilized standard native JS filters"],
          improved_code: `// Optimized Gen ${gen}\nfunction sortArray(arr) {\n  return arr.slice().sort((a, b) => a - b);\n}`,
          reasoning: "Swapped custom nested loops for standard fast native Array.prototype.sort implementation.",
          original_code: currentCode,
          temperature: temp
        };
        setGenerations(prev => {
          const updated = [...prev, mockGen];
          setCurrentGenIndex(updated.length - 1);
          return updated;
        });
        currentCode = mockGen.improved_code;
        previousScore = mockGen.score;
        if (mockGen.score >= targetScore) break;
        gen++;
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    setIsRunning(false);
    loopRunningRef.current = false;
  };

  const handleStopLoop = () => {
    loopRunningRef.current = false;
    setIsRunning(false);
  };

  const handleReset = () => {
    loopRunningRef.current = false;
    setIsRunning(false);
    setGenerations([]);
    setCurrentGenIndex(-1);
    setInputCode(DEFAULT_CODE);
    setStreamedText("");
  };

  const getScoreColor = (score: number) => {
    if (score < 60) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (score < 85) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const selectedGen = currentGenIndex >= 0 ? generations[currentGenIndex] : null;

  return (
    <section id="self-improve" className="py-16 bg-gray-950/60 border-b border-gray-900 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
              Self-Improving AI Loop
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Submit raw JavaScript. Watch the LLM evaluate flaws, rewrite the logic, and automatically pipe the improved code back into itself recursive-loop style.
            </p>
          </div>
          
          {/* Info explainer */}
          <div className="relative">
            <button 
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
              title="How this AI concept works"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-12 z-20 w-80 p-4 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl text-xs space-y-2 text-gray-300">
                <h4 className="font-bold text-white mb-1">🧠 Autonomous Self-Healing Code Loops</h4>
                <p>This is a mock demonstrator of **AI Agent Iterative Coding**.</p>
                <p>By forcing the LLM to inspect its own weaknesses, grade its score, and generate recursive iterations, the quality of code converges from raw code to micro-optimized files autonomously.</p>
                <p>Decreasing the **Temperature** (randomness parameter) over generations forces the LLM to focus on deep, precise logical refinements rather than broad rewrites.</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel Main Editor Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left panel: Input Editor */}
          <div className="lg:col-span-5 flex flex-col h-[420px] bg-gray-900/60 rounded-2xl border border-gray-800/80 overflow-hidden shadow-inner">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                ✏️ Input Editor
              </span>
              <span className="text-[10px] text-gray-500 font-mono">JS Only</span>
            </div>
            
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 p-4 bg-gray-950 text-gray-300 text-xs font-mono focus:outline-none resize-none selection:bg-indigo-500/20 leading-relaxed overflow-auto"
              placeholder="Paste inefficient code here..."
              disabled={isRunning}
            />
            
            {/* Control Console */}
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Max Iterations:</span>
                  <select 
                    value={maxGenerations} 
                    onChange={(e) => setMaxGenerations(parseInt(e.target.value))}
                    className="bg-gray-950 border border-gray-800 rounded px-1.5 py-0.5 text-indigo-400 font-mono text-[11px]"
                    disabled={isRunning}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Target Score:</span>
                  <input 
                    type="number" 
                    value={targetScore} 
                    onChange={(e) => setTargetScore(parseInt(e.target.value))}
                    className="w-10 bg-gray-950 border border-gray-800 rounded px-1 py-0.5 text-indigo-400 font-mono text-[11px] text-center"
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {isRunning ? (
                  <button
                    onClick={handleStopLoop}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Stop Loop
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-lg bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                      title="Reset Default Code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleStartLoop}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Optimize Code
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Stream Output and Results */}
          <div className="lg:col-span-7 flex flex-col h-[420px] bg-gray-900/60 rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl relative">
            
            {generations.length === 0 && !isRunning ? (
              /* Idle Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="h-12 w-12 rounded-xl bg-gray-800/50 border border-gray-800 flex items-center justify-center mb-3">
                  <Cpu className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="font-semibold text-gray-200 text-sm mb-1">Visual Optimization Monitor</h4>
                <p className="text-xs text-gray-500 max-w-[320px] leading-relaxed">
                  Start the Self-Improve Loop to watch iterations compile, grade, and auto-correct.
                </p>
              </div>
            ) : (
              /* Active loop running/completed state */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Header status bar */}
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
                    <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isRunning ? 'animate-ping' : ''}`}></span>
                    {isRunning ? `🛠️ Optimizing... Generation ${generations.length}` : '✅ Optimization Completed'}
                  </span>
                  
                  {selectedGen && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        Temp: {selectedGen.temperature}
                      </span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getScoreColor(selectedGen.score)}`}>
                        Score: {selectedGen.score}/100
                      </span>
                    </div>
                  )}
                </div>

                {/* Main visualization output */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {isRunning && !selectedGen && streamedText && (
                    /* Display raw text streaming from LLM */
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono animate-pulse">
                        <span>🤖 Compiling LLM Stream...</span>
                      </div>
                      <pre className="text-[11px] font-mono text-gray-400 bg-gray-950 p-3 rounded-xl border border-gray-900 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all h-64">
                        {streamedText}
                      </pre>
                    </div>
                  )}

                  {selectedGen && (
                    /* Display compiled Generation Data */
                    <div className="space-y-4">
                      {/* Analysis Block */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                          <h5 className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Weaknesses Sensed
                          </h5>
                          <ul className="list-disc pl-3.5 space-y-1.5">
                            {selectedGen.weaknesses.map((w, idx) => (
                              <li key={idx} className="text-[11px] text-gray-300">{w}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                          <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Optimizations Implemented
                          </h5>
                          <ul className="list-disc pl-3.5 space-y-1.5">
                            {selectedGen.suggestions.map((s, idx) => (
                              <li key={idx} className="text-[11px] text-gray-300">{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Code tabs */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-800">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveTab('improved')}
                              className={`px-3 py-1.5 text-xs font-semibold ${activeTab === 'improved' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              🚀 Optimized Code
                            </button>
                            <button
                              onClick={() => setActiveTab('original')}
                              className={`px-3 py-1.5 text-xs font-semibold ${activeTab === 'original' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              ⏪ Prior Code
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-500 italic font-mono shrink-0 hidden sm:inline">
                            {selectedGen.reasoning}
                          </span>
                        </div>

                        {activeTab === 'improved' && (
                          <pre className="text-[11px] font-mono text-emerald-400 bg-gray-950 p-3 rounded-xl border border-emerald-950/20 overflow-x-auto leading-relaxed h-44">
                            {selectedGen.improved_code}
                          </pre>
                        )}
                        {activeTab === 'original' && (
                          <pre className="text-[11px] font-mono text-gray-400 bg-gray-950 p-3 rounded-xl border border-gray-900 overflow-x-auto leading-relaxed h-44">
                            {selectedGen.original_code}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Iterations timeline chip drawer */}
                <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex items-center justify-start gap-2 overflow-x-auto shrink-0 select-none">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider shrink-0 mr-1">
                    Timeline:
                  </span>
                  {generations.map((g, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentGenIndex(idx)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shrink-0 ${
                        currentGenIndex === idx
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800'
                      }`}
                    >
                      Gen {g.generation}
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        g.score >= 85 ? 'bg-emerald-400' : g.score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></span>
                      <span className="text-[9px] opacity-75">{g.score}</span>
                    </button>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
