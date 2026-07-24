"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  CheckSquare, 
  ArrowRight, 
  Loader2, 
  Plus, 
  Check, 
  Sparkles,
  Lock,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GOAL_OPTIONS = [
  { type: 'users_100', label: 'Get first 100 users', target: 100 },
  { type: 'paying_100', label: 'Get first 100 paying users', target: 100 },
  { type: 'mrr_1000', label: 'Touch $1,000 MRR', target: 1000 },
  { type: 'rev_100', label: 'Get first $100 in revenue', target: 100 },
  { type: 'consistency', label: 'Consistency in marketing', target: 0, locked: true }
];

const QUOTES = [
  "Consistency beats intensity every single time.",
  "You don't need a marketing team. You need a system.",
  "One helpful reply is worth 100 cold emails.",
  "Marketing is just being helpful to the right people.",
  "Build in public, grow in private."
];

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [showDayCompleteModal, setShowDayCompleteModal] = useState(false);
  const [activeQuote, setActiveQuote] = useState(QUOTES[0]);

  const fetchAllData = async () => {
    if (!user) return;
    try {
      const [progressRes, tasksRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true })
      ]);

      const prog = progressRes.data;
      const tasksData = tasksRes.data || [];
      
      setProgress(prog);
      setTasks(tasksData);
      
      // Random quote for modal
      setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Shared Day Logic
  let currentDay = 1;
  if (progress?.sprint_start_date) {
    const start = new Date(progress.sprint_start_date);
    start.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    currentDay = Math.min(15, diff + 1);
  }

  // Check for day completion to trigger modal
  useEffect(() => {
    if (!tasks.length || !progress) return;
    const todayTasks = tasks.filter(t => t.day === currentDay);
    if (todayTasks.length > 0 && todayTasks.every(t => t.status === 'completed')) {
      const todayDate = new Date().toISOString().split('T')[0];
      if (progress.last_completed_date !== todayDate) {
        handleDayComplete();
      }
    }
  }, [tasks, currentDay, progress]);

  const handleDayComplete = async () => {
    const todayDate = new Date().toISOString().split('T')[0];
    const newStreak = (progress?.streak || 0) + 1;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          streak: newStreak,
          last_completed_date: todayDate
        }, { onConflict: 'user_id' });

      if (!error) {
        setProgress(prev => ({ ...prev, streak: newStreak, last_completed_date: todayDate }));
        setShowDayCompleteModal(true);
      }
    } catch (err) {
      console.error('Failed to update streak:', err);
    }
  };

  const handleSetGoal = async () => {
    if (!selectedGoal) return;
    const now = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          goal_type: selectedGoal.type,
          goal_label: selectedGoal.label,
          goal_target: selectedGoal.target,
          current_value: 0,
          sprint_start_date: now
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      toast.success("Goal locked in! Let's get to work.");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to set goal.");
    }
  };

  const handleResetGoal = async () => {
    if (!window.confirm("Are you sure you want to change your goal? Your current progress on this goal will be reset.")) return;
    
    try {
      const { error } = await supabase
        .from('user_progress')
        .update({ 
          goal_type: null, 
          goal_label: null, 
          goal_target: null, 
          current_value: 0 
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProgress(prev => ({ ...prev, goal_type: null }));
      toast.success("Goal cleared. Choose a new destination.");
    } catch (err) {
      toast.error("Failed to reset goal.");
    }
  };

  const handleUpdateValue = async () => {
    const val = parseInt(updateValue);
    if (isNaN(val)) return;

    try {
      const newValue = (progress.current_value || 0) + val;
      const { error } = await supabase
        .from('user_progress')
        .update({ current_value: newValue })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProgress(prev => ({ ...prev, current_value: newValue }));
      setUpdateValue('');
      setIsUpdating(false);
      toast.success("Progress updated!");
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  if (isInitialLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>;

  const todayTasks = tasks.filter(t => t.day === currentDay);
  const tomorrowTasks = tasks.filter(t => t.day === currentDay + 1);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 h-14 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center px-6 z-30 justify-between">
          <h1 className="text-sm font-bold text-zinc-900">Growth Progress</h1>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold">{progress?.streak || 0} Day Streak</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto w-full p-8 space-y-12 pb-32">
          {!progress?.goal_type ? (
            /* STEP 1: GOAL SELECTION */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Pick your destination.</h2>
                <p className="text-zinc-500 mt-2">Choose the primary metric you want to grow. We'll track it alongside your consistency streak.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {GOAL_OPTIONS.map((goal) => (
                  <div 
                    key={goal.type}
                    onClick={() => !goal.locked && setSelectedGoal(goal)}
                    className={cn(
                      "bg-white border-2 rounded-2xl p-6 transition-all relative group",
                      goal.locked ? "opacity-60 grayscale cursor-not-allowed border-slate-100" :
                      selectedGoal?.type === goal.type ? "border-orange-500 bg-orange-50/50 ring-4 ring-orange-500/10" : "border-slate-100 hover:border-orange-200 cursor-pointer"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        selectedGoal?.type === goal.type ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500"
                      )}>
                        {goal.locked ? <Lock className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">{goal.label}</h3>
                    {goal.locked && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Automatic Tracking</p>}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSetGoal}
                disabled={!selectedGoal}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 text-base"
              >
                Let's Start Growing
              </button>
            </div>
          ) : (
            /* STEP 2: MAIN PROGRESS CONTENT */
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* GOAL CARD */}
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] block mb-2">Primary Goal</span>
                    <h2 className="text-2xl font-black text-zinc-900">{progress.goal_label}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-zinc-900">{progress.current_value}</span>
                    <span className="text-sm font-bold text-zinc-400 ml-1">/ {progress.goal_target}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (progress.current_value / progress.goal_target) * 100)}%` }}
                      className="h-full bg-orange-500"
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span className="text-sm font-bold text-zinc-900">{progress.streak || 0} day streak</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!isUpdating ? (
                        <>
                          <button 
                            onClick={handleResetGoal}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all bg-transparent flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Change Goal
                          </button>
                          <button 
                            onClick={() => setIsUpdating(true)}
                            className="px-5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all border-none cursor-pointer"
                          >
                            Update Progress
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-2 items-center animate-in slide-in-from-right-2 duration-300">
                          <input 
                            autoFocus
                            type="number" 
                            placeholder="+ Today's count"
                            value={updateValue}
                            onChange={(e) => setUpdateValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateValue()}
                            className="bg-slate-50 border-2 border-orange-200 rounded-xl px-4 py-2 text-sm text-zinc-900 w-36 focus:outline-none focus:border-orange-500"
                          />
                          <button 
                            onClick={handleUpdateValue}
                            className="p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all border-none cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setIsUpdating(false)}
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-600 ml-2 bg-transparent border-none cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* TODAY'S TASKS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Today's Tasks</h3>
                  <span className="text-xs font-bold text-zinc-400">Day {currentDay}</span>
                </div>
                <div className="grid gap-3">
                  {todayTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div key={task.id} className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex items-center justify-between group hover:border-orange-200 transition-all">
                        <div className="flex gap-5 min-w-0">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all mt-1",
                            isDone ? "bg-orange-500 text-white" : "border-2 border-slate-200 text-transparent"
                          )}>
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-bold text-base", isDone ? "text-zinc-300 line-through" : "text-zinc-900")}>{task.task_title}</p>
                            <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{task.task_description}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-6">
                          {isDone ? (
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-zinc-300">
                               <Check className="w-5 h-5" />
                            </div>
                          ) : (
                            <button
                              onClick={() => navigate(task.route)}
                              className="px-6 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all border-none cursor-pointer"
                            >
                              Start
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOMORROW'S TASKS */}
              {currentDay < 15 && tomorrowTasks.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Locked Content</h3>
                  <div className="grid gap-3 opacity-50">
                    {tomorrowTasks.map((task) => (
                      <div key={task.id} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-between">
                        <div className="flex gap-5 min-w-0">
                          <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex-shrink-0 mt-1" />
                          <div className="min-w-0">
                            <p className="font-bold text-base text-zinc-400">{task.task_title}</p>
                            <p className="text-sm text-zinc-400 mt-1">Available tomorrow.</p>
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <Lock className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* DAY COMPLETE MODAL */}
      <AnimatePresence>
        {showDayCompleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-slate-100 rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/20">
                <Check className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-zinc-900">Day {currentDay} complete! 🔥</h2>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">{progress?.streak || 0} day streak</p>
              
              <div className="my-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-zinc-600 text-sm leading-relaxed relative">
                 <span className="absolute -top-3 left-6 text-4xl text-orange-200 font-serif leading-none">“</span>
                 {activeQuote}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowDayCompleteModal(false);
                    setIsUpdating(true);
                  }}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 border-none cursor-pointer text-base hover:bg-orange-600 transition-all"
                >
                  Update Progress Count
                </button>
                
                <button 
                  onClick={() => setShowDayCompleteModal(false)}
                  className="w-full py-4 bg-transparent text-zinc-400 font-bold rounded-xl border-none cursor-pointer text-sm hover:text-zinc-600 transition-all"
                >
                  Close & come back tomorrow
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}