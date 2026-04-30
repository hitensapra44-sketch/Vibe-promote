import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NVIDIA_API_KEY = "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";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    if (!user_id) throw new Error("Missing user_id")

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get Brand Brain
    const { data: brain, error: brainError } = await supabase
      .from('brand_brains')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (brainError || !brain) throw new Error("Brand Brain not found for user")

    // 2. Extract keywords from pain phrases or core problem
    const keywords = brain.pain_phrases?.split(',').map(k => k.trim()).filter(Boolean) || [brain.core_problem];
    const results = [];

    // 3. Search Reddit & HN
    for (const keyword of keywords.slice(0, 3)) {
      // Reddit - Added User-Agent to prevent 429/403 errors
      try {
        const redditRes = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=10&sort=new`, {
          headers: { 'User-Agent': 'VibePromote/1.0.0 (by /u/VibePromote)' }
        })
        
        if (redditRes.ok) {
          const redditData = await redditRes.json()
          if (redditData?.data?.children) {
            for (const post of redditData.data.children) {
              const p = post.data
              if (p.num_comments >= 1) {
                results.push({
                  user_id,
                  post_title: p.title,
                  post_body: p.selftext || '',
                  post_url: `https://reddit.com${p.permalink}`,
                  subreddit: p.subreddit,
                  author: p.author,
                  posted_at: new Date(p.created_utc * 1000).toISOString(),
                  platform: 'reddit',
                  upvotes: p.ups,
                  comment_count: p.num_comments
                })
              }
            }
          }
        } else {
          console.error(`[audience-spotter] Reddit API returned status: ${redditRes.status}`);
        }
      } catch (e) { console.error("[audience-spotter] Reddit search failed", e) }

      // Hacker News
      try {
        const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=10`)
        if (hnRes.ok) {
          const hnData = await hnRes.json()
          if (hnData?.hits) {
            for (const post of hnData.hits) {
              results.push({
                user_id,
                post_title: post.title,
                post_body: post.story_text || post.comment_text || '',
                post_url: `https://news.ycombinator.com/item?id=${post.objectID}`,
                subreddit: 'Hacker News',
                author: post.author,
                posted_at: post.created_at,
                platform: 'hacker_news',
                upvotes: post.points || 0,
                comment_count: post.num_comments || 0
              })
            }
          }
        }
      } catch (e) { console.error("[audience-spotter] HN search failed", e) }
    }

    // 4. Analyze with AI
    const analyzedSignals = []
    for (const res of results.slice(0, 10)) {
      const systemPrompt = `You are a high-intent sales signal detector. 
      Analyze this post context and the user's product to see if they are a potential buyer.
      Product: ${brain.app_name} - ${brain.app_description}
      Target Audience: ${brain.target_customer}
      Tone: ${brain.brand_tone}

      Return ONLY JSON:
      {
        "intent_score": 0-100,
        "intent_type": "Seeking Recommendation" | "Comparing Alternatives" | "Expressing Pain" | "Asking How" | "Switching Tools" | "Budget Ready",
        "suggested_reply": "A natural, helpful reply (max 280 chars) that mentions ${brain.app_name} as a solution without being spammy."
      }`

      const userMsg = `Post Title: ${res.post_title}\nPost Body: ${res.post_body}`

      try {
        const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-mini-4b-instruct",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMsg }],
            temperature: 0.2,
            max_tokens: 300
          })
        })
        
        const aiData = await aiRes.json()
        
        // Safety check for AI response structure
        if (aiData?.choices?.[0]?.message?.content) {
          const content = aiData.choices[0].message.content.replace(/```json|```/g, '').trim();
          const analysis = JSON.parse(content);
          
          const finalSignal = { ...res, ...analysis, status: 'new' }
          
          // Save to DB (upsert by URL to avoid duplicates)
          await supabase.from('audience_signals').upsert(finalSignal, { onConflict: 'post_url' })
          analyzedSignals.push(finalSignal)
        } else {
          console.error("[audience-spotter] AI returned invalid response structure", aiData);
        }
      } catch (e) { console.error("[audience-spotter] AI Analysis failed for a post", e) }
    }

    return new Response(JSON.stringify(analyzedSignals), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error("[audience-spotter] Global error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})