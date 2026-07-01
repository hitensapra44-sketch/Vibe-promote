import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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

    const tokenRes = await fetch('https://auth.buffer.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier,
      }),
    })

    if (!tokenRes.ok) {
      return new Response(JSON.stringify({ error: 'Token exchange failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const graphqlRes = await fetch('https://api.buffer.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query { channels { id name service } }`,
      }),
    })

    if (!graphqlRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch channels' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const graphqlData = await graphqlRes.json()
    const channels = (graphqlData?.data?.channels || []).filter(
      ch => ch.service === 'twitter' || ch.service === 'threads'
    )

    return new Response(JSON.stringify({ access_token: accessToken, channels }), {
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
