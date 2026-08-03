"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Lock, ArrowRight } from 'lucide-react';
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

    const systemPrompt = `You are an expert growth strategist. Analyzed your app data: 
    Score: ${dataContext.growthScore}/100.
    Metric Highlights: ${JSON.stringify(dataContext.metrics)}.
    Context: Use the raw post data to give specific advice.`;

    try {
      const response = await generateAICall(systemPrompt, msg, user?.id, 'analytics');
      setMessages(prev => [...prev, { role: 'buddy', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'buddy', text: "I hit a snag. Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-[360px] sm:w-[400px] bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[600px] mb-2"
          >
            <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Growth Coach</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online Analysis</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none p-1 cursor-pointer">
                <X size={20} />
              </button>
            </header>

            {isLocked ? (
              <div className="p-8 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-[24px] bg-orange-100 flex items-center justify-center text-orange-500">
                  <Lock size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Unlock Strategy Insights</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Get detailed strategy suggestions and deep analysis of your performance patterns.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  Upgrade to Pro <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px]">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "ml-auto bg-orange-500 text-white rounded-br-none font-medium" 
                        : "mr-auto bg-slate-100 text-slate-700 rounded-bl-none font-medium"
                    )}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mr-auto bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything about your metrics..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none placeholder-slate-400 font-medium"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isTyping}
                      className="w-11 h-11 flex items-center justify-center bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50 border-none cursor-pointer"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-1/2 right-full mr-4 translate-y-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-xl"
            >
              Ask me anything about your growth
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
          className={cn(
            "w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-300 border-none cursor-pointer",
            isOpen ? "bg-slate-900 text-white rotate-90" : "bg-orange-500 text-white shadow-orange-500/30"
          )}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
}