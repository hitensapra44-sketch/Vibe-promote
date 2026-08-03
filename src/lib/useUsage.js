import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch and track usage for a specific feature.
 * Uses TanStack Query for automatic caching and manual refetching.
 */
export function useUsage(feature) {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: ['usage', user?.id, feature],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data, error } = await supabase
        .from('user_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('feature', feature)
        .eq('month', currentMonth)
        .maybeSingle();

      if (error) throw error;
      return data?.count || 0;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { 
    used: query.data ?? 0, 
    isLoading: query.isLoading,
    refetch: query.refetch 
  };
}

/**
 * Global function to increment usage.
 * Dispatches an event to alert hooks even outside of React Query context.
 */
export async function incrementUsage(supabaseClient, userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: existing, error: fetchError } = await supabaseClient
    .from('user_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('month', currentMonth)
    .maybeSingle();

  if (fetchError) {
    console.error('[incrementUsage] fetch failed:', fetchError);
    throw fetchError;
  }

  let res;
  if (existing) {
    res = await supabaseClient
      .from('user_usage')
      .update({ count: existing.count + 1 })
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('month', currentMonth);
  } else {
    res = await supabaseClient
      .from('user_usage')
      .insert({ user_id: userId, feature, month: currentMonth, count: 1 });
  }

  if (res.error) {
    console.error('[incrementUsage] write failed:', res.error);
    throw res.error;
  }

  // Dispatch event for UI components that might not be using the hook
  window.dispatchEvent(new CustomEvent('vh_usage_incremented', { detail: { feature } }));
  
  return res;
}