import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useAudienceSpotter(userId: string) {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<any>(null);

  const loadSignals = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('audience_signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) {
      setSignals(data);
      return data;
    }
    return [];
  };

  // Load existing signals on mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadSignals();

      const channel = supabase
        .channel(`audience_signals_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'audience_signals',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            setSignals(prev => {
              const exists = prev.find(s => s.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            });
            setIsLoading(false);
            if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const startScan = async ({ keywords, platforms, communities }: { keywords: string[], platforms: string[], communities: string[] }) => {
    if (!userId) return;
    setIsLoading(true);

    const scanStartedAt = Date.now();

    localStorage.setItem('vh_audience_config', JSON.stringify({
      keywords,
      platforms,
      communities,
      scanStartedAt,
      isScanning: true
    }));

    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
      localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
    }, 360000);

    await supabase
      .from('brand_brains')
      .update({
        audience_keywords: JSON.stringify(keywords),
        audience_platforms: JSON.stringify(platforms),
        audience_communities: JSON.stringify(communities)
      })
      .eq('user_id', userId);

    // Browser-side Reddit fetch — no server IP blocks
    const rawPosts: any[] = [];
    const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    if (platforms.includes('reddit')) {
      for (const keyword of keywords.slice(0, 4)) {
        for (const community of communities.slice(0, 5)) {
          try {
            const proxyUrl = `https://vibe-reddit-proxy.onrender.com/search?q=${encodeURIComponent(keyword)}&sub=${encodeURIComponent(community)}&sort=new&t=week&limit=25`;
            const res = await fetch(proxyUrl);
            if (res.ok) {
              const data = await res.json();
              const children = data.data?.children || [];
              children.forEach((child: any) => {
                const p = child.data;
                if (p && p.created_utc > sevenDaysAgo) {
                  rawPosts.push({
                    title: p.title || '',
                    body: p.selftext || '',
                    url: `https://reddit.com${p.permalink}`,
                    author: p.author || 'unknown',
                    subreddit: p.subreddit || community,
                    upvotes: p.score || 0,
                    comments: p.num_comments || 0,
                    created_at: p.created_utc * 1000,
                    platform: 'reddit'
                  });
                }
              });
            } else {
              console.error(`Proxy r/${community} status: ${res.status}`);
            }
          } catch (e) {
            console.error(`Reddit proxy failed for r/${community}:`, e);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    // Fire Edge Function with raw posts for AI scoring
    // HN fetching stays in the Edge Function since Algolia has no blocks
    supabase.functions.invoke('audience-scanner', {
      body: { 
        user_id: userId,
        raw_posts: rawPosts  // send browser-fetched Reddit posts
      },
    }).catch(e => console.error('Scanner fire failed:', e));
  };

  const updateSignalStatus = async ({ id, status }: { id: string, status: string }) => {
    // Optimistic update
    setSignals(prev => prev.map(s => s.id === id ? { ...s, status } : s));

    await supabase
      .from('audience_signals')
      .update({ status })
      .eq('id', id);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, []);

  return { signals, isLoading, startScan, updateSignalStatus };
}