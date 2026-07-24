"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

export function useGrowthState() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['growth-state', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // 1. Fetch all necessary data in parallel
      const [progressRes, tasksRes, leadsRes, repliesRes, postsRes, usageRes, brainRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_tasks').select('*').eq('user_id', user.id).order('day', { ascending: true }),
        supabase.from('audience_signals').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('audience_signals').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'replied'),
        supabase.from('social_posts').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_usage').select('count, feature').eq('user_id', user.id),
        supabase.from('brand_brains').select('audience_communities, audience_keywords').eq('user_id', user.id).maybeSingle()
      ]);

      const progress = progressRes.data || {};
      const rawTasks = tasksRes.data || [];
      const brain = brainRes.data || {};
      const usageList = usageRes.data || [];
      
      const counts = {
        leads: leadsRes.count || 0,
        replies: repliesRes.count || 0,
        posts: postsRes.count || 0,
        copilot: usageList.find(u => u.feature === 'copilot')?.count || 0,
        postMaker: usageList.find(u => u.feature === 'post_maker')?.count || 0
      };

      // 2. Compute current day from sprint_start_date
      let currentDay = 1;
      if (progress.sprint_start_date) {
        const start = new Date(progress.sprint_start_date);
        start.setHours(0, 0, 0, 0);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(now - start);
        currentDay = Math.min(15, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
      }

      // 3. Dynamic Description Logic
      let subs = [];
      try { subs = JSON.parse(brain.audience_communities || '[]'); } catch(e) {}
      const targetSub = subs[0] || 'your niche';

      let kws = [];
      try { kws = JSON.parse(brain.audience_keywords || '[]'); } catch(e) {}
      const targetKeyword = kws[0] || 'relevant topics';

      // 4. Map statuses and enhance descriptions
      const tasks = rawTasks.map(t => {
        let status = t.status || 'pending';
        const key = t.task_key;

        // Auto-completion logic based on real activity
        if (key.includes('finder')) {
          if (counts.leads >= (key.includes('d1') ? 10 : 5)) status = 'completed';
        } else if (key.includes('reply')) {
          if (counts.replies >= 3) status = 'completed';
        } else if (key.includes('post')) {
          // If they've made at least one post through the post maker, it's done
          if (counts.postMaker >= 1 || counts.posts >= 1) status = 'completed';
        } else if (key.includes('copilot') || key.includes('brain')) {
          if (counts.copilot >= 1) status = 'completed';
        }

        // Dynamic description enhancement
        let desc = t.task_description;
        if (key.includes('post') && targetSub) desc = desc.replace('a subreddit', `r/${targetSub}`).replace('communities', `r/${targetSub}`);
        if (key.includes('finder') && targetKeyword) desc = desc.replace('keywords', `"${targetKeyword}"`);

        return { ...t, status, task_description: desc };
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
    staleTime: 1000 * 30, // Refetch more often to catch post events
  });
}