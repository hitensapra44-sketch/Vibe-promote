"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BufferOAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const storedState = sessionStorage.getItem('buffer_oauth_state');

    if (errorParam) {
      const errorDesc = searchParams.get('error_description') || errorParam;
      setError(errorDesc);
      return;
    }

    if (!code) {
      setError('Missing authorization code');
      return;
    }

    if (state !== storedState) {
      setError('State mismatch — possible CSRF attack');
      return;
    }

    const codeVerifier = sessionStorage.getItem('buffer_code_verifier');
    if (!codeVerifier) {
      setError('Missing code verifier');
      return;
    }

    exchangeCode(code, codeVerifier);
  }, [searchParams]);

  const exchangeCode = async (code, codeVerifier) => {
    try {
      const redirectUri = `${window.location.origin}/oauth/buffer/callback`;

      const { data, error } = await supabase.functions.invoke('buffer-oauth-callback', {
        body: { code, code_verifier: codeVerifier, redirect_uri: redirectUri },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      sessionStorage.removeItem('buffer_code_verifier');
      sessionStorage.removeItem('buffer_oauth_state');

      toast.success('Buffer account connected successfully');
      navigate('/auto-poster');
    } catch (err) {
      console.error('[BufferOAuthCallback] Exchange error:', err.message);
      toast.error(err.message || 'Failed to connect Buffer account');
      navigate('/auto-poster');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-sm text-red-400">{error}</p>
          <Button onClick={() => navigate('/auto-poster')}>Back to Auto Poster</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mx-auto" />
        <p className="text-sm text-foreground/60">Connecting Buffer account...</p>
      </div>
    </div>
  );
}