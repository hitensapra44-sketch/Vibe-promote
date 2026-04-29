"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  MessageSquare, 
  Loader2, 
  Sparkles,
  X,
  Check,
  Zap,
  Copy,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Search
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAudienceSpotter } from '../hooks/useAudienceSpotter';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

export default function AudienceSpotter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('monitoring'); // 'monitoring' | 'keywords'
  const [filterStatus, setFilterStatus] = useState('new');
  const [filterIntent, setFilterIntent] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  
  const [brain, setBrain] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');

  const { signals, isLoading, startScan, updateSignalStatus } = useAudienceSpotter(user?.id);

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data } = await supabase.from('brand_brains').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        setBrain(data);
        setKeywords(data.pain_phrases?.split(',').map(k => k.trim()).filter(Boolean) || []);
        setSubreddits(data.primary_platform?.split(',').map(s => s.trim()).filter(Boolean) || []);
      }
    }
    fetchBrain();
  }, [user]);

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

  const handleCopyAndOpen = (signal) => {
    navigator.clipboard.writeText(signal.suggested_reply);
    toast.success("Suggested reply copied!");
    window.open(signal.post_url, '_blank');
  };

  const handleSaveConfig = async () => {
    const { error } = await supabase
      .from('brand_brains')
      .update({ 
        pain_phrases: keywords.join(', '),
        primary_platform: subreddits.join(', ')
      })
      .eq('user_id', user.id);
    
    if (error) toast.error("Failed to save configuration");
    else toast.success("Configuration saved!");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
          
          {/* Header */}
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
            <div className="flex bg-[#111111] border border-white/5 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('monitoring')}
                className={cn("px-6 py-2 text-xs font-bold rounded-md transition-all", activeTab === 'monitoring' ? "bg-primary text-white" : "text-[#52525B] hover:text-white")}
              >
                Monitoring
              </button>
              <button 
                onClick={() => setActiveTab('keywords')}
                className={cn("px-6 py-2 text-xs font-bold rounded-md transition-all", activeTab === 'keywords' ? "bg-primary text-white" : "text-[#52525B] hover:text-white")}
              >
                Keywords
              </button>
            </div>
          </div>

          {activeTab === 'monitoring' ? (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
                  <p className="text-[#52525B] text-[10px] font-bold uppercase tracking-widest mb-1">Pending Review</p>
                  <p className="text-2xl font-bold text-primary">{signals.filter(s => s.status === 'new').length}</p>
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
                  {['new', 'reviewed', 'dismissed'].map((status) => (
                    <button 
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all border",
                        filterStatus === status 
                          ? "bg-primary border-primary text-white" 
                          : "bg-white/5 border-white/5 text-[#52525B] hover:text-white"
                      )}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#52525B]" />
                    <select 
                      value={filterIntent} 
                      onChange={(e) => setFilterIntent(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer"
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
                      className="bg-transparent border-none text-xs font-bold text-white focus:ring-0 cursor-pointer"
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
                {isLoading && signals.length === 0 ? (
                  <div className="py-24 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-[#52525B]">Scanning for signals...</p>
                  </div>
                ) : filteredSignals.length === 0 ? (
                  <div className="py-24 text-center bg-[#111111] border border-white/5 rounded-2xl">
                    <Search className="w-12 h-12 text-[#52525B] mx-auto mb-4" />
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
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateSignalStatus({ id: signal.id, status: 'reviewed' })}
                              className="p-2 rounded-lg hover:bg-green-500/10 text-[#52525B] hover:text-green-500 transition-all bg-transparent"
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
            </>
          ) : (
            /* Keywords View */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Keywords Section */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Keywords to monitor</h3>
                    <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">{keywords.length} Active</span>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="e.g. marketing tool"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (setKeywords([...keywords, newKeyword]), setNewKeyword(''))}
                      className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                    <button 
                      onClick={() => { if(newKeyword) { setKeywords([...keywords, newKeyword]); setNewKeyword(''); } }}
                      className="p-2 rounded-lg bg-primary text-white"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((k, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium group">
                        {k}
                        <button onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))} className="text-[#52525B] hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subreddits Section */}
                <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Subreddits to monitor</h3>
                    <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">{subreddits.length} Active</span>
                  </div>
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="e.g. SaaS"
                      value={newSubreddit}
                      onChange={(e) => setNewSubreddit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (setSubreddits([...subreddits, newSubreddit]), setNewSubreddit(''))}
                      className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                    />
                    <button 
                      onClick={() => { if(newSubreddit) { setSubreddits([...subreddits, newSubreddit]); setNewSubreddit(''); } }}
                      className="p-2 rounded-lg bg-primary text-white"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subreddits.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium group">
                        r/{s}
                        <button onClick={() => setSubreddits(subreddits.filter((_, idx) => idx !== i))} className="text-[#52525B] hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 pt-8">
                <button 
                  onClick={handleSaveConfig}
                  className="px-10 py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-xl"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={() => { handleSaveConfig(); startScan(); setActiveTab('monitoring'); }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-10 py-4 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Scan for signals
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}