'use client';

import React, { useState, useEffect, useRef } from 'react';

type Message = {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let storedId = sessionStorage.getItem('chat_client_id');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('chat_client_id', storedId);
    }
    setClientId(storedId);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Fetch historical messages
      fetch('/api/messages')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch(err => console.error('Error fetching messages:', err));

      // Connect to WebSocket
      const wsUrl = process.env.NEXT_PUBLIC_GO_CHAT_WS_URL;
      console.log("Attempting to connect to WebSocket URL:", wsUrl);
      if (wsUrl) {
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('Connected to chat WebSocket successfully at', wsUrl);
        };

        ws.onmessage = (event) => {
          try {
            const msg: Message = JSON.parse(event.data);
            setMessages(prev => [...prev, msg]);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onclose = (event) => {
          console.log('Disconnected from chat WebSocket. Code:', event.code, 'Reason:', event.reason);
        };

        ws.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };

        wsRef.current = ws;

        return () => {
          ws.close();
        };
      }
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("--- Send button clicked! ---");
    console.log("Input value:", input);

    if (!wsRef.current) {
      console.warn("Issue: WebSocket is not initialized (wsRef.current is null).");
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Issue: WebSocket is not ready. Current state:", wsRef.current.readyState, "(Expected state 1 for OPEN)");
      return;
    }

    if (!input.trim()) {
      console.warn("Issue: Input is empty.");
      return;
    }

    const payload = { content: input.trim(), sender_id: clientId };
    console.log("Success! Sending payload via WebSocket:", payload);
    wsRef.current.send(JSON.stringify(payload));
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col h-96 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Real-time Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === clientId;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg shadow-sm border ${
                      isMe 
                        ? 'bg-blue-600 text-white border-blue-700 rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700 rounded-bl-none'
                    }`}>
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sendfdsd
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
