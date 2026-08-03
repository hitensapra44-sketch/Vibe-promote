import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useAudienceSpotter(userId: string) {
  const [signals, setSignals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<any>(null);
  const pollCountRef = useRef(0);

  // Load existing signals from DB on mount
  useEffect(() => {
    if (!userId) return;
    loadSignals();
  }, [userId]);

  const loadSignals = async () => {
    const { data } = await supabase
      .from('audience_signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setSignals(data);
  };

  const startPolling = () => {
    if (pollRef.current) return; // already polling
    pollCountRef.current = 0;
    
    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      
      // Stop polling after 10 minutes (20 x 30s)
      if (pollCountRef.current > 20) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setIsLoading(false);
        
        // Update localStorage
        const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
        localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
        return;
      }

      const { data } = await supabase
        .from('audience_signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (data && data.length > 0) {
        setSignals(data);
        // Only stop loading if we have new signals
        const newCount = data.filter(s => s.status === 'new').length;
        if (newCount > 0) {
          setIsLoading(false);
          clearInterval(pollRef.current);
          pollRef.current = null;
          
          const saved = JSON.parse(localStorage.getItem('vh_audience_config') || '{}');
          localStorage.setItem('vh_audience_config', JSON.stringify({ ...saved, isScanning: false }));
        }
      }
    }, 30000); // every 30 seconds
  };

  const startScan = async ({ keywords, platforms, communities }: { keywords: string[], platforms: string[], communities: string[] }) => {
    if (!userId) return;
    setIsLoading(true);

    // Save config to localStorage
    localStorage.setItem('vh_audience_config', JSON.stringify({
      keywords,
      platforms,
      communities,
      scanStartedAt: Date.now(),
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
      await supabase.functions.invoke('audience-scanner');
    } catch (e) {
      console.error('Edge function invoke error:', e);
    }

    // Start polling for results
    startPolling();
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