import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1. Validate Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error("[reddit-proxy] Auth error:", authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Get and validate username
    const url = new URL(req.url)
    const username = url.searchParams.get('username')

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    console.log(`[reddit-proxy] Fetching posts for user: ${username}`);

    // 3. Fetch from Reddit API
    const redditUrl = `https://www.reddit.com/user/${username}/submitted.json?limit=25&sort=new`
    const response = await fetch(redditUrl, {
      headers: { 
        'User-Agent': 'VibePromote/1.0 (by /u/VibePromote)' 
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(JSON.stringify({ error: 'Reddit user not found' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Reddit rate limit exceeded' }), { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      throw new Error(`Reddit API returned ${response.status}`)
    }

    const data = await response.json()
    
    // 4. Map Reddit data to the application's post structure
    const posts = (data.data?.children || []).map((child: any) => ({
      title: child.data.title,
      subreddit: child.data.subreddit_name_prefixed,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: `https://reddit.com${child.data.permalink}`,
      created_at: new Date(child.data.created_utc * 1000).toISOString()
    }))

    // 5. Return response with caching headers
    return new Response(JSON.stringify(posts), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      status: 200
    })

  } catch (error: any) {
    console.error("[reddit-proxy] Global error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})