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
      // Reddit
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

    // 4. Analyze with AI (Two-step process)
    const analyzedSignals = []
    for (const res of results.slice(0, 10)) {
      try {
        // CALL 1: RELEVANCE FILTER
        const filterSystemPrompt = `You are a relevance filter. Based on the product info below, decide if this post is from someone who would genuinely benefit from or is actively looking for a solution like this product.

Product: ${brain.app_name}
Description: ${brain.app_description}
Target Customer: ${brain.target_customer}
Core Problem it solves: ${brain.core_problem}

Only mark relevant: true if the post author matches the target customer profile and is expressing a pain point or seeking a recommendation that this product directly solves.

Reply ONLY in this JSON format, nothing else:
{
  "relevant": true,
  "intent": "Expressing Pain" or "Seeking Recommendation" or "Not Relevant",
  "score": 0-100,
  "reason": "one sentence"
}`

        const postText = `Post Title: ${res.post_title}\nPost Body: ${res.post_body}`

        const filterRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${NVIDIA_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-mini-4b-instruct",
            messages: [{ role: "system", content: filterSystemPrompt }, { role: "user", content: postText }],
            temperature: 0.1,
            max_tokens: 200
          })
        })
        
        const filterData = await filterRes.json()
        const filterContent = filterData.choices[0].message.content.replace(/```json|```/g, '').trim()
        const filterResult = JSON.parse(filterContent)

        if (filterResult.relevant && filterResult.score > 70) {
          // CALL 2: REPLY GENERATION
          const replySystemPrompt = `You are a genuine community member who uses ${brain.app_name}. 

Product context:
- What it does: ${brain.app_description}
- Who it helps: ${brain.target_customer}
- Problem it solves: ${brain.core_problem}
- Why it's different: ${brain.unique_differentiator}

Write a reply that:
1. Acknowledges the poster's specific pain point in 1-2 sentences, showing you actually read their post
2. Gives one genuinely helpful insight related to their problem
3. Naturally mentions ${brain.app_name} only if it directly solves what they described
4. Maximum 4 sentences total
5. Tone: casual, founder-to-founder, like a real Reddit comment not an ad
6. Never say 'Absolutely' or 'I'd be happy to'
7. Never mention features that are not in the product description above`

          const replyRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${NVIDIA_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "nvidia/nemotron-mini-4b-instruct",
              messages: [{ role: "system", content: replySystemPrompt }, { role: "user", content: postText }],
              temperature: 0.5,
              max_tokens: 400
            })
          })
          
          const replyData = await replyRes.json()
          const suggestedReply = replyData.choices[0].message.content.trim()

          const finalSignal = { 
            ...res, 
            intent_score: filterResult.score,
            intent_type: filterResult.intent,
            suggested_reply: suggestedReply,
            status: 'new' 
          }
          
          // Save to DB (upsert by URL to avoid duplicates)
          await supabase.from('audience_signals').upsert(finalSignal, { onConflict: 'post_url' })
          analyzedSignals.push(finalSignal)
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