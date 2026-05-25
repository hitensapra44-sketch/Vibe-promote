"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, X, Check, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";

const SEED_TASKS = [
  { day: 1, task_key: 'run_user_finder', task_title: 'Run User Finder', task_description: 'Scan Reddit for people already talking about the problem your product solves. Save the best posts to reply to later.', task_time: '~10 min', route: '/audience-spotter' },
  { day: 1, task_key: 'reddit_post_d1', task_title: 'Make a Reddit Post', task_description: 'Write a build in public post for r/buildingpublic using Post Maker. Use the Vulnerable Founder template.', task_time: '~15 min', route: '/post-maker' },
  { day: 1, task_key: 'x_post_d1', task_title: 'Generate an X Post', task_description: 'Generate a hook-format X post using Post Maker. Copy it and post it yourself.', task_time: '~5 min', route: '/post-maker' },
  { day: 1, task_key: 'connect_reddit', task_title: 'Connect Your Reddit Account', task_description: 'Connect your Reddit account so your replies feel native and build real karma.', task_time: '~3 min', route: '/connected-accounts' },
  { day: 1, task_key: 'add_goal', task_title: 'Add your first marketing goal', task_description: 'Add a marketing goal you want to achieve this month and it will track every progress.', task_time: '~3 min', route: '/progress' },

  { day: 2, task_key: 'reply_posts_d2', task_title: 'Reply to Saved Posts', task_description: 'Go to User Finder and reply to the posts you saved yesterday using the suggested replies.', task_time: '~15 min', route: '/audience-spotter' },
  { day: 2, task_key: 'reddit_post_d2', task_title: 'Make a Reddit Post', task_description: 'Write a problem/solution post for your top extracted subreddit using the Contrarian Insight template.', task_time: '~15 min', route: '/post-maker' },
  { day: 2, task_key: 'x_post_d2', task_title: 'Generate an X Post', task_description: 'Generate a problem awareness format X post using Post Maker. Copy it and post it yourself.', task_time: '~5 min', route: '/post-maker' },

  { day: 3, task_key: 'reply_posts_d3', task_title: 'Reply to Saved Posts', task_description: 'Open User Finder and reply to any new posts that have come in since yesterday.', task_time: '~15 min', route: '/audience-spotter' },
  { day: 3, task_key: 'reddit_post_d3', task_title: 'Make a Reddit Post', task_description: 'Write a milestone or win post for r/indiehackers using the Transparent Numbers template.', task_time: '~15 min', route: '/post-maker' },
  { day: 3, task_key: 'x_post_d3', task_title: 'Generate an X Post', task_description: 'Generate a social proof format X post using Post Maker. Copy it and post yourself.', task_time: '~5 min', route: '/post-maker' },

  { day: 4, task_key: 'reply_posts_d4', task_title: 'Reply to Saved Posts', task_description: 'Open User Finder and reply to any remaining saved posts before your trial ends.', task_time: '~15 min', route: '/audience-spotter' },
  { day: 4, task_key: 'reddit_post_d4', task_title: 'Make a Reddit Post', task_description: 'Write a launch or CTA post for your top extracted subreddit using the Deep Useful Breakdown template.', task_time: '~15 min', route: '/post-maker' },
  { day: 4, task_key: 'x_post_d4', task_title: 'Generate an X Post', task_description: 'Generate a launch format X post using Post Maker. Copy it and post yourself.', task_time: '~5 min', route: '/post-maker' },
  { day: 4, task_key: 'check_analytics', task_title: 'Check Analytics + Ask Marketing Buddy', task_description: 'Open Analytics to see what got traction, then ask Marketing Buddy what to improve and what to stop.', task_time: '~10 min', route: '/dashboard/results-tracker' }
];

export async function markTaskComplete(userId, taskKey, supabaseClient) {
  if (!userId || !taskKey || !supabaseClient) return;
  try {
    const { error } = await supabaseClient
      .from('user_tasks')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('task_key', taskKey);
    if (error) {
      console.error('Error marking task complete:', error);
    } else {
      window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));
    }
  } catch (err) {
    console.error('Error in markTaskComplete:', err);
  }
}

