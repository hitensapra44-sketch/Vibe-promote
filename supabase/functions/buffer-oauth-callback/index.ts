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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('[buffer-oauth-callback] Missing authorization header')
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('[buffer-oauth-callback] Invalid token:', authError?.message)
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('[buffer-oauth-callback] User authenticated:', user.id)

    const { code, code_verifier, redirect_uri } = await req.json()

    if (!code || !code_verifier || !redirect_uri) {
      console.log('[buffer-oauth-callback] Missing required fields')
      return new Response(JSON.stringify({ error: 'Missing required fields: code, code_verifier, redirect_uri' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const clientId = Deno.env.get('BUFFER_OAUTH_CLIENT_ID')
    const clientSecret = Deno.env.get('BUFFER_OAUTH_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      console.error('[buffer-oauth-callback] Buffer OAuth credentials not configured')
      return new Response(JSON.stringify({ error: 'Buffer OAuth credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('[buffer-oauth-callback] Exchanging code for tokens')

    const tokenRes = await fetch('https://auth.buffer.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('[buffer-oauth-callback] Token exchange failed:', tokenRes.status, errText)
      return new Response(JSON.stringify({ error: errText }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    const expiresIn = tokenData.expires_in

    console.log('[buffer-oauth-callback] Token exchange successful')

    const graphqlRes = await fetch('https://api.buffer.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ organizations { id channels { id displayName service { name } } } }',
      }),
    })

    if (!graphqlRes.ok) {
      const errText = await graphqlRes.text()
      console.error('[buffer-oauth-callback] Failed to fetch channels:', graphqlRes.status, errText)
      return new Response(JSON.stringify({ error: 'Failed to fetch channels', detail: errText }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const graphqlData = await graphqlRes.json()
    const organizations = graphqlData?.data?.organizations || []

    let channelsConnected = 0

    for (const org of organizations) {
      const channels = org.channels || []
      for (const channel of channels) {
        const serviceName = channel.service?.name?.toLowerCase()
        let platform = null

        if (serviceName === 'twitter' || serviceName === 'x') {
          platform = 'x'
        } else if (serviceName === 'threads') {
          platform = 'threads'
        } else {
          console.log(`[buffer-oauth-callback] Skipping channel ${channel.id} with service: ${serviceName}`)
          continue
        }

        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        console.log(`[buffer-oauth-callback] Upserting channel ${channel.id} for platform ${platform}`)

        const { error: upsertError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: user.id,
            platform,
            buffer_access_token: accessToken,
            buffer_refresh_token: refreshToken,
            buffer_channel_id: channel.id,
            buffer_channel_name: channel.displayName,
            token_expires_at: tokenExpiresAt,
            is_active: true,
          }, { onConflict: 'user_id,buffer_channel_id' })

        if (upsertError) {
          console.error('[buffer-oauth-callback] Upsert error for channel', channel.id, upsertError.message)
        } else {
          channelsConnected++
          console.log(`[buffer-oauth-callback] Successfully connected channel ${channel.id}`)
        }
      }
    }

    console.log(`[buffer-oauth-callback] Total channels connected: ${channelsConnected}`)

    return new Response(JSON.stringify({ success: true, channels_connected: channelsConnected }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('[buffer-oauth-callback] Global error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})