'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Cpu, HelpCircle, ShieldAlert, CheckCircle, Database, Search, Terminal } from 'lucide-react';

interface AgentStep {
  type: 'thought' | 'action' | 'observation' | 'final';
  content: string;
  toolName?: string;
  toolArgs?: string;
  timestamp: string;
}

const SAMPLE_TASKS = [
  "Research LoRA fine-tuning and write a summary",
  "Write an efficient fibonacci function, test it, and save the code to memory",
  "Verify what vector indices are, and recall the stored fibonacci code to compare"
];

export default function AgentTaskBoard() {
  const [task, setTask] = useState("Research LoRA fine-tuning and write a summary");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps, currentThought]);

  const executeMockTool = (toolName: string, args: string): string => {
    const cleanedArgs = args.replace(/^['"]|['"]$/g, '').trim();

    switch (toolName) {
      case 'web_search':
        if (cleanedArgs.toLowerCase().includes('lora')) {
          return JSON.stringify({
            title: "LoRA: Low-Rank Adaptation of Large Language Models",
            snippet: "LoRA freezes pre-trained LLM weights and injects trainable rank decomposition matrices, reducing GPU memory parameters by 99% during training."
          });
        }
        if (cleanedArgs.toLowerCase().includes('vector') || cleanedArgs.toLowerCase().includes('index')) {
          return JSON.stringify({
            title: "Vector Indices in Modern Embeddings Stores",
            snippet: "ANN structures like HNSW graphs, IVF, and PQ allow sub-millisecond approximate nearest neighbor searches across floating-point coordinates."
          });
        }
        return JSON.stringify({
          title: `FakeSearch: ${cleanedArgs}`,
          snippet: `Mock results summarizing search insights regarding: ${cleanedArgs}. Production systems utilize standard DuckDuckGo/Google search API bridges.`
        });

      case 'code_run':
        return `Code Execution SUCCESS. Output: Completed successfully. Mock result generated for evaluation.`;

      case 'memory_store':
        // Format: key, value. Try to extract
        const splitIdx = cleanedArgs.indexOf(',');
        let key = cleanedArgs;
        let value = "stored_value";
        if (splitIdx !== -1) {
          key = cleanedArgs.substring(0, splitIdx).trim();
          value = cleanedArgs.substring(splitIdx + 1).trim();
        }
        localStorage.setItem(`agent_mem_${key}`, value);
        return `Memory successfully saved to client localStorage key 'agent_mem_${key}': "${value.substring(0, 40)}..."`;

      case 'memory_recall':
        const stored = localStorage.getItem(`agent_mem_${cleanedArgs}`);
        if (stored) {
          return `Memory RECALLED successfully: "${stored}"`;
        }
        return `Memory cell 'agent_mem_${cleanedArgs}' was EMPTY. No data found.`;

      default:
        return `Error: Tool '${toolName}' not found.`;
    }
  };

  const handleStartAgent = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSteps([]);
    setCurrentThought("");
    
    abortControllerRef.current = new AbortController();

    // Prepare agent prompt
    const systemPrompt = `You are an autonomous AI engineering Agent that utilizes ReAct (Reasoning and Acting) loops.
You must solve the user's task step-by-step using these exact tools:

Available Mock Tools:
1. web_search(query) -> Returns search result snippets
2. code_run(code) -> Runs code blocks and returns stdout
3. memory_store(key, value) -> Saves string values to local memory
4. memory_recall(key) -> Retrieves string values from local memory

Format Instructions:
To think and act, you must output strictly in this sequence:
Thought: <what you are planning>
Action: <tool_name>(<arguments>)
(Wait for Observation)

Once you have gathered enough information to fully complete the user's task, respond strictly with:
Final Answer: <your final answer summary>

CRITICAL RULES:
- Only output ONE Thought and ONE Action per response. Do not output the Observation yourself!
- Keep thoughts extremely brief (1-2 sentences).`;

    let userQuery = `Task: ${task}`;
    let iterations = 0;
    const maxIterations = 5;

    let history = [
      { role: 'user', content: userQuery }
    ];

    while (iterations < maxIterations && isRunning) {
      setCurrentThought("Thinking...");
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history,
            systemPrompt
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) throw new Error('API failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No reader available');

        let text = "";
        setCurrentThought("");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          setCurrentThought(text);
        }

        // Add model reply to local history context
        history.push({ role: 'assistant', content: text });

        // Parse LLM response for thoughts/actions
        const thoughtMatch = text.match(/Thought:\s*([\s\S]*?)(?=Action:|Final Answer:|$)/);
        const actionMatch = text.match(/Action:\s*(\w+)\(([\s\S]*?)\)/);
        const finalMatch = text.match(/Final Answer:\s*([\s\S]*)/);

        if (thoughtMatch && thoughtMatch[1].trim()) {
          setSteps(prev => [...prev, {
            type: 'thought',
            content: thoughtMatch[1].trim(),
            timestamp: new Date().toLocaleTimeString()
          }]);
        }

        if (actionMatch) {
          const toolName = actionMatch[1].trim();
          const toolArgs = actionMatch[2].trim();

          setSteps(prev => [...prev, {
            type: 'action',
            content: `Invoking tool: ${toolName}(${toolArgs})`,
            toolName,
            toolArgs,
            timestamp: new Date().toLocaleTimeString()
          }]);

          // Pause briefly for realistic simulation
          await new Promise(r => setTimeout(r, 1000));

          // Run tool client-side
          const observationResult = executeMockTool(toolName, toolArgs);

          setSteps(prev => [...prev, {
            type: 'observation',
            content: observationResult,
            timestamp: new Date().toLocaleTimeString()
          }]);

          // Feed observation back to the LLM
          history.push({
            role: 'user',
            content: `Observation: ${observationResult}`
          });

        } else if (finalMatch) {
          setSteps(prev => [...prev, {
            type: 'final',
            content: finalMatch[1].trim(),
            timestamp: new Date().toLocaleTimeString()
          }]);
          break; // Loop completed successfully!
        } else {
          // If no formatting matched, treat whole thing as final answer fallback
          setSteps(prev => [...prev, {
            type: 'final',
            content: text.replace(/Thought:|Action:|Final Answer:/g, '').trim(),
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;
        }

        iterations++;
        await new Promise(r => setTimeout(r, 1000));

      } catch (err: any) {
        if (err.name === 'AbortError') break;
        console.error("Agent run failed:", err);
        // Serve smart mock tracing if LLM blocks or rates limit
        setSteps(prev => [
          ...prev,
          { type: 'thought', content: "Failed to establish AI completion. Simulating local rule agent trace...", timestamp: new Date().toLocaleTimeString() },
          { type: 'action', content: "Invoking tool: web_search('LoRA Fine-Tuning Summary')", toolName: 'web_search', toolArgs: 'LoRA', timestamp: new Date().toLocaleTimeString() },
          { type: 'observation', content: `{"title": "LoRA Summary", "snippet": "Successfully fetched local LoRA configurations: frozen attention blocks, rank matrix rank=8 injected."}`, timestamp: new Date().toLocaleTimeString() },
          { type: 'thought', content: "I now have the summary data. I will store it to client storage.", timestamp: new Date().toLocaleTimeString() },
          { type: 'action', content: "Invoking tool: memory_store('lora_summary', 'LoRA reduces param training size by 99%')", toolName: 'memory_store', toolArgs: 'lora_summary', timestamp: new Date().toLocaleTimeString() },
          { type: 'observation', content: "Memory successfully saved to client localStorage key 'agent_mem_lora_summary'", timestamp: new Date().toLocaleTimeString() },
          { type: 'final', content: "Task completed successfully. LoRA research summary has been captured, verified, and safely written to client local state storage.", timestamp: new Date().toLocaleTimeString() }
        ]);
        break;
      }
    }

    setIsRunning(false);
    setCurrentThought("");
  };

  const handleStopAgent = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setCurrentThought("");
  };

  return (
    <section id="agent-board" className="py-16 bg-gray-950/60 border-b border-gray-900 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold flex items-center gap-2">
              <Cpu className="w-6 h-6 text-indigo-400" />
              Autonomous ReAct AI Agent Board
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Describe a multi-step task below. Watch the LLM formulate thoughts, choose local search/storage tools, parse results, and output final answers completely autonomously.
            </p>
          </div>

          {/* Info explainer */}
          <div className="relative">
            <button 
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-12 z-20 w-80 p-4 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl text-xs space-y-2 text-gray-300">
                <h4 className="font-bold text-white mb-1">🤖 ReAct (Reasoning + Acting) Agents</h4>
                <p>This panel simulates a production **AI Agent workflow**.</p>
                <p>By parsing custom string syntax `Action: tool_name(args)` in the LLM's response, the client executes JavaScript methods locally, retrieves variables, and appends them back to the conversation as an `Observation`.</p>
                <p>The LLM reads this observation and decides the next Action, creating a self-driving loop until it determines the task is complete.</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Board Panel */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* Left panel: Task Picker & Run button */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                📋 Pick a Sample Task
              </span>
              <div className="grid gap-2">
                {SAMPLE_TASKS.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTask(st)}
                    className={`text-left text-xs p-2.5 rounded-xl border leading-relaxed transition-all ${
                      task === st
                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/30 font-semibold shadow-inner'
                        : 'bg-gray-950 hover:bg-gray-800 text-gray-400 border-gray-850 hover:text-white'
                    }`}
                    disabled={isRunning}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Task input */}
            <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800/80 space-y-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                ✏️ Custom Task Spec
              </span>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full p-2.5 bg-gray-950 border border-gray-850 rounded-xl text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none font-sans"
                placeholder="Type your task guidelines..."
                disabled={isRunning}
              />
              
              <div className="pt-2">
                {isRunning ? (
                  <button
                    onClick={handleStopAgent}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Stop Agent Execution
                  </button>
                ) : (
                  <button
                    onClick={handleStartAgent}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch AI Agent
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right panel: Thought Trace Console */}
          <div className="md:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden h-[360px] flex flex-col shadow-2xl relative">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center shrink-0 font-mono">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                ⚙️ Live Agent Terminal Console
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">ReAct Loop</span>
            </div>

            {/* Steps stream viewer */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-950/20 custom-scrollbar scroll-smooth">
              {steps.length === 0 && !currentThought ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                  <Terminal className="w-10 h-10 text-gray-700 mb-3 animate-pulse" />
                  <h5 className="font-semibold text-gray-500 text-xs font-mono">Agent state: IDLE</h5>
                  <p className="text-[10.5px] text-gray-600 max-w-[240px] mt-1 leading-relaxed">
                    Set a task spec on the left and click **Launch** to wake the planner.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                  {steps.map((step, idx) => {
                    if (step.type === 'thought') {
                      return (
                        <div key={idx} className="bg-indigo-950/20 border border-indigo-900/20 p-2.5 rounded-xl text-gray-300">
                          <span className="font-bold text-indigo-400 block mb-1">
                            🤔 THOUGHT (Reasoning) [{step.timestamp}]:
                          </span>
                          {step.content}
                        </div>
                      );
                    }
                    if (step.type === 'action') {
                      return (
                        <div key={idx} className="bg-yellow-950/10 border border-yellow-900/10 p-2.5 rounded-xl text-yellow-300">
                          <span className="font-bold text-yellow-400 flex items-center gap-1.5 mb-1">
                            🔧 ACTION (Executing tool):
                          </span>
                          {step.content}
                        </div>
                      );
                    }
                    if (step.type === 'observation') {
                      return (
                        <div key={idx} className="bg-gray-900/50 border border-gray-800 p-2.5 rounded-xl text-gray-400">
                          <span className="font-bold text-gray-500 block mb-1">
                            📄 OBSERVATION (Tool output):
                          </span>
                          <pre className="text-[10px] overflow-x-auto whitespace-pre-wrap">{step.content}</pre>
                        </div>
                      );
                    }
                    if (step.type === 'final') {
                      return (
                        <div key={idx} className="bg-emerald-950/25 border border-emerald-900/20 p-3.5 rounded-xl text-emerald-400">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                            ✅ FINAL ANSWER (Task Completed!):
                          </span>
                          {step.content}
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Current thinking buffer stream */}
                  {currentThought && (
                    <div className="bg-gray-950 border border-gray-900 p-2.5 rounded-xl text-gray-400 animate-pulse">
                      <span className="font-bold text-indigo-400 block mb-1">🤖 Agent is thinking...</span>
                      {currentThought}
                    </div>
                  )}
                </div>
              )}
              <div ref={consoleEndRef} />
            </div>

            {/* Active tools indicator pill */}
            <div className="px-4 py-2 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center gap-3 shrink-0 select-none text-[10px]">
              <span className="text-gray-500 font-mono font-bold">Tools Loaded:</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-950 text-indigo-400 border border-gray-800 flex items-center gap-1">
                <Search className="w-3 h-3 text-indigo-400" /> search
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gray-950 text-indigo-400 border border-gray-800 flex items-center gap-1">
                <Terminal className="w-3 h-3 text-indigo-400" /> executor
              </span>
              <span className="px-1.5 py-0.5 rounded bg-gray-950 text-indigo-400 border border-gray-800 flex items-center gap-1">
                <Database className="w-3 h-3 text-indigo-400" /> local_mem
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
