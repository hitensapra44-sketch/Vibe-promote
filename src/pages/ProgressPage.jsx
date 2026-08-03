"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  Check, 
  Sparkles,
  Lock,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { markTaskComplete } from '../components/TaskWidget';
import { completeOnboardingTask } from '../lib/onboarding';
import { SEED_TASKS, autoMarkTask } from '../lib/tasks';

const GOAL_OPTIONS = [
  { type: 'users_100', label: 'Get first 100 users', target: 100 },
  { type: 'paying_100', label: 'Get first 100 paying users', target: 100 },
  { type: 'mrr_1000', label: 'Touch $1,000 MRR', target: 1000 },
  { type: 'rev_100', label: 'Get first $100 in revenue', target: 100 },
];

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);

  const fetchAllData = async () => {
    if (!user) return;
    try {
      const [progressRes, tasksRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true })
      ]);

      const prog = progressRes.data;
      const tasksData = tasksRes.data || [];
      
      const hasSprintTasks = tasksData.some(t => /^d\d+_/.test(t.task_key) || /_d\d+$/.test(t.task_key) || t.task_key.includes('_d'));
      
      if (prog?.goal_type && !hasSprintTasks) {
        console.log("[ProgressPage] Seeding tasks for user:", user.id);
        const { error: seedError } = await supabase
          .from('user_tasks')
          .upsert(
            SEED_TASKS.map(t => ({
              user_id: user.id,
              day: t.day,
              task_key: t.task_key,
              task_title: t.task_title,
              task_description: t.task_description,
              task_time: t.task_time,
              route: t.route,
              status: 'pending'
            })),
            { onConflict: 'user_id,task_key' }
          );
        
        if (seedError) {
          console.error("[ProgressPage] Seed upsert error:", seedError);
          toast.error(`Failed to seed tasks: ${seedError.message}`);
        } else {
          console.log("[ProgressPage] Seed successful");
          const { data: newTasks } = await supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true });
          setTasks(newTasks || []);
        }
      } else {
        setTasks(tasksData);
      }
      setProgress(prog);
      if (prog) {
        const start = new Date(prog.trial_start_date || prog.created_at);
        start.setHours(0,0,0,0);
        const now = new Date();
        now.setHours(0,0,0,0);
        const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const current = Math.max(1, Math.min(15, diff + 1));
        setExpandedDay(current);
      }
    } catch (err) {
      console.error("[ProgressPage] fetchAllData error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const currentDay = useMemo(() => {
    if (!progress) return 1;
    const start = new Date(progress.trial_start_date || progress.created_at);
    start.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(15, diff + 1));
  }, [progress]);

  const handleSetGoal = async () => {
    if (!selectedGoal) return;
    const today = new Date().toISOString().split('T')[0];
    const loadingToast = toast.loading("Starting your 15-day sprint...");
    
    try {
      const { error: progError } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        goal_type: selectedGoal.type,
        goal_label: selectedGoal.label,
        goal_target: selectedGoal.target,
        current_value: 0,
        trial_start_date: today
      }, { onConflict: 'user_id' });

      if (progError) {
        console.error("[ProgressPage] Goal upsert error:", progError);
        toast.error(`Failed to set goal: ${progError.message}`, { id: loadingToast });
        return;
      }

      const { error: seedError } = await supabase.from('user_tasks').upsert(
        SEED_TASKS.map(t => ({
          user_id: user.id,
          day: t.day,
          task_key: t.task_key,
          task_title: t.task_title,
          task_description: t.task_description,
          task_time: t.task_time,
          route: t.route,
          status: 'pending'
        })),
        { onConflict: 'user_id,task_key' }
      );

      if (seedError) {
        console.error("[ProgressPage] Seed upsert error (handleSetGoal):", seedError);
        toast.error(`Goal set, but tasks failed to load: ${seedError.message}`, { id: loadingToast });
      } else {
        await completeOnboardingTask(user.id, 'set_goal');
        toast.success("Sprint activated! Roadmap ready.", { id: loadingToast });
        fetchAllData();
      }
    } catch (err) {
      console.error("[ProgressPage] handleSetGoal critical error:", err);
      toast.error("An unexpected error occurred.", { id: loadingToast });
    }
  };

  const handleUpdateValue = async () => {
    const val = parseInt(updateValue);
    if (isNaN(val)) return;
    const newValue = (progress.current_value || 0) + val;
    const { error } = await supabase.from('user_progress').update({ current_value: newValue }).eq('user_id', user.id);
    
    if (error) {
      toast.error(`Update failed: ${error.message}`);
      return;
    }

    setProgress(prev => ({ ...prev, current_value: newValue }));
    setUpdateValue('');
    setIsUpdating(false);
    toast.success("Progress updated!");
    autoMarkTask(user.id, '/progress', 'Update');
  };

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center"><RefreshCw className="w-6 h-6 text-orange-500 animate-spin" /></div>;

  const groupedTasks = Array.from({ length: 15 }, (_, i) => ({
    day: i + 1,
    tasks: tasks.filter(t => t.day === i + 1)
  })).filter(g => g.tasks.length > 0);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 h-14 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center px-6 z-30 justify-between">
          <h1 className="text-sm font-bold text-zinc-900">15-Day Growth Sprint</h1>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold">{progress?.streak || 0} Day Streak</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto w-full p-8 space-y-12 pb-32">
          {!progress?.goal_type ? (
            <div className="animate-in fade-in duration-500">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Set your destination.</h2>
                <p className="text-zinc-500 mt-2">Pick a goal to unlock your 15-day marketing roadmap.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {GOAL_OPTIONS.map((goal) => (
                  <div 
                    key={goal.type}
                    onClick={() => setSelectedGoal(goal)}
                    className={cn(
                      "bg-white border-2 rounded-2xl p-6 transition-all cursor-pointer group",
                      selectedGoal?.type === goal.type ? "border-orange-500 bg-orange-50/50" : "border-slate-100 hover:border-orange-200"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                      selectedGoal?.type === goal.type ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400 group-hover:text-orange-500"
                    )}>
                      <Target className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">{goal.label}</h3>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSetGoal}
                disabled={!selectedGoal}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl disabled:opacity-50 border-none cursor-pointer"
              >
                Activate Sprint
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Progress Summary Card */}
              <div className="bg-zinc-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-1">Current Goal</span>
                    <h2 className="text-2xl font-bold">{progress.goal_label}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{progress.current_value}</span>
                    <span className="text-sm font-bold text-zinc-500 ml-1">/ {progress.goal_target}</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (progress.current_value / progress.goal_target) * 100)}%` }}
                    className="h-full bg-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="text-sm font-bold">Day {currentDay} of 15</span>
                  </div>
                  <button 
                    onClick={() => setIsUpdating(true)}
                    className="px-4 py-2 bg-white text-zinc-900 rounded-xl text-xs font-bold border-none cursor-pointer hover:bg-zinc-100 transition-all"
                  >
                    Update Progress
                  </button>
                </div>

                <AnimatePresence>
                  {isUpdating && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 pt-6 border-t border-white/10 flex gap-2">
                      <input 
                        type="number" autoFocus placeholder="+ amount" value={updateValue}
                        onChange={(e) => setUpdateValue(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white flex-1 focus:outline-none focus:border-orange-500"
                      />
                      <button onClick={handleUpdateValue} className="p-2 bg-orange-500 text-white rounded-lg border-none cursor-pointer"><Check className="w-5 h-5" /></button>
                      <button onClick={() => setIsUpdating(false)} className="p-2 bg-transparent text-zinc-500 border-none cursor-pointer">✕</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Roadmap List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">15-Day Roadmap</h3>
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Consistency is Key</span>
                </div>

                <div className="space-y-3">
                  {groupedTasks.map((group) => {
                    const isToday = group.day === currentDay;
                    const isPast = group.day < currentDay;
                    const isFuture = group.day > currentDay;
                    const isExpanded = expandedDay === group.day;
                    const allDone = group.tasks.every(t => t.status === 'completed');

                    return (
                      <div key={group.day} className={cn(
                        "border rounded-2xl overflow-hidden transition-all",
                        isToday ? "border-orange-200 ring-2 ring-orange-500/5 shadow-sm" : "border-slate-100",
                        isPast ? "bg-slate-50/50" : "bg-white"
                      )}>
                        <button 
                          onClick={() => setExpandedDay(isExpanded ? null : group.day)}
                          className="w-full flex items-center justify-between p-4 bg-transparent border-none cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                              isToday ? "bg-orange-500 text-white" : 
                              isPast ? (allDone ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-500") : 
                              "bg-slate-100 text-slate-400"
                            )}>
                              {allDone && isPast ? <Check className="w-4 h-4" /> : group.day}
                            </div>
                            <div>
                              <span className={cn(
                                "text-sm font-bold",
                                isToday ? "text-zinc-900" : "text-zinc-500"
                              )}>
                                Day {group.day} {isToday && "(Today)"}
                              </span>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                                {group.tasks.length} tasks • {group.tasks.filter(t => t.status === 'completed').length} done
                              </p>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-slate-50">
                              <div className="p-2 space-y-1">
                                {group.tasks.map((task) => {
                                  const isCompleted = task.status === 'completed';
                                  return (
                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group">
                                      <div className="flex gap-3 min-w-0">
                                        {isCompleted ? <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" /> : <Clock size={16} className="text-zinc-300 mt-0.5 flex-shrink-0" />}
                                        <div className="min-w-0">
                                          <p className={cn("text-sm font-medium", isCompleted ? "text-zinc-400 line-through" : "text-zinc-700")}>{task.task_title}</p>
                                          <p className="text-xs text-zinc-400 truncate">{task.task_description}</p>
                                        </div>
                                      </div>
                                      {!isCompleted && isToday && (
                                        <button 
                                          onClick={() => navigate(task.route)}
                                          className="px-3 py-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg border-none cursor-pointer shadow-sm hover:scale-105 transition-all"
                                        >
                                          Start
                                        </button>
                                      )}
                                      {!isCompleted && isFuture && (
                                        <Lock size={14} className="text-zinc-200" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}