import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[buffer-oauth-callback] Missing authorization header')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('[buffer-oauth-callback] Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { code, code_verifier, redirect_uri } = await req.json()

    if (!code || !code_verifier || !redirect_uri) {
      console.error('[buffer-oauth-callback] Missing required parameters')
      return new Response(JSON.stringify({ error: 'Missing code, code_verifier or redirect_uri' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const clientId = Deno.env.get('BUFFER_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('BUFFER_OAUTH_CLIENT_SECRET')

    console.log('[buffer-oauth-callback] Exchanging code for tokens...')

    const tokenResponse = await fetch('https://auth.buffer.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('[buffer-oauth-callback] Token exchange failed:', errorData)
      return new Response(JSON.stringify({ error: errorData.error_description || 'Token exchange failed' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { access_token, refresh_token, expires_in } = await tokenResponse.json()
    console.log('[buffer-oauth-callback] Token exchange successful. Fetching channels...')

    const graphqlResponse = await fetch('https://api.buffer.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ organizations { id channels { id displayName service { name } } } }',
      }),
    })

    if (!graphqlResponse.ok) {
      console.error('[buffer-oauth-callback] Failed to fetch channels')
      return new Response(JSON.stringify({ error: 'Failed to fetch Buffer channels' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { data: gqlData } = await graphqlResponse.json()
    const organizations = gqlData?.organizations || []
    
    let connectedCount = 0
    const tokenExpiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString()

    for (const org of organizations) {
      for (const channel of org.channels || []) {
        const serviceName = channel.service?.name?.toLowerCase()
        let platform = null

        if (serviceName === 'twitter' || serviceName === 'x') platform = 'x'
        else if (serviceName === 'threads') platform = 'threads'

        if (!platform) continue

        console.log(`[buffer-oauth-callback] Connecting ${platform} channel: ${channel.displayName}`)

        const { error: upsertError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: user.id,
            platform,
            buffer_access_token: access_token,
            buffer_refresh_token: refresh_token,
            buffer_channel_id: channel.id,
            buffer_channel_name: channel.displayName,
            token_expires_at: tokenExpiresAt,
            is_active: true,
            connected_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id,buffer_channel_id' 
          })

        if (upsertError) {
          console.error('[buffer-oauth-callback] Upsert error:', upsertError)
        } else {
          connectedCount++
        }
      }
    }

    console.log(`[buffer-oauth-callback] Success. Connected ${connectedCount} channels.`)
    return new Response(JSON.stringify({ success: true, channels_connected: connectedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error('[buffer-oauth-callback] Global error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})