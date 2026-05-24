'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, ToggleLeft, ToggleRight, Database, HelpCircle, FileText, Search } from 'lucide-react';
import { KNOWLEDGE_BASE, KnowledgeChunk } from './knowledgeBase';

interface ScoredChunk {
  chunk: KnowledgeChunk;
  score: number;
}

interface RAGMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: ScoredChunk[];
  rag_enabled: boolean;
  latency?: number;
}

export default function RAGChat() {
  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [input, setInput] = useState('');
  const [ragEnabled, setRagEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Client-side lightweight BM25-like tf-idf retriever
  const retrieveContext = (query: string): ScoredChunk[] => {
    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    if (terms.length === 0) return [];

    const scored = KNOWLEDGE_BASE.map((chunk) => {
      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.title.toLowerCase();
      const combinedLength = chunk.content.split(/\s+/).length;

      let score = 0;
      terms.forEach((term) => {
        // TF (Term Frequency) inside document body
        const contentTF = contentLower.split(term).length - 1;
        // Title term matching weight boost
        const titleTF = (titleLower.split(term).length - 1) * 3;

        const totalTF = contentTF + titleTF;
        if (totalTF > 0) {
          // BM25-like length normalization saturation formula
          const documentLenNormalized = totalTF / (totalTF + 1.2 * (0.25 + 0.75 * (combinedLength / 40)));
          score += documentLenNormalized;
        }
      });

      // Normalize score between 0.0 and 1.0 roughly
      const normalizedScore = parseFloat(Math.min(score / terms.length, 1.0).toFixed(3));

      return { chunk, score: normalizedScore };
    });

    // Return top-3 highest scored matching chunks above 0.05
    return scored
      .filter((item) => item.score > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: RAGMessage = {
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
      rag_enabled: ragEnabled
    };

    setMessages((prev) => [...prev, userMsg]);

    // Track RAG Retrieval Phase
    let matchedChunks: ScoredChunk[] = [];
    if (ragEnabled) {
      matchedChunks = retrieveContext(userText);
    }

    const startTime = Date.now();

    // Prepare system instructions and contextual injection
    let systemPrompt = `You are a specialized AI Engineering consultant. 
Keep your response concise, clear, and professional. 
Always output in clean Markdown.`;

    if (ragEnabled && matchedChunks.length > 0) {
      const contextString = matchedChunks
        .map((sc, i) => `[Source ${i + 1}: ${sc.chunk.title}]\nCategory: ${sc.chunk.category}\nContent: ${sc.chunk.content}`)
        .join("\n\n");

      systemPrompt += `\n\nYou MUST answer the user query strictly utilizing details in the following retrieved context chunks. 
If the context does not contain facts necessary to satisfy the query, answer professionally but clearly state that the static vector store didn't contain sufficient metrics.

Retrieved Ground-Truth Context:
${contextString}`;
    } else if (ragEnabled) {
      systemPrompt += `\n\nNote: The RAG keyword retriever was active but returned 0 matches in the knowledge base. State this clearly before answering from pre-trained weights.`;
    } else {
      systemPrompt += `\n\nNote: RAG mode is DISABLED. Answer this query based purely on your general pre-trained knowledge base. Do NOT reference any custom context chunks.`;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: userText }
          ],
          systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error('API failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream reader');

      // Create empty target message
      const initialAssistantMsg: RAGMessage = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        sources: matchedChunks,
        rag_enabled: ragEnabled
      };

      setMessages((prev) => [...prev, initialAssistantMsg]);
      setIsLoading(false);

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        accumulatedText += text;

        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulatedText,
              latency: Date.now() - startTime
            };
          }
          return updated;
        });
      }

    } catch (err) {
      console.error("Error in RAG chat:", err);
      // Fallback response
      const latency = Date.now() - startTime;
      const assistantMsg: RAGMessage = {
        role: 'assistant',
        content: `I encountered a connection error. Here is a localized response: ${
          ragEnabled && matchedChunks.length > 0 
            ? `Retrieved context suggests: "${matchedChunks[0].chunk.content}"`
            : "RAG Mode is currently running locally. Trung's portfolio technical skills include NestJS, React, and databases."
        }`,
        created_at: new Date().toISOString(),
        sources: matchedChunks,
        rag_enabled: ragEnabled,
        latency
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }
  };

  return (
    <section id="rag-chat" className="py-16 bg-gray-950/40 border-b border-gray-900 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-400" />
              Retriever-Augmented Generation (RAG) Demo
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Type queries (e.g. "What is BM25?" or "Tell me about LoRA fine-tuning"). Toggle RAG mode ON/OFF to visually inspect context-grounding differences.
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
                <h4 className="font-bold text-white mb-1">🔍 Retrieval-Augmented Generation</h4>
                <p>When **RAG Mode is ON**, a client-side **BM25 TF-IDF engine** parses your question, retrieves the top 3 contextual document chunks from our static index, and injects them into the prompt.</p>
                <p>This allows the LLM to write answers grounded in specific knowledge graphs, eliminating hallucinations.</p>
                <p>When **RAG is OFF**, the LLM answers purely from pre-trained weights, creating a benchmark difference.</p>
              </div>
            )}
          </div>
        </div>

        {/* RAG Chat Box Container */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl h-[500px] flex flex-col">
          
          {/* Header Console */}
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex justify-between items-center shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-400" />
              Vector / BM25 Knowledge Sandbox
            </span>

            {/* Toggle Button */}
            <button
              onClick={() => setRagEnabled(!ragEnabled)}
              className="flex items-center gap-1.5 text-xs font-bold transition-all"
            >
              <span className="text-gray-400 select-none">RAG Context Integration:</span>
              {ragEnabled ? (
                <div className="flex items-center text-emerald-400 gap-1 hover:text-emerald-300">
                  <ToggleRight className="w-7 h-7" />
                  <span>ENABLED</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500 gap-1 hover:text-gray-400">
                  <ToggleLeft className="w-7 h-7" />
                  <span>OFFLINE</span>
                </div>
              )}
            </button>
          </div>

          {/* Chat Bubble log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/20 custom-scrollbar scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
                <Database className="w-10 h-10 text-gray-700 mb-3 animate-pulse" />
                <h5 className="font-semibold text-gray-400 text-sm mb-1">Static Documents Store is Ready</h5>
                <p className="text-xs text-gray-600 max-w-[280px] leading-relaxed">
                  Try asking: **"Tell me about LoRA"** or **"What is Faithfulness?"**
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={idx} className={`space-y-2 ${isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                      {/* Bubble */}
                      <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm border ${
                        isUser 
                          ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-700/20 text-white rounded-br-none'
                          : 'bg-gray-900 border-gray-800 text-gray-200 rounded-bl-none'
                      }`}>
                        <p className="text-xs sm:text-sm break-words leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <div className="text-[9px] mt-2 opacity-65 flex items-center justify-between gap-4">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isUser && msg.latency && (
                            <span className="font-mono text-[8.5px]">
                              latency: {(msg.latency / 1000).toFixed(2)}s • mode: {msg.rag_enabled ? 'RAG' : 'Base'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Matched Sources Drawer */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="max-w-[85%] bg-gray-900/40 border border-gray-800/60 p-2.5 rounded-xl text-[10.5px] text-gray-400 space-y-1.5 w-full ml-1 animate-in fade-in duration-300">
                          <div className="font-semibold text-indigo-400 flex items-center gap-1 font-mono uppercase tracking-wider text-[9px] border-b border-gray-800/80 pb-1">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            BM25 Documents Sourced ({msg.sources.length} hits)
                          </div>
                          <div className="grid gap-1.5 pt-1">
                            {msg.sources.map((sc, sidx) => (
                              <div key={sidx} className="flex items-start justify-between gap-4 bg-gray-950/40 p-1.5 rounded border border-gray-900">
                                <div>
                                  <span className="font-bold text-gray-300 text-[10.5px]">
                                    [{sc.chunk.category}] {sc.chunk.title}
                                  </span>
                                  <p className="text-[9.5px] text-gray-500 italic mt-0.5 leading-snug">
                                    "{sc.chunk.content.substring(0, 100)}..."
                                  </p>
                                </div>
                                <span className="font-mono text-[9px] font-bold bg-indigo-950/60 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900/30 shrink-0">
                                  score: {sc.score}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form message input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Vector/BM25 context database..."
              className="flex-1 px-4 py-2 bg-gray-950 border border-gray-800 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-full p-2.5 transition-all transform active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
