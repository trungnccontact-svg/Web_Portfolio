'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, Trash2, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  model?: string;
};

const QUICK_REPLIES = [
  { text: "What are Trung's core skills? 🛠️", query: "What are your core technical skills and practices?" },
  { text: "Tell me about your key projects 🚀", query: "Can you tell me about your projects like CONUT and Pezzel?" },
  { text: "How can I contact you? 📬", query: "How can I get in touch with you? What is your email and phone?" },
  { text: "What interactive features are here? 🎮", query: "What are the interactive pages/games I can try on this website?" }
];

// Offline fallback response library in case OpenRouter has rate limits or no keys
const OFFLINE_RESPONSES = [
  {
    keywords: ['skill', 'technolog', 'stack', 'frontend', 'backend', 'language'],
    reply: `Here are **Trung's core technical skills**:\n\n• **Frontend**: ReactJS, React Native (Expo), Tailwind CSS, NativeWind, Zustand, Redux Toolkit\n• **Backend**: NestJS, Node.js\n• **Database**: MongoDB, SQL Server, TiDB/MySQL\n• **Languages**: TypeScript, JavaScript, VB.NET\n• **Practices**: RESTful APIs, Agile/Scrum, AI-Assisted development\n\nHe is excellent at building pixel-perfect, accessible interfaces and backend systems!`
  },
  {
    keywords: ['project', 'conut', 'pezzel', 'pozzel', 'mconcept', 'mcollection'],
    reply: `Trung has built several **impressive full-stack applications**:\n\n1. **CONUT** (Lead Full-stack Developer): Social group-buying platform built with React Native, Expo, NestJS, and MongoDB. Designed dynamic group-pricing.\n2. **Pezzel** (Full-stack Developer): Real estate booking app with custom interactive Google Maps drawing tools.\n3. **Pozzel**: Service-booking app on App Store built with React Native and NestJS.\n4. **MConcept / MCollection**: Highly performant e-commerce websites with multi-language capabilities.`
  },
  {
    keywords: ['contact', 'email', 'phone', 'call', 'reach', 'touch', 'address'],
    reply: `You can reach out to **Trung** directly through:\n\n• 📬 **Email**: [trungnc.contact@gmail.com](mailto:trungnc.contact@gmail.com)\n• 📞 **Phone**: **0832942345**\n• 📍 **Address**: No.524C, Nguyen Trai quarter, Lai Thieu ward, Ho Chi Minh City, Vietnam\n\nHe is active and looking for new full-stack opportunities!`
  },
  {
    keywords: ['game', 'chess', 'english', 'notepad', 'nasa', 'job', 'agent', 'feature'],
    reply: `This portfolio has several **stellar interactive pages** you must try:\n\n• 🎮 **[Play Chess](/chess)**: Battle an adaptive minimax AI that stores games in TiDB.\n• 📸 **[AI English Scanner](/english)**: Scan grammar sheets or check your writing syntax.\n• 📓 **[Interactive Notepad](/notepad)**: Write and export notes in Markdown.\n• 🚀 **[NASA Space Hub](/nasa)**: Browse stunning cosmos imagery via NASA APIs.\n• 💼 **[AI Job Agent](/ai-job-agent)**: Match your job spec against Trung's CV.`
  }
];

