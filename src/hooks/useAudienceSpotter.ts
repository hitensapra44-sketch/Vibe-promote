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

    // Save config to localStorage
    localStorage.setItem('vh_audience_config', JSON.stringify({
      keywords,
      platforms,
      communities,
      scanStartedAt,
      isScanning: true
    }));

    // Safety timeout
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
      localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
    }, 360000);

    // Save config to brand_brains
    await supabase
      .from('brand_brains')
      .update({
        audience_keywords: JSON.stringify(keywords),
        audience_platforms: JSON.stringify(platforms),
        audience_communities: JSON.stringify(communities)
      })
      .eq('user_id', userId);

    // Invoke Edge Function
    supabase.functions.invoke('audience-scanner', {  
      body: { user_id: userId },
    }).catch(e => console.error('Scanner fire failed:', e));

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