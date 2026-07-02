"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Twitter, AtSign } from 'lucide-react';

export default function OAuthBufferCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const verifier = sessionStorage.getItem('buffer_code_verifier');

    if (authCode && verifier) {
      exchangeCode(authCode, verifier);
    } else {
      setError('Missing authorization code or verifier');
      setIsLoading(false);
    }
  }, []);

  const exchangeCode = async (authCode, codeVerifier) => {
    try {
      const { data, error } = await supabase.functions.invoke('buffer-oauth-callback', {
        body: { code: authCode, code_verifier: codeVerifier },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAccessToken(data.access_token);
      setChannels(data.channels || []);
    } catch (err) {
      setError(err.message || 'Failed to exchange authorization code');
      toast.error(err.message || 'Failed to connect Buffer account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedChannel || !user) return;

    setIsSaving(true);
    try {
      const platform = selectedChannel.service === 'twitter' ? 'x' : selectedChannel.service === 'instagram' ? 'threads' : 'buffer';

      const { error } = await supabase
        .from('social_accounts')
        .insert({
          user_id: user.id,
          platform,
          buffer_access_token: accessToken,
          buffer_channel_id: selectedChannel.id,
          buffer_channel_name: selectedChannel.service_username || selectedChannel.service,
          connected_at: new Date().toISOString(),
          is_active: true,
        });

      if (error) throw error;

      sessionStorage.removeItem('buffer_code_verifier');
      toast.success('Buffer account connected');
      navigate('/auto-poster');
    } catch (err) {
      toast.error('Failed to save connection');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-sm text-red-400">{error}</p>
          <Button onClick={() => navigate('/auto-poster')}>Back to Auto Poster</Button>
        </div>
      </div>
    );
  }

  const relevantChannels = channels.filter(ch => ch.service === 'twitter' || ch.service === 'instagram');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Connect Buffer Channel</h1>
          <p className="text-xs text-foreground/60 mt-2">Select which channel to link to Auto Poster</p>
        </div>

        {relevantChannels.length === 0 ? (
          <p className="text-xs text-center text-foreground/60">No X or Threads channels found in your Buffer account.</p>
        ) : (
          <div className="space-y-2">
            {relevantChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  selectedChannel?.id === ch.id
                    ? 'border-[#F97316] bg-[#F97316]/5'
                    : 'border-orange-200 hover:border-orange-400'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-foreground/60">
                  {ch.service === 'twitter' ? <Twitter className="w-4 h-4" /> : <AtSign className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{ch.service === 'twitter' ? 'X' : 'Threads'}</p>
                  <p className="text-[10px] text-foreground/60">{ch.name}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{ch.service === 'twitter' ? 'X' : 'Threads'}</p>
                  <p className="text-[10px] text-[#52525B]">@{ch.service_username || ch.id}</p>
                </div>
                {selectedChannel?.id === ch.id && (
                  <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                )}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full h-11 text-xs font-bold"
          disabled={!selectedChannel || isSaving}
          onClick={handleConnect}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            'Connect Channel'
          )}
        </Button>
      </div>
    </div>
  );
}
