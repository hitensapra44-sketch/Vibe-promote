"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, X, Check, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { cn } from "@/lib/utils";

const SEED_TASKS = [
  // ── DAY 1 ──────────────────────────────────────────────────────
  {
    day: 1, task_key: 'goal_set_d1',
    task_title: 'Set One Growth Goal',
    task_description: 'Set one clear 15-day outcome for this sprint: more active users, more signups, or more conversions. Keep the goal specific so every task has a purpose.',
    route: '/progress'
  },
  {
    day: 1, task_key: 'finder_baseline_d1',
    task_title: 'Find 10 High-Intent Leads',
    task_description: 'Run User Finder and save 10 posts from people describing the exact pain your app solves. Prioritize recent posts, strong frustration, tool requests, and clear workflow problems.',
    route: '/audience-spotter'
  },
  {
    day: 1, task_key: 'reply_baseline_d1',
    task_title: 'Reply to 5 Saved Leads',
    task_description: 'Reply to 5 saved posts inside User Finder. Be genuinely helpful, solve the problem first, and mention your product only if it fits naturally.',
    route: '/audience-spotter'
  },
  {
    day: 1, task_key: 'copilot_positioning_d1',
    task_title: 'Ask Co-Pilot What You Really Sell',
    task_description: 'Share your app, your current users, and the problem they have in common. Ask Co-Pilot for the clearest one-line positioning and the strongest pain language to use.',
    route: '/marketing-buddy'
  },

  // ── DAY 2 ──────────────────────────────────────────────────────
  {
    day: 2, task_key: 'finder_competitor_d2',
    task_title: 'Find Competitor Complaint Posts',
    task_description: 'Use User Finder to look for complaints about tools or workflows your users already use today. Save 10 posts from people who are clearly frustrated with current solutions.',
    route: '/audience-spotter'
  },
  {
    day: 2, task_key: 'reply_competitor_d2',
    task_title: 'Reply to 5 Competitor Complaint Posts',
    task_description: 'Reply inside User Finder with practical help, not a pitch. Solve the immediate issue, add context, and keep your product mention soft or absent.',
    route: '/audience-spotter'
  },
  {
    day: 2, task_key: 'post_problem_d2',
    task_title: 'Post the Problem, Not the Product',
    task_description: 'Create one short post that talks only about the pain, friction, or wasted time your users deal with. Keep it focused on the problem and avoid describing the tool itself.',
    route: '/post-maker'
  },
  {
    day: 2, task_key: 'analytics_baseline_d2',
    task_title: 'Check Your Starting Metrics',
    task_description: 'Open Analytics and note your current baseline: replies, clicks, signups, and where users seem to drop off. Write down one metric to improve first.',
    route: '/dashboard/results-tracker'
  },

  // ── DAY 3 ──────────────────────────────────────────────────────
  {
    day: 3, task_key: 'finder_icp_d3',
    task_title: 'Find Posts from Your Exact ICP',
    task_description: 'Run User Finder for your ideal customer profile, not just the problem. Save 10 posts from people who match the type of user you want most.',
    route: '/audience-spotter'
  },
  {
    day: 3, task_key: 'reply_icp_d3',
    task_title: 'Reply to 5 ICP Posts',
    task_description: 'Reply to 5 posts from your exact ICP. Focus on their workflow, tools, and pain points so your replies feel deeply relevant.',
    route: '/audience-spotter'
  },
  {
    day: 3, task_key: 'reddit_value_d3',
    task_title: 'Give Value on Reddit Without Pitching',
    task_description: 'Spend a short session leaving helpful comments on 3 relevant Reddit threads. Add useful context, answer questions, and do not mention your product unless asked.',
    route: '/audience-spotter'
  },
  {
    day: 3, task_key: 'copilot_message_d3',
    task_title: 'Refine Your Messaging with Co-Pilot',
    task_description: 'Share the language you saw in lead posts and ask Co-Pilot to tighten your message. Focus on the exact words users use to describe the problem.',
    route: '/marketing-buddy'
  },

  // ── DAY 4 ──────────────────────────────────────────────────────
  {
    day: 4, task_key: 'finder_recommendation_d4',
    task_title: 'Find Tool Recommendation Posts',
    task_description: 'Use User Finder to search for posts asking for a tool, alternative, recommendation, or solution. Save 10 posts where buying intent is obvious.',
    route: '/audience-spotter'
  },
  {
    day: 4, task_key: 'reply_recommendation_d4',
    task_title: 'Reply to 5 Recommendation Posts',
    task_description: 'Reply to 5 recommendation or alternative requests inside User Finder. Help first, compare options honestly, and only mention your app if it clearly fits.',
    route: '/audience-spotter'
  },
  {
    day: 4, task_key: 'post_user_voice_d4',
    task_title: 'Create a Post Using User Language',
    task_description: 'Write one post that uses the exact phrases users used to describe their problem. This should sound like the market, not like a founder pitch.',
    route: '/post-maker'
  },
  {
    day: 4, task_key: 'progress_check_d4',
    task_title: 'Check Goal Progress',
    task_description: 'Open Progress and compare what happened so far against your sprint goal. Note what is moving, what is flat, and what deserves more focus.',
    route: '/progress'
  },

  // ── DAY 5 ──────────────────────────────────────────────────────
  {
    day: 5, task_key: 'finder_frustration_d5',
    task_title: 'Find Frustration Posts',
    task_description: 'Search User Finder for people expressing frustration, annoyance, or slow manual workflows. Save 10 posts that show strong emotional pain.',
    route: '/audience-spotter'
  },
  {
    day: 5, task_key: 'reply_frustration_d5',
    task_title: 'Reply to 5 Frustration Posts',
    task_description: 'Reply to 5 frustration posts with empathy and a concrete fix or workaround. Make your reply feel like real support, not marketing.',
    route: '/audience-spotter'
  },
  {
    day: 5, task_key: 'analytics_first_pattern_d5',
    task_title: 'Look for Your First Winning Pattern',
    task_description: 'Open Analytics and check which searches, posts, or replies got the strongest response. Write down the pattern you should repeat next.',
    route: '/dashboard/results-tracker'
  },
  {
    day: 5, task_key: 'copilot_testimonial_d5',
    task_title: 'Ask Co-Pilot to Turn Feedback into Proof',
    task_description: 'Share a user comment, reply, or outcome with Co-Pilot. Ask it to help turn that into a short proof statement or testimonial draft.',
    route: '/marketing-buddy'
  },

  // ── DAY 6 ──────────────────────────────────────────────────────
  {
    day: 6, task_key: 'finder_new_keyword_d6',
    task_title: 'Search with a New Keyword',
    task_description: 'Run User Finder with a different keyword angle than before. Save 10 fresh posts so you keep widening your lead pool without losing relevance.',
    route: '/audience-spotter'
  },
  {
    day: 6, task_key: 'reply_new_keyword_d6',
    task_title: 'Reply to 5 Fresh Leads',
    task_description: 'Reply to 5 new posts from today’s search. Keep the replies specific to the user’s situation and avoid sounding repetitive.',
    route: '/audience-spotter'
  },
  {
    day: 6, task_key: 'reddit_value_d6',
    task_title: 'Spend a Short Session Helping on Reddit',
    task_description: 'Leave helpful comments on 3 Reddit threads related to your niche. Add value, answer clearly, and do not push your product.',
    route: '/audience-spotter'
  },
  {
    day: 6, task_key: 'post_case_study_d6',
    task_title: 'Post One Small User Win',
    task_description: 'Create a short post showing one real win, improvement, or useful outcome from a current user. Keep it honest and concrete.',
    route: '/post-maker'
  },

  // ── DAY 7 ──────────────────────────────────────────────────────
  {
    day: 7, task_key: 'analytics_week1_d7',
    task_title: 'Review Week 1 Results',
    task_description: 'Open Analytics and review what worked in the first 6 days. Identify the best community, the best keyword, and the best reply style.',
    route: '/dashboard/results-tracker'
  },
  {
    day: 7, task_key: 'copilot_week1_d7',
    task_title: 'Ask Co-Pilot What to Double Down On',
    task_description: 'Share your week-one learnings with Co-Pilot and ask what to repeat, what to stop, and what single change will improve results fastest.',
    route: '/marketing-buddy'
  },
  {
    day: 7, task_key: 'progress_week1_d7',
    task_title: 'Update Your Sprint Progress',
    task_description: 'Open Progress and record where you are against your 15-day goal. Make sure the next week is aligned with the strongest signals so far.',
    route: '/progress'
  },
  {
    day: 7, task_key: 'post_learnings_d7',
    task_title: 'Post What You Learned So Far',
    task_description: 'Write a transparent post about what users said, what surprised you, and what you changed. Keep it useful for other builders, not promotional.',
    route: '/post-maker'
  },

  // ── DAY 8 ──────────────────────────────────────────────────────
  {
    day: 8, task_key: 'finder_new_community_d8',
    task_title: 'Search a New Community',
    task_description: 'Use User Finder in a different subreddit or community than the one you used most. Save 10 relevant posts to test a fresh audience.',
    route: '/audience-spotter'
  },
  {
    day: 8, task_key: 'reply_new_community_d8',
    task_title: 'Reply to 5 Posts in the New Community',
    task_description: 'Reply to 5 leads from the new community and match the tone and language of that space. Be especially useful so people notice you.',
    route: '/audience-spotter'
  },
  {
    day: 8, task_key: 'post_howto_d8',
    task_title: 'Publish a Helpful How-To Post',
    task_description: 'Create one genuinely useful how-to post that teaches part of the workflow your app improves. Make it educational first and promotional second.',
    route: '/post-maker'
  },
  {
    day: 8, task_key: 'analytics_reply_quality_d8',
    task_title: 'Check Reply Quality in Analytics',
    task_description: 'Open Analytics and compare which replies led to comments, clicks, or deeper conversations. Note the wording that got the best response.',
    route: '/dashboard/results-tracker'
  },

  // ── DAY 9 ──────────────────────────────────────────────────────
  {
    day: 9, task_key: 'finder_buyer_mode_d9',
    task_title: 'Find Posts from People in Buyer Mode',
    task_description: 'Search User Finder for posts that show someone actively trying to solve the problem now. Prioritize urgency, comparison posts, and clear decision intent.',
    route: '/audience-spotter'
  },
  {
    day: 9, task_key: 'reply_buyer_mode_d9',
    task_title: 'Reply to 5 Buyer-Intent Posts',
    task_description: 'Reply inside User Finder to 5 posts with strong buying intent. Be direct, useful, and natural if you mention your app at all.',
    route: '/audience-spotter'
  },
  {
    day: 9, task_key: 'copilot_one_liner_d9',
    task_title: 'Sharpen Your One-Liner with Co-Pilot',
    task_description: 'Share your current homepage or app description with Co-Pilot and ask for a tighter one-liner that matches the best leads you’ve found.',
    route: '/marketing-buddy'
  },
  {
    day: 9, task_key: 'reddit_value_d9',
    task_title: 'Give Value in 3 Reddit Comments',
    task_description: 'Leave 3 helpful comments on Reddit without mentioning your product. Focus on giving an answer people would save or upvote.',
    route: '/audience-spotter'
  },

  // ── DAY 10 ─────────────────────────────────────────────────────
  {
    day: 10, task_key: 'analytics_midpoint_d10',
    task_title: 'Review Mid-Sprint Metrics',
    task_description: 'Open Analytics and compare your current results against Day 1. Look at signups, activation, and any signs that the messaging is improving.',
    route: '/dashboard/results-tracker'
  },
  {
    day: 10, task_key: 'progress_midpoint_d10',
    task_title: 'Check Mid-Sprint Goal Progress',
    task_description: 'Open Progress and update your sprint goal with the numbers you have now. Decide whether to keep pushing the same angle or sharpen it.',
    route: '/progress'
  },
  {
    day: 10, task_key: 'finder_best_community_d10',
    task_title: 'Go Back to the Best Community',
    task_description: 'Use User Finder in the community that has produced the strongest replies so far. Save 10 more high-intent posts from that space.',
    route: '/audience-spotter'
  },
  {
    day: 10, task_key: 'reply_best_community_d10',
    task_title: 'Reply to 5 Leads from Your Best Community',
    task_description: 'Reply to 5 posts from the community that is performing best. Reuse the reply structure that has been getting the best responses.',
    route: '/audience-spotter'
  },

  // ── DAY 11 ─────────────────────────────────────────────────────
  {
    day: 11, task_key: 'finder_launch_ready_d11',
    task_title: 'Find Launch-Ready Leads',
    task_description: 'Search for posts where people just asked for a solution, discovered a tool, or are close to making a decision. Save 10 launch-ready leads.',
    route: '/audience-spotter'
  },
  {
    day: 11, task_key: 'reply_launch_ready_d11',
    task_title: 'Reply to 5 Launch-Ready Leads',
    task_description: 'Reply to 5 launch-ready posts inside User Finder. Help them clearly, and only mention your app if it is a natural fit for what they asked.',
    route: '/audience-spotter'
  },
  {
    day: 11, task_key: 'post_user_story_d11',
    task_title: 'Publish a Real User Story',
    task_description: 'Create a post about one actual user, what they needed, and what changed after using your app. Keep it truthful and specific.',
    route: '/post-maker'
  },
  {
    day: 11, task_key: 'copilot_launch_angle_d11',
    task_title: 'Ask Co-Pilot for the Best Angle to Mention the Product',
    task_description: 'Share the best conversations you’ve had and ask Co-Pilot when and how the product should be mentioned so it feels natural instead of forced.',
    route: '/marketing-buddy'
  },

  // ── DAY 12 ─────────────────────────────────────────────────────
  {
    day: 12, task_key: 'analytics_friction_d12',
    task_title: 'Check Where Users Get Stuck',
    task_description: 'Open Analytics and look for drop-off, confusion, or friction in the first session. Write down the one biggest blocker to fix next.',
    route: '/dashboard/results-tracker'
  },
  {
    day: 12, task_key: 'finder_friction_d12',
    task_title: 'Find Posts About the Same Friction',
    task_description: 'Use User Finder to search for the exact friction point you saw in analytics. Save 10 posts that match the problem users keep hitting.',
    route: '/audience-spotter'
  },
  {
    day: 12, task_key: 'reply_friction_d12',
    task_title: 'Reply to 5 Friction Posts',
    task_description: 'Reply to 5 posts about the friction point you found. Your goal is to learn the language people use and help them in the thread.',
    route: '/audience-spotter'
  },
  {
    day: 12, task_key: 'copilot_onboarding_d12',
    task_title: 'Ask Co-Pilot to Improve the First Run',
    task_description: 'Share the friction you found and ask Co-Pilot how to make the first user experience clearer, faster, and easier to understand.',
    route: '/marketing-buddy'
  },

  // ── DAY 13 ─────────────────────────────────────────────────────
  {
    day: 13, task_key: 'finder_warm_followup_d13',
    task_title: 'Find Warm Follow-Up Leads',
    task_description: 'Use User Finder to revisit the type of posts that have already produced replies or interest. Save 10 warm leads that deserve follow-up energy.',
    route: '/audience-spotter'
  },
  {
    day: 13, task_key: 'reply_warm_followup_d13',
    task_title: 'Reply to Warm Leads Again',
    task_description: 'Reply to 5 warm posts from people who seem close to trying a solution. Keep the conversation going and stay helpful.',
    route: '/audience-spotter'
  },
  {
    day: 13, task_key: 'reddit_value_d13',
    task_title: 'Spend a Short Session Adding Value on Reddit',
    task_description: 'Leave helpful comments on 3 Reddit threads related to your niche. Do not pitch; just solve problems and build recognition.',
    route: '/audience-spotter'
  },
  {
    day: 13, task_key: 'progress_warm_d13',
    task_title: 'Update Your Progress with the Warmest Signals',
    task_description: 'Open Progress and note which leads, communities, and message angles are closest to conversion. Use that to focus the final days.',
    route: '/progress'
  },

  // ── DAY 14 ─────────────────────────────────────────────────────
  {
    day: 14, task_key: 'finder_final_push_d14',
    task_title: 'Find Final High-Intent Leads',
    task_description: 'Run User Finder one more time using the strongest keyword angle you have discovered. Save 10 of the most likely-to-convert posts.',
    route: '/audience-spotter'
  },
  {
    day: 14, task_key: 'reply_final_push_d14',
    task_title: 'Reply to 5 Final High-Intent Posts',
    task_description: 'Reply to 5 of the strongest leads from today’s search. Keep the reply sharp, human, and focused on solving the user’s problem.',
    route: '/audience-spotter'
  },
  {
    day: 14, task_key: 'post_trust_d14',
    task_title: 'Post a Trust-Building Update',
    task_description: 'Create a transparent update about what you learned, what worked, and what you changed. Honest progress posts build more trust than polished marketing.',
    route: '/post-maker'
  },
  {
    day: 14, task_key: 'copilot_next_sprint_d14',
    task_title: 'Ask Co-Pilot What to Repeat Next',
    task_description: 'Share the strongest findings from the sprint and ask Co-Pilot what to repeat in the next 15 days so the momentum compounds.',
    route: '/marketing-buddy'
  },

  // ── DAY 15 ─────────────────────────────────────────────────────
  {
    day: 15, task_key: 'analytics_final_d15',
    task_title: 'Review the Full Sprint Results',
    task_description: 'Open Analytics and compare the start and end of the 15-day sprint. Review replies, signups, activation, and the strongest message pattern.',
    route: '/dashboard/results-tracker'
  },
  {
    day: 15, task_key: 'results_post_d15',
    task_title: 'Post Your 15-Day Results',
    task_description: 'Write a transparent post sharing what you tried, what worked, what failed, and what numbers changed. This becomes a strong trust asset for future users.',
    route: '/post-maker'
  },
  {
    day: 15, task_key: 'copilot_next_15_d15',
    task_title: 'Plan the Next 15 Days with Co-Pilot',
    task_description: 'Share the full sprint results with Co-Pilot and ask what the next 15-day plan should focus on for more users and better conversion.',
    route: '/marketing-buddy'
  },
  {
    day: 15, task_key: 'goal_check_d15',
    task_title: 'Check Your Goal and Lock the Next One',
    task_description: 'Open Progress, review the goal you set on Day 1, and lock the next goal based on what actually moved during the sprint.',
    route: '/progress'
  }
];

