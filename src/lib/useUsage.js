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
  }, [user, feature]);

  return { used, isLoading };
}

export async function incrementUsage(supabaseClient, userId, feature) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: existing } = await supabaseClient
    .from('user_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('month', currentMonth)
    .maybeSingle();

  const newCount = (existing?.count || 0) + 1;

  return await supabaseClient
    .from('user_usage')
    .upsert({
      user_id: userId,
      feature,
      month: currentMonth,
      count: newCount
    }, {
      onConflict: 'user_id,feature,month'
    });
}