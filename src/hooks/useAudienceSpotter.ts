import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useAudienceSpotter(userId: string) {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<any>(null);
  const pollCountRef = useRef(0);

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
    try {
      await supabase.functions.invoke('audience-scanner', {
        body: { user_id: userId }
      });
    } catch (e) {
      console.error('Edge function invoke error:', e);
    }

    // Start polling for results
    if (pollRef.current) clearInterval(pollRef.current);
    pollCountRef.current = 0;

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      // Stop polling after 6 minutes max (24 polls of 15s)
      if (pollCountRef.current > 24) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsLoading(false);

        const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
        localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
        return;
      }

      const currentSignals = await loadSignals();
      
      // Check if any new signals appeared since scanStartedAt
      const newSignals = currentSignals.filter(s => {
        const createdTime = new Date(s.created_at).getTime();
        return s.status === 'new' && createdTime > scanStartedAt;
      });

      if (newSignals.length > 0) {
        setIsLoading(false);
        clearInterval(pollRef.current);
        pollRef.current = null;

        const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
        localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
      }
    }, 15000); // every 15 seconds
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
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { signals, isLoading, startScan, updateSignalStatus };
}