"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Target, 
  MessageSquare, 
  Twitter, 
  Globe, 
  Loader2, 
  Sparkles,
  ArrowLeft,
  X,
  Check,
  AlertCircle,
  Hash,
  Settings,
  Plus,
  ChevronRight,
  Zap,
  Copy,
  ExternalLink,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [view, setView] = useState('monitoring'); 
  const [filterStatus, setFilterStatus] = useState('new');
  const [filterIntent, setFilterIntent] = useState('all');
  const [sortBy, setSortBy] = useState('score'); // score, date, upvotes
  
  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);
  const navigate = useNavigate();

  const filteredSignals = useMemo(() => {
    let result = signals.filter(s => filterStatus === 'all' || s.status === filterStatus);
    if (filterIntent !== 'all') result = result.filter(s => s.intent_type === filterIntent);
    
    return result.sort((a, b) => {
      if (sortBy === 'score') return b.intent_score - a.intent_score;
      if (sortBy === 'date') return new Date(b.posted_at) - new Date(a.posted_at);
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      return 0;
    });
  }, [signals, filterStatus, filterIntent, sortBy]);

  const pendingCount = signals.filter(s => s.status === 'new').length;

  const handleCopyAndOpen = (signal) => {
    navigator.clipboard.writeText(signal.suggested_reply);
    toast.success("Suggested reply copied!");
    window.open(signal.post_url, '_blank');
  };

  if (isLoading && signals.length === 0) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Audience Spotter</h1>
                <p className="text-[#52525B] text-sm">Real-time high-intent buying signals.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => startScan()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-sm font-bold transition-all shadow-lg shadow-primary/20"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Scan for signals
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-primary">{pendingCount}</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Avg Intent Score</p>
              <p className="text-2xl font-bold text-white">
                {signals.length > 0 ? Math.round(signals.reduce((acc, s) => acc + s.intent_score, 0) / signals.length) : 0}%
              </p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Top Platform</p>
              <p className="text-2xl font-bold text-white">Reddit</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Total Signals</p>
              <p className="text-2xl font-bold text-white">{signals.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilterStatus('new')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", filterStatus === 'new' ? "bg-primary text-white" : "bg-white/5 text-[#52525B] hover:text-white")}
              >
                New ({pendingCount})
              </button>
              <button 
                onClick={() => setFilterStatus('reviewed')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", filterStatus === 'reviewed' ? "bg-primary text-white" : "bg-white/5 text-[#52525B] hover:text-white")}
              >
                Reviewed
              </button>
              <button 
                onClick={() => setFilterStatus('dismissed')}
                className={cn("px-4 py-1.5 rounded-full text-xs font-bold transition-all", filterStatus === 'dismissed' ? "bg-primary text-white" : "bg-white/5 text-[#52525B] hover:text-white")}
              >
                Dismissed
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#52525B]" />
                <select 
                  value={filterIntent} 
                  onChange={(e) => setFilterIntent(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white focus:ring-0"
                >
                  <option value="all">All Intents</option>
                  <option value="Seeking Recommendation">Recommendation</option>
                  <option value="Comparing Alternatives">Comparison</option>
                  <option value="Expressing Pain">Pain</option>
                  <option value="Switching Tools">Switching</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#52525B]" />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-white focus:ring-0"
                >
                  <option value="score">Intent Score</option>
                  <option value="date">Date</option>
                  <option value="upvotes">Upvotes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Signals List */}
          <div className="space-y-4 mb-12">
            {filteredSignals.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-[#52525B]" />
                </div>
                <h3 className="text-white font-bold mb-1">No signals found</h3>
                <p className="text-[#52525B] text-sm">Try scanning for new signals or changing your filters.</p>
              </div>
            ) : (
              filteredSignals.map((signal) => (
                <motion.div 
                  layout
                  key={signal.id}
                  className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs",
                          signal.platform === 'reddit' ? "bg-[#FF4500]" : "bg-[#FF6600]"
                        )}>
                          {signal.platform === 'reddit' ? 'r/' : 'HN'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">{signal.subreddit}</span>
                            <span className="text-[#52525B] text-xs">•</span>
                            <span className="text-[#52525B] text-xs">by u/{signal.author}</span>
                            <span className="text-[#52525B] text-xs">•</span>
                            <span className="text-[#52525B] text-xs">{new Date(signal.posted_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                              signal.intent_score > 70 ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                            )}>
                              {signal.intent_type} • {signal.intent_score}% Score
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateSignalStatus({ id: signal.id, status: 'dismissed' })}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-[#52525B] hover:text-red-500 transition-all bg-transparent"
                          title="Non Relevant"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateSignalStatus({ id: signal.id, status: 'reviewed' })}
                          className="p-2 rounded-lg hover:bg-green-500/10 text-[#52525B] hover:text-green-500 transition-all bg-transparent"
                          title="Mark Reviewed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-lg font-bold text-white mb-3 line-clamp-1">{signal.post_title}</h2>
                    <p className="text-[#A1A1AA] text-sm line-clamp-3 mb-6 leading-relaxed">{signal.post_body}</p>

                    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Suggested Reply</span>
                      </div>
                      <p className="text-white text-sm italic leading-relaxed">"{signal.suggested_reply}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[#52525B]">
                          <Zap className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{signal.upvotes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#52525B]">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{signal.comment_count}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopyAndOpen(signal)}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy & Open Post
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);