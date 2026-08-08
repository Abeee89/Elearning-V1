"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { getOrCreateChatSession, getChatHistory, sendMessage } from "@/actions/chatbot";

export function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initChat();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const initChat = async () => {
    try {
      const sId = await getOrCreateChatSession();
      setSessionId(sId);
      const history = await getChatHistory(sId);
      setMessages(history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || isLoading) return;

    const userMessage = input;
    setInput("");
    
    // Optimistic UI update
    setMessages(prev => [...prev, { sender: "user", messageText: userMessage }]);
    setIsLoading(true);

    try {
      const res = await sendMessage(sessionId, userMessage);
      if (res.success) {
        setMessages(prev => [...prev, { sender: "ai", messageText: res.response }]);
      } else {
        setMessages(prev => [...prev, { sender: "ai", messageText: res.error }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-trace-teal text-black shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:bg-trace-teal/90 transition-transform hover:scale-105 p-0 flex items-center justify-center"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-black/90 border border-trace-teal/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md animate-slide-up">
          {/* Header */}
          <div className="bg-trace-teal/10 p-4 border-b border-trace-teal/20 flex items-center">
             <Bot className="w-6 h-6 text-trace-teal mr-3" />
             <div>
               <h3 className="text-white font-space-grotesk font-bold">Asisten Belajar AI</h3>
               <p className="text-xs text-trace-teal/70 font-inter">Online & Siap Membantu</p>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 text-sm mt-10">
                <Bot className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Halo! Ada yang bisa saya bantu terkait materi elektronika hari ini?</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-inter leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-trace-teal text-black rounded-br-none" 
                    : "bg-white/10 text-white border border-white/5 rounded-bl-none"
                }`}>
                  {msg.messageText}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl bg-white/10 text-white rounded-bl-none border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-trace-teal font-jetbrains-mono uppercase tracking-wider">
                    <span>AI Assistant</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-trace-teal animate-pulse"></span>
                  </div>
                  {/* Short pulsing segment using the trace-line motif */}
                  <div className="h-1 w-16 bg-white/10 rounded overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-trace-teal rounded shadow-[0_0_8px_#4FD1C5] animate-[trace-pulse_1.5s_infinite_ease-in-out]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/50">
             <div className="flex relative">
               <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Ketik pertanyaan Anda..."
                 className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-trace-teal/50 transition-colors"
               />
               <Button 
                 type="submit" 
                 disabled={isLoading || !input.trim()}
                 className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-trace-teal hover:bg-trace-teal/80 text-black p-0 flex items-center justify-center disabled:opacity-50"
               >
                 <Send className="w-4 h-4 ml-0.5" />
               </Button>
             </div>
          </form>
        </div>
      )}
    </>
  );
}
