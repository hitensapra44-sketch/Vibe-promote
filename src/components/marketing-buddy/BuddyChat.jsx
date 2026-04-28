"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BuddyChat({ brandInfo }) {
  const [messages, setMessages] = useState([
    { 
      role: 'buddy', 
      text: "Hey! I know everything about your app. Ask me anything — post ideas, strategy questions, what to do next. I'm here 24/7." 
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const buddyMsg = { 
        role: 'buddy', 
        text: "Got it — I'll have a real answer here once the AI is connected. For now I'm just showing you how this will look." 
      };
      setMessages(prev => [...prev, buddyMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const quickPrompts = [
    "Reddit post idea",
    "What to post this week",
    "Who should I target",
    "Analyze my strategy",
    "Write me a hook"
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={cn(
              "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative",
              msg.role === 'user' 
                ? "ml-auto bg-orange-500/10 border border-orange-500/20 text-white rounded-br-sm" 
                : "mr-auto bg-[#111111] border border-[#1F1F1F] text-zinc-300 rounded-bl-sm"
            )}
          >
            {msg.role === 'buddy' && (
              <Sparkles size={12} className="text-orange-500 absolute -top-1.5 -left-1.5" />
            )}
            {msg.text}
          </div>
        ))}
        
        {isTyping && (
          <div className="mr-auto bg-[#111111] border border-[#1F1F1F] rounded-xl rounded-bl-sm px-4 py-3 flex gap-1">
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => setInputValue(prompt)}
              className="bg-[#111111] border border-[#1F1F1F] text-zinc-400 text-[10px] font-bold rounded-full px-3 py-1.5 whitespace-nowrap hover:border-zinc-600 hover:text-white transition-all bg-transparent"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <textarea 
            rows={1}
            placeholder="Ask anything — 'Give me a Reddit post idea'..."
            className="flex-1 bg-[#111111] border border-[#1F1F1F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 placeholder-zinc-500 resize-none min-h-[46px] max-h-[120px]"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className={cn(
              "p-3 rounded-xl transition-all flex-shrink-0",
              inputValue.trim() && !isTyping ? "bg-orange-500 text-white" : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}