export default function TaskWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed tasks
        const seededTasks = SEED_TASKS.map(t => ({
          ...t,
          user_id: user.id,
          status: 'pending'
        }));
        const { error: seedError } = await supabase
          .from('user_tasks')
          .insert(seededTasks);
        if (seedError) throw seedError;
        fetchTasks();
        return;
      }

      // Deduplicate tasks by task_key to prevent duplicates
      const uniqueTasks = Array.from(new Map(data.map(t => [t.task_key, t])).values());
      setTasks(uniqueTasks);

      // Calculate current day based on first task's created_at
      const firstTask = uniqueTasks[0];
      if (firstTask && firstTask.created_at) {
        const firstDate = new Date(firstTask.created_at);
        firstDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(4, diffDays + 1));
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  useEffect(() => {
    const handleTaskCompleted = () => {
      fetchTasks();
    };
    window.addEventListener('vh_task_completed', handleTaskCompleted);
    return () => {
      window.removeEventListener('vh_task_completed', handleTaskCompleted);
    };
  }, [fetchTasks]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastDay = localStorage.getItem('vh_widget_last_day');
    if (lastDay !== todayStr) {
      localStorage.setItem('vh_widget_last_day', todayStr);
      localStorage.setItem('vh_widget_open', 'true');
      setIsOpen(true);
    } else {
      const storedOpen = localStorage.getItem('vh_widget_open');
      setIsOpen(storedOpen === 'true');
    }
  }, []);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    localStorage.setItem('vh_widget_open', String(nextState));
  };

  if (!user || loading) return null;

  const todaysTasks = tasks.filter(t => t.day === currentDay);
  const completedCount = todaysTasks.filter(t => t.status === 'completed').length;
  const totalCount = todaysTasks.length;
  const hasIncomplete = completedCount < totalCount;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-poppins">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-4 flex flex-col gap-3 bg-[#161616]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-white">Day {currentDay} Marketing Plan</span>
                </div>
                <button 
                  onClick={toggleOpen}
                  className="text-gray-500 hover:text-white bg-transparent border-none p-1 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Daily Progress</span>
                  <span className="font-bold text-orange-500">{completedCount} of {totalCount} completed</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Task List */}
            <div className="p-5 flex flex-col gap-4 max-h-[320px] overflow-y-auto scrollbar-hide bg-[#111111]">
              {todaysTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        isCompleted ? "bg-orange-500" : "border-2 border-white/20 bg-transparent"
                      )}>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className={cn(
                          "text-sm font-bold text-white leading-snug",
                          isCompleted && "text-zinc-500 line-through"
                        )}>
                          {task.task_title}
                        </p>
                        <p className={cn(
                          "text-xs text-zinc-400 leading-relaxed",
                          isCompleted && "text-zinc-600"
                        )}>
                          {task.task_description}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.task_time}</span>
                        </div>
                      </div>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          navigate(task.route);
                          toggleOpen();
                        }}
                        className="text-xs font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg transition-all flex-shrink-0 self-center"
                      >
                        Start
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-white/5" />

            {/* Footer */}
            <div className="p-5 bg-[#161616] flex items-center justify-between">
              {hasIncomplete ? (
                <span className="text-xs text-zinc-400">Complete today's tasks to build your streak!</span>
              ) : (
                <span className="text-xs text-orange-500 font-bold leading-relaxed flex items-center gap-1.5">
                  ✨ Today's marketing is done! Go build your app.
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Closed State Icon */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={toggleOpen}
          className="w-14 h-14 rounded-full bg-[#111111] border-2 border-orange-500/50 flex items-center justify-center relative shadow-2xl cursor-pointer"
        >
          <CheckSquare className="w-6 h-6 text-orange-500" />
          {hasIncomplete && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-[#111111]" />
          )}
        </motion.button>
      )}
    </div>
  );
}