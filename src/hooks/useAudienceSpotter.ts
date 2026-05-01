import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

interface Signal {
  id: string;
  platform: string;
  title: string;
  post_url: string;
  created_at: number;
  score: number;
  author: string;
  subreddit?: string; // Optional for HN
  type: string;
  intent_type: string;
  intent_score: number;
  suggested_reply: string;
  status?: 'pending' | 'reviewed' | 'dismissed'; // Added status property
}

export const useAudienceSpotter = (userId: string) => {
  const queryClient = useQueryClient();

  // 1. Fetch existing signals from the database
  const { data: signals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['audience_signals', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audience_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // 2. Trigger the Edge Function to scan for NEW signals
  const scanMutation = useMutation({
    mutationFn: async ({ keywords, platforms }: { keywords: string[]; platforms: string[] }): Promise<Signal[]> => {
      console.log('Scanning with keywords:', keywords);
      console.log('Scanning on platforms:', platforms);
      const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
      let allSignals: Signal[] = [];

      // Fetch from Hacker News
      if (platforms.includes('hackernews')) {
        const hnPromises = keywords.map(async (keyword) => {
          const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${sevenDaysAgo},points>5`;
          const response = await fetch(hnUrl);
          if (!response.ok) throw new Error('Failed to fetch Hacker News');
          const data = await response.json();
          return data.hits.map(hit => ({
            id: `hn-${hit.objectID}`,
            platform: 'hackernews',
            title: hit.title,
            post_url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            created_at: hit.created_at_i * 1000, // Convert to milliseconds
            score: hit.points,
            author: hit.author,
            type: 'signal', // Assuming a default type
            intent_type: 'high', // Assuming a default intent
            intent_score: 80, // Assuming a default score
            suggested_reply: 'Great post!', // Placeholder
          }));
        });
        const hnResults = await Promise.all(hnPromises);
        allSignals = allSignals.concat(hnResults.flat());
      }

      // Fetch from Reddit
      if (platforms.includes('reddit')) {
        const redditPromises = keywords.map(async (keyword) => {
          const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&t=week&limit=10`;
          const response = await fetch(redditUrl, {
            headers: {
              'User-Agent': 'VibehypeApp/1.0',
            },
          });
          if (!response.ok) throw new Error('Failed to fetch Reddit');
          const data = await response.json();
          return data.data.children
            .filter(child => child.data.created_utc > sevenDaysAgo)
            .map(child => ({
              id: `reddit-${child.data.id}`,
              platform: 'reddit',
              title: child.data.title,
              post_url: `https://www.reddit.com${child.data.permalink}`,
              created_at: child.data.created_utc * 1000, // Convert to milliseconds
              score: child.data.score,
              author: child.data.author,
              subreddit: child.data.subreddit_name_prefixed,
              type: 'signal', // Assuming a default type
              intent_type: 'medium', // Assuming a default intent
              intent_score: 60, // Assuming a default score
              suggested_reply: 'Interesting discussion!', // Placeholder
            }));
        });
        const redditResults = await Promise.all(redditPromises);
        allSignals = allSignals.concat(redditResults.flat());
      }

      // Sort all signals by date, newest first
      allSignals.sort((a, b) => b.created_at - a.created_at);

      // For now, we'll just return the signals. In a real app, you'd likely save these to Supabase.
      // For the purpose of this task, we'll simulate saving by returning them.
      return allSignals;
    },
    onSuccess: (newSignals: Signal[]) => {
      toast.success('Scan complete! New signals found.');
      // Instead of invalidating, we'll update the cache directly or refetch if needed
      queryClient.setQueryData(['audience_signals', userId], (oldSignals: Signal[] | undefined) => {
        // This is a simplified merge. In a real app, you'd handle duplicates and existing signals more robustly.
        const existingSignalIds = new Set(oldSignals?.map(s => s.id));
        const uniqueNewSignals = newSignals.filter(s => !existingSignalIds?.has(s.id));
        return [...(oldSignals || []), ...uniqueNewSignals].sort((a, b) => b.created_at - a.created_at);
      });
    },
    onError: (error) => {
      toast.error(`Failed to scan for signals: ${error.message}`);
    }
  });

  // 3. Update signal status (reviewed/dismissed)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'reviewed' | 'dismissed' }): Promise<Signal> => {
      const { data, error } = await supabase
        .from('audience_signals')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Signal;
    },
    onSuccess: (updatedSignal: Signal) => {
      queryClient.setQueryData(['audience_signals', userId], (oldSignals: Signal[] | undefined) => {
        if (!oldSignals) return [];
        return oldSignals.map(signal => 
          signal.id === updatedSignal.id ? { ...signal, status: updatedSignal.status } : signal
        );
      });
    }
  });

  return {
    signals,
    isLoading: isLoading || scanMutation.isPending,
    isError,
    refetch,
    startScan: scanMutation.mutate,
    updateSignalStatus: updateStatusMutation.mutate
  };
};