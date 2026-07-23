"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Rocket, 
  Calendar, 
  Check,
  Loader2,
  Zap
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import Sidebar from '../components/Sidebar';
import { useGrowthState } from '../lib/useGrowthState';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const GOAL_OPTIONS = [
  { goal_type: 'users_100', goal_label: 'Get first 100 users', goal_target: 100 },
  { goal_type: 'paying_10', goal_label: 'Get first 10 paying users', goal_target: 10 },
  { goal_type: 'mrr_100', goal_label: 'Touch $100 MRR', goal_target: 100 }
];

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: state, isLoading } = useGrowthState();
  const [isSettingGoal, setIsSettingGoal] = useState(false);

  const handleSetGoal = async (goal) => {
    await supabase.from('user_progress').upsert({
      user_id: user.id,
      goal_type: goal.goal_type,
      goal_label: goal.goal_label,
      goal_target: goal.goal_target
    }, { onConflict: 'user_id' });
    
    queryClient.invalidateQueries({ queryKey: ['growth-state'] });
    setIsSettingGoal(false);
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />
      <main className="flex-1 min-w-0 overflow-y-auto p-8 sm:p-12">
        <div className="max-w-3xl mx-auto w-full">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold">Growth Sprints</h1>
              <p className="text-foreground/60 text-sm mt-1">
                {state?.onboardingComplete ? `Day ${state.currentDay} of 15` : 'Complete your setup to start the sprint.'}
              </p>
            </div>
            {state?.onboardingComplete && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-widest">
                <Rocket className="w-3.5 h-3.5" />
                Active Sprint
              </div>
            )}
          </div>

          {/* ONBOARDING STATE */}
          {!state?.onboardingComplete ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="p-8 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Finish Setup</h2>
                </div>
                
                <div className="space-y-3">
                  {state?.onboardingTasks.map((task) => (
                    <div 
                      key={task.id}
                      onClick={() => !task.completed && navigate(task.route)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                        task.completed ? "bg-green-500/5 border-green-500/20" : "bg-background border-foreground/5 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {task.completed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-foreground/20" />}
                        <span className={cn("text-sm font-medium", task.completed ? "text-green-600 line-through opacity-60" : "text-foreground")}>
                          {task.label}
                        </span>
                      </div>
                      {!task.completed && <ArrowRight className="w-4 h-4 text-foreground/20" />}
                    </div>
                  ))}
                </div>
              </section>

              <div className="p-6 rounded-xl border border-orange-500/30 bg-orange-500/[0.02] flex items-start gap-4">
                <Zap className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-foreground">Why complete setup?</h4>
                  <p className="text-xs text-foreground/60 leading-relaxed mt-1">
                    We only start your 15-day sprint once you've set a goal and found your first leads. This ensures every day has high-impact tasks waiting for you.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* SPRINT STATE */
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* GOAL WIDGET */}
              <div className="p-8 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold">{state.progress.goal_label}</h2>
                  </div>
                  <button onClick={() => setIsSettingGoal(true)} className="text-[10px] font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest bg-transparent">
                    Change Goal
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/40">
                    <span>Progress</span>
                    <span>{state.progress.current_value || 0} / {state.progress.goal_target}</span>
                  </div>
                  <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((state.progress.current_value || 0) / state.progress.goal_target) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DAILY TASKS */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <Calendar className="w-4 h-4 text-foreground/40" />
                  <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Day {state.currentDay} Focus</h3>
                </div>

                <div className="space-y-3">
                  {state.tasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div 
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-6 rounded-2xl border transition-all",
                          isDone ? "bg-green-500/5 border-green-500/20" : "bg-foreground/5 border-foreground/5"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center mt-0.5",
                            isDone ? "bg-green-500 text-white" : "border border-foreground/10"
                          )}>
                            {isDone && <Check className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className={cn("text-base font-bold", isDone && "opacity-40 line-through")}>{task.task_title}</h4>
                            <p className="text-xs text-foreground/50 mt-1 leading-relaxed max-w-md">{task.task_description}</p>
                          </div>
                        </div>
                        {!isDone && (
                          <button 
                            onClick={() => navigate(task.route)}
                            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-lg shadow-primary/10 whitespace-nowrap ml-4"
                          >
                            Go to Action
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Goal Modal */}
      <AnimatePresence>
        {isSettingGoal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background border border-foreground/10 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
              <h2 className="text-2xl font-bold">Pick your 15-day goal</h2>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(g => (
                  <button key={g.goal_type} onClick={() => handleSetGoal(g)} className="w-full text-left p-4 rounded-xl border border-foreground/5 hover:border-primary/50 transition-all font-bold text-sm bg-foreground/5">
                    {g.goal_label}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsSettingGoal(false)} className="w-full py-3 text-foreground/40 text-xs font-bold uppercase tracking-widest bg-transparent">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}