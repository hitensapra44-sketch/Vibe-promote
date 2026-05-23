"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';

const SEED_TASKS = [
  { day: 1, task_key: 'run_user_finder', task_title: 'Run User Finder', task_description: 'Scan Reddit for people already talking about the problem your product solves. Save the best posts to reply to later.', task_time: '~10 min', route: '/audience-spotter' },
  { day: 1, task_key: 'reddit_post_d1', task_title: 'Make a Reddit Post', task_description: 'Write a build in public post for r/buildingpublic using Post Maker. Use the Vulnerable Founder template.', task_time: '~15 min', route: '/post-maker' },
  { day: 1, task_key: 'x_post_d1', task_title: 'Generate an X Post', task_description: 'Generate a hook-format X post using Post Maker. Copy it and post it yourself.', task_time: '~5 min', route: '/post-maker' },
  { day: 1, task_key: 'connect_reddit', task_title: 'Connect Your Reddit Account', task_description: 'Connect your Reddit account so your replies feel native and build real karma.', task_time: '~3 min', route: '/connected-accounts' },

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

      setTasks(data);

      // Calculate current day based on first task's created_at
      const firstTask = data[0];
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
            className="w-80 bg-[#111111] border border-white/5 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 pb-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Day {currentDay} of 4</span>
                <button 
                  onClick={toggleOpen}
                  className="text-gray-500 hover:text-white bg-transparent border-none p-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full bg-white/5 h-0.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Task List */}
            <div className="p-4 flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-hide">
              {todaysTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={cn(
                        "w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        isCompleted ? "bg-orange-500" : "border border-white/10 bg-transparent"
                      )}>
                        {isCompleted && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs font-bold text-white truncate",
                          isCompleted && "text-gray-600 line-through"
                        )}>
                          {task.task_title}
                        </p>
                        <span className="text-[10px] text-gray-600 block mt-0.5">{task.task_time}</span>
                      </div>
                    </div>
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          navigate(task.route);
                          toggleOpen();
                        }}
                        className="text-[10px] font-bold text-orange-500 bg-transparent border-none hover:text-orange-400 p-0 cursor-pointer flex-shrink-0"
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
            <div className="p-4 pt-3 pb-3 bg-[#161616] flex items-center justify-between">
              {hasIncomplete ? (
                <span className="text-[10px] text-gray-600">{completedCount} of {totalCount} done today</span>
              ) : (
                <span className="text-[10px] text-orange-500 font-bold">Come back tomorrow</span>
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
          className="w-10 h-10 rounded-full bg-[#111111] border border-orange-500/40 flex items-center justify-center relative shadow-lg cursor-pointer"
        >
          <CheckSquare className="w-4 h-4 text-orange-500" />
          {hasIncomplete && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-[#111111]" />
          )}
        </motion.button>
      )}
    </div>
  );
}