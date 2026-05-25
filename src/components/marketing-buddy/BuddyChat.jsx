"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateAICall } from '../../lib/ai';
import { useAuth } from '../../lib/AuthContext';
import { toast } from 'sonner';
import { incrementUsage } from '../../lib/useUsage';
import { supabase } from '../../supabaseClient';

export default function BuddyChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { 
      role: 'buddy', 
      text: "Hey! I'm your marketing co-pilot. I've studied your Brand Brain and I'm ready to help you grow. What's on your mind today?" 
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

  const handleSend = async (text) => {
    const msgText = typeof text === 'string' ? text : inputValue;
    if (!msgText.trim() || isTyping) return;

    const userMsg = { role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const systemPrompt = `You are the user's elite AI Marketing Co-pilot. 
    Your primary goal is to provide strategic marketing advice, content ideas, and growth tactics that are 100% aligned with the provided Brand Context.
    
    RULES:
    1. NEVER be generic. Use the brand's specific tone, problem, and audience in every answer.
    2. Be actionable. Don't just give theory; give specific steps, hooks, or platform-specific advice.
    3. Be encouraging but professional (unless the brand tone is edgy/casual).
    4. If the user asks for content, follow their specific 'Writing Style' and 'Tone' from the context.
    5. Always lead with the 'Core Value' and 'Unique Differentiator' of the product.
    6. if user ask anything beyond the question about there app or question about marketing if user ask anything beyond that dont answer and say i am your persnol marketing asistant and i cant help you with that request.
    
    Maintain a helpful, high-energy founder-to-founder vibe.`;

    try {
      // The generateAICall utility automatically fetches and injects the brand brain when userId is passed
      const response = await generateAICall(systemPrompt, msgText, user?.id, 'copilot');
      
      const buddyMsg = { 
        role: 'buddy', 
        text: response 
      };
      setMessages(prev => [...prev, buddyMsg]);
      
      // Increment usage on successful message generation
      await incrementUsage(supabase, user?.id, 'copilot');
    } catch (err) {
      console.error("Copilot Error:", err);
      toast.error("I hit a snag. Try again?");
      setMessages(prev => [...prev, { role: 'buddy', text: "Sorry, I had trouble connecting to my brain. Can you try that again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    'How should I pitch my SaaS on Reddit?',
    'What onboarding emails fit my product?',
    'Ideas to differentiate my app from competitors?',
    'Landing-page headlines for my app'
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
          <div className="mr-auto bg-[#111111] border border-[#1F1F1F] rounded-xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
            <Loader2 size={14} className="text-orange-500 animate-spin mr-1" />
            <span className="text-zinc-500 text-xs">Consulting your brain...</span>
          </div>
        )}
      </div>

      <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              className="bg-[#111111] border border-[#1F1F1F] text-zinc-400 text-[10px] font-bold rounded-full px-3 py-1.5 text-left hover:border-zinc-600 hover:text-white transition-all disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea 
            rows={1}
            placeholder="Ask anything..."
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
              inputValue.trim() && !isTyping ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            )}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}