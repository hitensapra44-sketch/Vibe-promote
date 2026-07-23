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

      // 1. Fetch Core Data
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
      
      const counts = {
        leads: leadsRes.count || 0,
        replies: repliesRes.count || 0,
        posts: postsRes.count || 0,
        copilot: usageRes.data?.count || 0,
        accounts: accountsRes.count || 0,
        hasGoal: !!progress.goal_type
      };

      // 2. Define Onboarding Checklist
      const onboardingTasks = [
        { id: 'goal', label: 'Set a growth goal', completed: counts.hasGoal, target: 1, current: counts.hasGoal ? 1 : 0, route: '/progress' },
        { id: 'leads', label: 'Find your first 3 leads', completed: counts.leads >= 3, target: 3, current: counts.leads, route: '/audience-spotter' },
        { id: 'action', label: 'Take your first action', completed: (counts.replies + counts.posts) >= 1, target: 1, current: (counts.replies + counts.posts), route: '/post-maker' },
        { id: 'connect', label: 'Connect an account', completed: counts.accounts >= 1, target: 1, current: counts.accounts, route: '/connected-accounts', optional: true }
      ];

      // 3. Handle Auto-Completion of Onboarding
      const requiredDone = onboardingTasks.filter(t => !t.optional).every(t => t.completed);
      let onboardingComplete = progress.onboarding_complete;
      let sprintStart = progress.sprint_start_date;

      if (requiredDone && !onboardingComplete) {
        onboardingComplete = true;
        sprintStart = new Date().toISOString();
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          onboarding_complete: true,
          sprint_start_date: sprintStart
        }, { onConflict: 'user_id' });
      }

      // 4. Day Calculation (Capped at 15)
      let currentDay = 1;
      if (sprintStart) {
        const start = new Date(sprintStart);
        const now = new Date();
        const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        currentDay = Math.min(15, diffDays + 1);
      }

      // 5. Compute Dynamic Tasks for Current Day
      const getStatus = (task) => {
        const key = task.task_key;
        if (key.includes('goal_set')) return counts.hasGoal ? 'completed' : 'pending';
        if (key.includes('finder')) {
          const target = key.includes('d1') ? 10 : 5; 
          return counts.leads >= target ? 'completed' : 'pending';
        }
        if (key.includes('reply')) return counts.replies >= 5 ? 'completed' : 'pending';
        if (key.includes('post')) return counts.posts >= 1 ? 'completed' : 'pending';
        if (key.includes('copilot')) return counts.copilot >= 1 ? 'completed' : 'pending';
        return task.status || 'pending';
      };

      const tasks = rawTasks.map(t => ({
        ...t,
        status: getStatus(t)
      }));

      return {
        onboardingComplete,
        currentDay,
        counts,
        onboardingTasks,
        tasks: tasks.filter(t => t.day === currentDay),
        allTasks: tasks,
        progress: {
          ...progress,
          onboarding_complete: onboardingComplete,
          sprint_start_date: sprintStart
        }
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60,
  });
}