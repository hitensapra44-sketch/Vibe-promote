"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Flame, 
  CheckSquare, 
  ArrowRight, 
  Loader2, 
  Plus, 
  Check, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GOAL_OPTIONS = [
  { type: 'users_100', label: 'Get first 100 users', target: 100 },
  { type: 'paying_10', label: 'Get first 10 paying users', target: 10 },
  { type: 'mrr_100', label: 'Touch $100 MRR', target: 100 },
  { type: 'consistency', label: 'Consistency in marketing', target: 0 }
];

const QUOTES = {
  1: "The first step is always the hardest. You took it.",
  2: "Two days in. Most people quit before they start.",
  3: "Consistency is not a trait. It is a decision.",
  4: "Four days of real work. That is more than most do in a month."
};

export default function ProgressPage() {
  const { user, plan } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [showDayCompleteModal, setShowDayCompleteModal] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);

  const fetchAllData = async () => {
    if (!user) return;
    try {
      const [progressRes, tasksRes, paymentRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true }),
        supabase.from('user_payments').select('payment_status').eq('email', user.email).maybeSingle()
      ]);

      if (paymentRes.data?.payment_status) setIsPaid(true);
      
      const tasksData = tasksRes.data || [];
      setTasks(tasksData);
      
      if (tasksData.length > 0) {
        const startDate = new Date(tasksData[0].created_at);
        startDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDay(Math.min(15, diffDays));
      }

      if (progressRes.data) {
        setProgress(progressRes.data);
      }
    } catch (err) {
      console.error('Error fetching progress data:', err);
    } finally {
      setIsInitialLoading(false);
      setIsLoading(false);
    }
  };

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Check for day completion
  useEffect(() => {
    if (tasks.length === 0) return;
    const todayTasks = tasks.filter(t => t.day === currentDay);
    if (todayTasks.length > 0 && todayTasks.every(t => t.status === 'completed')) {
      // Check if we already registered completion for today
      const todayDate = new Date().toISOString().split('T')[0];
      if (progress?.last_completed_date !== todayDate) {
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

      if (error) throw error;
      
      setProgress(prev => ({ ...prev, streak: newStreak, last_completed_date: todayDate }));
      setShowDayCompleteModal(true);
    } catch (err) {
      console.error('Failed to update streak:', err);
    }
  };

  const handleSetGoal = async () => {
    if (!selectedGoal) return;
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          goal_type: selectedGoal.type,
          goal_label: selectedGoal.label,
          goal_target: selectedGoal.target,
          current_value: 0
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      // Auto-complete the task if user is on day 1
      if (currentDay === 1) {
        const { markTaskComplete } = await import('../components/TaskWidget');
        await markTaskComplete(user.id, 'add_goal_d1', supabase);
      }
      
      fetchAllData();
      toast.success("Goal locked in! Let's get to work.");
    } catch (err) {
      toast.error("Failed to set goal.");
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
      toast.success("Progress updated! Keep going.");
    } catch (err) {
      toast.error("Failed to update progress.");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>;

  const todayTasks = tasks.filter(t => t.day === currentDay);
  const tomorrowTasks = tasks.filter(t => t.day === currentDay + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center px-6 z-30">
          <h1 className="text-sm font-bold text-white">My Progress</h1>
        </header>

        <div className="max-w-3xl mx-auto w-full p-8 space-y-12">
          {!progress?.goal_type ? (
            /* GOAL SELECTION */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-white mb-2">What are you working toward?</h2>
              <p className="text-sm text-gray-500 mb-8">Pick one. Your daily tasks are built around it.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {GOAL_OPTIONS.map((goal) => (
                  <div 
                    key={goal.type}
                    onClick={() => setSelectedGoal(goal)}
                    className={cn(
                      "bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all",
                      selectedGoal?.type === goal.type ? "border-orange-500 bg-orange-500/5" : "border-white/5 hover:border-orange-500/40"
                    )}
                  >
                    <h3 className="text-sm font-bold text-white">{goal.label}</h3>
                    {goal.type === 'consistency' && (
                      <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Auto-fills as you complete daily tasks</p>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSetGoal}
                disabled={!selectedGoal}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                Set My Goal
              </button>
            </div>
          ) : (
            /* MAIN PROGRESS CONTENT */
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* GOAL CARD */}
              <div className="bg-[#111111] border border-orange-500/40 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Current Goal</span>
                <h2 className="text-xl font-bold text-white mb-6">{progress.goal_label}</h2>

                {progress.goal_type !== 'consistency' ? (
                  <div className="space-y-4">
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (progress.current_value / progress.goal_target) * 100)}%` }}
                        className="h-full bg-orange-500"
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 font-bold">{progress.current_value} / {progress.goal_target}</span>
                      <div className="flex flex-col items-end">
                        <button 
                          onClick={() => setIsUpdating(!isUpdating)}
                          className="text-[10px] font-bold text-white border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all bg-transparent"
                        >
                          Update Progress
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isUpdating && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-2 overflow-hidden"
                        >
                          <div className="flex gap-2 items-center">
                            <input 
                              autoFocus
                              type="number" 
                              placeholder="How many today?"
                              value={updateValue}
                              onChange={(e) => setUpdateValue(e.target.value)}
                              className="bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-40 focus:outline-none focus:border-orange-500/50"
                            />
                            <button 
                              onClick={handleUpdateValue}
                              className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{progress.streak || 0}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">day streak</span>
                  </div>
                )}
              </div>

              {progress.goal_type !== 'consistency' && (
                <div>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mb-1">Streak</span>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {progress.streak || 0} days <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </h3>
                </div>
              )}

              {/* TODAY'S TASKS */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">Today's Tasks</span>
                <div className="grid gap-3">
                  {todayTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div key={task.id} className="bg-[#111111] border border-white/5 rounded-xl p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="flex gap-5 min-w-0">
                          <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all mt-1",
                            isDone ? "bg-orange-500" : "border border-white/10 bg-transparent"
                          )}>
                            {isDone && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-bold text-sm", isDone ? "text-gray-600 line-through" : "text-white")}>{task.task_title}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.task_description}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-6">
                          {isDone ? (
                            <span className="text-xs font-bold text-gray-600">Done</span>
                          ) : (
                            <button
                              onClick={() => navigate(task.route)}
                              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all"
                            >
                              Start Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOMORROW'S TASKS */}
              {currentDay < 15 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block">Tomorrow</span>
                  <div className="grid gap-3 opacity-40">
                    {tomorrowTasks.map((task) => (
                      <div key={task.id} className="bg-[#111111] border border-white/5 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex gap-5 min-w-0">
                          <div className="w-6 h-6 rounded-md border border-white/10 bg-transparent flex-shrink-0 mt-1" />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-white">{task.task_title}</p>
                            <p className="text-xs text-gray-500 mt-1">Available tomorrow.</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Locked</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckSquare className="w-5 h-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-white text-center">Day {currentDay} complete</h2>
              <p className="text-sm text-gray-500 text-center mt-1">{progress?.streak || 0} day streak</p>
              
              <p className="text-sm text-gray-400 italic mt-6 leading-relaxed text-center">
                "{QUOTES[currentDay] || QUOTES[4]}"
              </p>

              <button
                onClick={() => {
                  setShowDayCompleteModal(false);
                  if (progress?.goal_type !== 'consistency') setIsUpdating(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl mt-8 shadow-lg shadow-orange-500/20"
              >
                Update your progress
              </button>
              
              <p 
                onClick={() => setShowDayCompleteModal(false)}
                className="text-xs text-gray-600 text-center mt-4 cursor-pointer hover:text-gray-400 transition-colors"
              >
                Come back tomorrow
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}