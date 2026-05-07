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

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const url = new URL(req.url)
    const username = url.searchParams.get('username')
    const type = url.searchParams.get('type') || 'posts' // 'posts' or 'about'

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const redditUrl = type === 'about' 
      ? `https://www.reddit.com/user/${username}/about.json`
      : `https://www.reddit.com/user/${username}/submitted.json?limit=25&sort=new`;

    const response = await fetch(redditUrl, {
      headers: { 
        'User-Agent': 'web:vibehype:1.0.0 (by /u/VibePromote)' 
      }
    })

    if (!response.ok) {
      if (response.status === 403) return new Response(JSON.stringify({ error: 'Private profile' }), { status: 403, headers: corsHeaders });
      if (response.status === 404) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json()
    
    if (type === 'about') {
      return new Response(JSON.stringify({ karma: data.data?.total_karma || 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const posts = (data.data?.children || []).map((child: any) => ({
      title: child.data.title,
      subreddit: child.data.subreddit_name_prefixed,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: `https://reddit.com${child.data.permalink}`,
      created_at: new Date(child.data.created_utc * 1000).toISOString(),
      engagement: (child.data.score || 0) + (child.data.num_comments || 0)
    }))

    return new Response(JSON.stringify(posts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})