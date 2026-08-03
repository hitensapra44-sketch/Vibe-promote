"use client";

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

export function useGrowthState() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['growth-state', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Fetch all necessary data in parallel
      const [progressRes, tasksRes, usageRes, connectedRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true }),
        supabase.from('user_usage').select('count, feature').eq('user_id', user.id),
        supabase.from('social_accounts').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      const progress = progressRes.data || {};
      const rawTasks = tasksRes.data || [];
      const usageList = usageRes.data || [];
      
      const counts = {
        copilot: usageList.find(u => u.feature === 'copilot')?.count || 0,
        postMaker: usageList.find(u => u.feature === 'post_maker')?.count || 0,
        accounts: connectedRes.count || 0
      };

      // 2. Compute current day from trial_start_date (date they set their goal)
      let currentDay = 1;
      const startRef = progress.trial_start_date;
      if (startRef) {
        const start = new Date(startRef);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(now - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        currentDay = Math.min(15, diffDays + 1);
      }

      // 3. Map statuses
      // We removed the broken .includes() logic that was marking future days as done.
      // Now we only auto-complete core setup milestones.
      const tasks = rawTasks.map(t => {
        let status = t.status || 'pending';
        const key = t.task_key;

        // Auto-completion logic for core setup tasks only
        if (key === 'add_goal_d1' || key === 'setup_goal') {
          if (progress.goal_type) status = 'completed';
        } else if (key === 'connect_reddit' || key === 'connect_accounts') {
          if (counts.accounts >= 1) status = 'completed';
        }

        return { ...t, status };
      });

      const todayTasks = tasks.filter(t => t.day === currentDay);
      const isDayComplete = todayTasks.length > 0 && todayTasks.every(t => t.status === 'completed');

      return {
        currentDay,
        progress,
        tasks: todayTasks,
        allTasks: tasks,
        isDayComplete,
        counts
      };
    },
    enabled: !!user?.id,
    staleTime: 0,
  });
}