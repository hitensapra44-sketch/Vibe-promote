import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Fetch all brand_brains rows where audience_keywords IS NOT NULL
    const { data: brains, error: brainsError } = await supabase
      .from('brand_brains')
      .select('*')
      .not('audience_keywords', 'is', null);

    if (brainsError) throw brainsError;

    let processedCount = 0;

    for (const brain of brains) {
      try {
        console.log(`[audience-scanner] Processing user: ${brain.user_id}`);

        // a. Count rows in audience_signals where user_id = brain.user_id AND status = 'new'
        const { count, error: countError } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', brain.user_id)
          .eq('status', 'new');

        if (countError) throw countError;

        // b. If count >= 10, skip this user
        if (count !== null && count >= 10) {
          console.log(`[audience-scanner] User ${brain.user_id} already has 10+ new signals. Skipping.`);
          continue;
        }

        // c. needed = 10 - count
        const needed = 10 - (count || 0);

        // d. Parse config
        const keywords = JSON.parse(brain.audience_keywords || '[]');
        const communities = JSON.parse(brain.audience_communities || '[]');
        const platforms = JSON.parse(brain.audience_platforms || '[]');

        const rawPosts: any[] = [];

        // e. Collect raw posts
        for (const keyword of keywords.slice(0, 5)) {
          // Reddit
          if (platforms.includes('reddit')) {
            for (const community of communities.slice(0, 3)) {
              const fetchReddit = async (retry = false): Promise<void> => {
                const res = await fetch(`https://www.reddit.com/r/${community}/search.json?q=${encodeURIComponent(keyword)}&sort=new&t=day&limit=10&restrict_sr=true`, {
                  headers: { 'User-Agent': 'VibehypeBot/1.0' }
                });

                if (res.status === 429 && !retry) {
                  console.warn(`[audience-scanner] Reddit 429. Retrying in 2s...`);
                  await new Promise(r => setTimeout(res, 2000));
                  return fetchReddit(true);
                }

                if (res.ok) {
                  const data = await res.json();
                  const children = data.data?.children || [];
                  children.forEach((child: any) => {
                    const p = child.data;
                    rawPosts.push({
                      title: p.title,
                      body: p.selftext || '',
                      url: `https://reddit.com${p.permalink}`,
                      author: p.author,
                      subreddit: p.subreddit,
                      upvotes: p.score,
                      comments: p.num_comments,
                      created_at: p.created_utc * 1000,
                      platform: 'reddit'
                    });
                  });
                }
              };
              await fetchReddit();
            }
          }

          // HN
          if (platforms.includes('hn')) {
            const ts = Math.floor(Date.now() / 1000) - 86400;
            const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${ts}&hitsPerPage=10`);
            if (hnRes.ok) {
              const data = await hnRes.json();
              const hits = data.hits || [];
              hits.forEach((hit: any) => {
                rawPosts.push({
                  title: hit.title,
                  body: hit.story_text || '',
                  url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                  author: hit.author,
                  subreddit: 'HN',
                  upvotes: hit.points,
                  comments: hit.num_comments,
                  created_at: hit.created_at,
                  platform: 'hn'
                });
              });
            }
          }
        }

        // f. Deduplicate by URL
        const uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());

        // g. Filter out URLs already in audience_signals for this user
        const { data: existingSignals } = await supabase
          .from('audience_signals')
          .select('post_url')
          .eq('user_id', brain.user_id);
        
        const existingUrls = new Set((existingSignals || []).map(s => s.post_url));
        const filteredPosts = uniquePosts.filter(p => !existingUrls.has(p.url));

        // h. For each remaining post, call NVIDIA API to score it
        let insertedCount = 0;
        for (const post of filteredPosts) {
          if (insertedCount >= needed) break;

          try {
            const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "meta/llama-3.1-8b-instruct",
                messages: [
                  {
                    role: "system",
                    content: "You are a strict SaaS buyer intent classifier. Return ONLY valid JSON, no extra text, no markdown: { \"score\": number 1-100, \"intent_type\": \"Seeking Solution\" or \"Frustrated User\" or \"Comparison Shopping\" or \"Pain Point\", \"suggested_reply\": \"max 2 sentences casual helpful tone mentioning the product naturally\", \"isRelevant\": true only if score >= 65 }"
                  },
                  {
                    role: "user",
                    content: `Product: ${brain.app_name}. Target customer: ${brain.target_customer}. Problem solved: ${brain.core_problem}. Unique advantage: ${brain.unique_differentiator}. Post title: ${post.title}. Post content: ${post.body.substring(0, 400)}`
                  }
                ],
                temperature: 0.3,
                max_tokens: 300
              })
            });

            if (!aiRes.ok) continue;

            const aiData = await aiRes.json();
            const aiResult = JSON.parse(aiData.choices[0].message.content.replace(/```json\n?|```/g, '').trim());

            if (aiResult.isRelevant && aiResult.score >= 65) {
              // i. Insert relevant posts
              await supabase.from('audience_signals').insert({
                user_id: brain.user_id,
                post_title: post.title,
                post_body: post.body.substring(0, 500),
                post_url: post.url,
                author: post.author,
                subreddit: post.subreddit,
                platform: post.platform,
                intent_score: aiResult.score,
                intent_type: aiResult.intent_type,
                suggested_reply: aiResult.suggested_reply,
                upvotes: post.upvotes || 0,
                comment_count: post.comments || 0,
                posted_at: new Date(post.created_at).toISOString(),
                status: 'new',
                created_at: new Date().toISOString()
              });
              insertedCount++;
            }
          } catch (e) {
            console.error(`[audience-scanner] AI call failed for post ${post.url}:`, e);
          }
        }

        // j. Update last_scanned_at
        await supabase
          .from('brand_brains')
          .update({ last_scanned_at: new Date().toISOString() })
          .eq('user_id', brain.user_id);

        processedCount++;
      } catch (userError) {
        console.error(`[audience-scanner] Error processing user ${brain.user_id}:`, userError);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})