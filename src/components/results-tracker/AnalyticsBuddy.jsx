"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2, Lock, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateAICall } from '../../lib/ai';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AnalyticsBuddy({ dataContext, isLocked = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'buddy', text: "Hey! I've analyzed your data. What would you like to know about your performance or strategy?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (text) => {
    if (isLocked) {
      setIsOpen(true);
      return;
    }
    const msg = text || inputValue;
    if (!msg.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInputValue('');
    setIsTyping(true);

    const systemPrompt = `You are a brutally honest marketing analyst and a smart founder‑friend. Use only the data that follows; never invent numbers.

Context

Period: ${dataContext.selectedPeriod}
Platform filter: ${dataContext.activePlatform || "all platforms"}
Posts (title – upvotes – comments – link taps – date):
${dataContext.posts.map(p => `- ${p.title} | ${p.upvotes} upvotes | ${p.comments} comments | ${p.linkTaps} link taps | ${p.date}`).join('\n')}

Aggregate metrics for the period:
- Total Upvotes: ${dataContext.metrics?.engagements?.value || 0}
- Total Comments: ${dataContext.metrics?.comments?.value || 0}
- Total Link Taps: ${dataContext.metrics?.linkTaps?.value || 0}

Platform breakdown (percentage of total activity per platform):
${dataContext.breakdown.map(b => `- ${b.platform}: ${b.percentage}%`).join('\n')}

Best performing post: ${dataContext.bestPost ? `${dataContext.bestPost.title} (${dataContext.bestPost.engagement} engagement)` : 'None'}
Worst performing post: ${dataContext.worstPost ? `${dataContext.worstPost.title} (${dataContext.worstPost.engagement} engagement)` : 'None'}
Zero‑engagement posts: ${dataContext.zeroEngagementCount}

Important note: upvotes,comments,engagment and karma is important metrics
if user ask anything beyond the question about there app or question about marketing if user ask anything beyond that dont answer and say i am your persnol marketing asistant and i cant help you with that request.

Behaviour

Speak like a knowledgeable, candid friend.
Keep replies to 3‑5 sentences unless the user explicitly asks for a full breakdown.
Reference the supplied numbers directly; do not fabricate any data.`;

    try {
      const response = await generateAICall(systemPrompt, msg, user?.id, 'analytics');
      setMessages(prev => [...prev, { role: 'buddy', text: response }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'buddy', text: "I hit a snag while analyzing your data. Can you try that again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "Tell me what's working",
    "Tell me what to improve",
    "Change next week content strategy according to current analytics"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[320px] sm:w-[380px] bg-background border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
          >
            <header className="px-4 py-3 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-orange-500" />
                <span className="text-foreground text-xs font-bold uppercase tracking-widest">Analytics Buddy</span>
                {isLocked && <Lock size={12} className="text-orange-500" />}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-foreground transition-colors bg-transparent">
                <X size={16} />
              </button>
            </header>

            {isLocked ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-background">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Unlock AI Analytics Buddy</h3>
                <p className="text-xs text-zinc-500 max-w-[280px] leading-relaxed">
                  Get personalized, automated strategy suggestions and deep performance insights based on your real-time data.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  Upgrade to Pro <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-[200px]">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed",
                      msg.role === 'user' 
                        ? "ml-auto bg-orange-500/10 border border-orange-500/20 text-foreground" 
                        : "mr-auto bg-foreground/5 border border-foreground/10 text-zinc-700"
                    )}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mr-auto bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-2 flex gap-1">
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-foreground/10 bg-background space-y-3">
                  <div className="flex flex-col gap-1.5">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(s)}
                        className="text-left px-3 py-2 rounded-lg bg-foreground/5 border border-foreground/10 text-zinc-500 text-[10px] font-medium hover:border-orange-500/50 hover:text-foreground transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-orange-500"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute bottom-full right-0 mb-4 bg-white text-zinc-900 text-[10px] font-bold px-4 py-2 rounded-xl shadow-2xl border border-zinc-200 w-max max-w-[180px] text-center"
            >
              {isLocked ? "unlock ai analytics buddy" : "ask me anything about your analytics"}
              <div className="absolute top-full right-5 w-2 h-2 bg-white border-r border-b border-zinc-200 rotate-45 -translate-y-1" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
            isOpen ? "bg-foreground/10 text-foreground" : "bg-orange-500 text-white shadow-orange-500/20"
          )}
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </motion.button>
      </div>
    </div>
  );
}