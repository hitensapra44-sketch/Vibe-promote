"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

export function useGrowthState() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['growth-state', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Fetch Core Progress & Tasks
      const [progressRes, tasksRes, leadsRes, repliesRes, postsRes, usageRes, accountsRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true }),
        supabase.from('audience_signals').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('audience_signals').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'replied'),
        supabase.from('social_posts').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_usage').select('count').eq('user_id', user.id).eq('feature', 'copilot').maybeSingle(),
        supabase.from('social_accounts').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const progress = progressRes.data || { onboarding_complete: false };
      const rawTasks = tasksRes.data || [];
      
      // Activity counts
      const counts = {
        leads: leadsRes.count || 0,
        replies: repliesRes.count || 0,
        posts: postsRes.count || 0,
        copilot: usageRes.data?.count || 0,
        accounts: accountsRes.count || 0,
        hasGoal: !!progress.goal_type
      };

      // 2. Compute Current Day
      let currentDay = 1;
      if (progress.sprint_start_date) {
        const start = new Date(progress.sprint_start_date);
        const now = new Date();
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        currentDay = Math.min(15, diffDays + 1);
      }

      // 3. Define/Compute Onboarding Tasks
      const onboardingTasks = [
        { id: 'goal', label: 'Set a growth goal', completed: counts.hasGoal, target: 1, current: counts.hasGoal ? 1 : 0, route: '/progress' },
        { id: 'leads', label: 'Find 5 opportunities', completed: counts.leads >= 5, target: 5, current: counts.leads, route: '/audience-spotter' },
        { id: 'action', label: 'Take your first action (Post or Reply)', completed: (counts.replies + counts.posts) >= 1, target: 1, current: (counts.replies + counts.posts), route: '/post-maker' },
        { id: 'connect', label: 'Connect an account (Recommended)', completed: counts.accounts >= 1, target: 1, current: counts.accounts, route: '/connected-accounts', optional: true }
      ];

      // Auto-complete onboarding if requirements met
      const requiredDone = onboardingTasks.filter(t => !t.optional).every(t => t.completed);
      if (requiredDone && !progress.onboarding_complete) {
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          onboarding_complete: true,
          sprint_start_date: new Date().toISOString()
        }, { onConflict: 'user_id' });
        // Recalculate or wait for invalidation
      }

      // 4. Compute Dynamic Tasks for Current Day
      // This maps static task keys to dynamic completion logic
      const getStatus = (task) => {
        const key = task.task_key;
        if (key.includes('goal_set')) return counts.hasGoal ? 'completed' : 'pending';
        if (key.includes('finder')) {
          // Logic: "Find 10 leads" -> need 10 leads
          const target = key.includes('d1') ? 10 : 5; 
          return counts.leads >= target ? 'completed' : 'pending';
        }
        if (key.includes('reply')) {
          const target = 5;
          return counts.replies >= target ? 'completed' : 'pending';
        }
        if (key.includes('post')) return counts.posts >= 1 ? 'completed' : 'pending';
        if (key.includes('copilot')) return counts.copilot >= 1 ? 'completed' : 'pending';
        if (key.includes('analytics') || key.includes('progress_check')) return 'pending'; // Manual check
        return task.status || 'pending';
      };

      const tasks = rawTasks.map(t => ({
        ...t,
        status: getStatus(t)
      }));

      return {
        onboardingComplete: progress.onboarding_complete,
        currentDay,
        counts,
        onboardingTasks,
        tasks: tasks.filter(t => t.day === currentDay),
        allTasks: tasks,
        progress
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60, // 1 minute
  });
}