function getOfflineFallbackReply(query: string): string {
  const lower = query.toLowerCase();
  for (const item of OFFLINE_RESPONSES) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.reply;
    }
  }
  return `Hi! I am currently running in **offline demo mode** because my AI cloud connection is resting. 😴\n\nI can still tell you about Trung! Ask me about:\n• His **skills** 🛠️\n• His **projects** (like CONUT or Pezzel) 🚀\n• His **contact info** 📬\n• The **interactive games** on this site 🎮`;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('Google Gemini 2.5');
  const [showBadgePulse, setShowBadgePulse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from Session Storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('portfolio_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
    
    // Load last active engine indicator if saved
    const savedModel = sessionStorage.getItem('portfolio_chat_active_model');
    if (savedModel) {
      setActiveModel(savedModel);
    }
  }, []);

  // Save history to Session Storage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('portfolio_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: userText.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const activeModelHeader = response.headers.get('X-Active-Model') || 'Free AI Engine';
      setActiveModel(activeModelHeader);
      sessionStorage.setItem('portfolio_chat_active_model', activeModelHeader);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      // Create initial empty assistant bubble
      const initialAssistantMsg: Message = {
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        model: activeModelHeader
      };

      setMessages(prev => [...prev, initialAssistantMsg]);
      setIsLoading(false); // Stop typing dot once text stream starts flowing

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        accumulatedText += text;

        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulatedText
            };
          }
          return updated;
        });
      }

    } catch (error) {
      console.warn('AI API failed. Initializing intelligent offline fallback...', error);
      
      // Introduce a realistic dynamic typing delay for offline replies (looks much better than instant response!)
      await new Promise(resolve => setTimeout(resolve, 800));

      const offlineReply = getOfflineFallbackReply(userText);
      const assistantMsg: Message = {
        role: 'assistant',
        content: offlineReply,
        created_at: new Date().toISOString(),
        model: 'Local Memory Engine'
      };

      setActiveModel('Local Memory (Offline)');
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
      setShowBadgePulse(true);
      setTimeout(() => setShowBadgePulse(false), 3000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleClearChat = () => {
    if (confirm("Reset conversation history?")) {
      setMessages([]);
      sessionStorage.removeItem('portfolio_chat_history');
      setActiveModel('Google Gemini 2.5');
      sessionStorage.removeItem('portfolio_chat_active_model');
    }
  };

  // Basic custom markdown parser for bullet lists, strong tags, and markdown links
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      let trimmed = line.trim();
      
      // Render blank lines
      if (!trimmed) {
        return <div key={lineIdx} className="h-2" />;
      }

      // Check if bullet point
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\.\s/.test(trimmed);
      
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        trimmed = trimmed.replace(/^[•\-*]\s*/, '');
      }

      // Parse bold elements (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      let parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(trimmed)) !== null) {
        // Text before match
        if (match.index > lastIndex) {
          parts.push(trimmed.substring(lastIndex, match.index));
        }
        // Bold element
        parts.push(
          <strong key={match.index} className="font-semibold text-primary-foreground dark:text-white drop-shadow-sm">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < trimmed.length) {
        parts.push(trimmed.substring(lastIndex));
      }

      // Final string or parsed parts
      let contentNode = parts.length > 0 ? parts : trimmed;

      // Handle Markdown Links [text](url)
      if (typeof contentNode === 'string' && /\[(.*?)\]\((.*?)\)/.test(contentNode)) {
        const linkRegex = /\[(.*?)\]\((.*?)\)/g;
        let linkParts: React.ReactNode[] = [];
        let linkLastIdx = 0;
        let linkMatch;
        let strContent = contentNode;

        while ((linkMatch = linkRegex.exec(strContent)) !== null) {
          if (linkMatch.index > linkLastIdx) {
            linkParts.push(strContent.substring(linkLastIdx, linkMatch.index));
          }
          linkParts.push(
            <a 
              key={linkMatch.index} 
              href={linkMatch[2]} 
              target={linkMatch[2].startsWith('http') ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              className="text-blue-500 dark:text-blue-400 font-medium underline hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              {linkMatch[1]}
            </a>
          );
          linkLastIdx = linkRegex.lastIndex;
        }

        if (linkLastIdx < strContent.length) {
          linkParts.push(strContent.substring(linkLastIdx));
        }
        contentNode = linkParts;
      }

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 text-sm leading-relaxed mb-1">
            {contentNode}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-sm leading-relaxed mb-1.5 break-words">
          {contentNode}
        </p>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full p-4 shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/20"
          title="Chat with Trung's AI Agent"
        >
          {/* Subtle green indicator dot for "online" status */}
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900"></span>
          </span>
          <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
        </button>
      ) : (
        /* Glassmorphism Chat Panel */
        <div 
          ref={chatContainerRef}
          className="bg-white/80 dark:bg-gray-950/85 backdrop-blur-xl rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[520px] border border-white/20 dark:border-white/5 overflow-hidden transition-all duration-500 transform translate-y-0 opacity-100 scale-100 ease-out animate-in fade-in slide-in-from-bottom-6"
        >
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none tracking-wide flex items-center gap-1.5">
                  AI Representative
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </h3>
                <span className="text-[10px] text-blue-100/80 mt-1 block">Nguyen Chi Trung</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button 
                  onClick={handleClearChat} 
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors"
                  title="Clear Conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Model Status Pill Badge */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-gray-100 dark:border-gray-900/40 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10.5px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
              Active System:
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/20 flex items-center gap-1 transition-all ${showBadgePulse ? 'scale-105 duration-300' : ''}`}>
              <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></span>
              {activeModel}
            </span>
          </div>
          
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40 dark:bg-gray-900/10 custom-scrollbar scroll-smooth">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900/30 shadow-sm animate-bounce">
                  <Bot className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">Chat with Trung's Representative</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] leading-relaxed mb-4">
                  Ask me about his tech stack, work experience, CONUT or Pezzel apps, or play a quick chess game!
                </p>
                
                {/* Initial Quick Suggestions */}
                <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                  {QUICK_REPLIES.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(reply.query)}
                      className="text-left text-xs bg-white dark:bg-gray-950/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-gray-700 dark:text-gray-300 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/80 transition-all duration-200 shadow-sm hover:translate-x-1"
                    >
                      {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.role === 'user';
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end animate-in slide-in-from-right-3 duration-250' : 'justify-start animate-in slide-in-from-left-3 duration-250'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm leading-relaxed ${
                        isMe 
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none border border-blue-700/20' 
                          : 'bg-white dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800 rounded-bl-none'
                      }`}>
                        {isMe ? (
                          <p className="text-sm break-words">{msg.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderMessageContent(msg.content)}
                          </div>
                        )}
                        <div className={`text-[9px] mt-2 flex justify-between items-center opacity-65 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isMe && msg.model && (
                            <span className="italic font-mono scale-[0.9] origin-right">
                              {msg.model.includes('Gemini') ? 'Gemini ⚡' : 'LLM Engine 🤖'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white dark:bg-gray-900/90 border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl rounded-bl-none flex items-center space-x-1.5 shadow-sm">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Message Composer */}
          <form 
            onSubmit={handleFormSubmit} 
            className="p-3 bg-white/70 dark:bg-gray-950/80 border-t border-gray-100 dark:border-gray-900/60 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900/80 dark:text-white transition-all bg-gray-50/50 dark:bg-gray-900/40"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 text-white rounded-full p-2.5 transition-all duration-200 shrink-0 transform hover:scale-105 active:scale-95 shadow-sm border border-indigo-700/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