export async function markTaskComplete(userId, taskKey, supabaseClient) {
  if (!userId || !taskKey) return;
  
  // Optimistically update local storage first
  try {
    const completedKeys = JSON.parse(localStorage.getItem(`vh_completed_tasks_${userId}`) || '[]');
    if (!completedKeys.includes(taskKey)) {
      completedKeys.push(taskKey);
      localStorage.setItem(`vh_completed_tasks_${userId}`, JSON.stringify(completedKeys));
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('vh_task_completed', { detail: { taskKey } }));

  if (supabaseClient) {
    try {
      await supabaseClient
        .from('user_tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('task_key', taskKey);
    } catch (err) {
      console.error('Error marking task complete in DB:', err);
    }
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
      // Try fetching from Supabase
      const { data, error } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      let finalTasks = [];
      let completedLocalKeys = [];
      try {
        completedLocalKeys = JSON.parse(localStorage.getItem(`vh_completed_tasks_${user.id}`) || '[]');
      } catch (e) {}

      if (!error && data && data.length > 0) {
        // Deduplicate tasks by task_key
        finalTasks = Array.from(new Map(data.map(t => [t.task_key, t])).values());
      } else {
        // Fallback to local seed tasks
        finalTasks = SEED_TASKS.map(t => ({
          ...t,
          id: t.task_key,
          user_id: user.id,
          status: completedLocalKeys.includes(t.task_key) ? 'completed' : 'pending'
        }));
      }

      // Sync with local storage completed tasks
      finalTasks = finalTasks.map(t => {
        if (completedLocalKeys.includes(t.task_key)) {
          return { ...t, status: 'completed' };
        }
        return t;
      });

      setTasks(finalTasks);

      // Calculate current day based on first task's created_at or default to 1
      const firstTask = finalTasks[0];
      if (firstTask && firstTask.created_at) {
        const firstDate = new Date(firstTask.created_at);
        firstDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(15, diffDays + 1));
      } else {
        setCurrentDay(1);
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
            className="w-[360px] bg-white border border-foreground/10 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div className="p-5 pb-4 flex flex-col gap-3 bg-foreground/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-bold text-foreground">Day {currentDay} Marketing Plan</span>
                </div>
                <button 
                  onClick={toggleOpen}
                  className="text-zinc-400 hover:text-foreground bg-transparent border-none p-1 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Daily Progress</span>
                  <span className="font-bold text-orange-500">{completedCount} of {totalCount} completed</span>
                </div>
                <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-foreground/10" />

            {/* Task List */}
            <div className="p-5 flex flex-col gap-4 max-h-[320px] overflow-y-auto scrollbar-hide bg-white">
              {todaysTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div key={task.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-foreground/5 border border-foreground/5 hover:border-foreground/10 transition-all">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        isCompleted ? "bg-orange-500" : "border-2 border-foreground/20 bg-transparent"
                      )}>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className={cn(
                          "text-sm font-bold text-foreground leading-snug",
                          isCompleted && "text-zinc-400 line-through"
                        )}>
                          {task.task_title}
                        </p>
                        <p className={cn(
                          "text-xs text-zinc-500 leading-relaxed",
                          isCompleted && "text-zinc-400"
                        )}>
                          {task.task_description}
                        </p>
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

            <div className="h-px bg-foreground/10" />

            {/* Footer */}
            <div className="p-5 bg-foreground/5 flex items-center justify-between">
              {hasIncomplete ? (
                <span className="text-xs text-zinc-500">Complete today's tasks to build your streak!</span>
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
          className="w-14 h-14 rounded-full bg-white border-2 border-orange-500/50 flex items-center justify-center relative shadow-2xl cursor-pointer"
        >
          <CheckSquare className="w-6 h-6 text-orange-500" />
          {hasIncomplete && (
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white" />
          )}
        </motion.button>
      )}
    </div>
  );
}