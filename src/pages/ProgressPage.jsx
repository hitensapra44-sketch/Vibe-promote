"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckSquare, Check, Lock, Sparkles, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import { cn } from "@/lib/utils";

const GOAL_OPTIONS = [
  { goal_type: 'users_100', goal_label: 'Get first 100 users', goal_target: 100 },
  { goal_type: 'paying_10', goal_label: 'Get first 10 paying users', goal_target: 10 },
  { goal_type: 'paying_50', goal_label: 'Get first 50 paying users', goal_target: 50 },
  { goal_type: 'mrr_100', goal_label: 'Touch $100 MRR', goal_target: 100 },
  { goal_type: 'mrr_1000', goal_label: 'Touch $1,000 MRR', goal_target: 1000 },
  { goal_type: 'newsletter_100', goal_label: 'Get 100 newsletter subscribers', goal_target: 100 },
  { goal_type: 'launch_ph', goal_label: 'Launch on Product Hunt', goal_target: 1 },
  { goal_type: 'consistency', goal_label: 'Consistency in marketing', goal_target: 0, sublabel: 'Auto-fills as you complete daily tasks' }
];

const QUOTES = {
  1: "The first step is always the hardest. You took it.",
  2: "Two days in. Most people quit before they start.",
  3: "Consistency is not a trait. It is a decision.",
  4: "Four days of real work. That is more than most do in a month."
};

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPaid, setIsPaid] = useState(false);
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showUpdateInput, setShowUpdateInput] = useState(false);
  const [updateValue, setUpdateValue] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const updateInputRef = useRef(null);

  const fetchProgressAndTasks = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch payment status
      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      if (paymentData?.payment_status) setIsPaid(true);

      // Fetch progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError) throw progressError;
      setProgress(progressData || { user_id: user.id, goal_type: null });

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;
      
      // Deduplicate tasks by task_key to prevent duplicates
      const uniqueTasks = Array.from(new Map((tasksData || []).map(t => [t.task_key, t])).values());
      setTasks(uniqueTasks);

      if (uniqueTasks.length > 0) {
        const firstTask = uniqueTasks[0];
        const firstDate = new Date(firstTask.created_at);
        firstDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(4, diffDays + 1));
      }
    } catch (err) {
      console.error('Error fetching progress/tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProgressAndTasks();
    }
  }, [user, fetchProgressAndTasks]);

  const todaysTasks = tasks.filter(t => t.day === currentDay);
  const tomorrowsTasks = tasks.filter(t => t.day === currentDay + 1);

  // Day complete modal trigger
  useEffect(() => {
    const triggerModal = async () => {
      if (todaysTasks.length > 0 && todaysTasks.every(t => t.status === 'completed')) {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (progress && progress.last_completed_date !== todayStr) {
          const newStreak = (progress.streak || 0) + 1;
          const { error } = await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              streak: newStreak,
              last_completed_date: todayStr
            }, { onConflict: 'user_id' });

          if (!error) {
            setProgress(prev => ({
              ...prev,
              streak: newStreak,
              last_completed_date: todayStr
            }));
            setShowCompleteModal(true);
          }
        }
      }
    };
    if (progress && tasks.length > 0) {
      triggerModal();
    }
  }, [tasks, progress, todaysTasks, user]);

  const handleSetGoal = async () => {
    if (!selectedGoal) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          goal_type: selectedGoal.goal_type,
          goal_label: selectedGoal.goal_label,
          goal_target: selectedGoal.goal_target,
          current_value: 0,
          streak: progress?.streak || 0
        }, { onConflict: 'user_id' });

      if (error) throw error;
      await fetchProgressAndTasks();
    } catch (err) {
      console.error('Error setting goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeGoal = async () => {
    setLoading(true);
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
      setProgress(prev => ({
        ...prev,
        goal_type: null,
        goal_label: null,
        goal_target: null,
        current_value: 0
      }));
      setSelectedGoal(null);
    } catch (err) {
      console.error('Error resetting goal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    const val = parseInt(updateValue, 10);
    if (isNaN(val)) return;
    setLoading(true);
    try {
      const newValue = (progress.current_value || 0) + val;
      const { error } = await supabase
        .from('user_progress')
        .update({ current_value: newValue })
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(prev => ({ ...prev, current_value: newValue }));
      setShowUpdateInput(false);
      setUpdateValue('');
    } catch (err) {
      console.error('Error updating progress:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const isGoalCompleted = progress?.goal_type && progress?.goal_type !== 'consistency' && (progress?.current_value || 0) >= (progress?.goal_target || 1);

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-foreground/5 bg-background flex items-center px-6 sticky top-0 z-30">
          <h1 className="text-sm font-bold text-foreground">My Progress</h1>
        </header>

        <div className="p-6 sm:p-8 max-w-3xl mx-auto w-full space-y-8 pb-24">
          {!progress || !progress.goal_type ? (
            /* Goal Selection Screen */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold text-foreground mb-2">What are you working toward?</h2>
              <p className="text-sm text-foreground/60 mb-8">Pick one. Your daily tasks are built around it.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {GOAL_OPTIONS.map((opt) => {
                  const isSelected = selectedGoal?.goal_type === opt.goal_type;
                  return (
                    <div
                      key={opt.goal_type}
                      onClick={() => setSelectedGoal(opt)}
                      className={cn(
                        "bg-foreground/5 border rounded-2xl p-6 cursor-pointer transition-all flex flex-col justify-between min-h-[120px]",
                        isSelected ? "border-orange-500 bg-orange-500/5" : "border-foreground/5 hover:border-orange-500/40"
                      )}
                    >
                      <span className="text-sm font-bold text-foreground">{opt.goal_label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-foreground/60 mt-2">{opt.sublabel}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSetGoal}
                disabled={!selectedGoal}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
              >
                Set My Goal
              </button>
            </div>
          ) : (
            /* Main Progress Page */
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Section 1: Goal Card */}
              <div className="bg-foreground/5 border border-orange-500/40 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest block mb-1">Current Goal</span>
                    <h2 className="text-xl font-bold text-foreground">
                      {isGoalCompleted ? "Congratulations, you did it! 🎉" : progress?.goal_label}
                    </h2>
                  </div>
                  <button
                    onClick={handleChangeGoal}
                    className="text-xs text-foreground/60 hover:text-foreground bg-transparent border border-foreground/10 rounded-lg px-3 py-1.5 transition-all"
                  >
                    Change Goal
                  </button>
                </div>

                {progress?.goal_type !== 'consistency' ? (
                  <div className="space-y-3">
                    <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, ((progress?.current_value || 0) / (progress?.goal_target || 1)) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-foreground/60">{progress?.current_value} / {progress?.goal_target}</span>
                      <button
                        onClick={() => {
                          setShowUpdateInput(!showUpdateInput);
                          setTimeout(() => updateInputRef.current?.focus(), 100);
                        }}
                        className="border border-foreground/10 text-xs text-foreground bg-transparent hover:bg-foreground/5 rounded-lg px-3 py-1.5 transition-all"
                      >
                        Update Progress
                      </button>
                    </div>

                    <AnimatePresence>
                      {showUpdateInput && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pt-2"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              ref={updateInputRef}
                              type="number"
                              placeholder="How many today?"
                              value={updateValue}
                              onChange={(e) => setUpdateValue(e.target.value)}
                              className="bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground w-40 focus:outline-none focus:border-orange-500"
                            />
                            <button
                              onClick={handleUpdateProgress}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs"
                            >
                              Confirm
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-foreground">{progress?.streak || 0}</span>
                    <span className="text-xs text-foreground/60 ml-2">day streak</span>
                  </div>
                )}
              </div>

              {/* Section 2: Streak (only for non-consistency goals) */}
              {progress?.goal_type !== 'consistency' && (
                <div>
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest block mb-1">Streak</span>
                  <span className="text-2xl font-bold text-foreground">{progress?.streak || 0} days</span>
                </div>
              )}

              {/* Section 3: Today's Tasks */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest block">Today's Tasks</span>
                <div className="space-y-3">
                  {todaysTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    return (
                      <div key={task.id} className="bg-foreground/5 border border-foreground/5 rounded-xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className={cn(
                            "w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                            isCompleted ? "bg-orange-500" : "border border-foreground/10 bg-transparent"
                          )}>
                            {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className={cn(
                              "text-sm font-bold text-foreground",
                              isCompleted && "text-foreground/60 line-through"
                            )}>
                              {task.task_title}
                            </h4>
                            <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{task.task_description}</p>
                          </div>
                        </div>
                        <div>
                          {!isCompleted ? (
                            <button
                              onClick={() => navigate(task.route)}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs whitespace-nowrap"
                            >
                              Start Now
                            </button>
                          ) : (
                            <span className="text-xs text-foreground/60 font-medium">Done</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Tomorrow's Tasks (locked) */}
              {currentDay < 4 && tomorrowsTasks.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest block">Tomorrow</span>
                  <div className="space-y-3 opacity-40">
                    {tomorrowsTasks.map((task) => (
                      <div key={task.id} className="bg-foreground/5 border border-foreground/5 rounded-xl p-5 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-5 h-5 rounded-sm border border-foreground/10 bg-transparent flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground">{task.task_title}</h4>
                            <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{task.task_description}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest whitespace-nowrap">Available tomorrow</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Day Complete Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-foreground/5 border border-foreground/5 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mt-4">Day {currentDay} complete</h3>
                <span className="text-sm text-foreground/60 mt-1">{progress?.streak || 0} day streak</span>
                <p className="text-sm text-foreground/60 italic mt-6 leading-relaxed">
                  "{QUOTES[currentDay] || "Consistency is the key to growth."}"
                </p>

                {progress?.goal_type !== 'consistency' ? (
                  <button
                    onClick={() => {
                      setShowCompleteModal(false);
                      setShowUpdateInput(true);
                      setTimeout(() => updateInputRef.current?.focus(), 300);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm mt-8 shadow-lg shadow-orange-500/20"
                  >
                    Update your progress
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCompleteModal(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm mt-8 shadow-lg shadow-orange-500/20"
                  >
                    Awesome
                  </button>
                )}

                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="text-xs text-foreground/60 text-center mt-4 cursor-pointer hover:text-foreground/80 bg-transparent border-none"
                >
                  Come back tomorrow
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}