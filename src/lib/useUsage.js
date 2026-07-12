import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';

export function useUsage(feature) {
  const { user } = useAuth();
  const [used, setUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7);

      try {
        const { data, error } = await supabase
          .from('user_usage')
          .select('count')
          .eq('user_id', user.id)
          .eq('feature', feature)
          .eq('month', currentMonth)
          .maybeSingle();

        if (error) throw error;
        setUsed(data?.count || 0);
      } catch (err) {
        console.error('Error fetching usage:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();

    const handleUpdate = () => {
      fetchUsage();
    };

    window.addEventListener('vh_usage_incremented', handleUpdate);
    return () => {
      window.removeEventListener('vh_usage_incremented', handleUpdate);
    };
  }, [user, feature]);

  return { used, isLoading };
}

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

  window.dispatchEvent(new CustomEvent('vh_usage_incremented', { detail: { feature } }));
  return res;
}