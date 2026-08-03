import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let username = '';
    let type = 'posts';

    // Parse request body or query params
    if (req.method === 'POST') {
      const body = await req.json();
      username = body.username;
      type = body.type || 'posts';
    } else {
      const url = new URL(req.url);
      username = url.searchParams.get('username') || '';
      type = url.searchParams.get('type') || 'posts';
    }

    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Clean username (remove u/ prefix if present)
    const cleanUsername = username.replace(/^u\//, '').trim();

    const redditUrl = type === 'about' 
      ? `https://www.reddit.com/user/${cleanUsername}/about.json`
      : `https://www.reddit.com/user/${cleanUsername}/submitted.json?limit=25&sort=new`;

    console.log(`[reddit-proxy] Fetching: ${redditUrl}`);

    const response = await fetch(redditUrl, {
      headers: { 
        // Using a more standard User-Agent to avoid being flagged as a bot
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!response.ok) {
      const status = response.status;
      console.error(`[reddit-proxy] Reddit API returned ${status}`);
      
      if (status === 403) {
        return new Response(JSON.stringify({ error: 'This Reddit profile is private or restricted.' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      if (status === 404) {
        return new Response(JSON.stringify({ error: 'Reddit user not found. Please check the spelling.' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Too many requests. Please wait a minute and try again.' }), { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      throw new Error(`Reddit API error: ${status}`);
    }

    const data = await response.json();
    
    if (type === 'about') {
      const karma = data.data?.total_karma ?? (data.data?.link_karma || 0) + (data.data?.comment_karma || 0);
      return new Response(JSON.stringify({ karma }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Map posts safely
    const children = data.data?.children || [];
    const posts = children.map((child: any) => {
      const p = child.data;
      return {
        title: p.title || 'Untitled Post',
        subreddit: p.subreddit_name_prefixed || 'r/unknown',
        score: p.score || 0,
        num_comments: p.num_comments || 0,
        url: p.permalink ? `https://reddit.com${p.permalink}` : '#',
        created_at: p.created_utc ? new Date(p.created_utc * 1000).toISOString() : new Date().toISOString(),
        engagement: (p.score || 0) + (p.num_comments || 0)
      };
    });

    return new Response(JSON.stringify(posts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error(`[reddit-proxy] Global Error: ${error.message}`);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from Reddit. This might be a temporary issue with their API.',
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})