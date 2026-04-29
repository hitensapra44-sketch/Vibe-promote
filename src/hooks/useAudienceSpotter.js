import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';

export const useAudienceSpotter = (userId) => {
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
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://pxueqqjfvbrzfvmcbynu.supabase.co/functions/v1/audience-spotter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ user_id: userId })
      });
      if (!response.ok) throw new Error('Scanning failed');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Scan complete! New signals found.');
      queryClient.invalidateQueries(['audience_signals', userId]);
    },
    onError: () => {
      toast.error('Failed to scan for signals.');
    }
  });

  // 3. Update signal status (reviewed/dismissed)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('audience_signals')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['audience_signals', userId]);
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