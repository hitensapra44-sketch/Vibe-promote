import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { code, code_verifier } = await req.json()

    if (!code || !code_verifier) {
      return new Response(JSON.stringify({ error: 'Missing code or code_verifier' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const clientId = Deno.env.get('BUFFER_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('BUFFER_OAUTH_CLIENT_SECRET')
    const redirectUri = 'https://vibepromote.tech/oauth/buffer/callback'

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'Buffer OAuth credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenRes = await fetch('https://api.bufferapp.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
        code_verifier,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      return new Response(JSON.stringify({ error: `Token exchange failed: ${errText}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json?access_token=' + encodeURIComponent(accessToken))
    if (!profilesRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch Buffer profiles' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const profiles = await profilesRes.json()

    return new Response(JSON.stringify({ access_token: accessToken, channels: profiles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
