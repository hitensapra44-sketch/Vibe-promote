"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronUp, 
  ChevronDown, 
  ArrowRight, 
  Zap, 
  Target,
  Search,
  PenLine,
  Link2,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";

export const markTaskComplete = async (userId, taskKey, supabaseClient) => {
  const { error } = await supabaseClient
    .from('user_tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('task_key', taskKey);
  
  if (!error) {
    window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
  }
  return { error };
};

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [getStartedState, setGetStartedState] = useState({
    hasGoal: false,
    hasLeads: false,
    hasAction: false,
    hasAccount: false
  });

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [progressRes, tasksRes, leadsRes, postsRes, accountsRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true }),
        supabase.from('audience_signals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('social_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('social_accounts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      const prog = progressRes.data;
      setProgress(prog);
      setTasks(tasksRes.data || []);

      setGetStartedState({
        hasGoal: !!prog?.goal_type,
        hasLeads: (leadsRes.count || 0) >= 3,
        hasAction: (postsRes.count || 0) >= 1,
        hasAccount: (accountsRes.count || 0) >= 1
      });

      // Auto-open for new users
      if (!prog?.goal_type && !localStorage.getItem('vh_widget_closed')) {
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Widget data fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('vh_task_completed', fetchData);
    return () => window.removeEventListener('vh_task_completed', fetchData);
  }, [user]);

  const isGetStartedComplete = getStartedState.hasGoal && getStartedState.hasLeads && getStartedState.hasAction && getStartedState.hasAccount;

  // Day Calculation
  let currentDay = 1;
  if (progress?.sprint_start_date) {
    const start = new Date(progress.sprint_start_date);
    start.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    currentDay = Math.min(15, diff + 1);
  }

  const todayTasks = tasks.filter(t => t.day === currentDay);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;

  const getStartedItems = [
    { id: 'goal', title: 'Set a growth goal', desc: 'What are we aiming for?', icon: Target, done: getStartedState.hasGoal, path: '/progress' },
    { id: 'leads', title: 'Find opportunities', desc: 'Find 3+ potential users', icon: Search, done: getStartedState.hasLeads, path: '/audience-spotter' },
    { id: 'action', title: 'Take growth action', desc: 'Write your first post or reply', icon: PenLine, done: getStartedState.hasAction, path: '/post-maker' },
    { id: 'account', title: 'Connect an account', desc: 'Link Reddit or X for tracking', icon: Link2, done: getStartedState.hasAccount, path: '/connected-accounts' },
  ];

  if (loading || !user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[340px] bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[520px]"
          >
            {/* Header */}
            <header className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                {!isGetStartedComplete ? (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-zinc-900 text-sm font-bold">Get Started</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-zinc-900 text-sm font-bold block">Day {currentDay} of 15</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500" 
                          style={{ width: `${(completedToday / (todayTasks.length || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">{completedToday}/{todayTasks.length} Done</span>
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={() => { setIsOpen(false); localStorage.setItem('vh_widget_closed', 'true'); }}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1 bg-transparent border-none cursor-pointer"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {!isGetStartedComplete ? (
                // GET STARTED VIEW
                getStartedItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between group">
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                        item.done ? "bg-orange-50 text-orange-500" : "bg-slate-50 text-slate-400"
                      )}>
                        {item.done ? <Check className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className={cn("text-sm font-bold leading-tight", item.done ? "text-zinc-400" : "text-zinc-900")}>{item.title}</p>
                        <p className="text-[11px] text-zinc-500 mt-1 line-clamp-1">{item.desc}</p>
                      </div>
                    </div>
                    {!item.done && (
                      <button 
                        onClick={() => { navigate(item.path); setIsOpen(false); }}
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all flex items-center justify-center flex-shrink-0 bg-transparent border-none cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                // DAILY TASKS VIEW
                todayTasks.length > 0 ? (
                  todayTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div key={task.id} className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between hover:border-orange-200 transition-all">
                        <div className="flex gap-3 min-w-0">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 transition-all",
                            isDone ? "bg-orange-500" : "border-2 border-slate-200"
                          )}>
                            {isDone && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-sm font-bold leading-tight", isDone ? "text-zinc-400 line-through" : "text-zinc-900")}>{task.task_title}</p>
                            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{task.task_description}</p>
                          </div>
                        </div>
                        {!isDone && (
                          <button 
                            onClick={() => { navigate(task.route); setIsOpen(false); }}
                            className="text-[10px] font-bold text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all bg-transparent border-none cursor-pointer whitespace-nowrap ml-2"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-orange-500 mx-auto" />
                    <p className="text-sm font-bold text-zinc-900">All tasks clear for today!</p>
                    <p className="text-xs text-zinc-500 px-8">Great work. Your next set of growth tasks arrives tomorrow.</p>
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <footer className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
              <button 
                onClick={() => { navigate('/progress'); setIsOpen(false); }}
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-orange-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                View Full Progress →
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-orange-500 hover:border-orange-500 transition-all cursor-pointer relative"
      >
        {!isGetStartedComplete && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-bounce">!</span>
        )}
        {isOpen ? <ChevronDown className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}