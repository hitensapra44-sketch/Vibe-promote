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

  try {
    const NVIDIA_API_KEY = Deno.env.get('NVIDIA_KEY_MISTRAL_1') || Deno.env.get('NVIDIA_KEY_MISTRAL_2') || Deno.env.get('NVIDIA_KEY_MINIMAX');
    const SERPER_API_KEY = Deno.env.get('SERPER_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing Supabase env vars");
    if (!SERPER_API_KEY) throw new Error("Missing SERPER_API_KEY");
    if (!NVIDIA_API_KEY) throw new Error("Missing NVIDIA API key");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let user_id: string | null = null;
    try {
      const body = await req.json();
      user_id = body?.user_id || null;
    } catch (_) {}

    console.log(`[audience-scanner] user_id: ${user_id}`);

    let brains: any[] = [];
    if (user_id) {
      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user_id)
        .not('audience_keywords', 'is', null);
      if (error) throw error;
      brains = data || [];
    } else {
      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .not('audience_keywords', 'is', null);
      if (error) throw error;
      brains = data || [];
    }

    console.log(`[audience-scanner] Found ${brains.length} brand brains`);

    let processedCount = 0;
    let totalInserted = 0;

    for (const brain of brains) {
      try {
        const currentUserId = brain.user_id;
        console.log(`[audience-scanner] Processing user: ${currentUserId}`);

        const { count, error: countError } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('status', 'new');

        if (countError) throw countError;

        if (count !== null && count >= 15) {
          console.log(`[audience-scanner] Already has 15+ signals. Skipping.`);
          continue;
        }

        const needed = Math.min(5, 15 - (count || 0));
        console.log(`[audience-scanner] Need ${needed} more signals`);

        const keywords: string[] = JSON.parse(brain.audience_keywords || '[]');
        const communities: string[] = JSON.parse(brain.audience_communities || '[]');
        const platforms: string[] = JSON.parse(brain.audience_platforms || '[]');

        if (keywords.length === 0) {
          console.log(`[audience-scanner] No keywords. Skipping.`);
          continue;
        }

        const rawPosts: any[] = [];

        // REDDIT via Serper
        if (platforms.includes('reddit')) {
          for (const keyword of keywords.slice(0, 4)) {
            for (const community of communities.slice(0, 5)) {
              try {
                const query = `site:reddit.com/r/${community} "${keyword}"`;
                console.log(`[audience-scanner] Serper query: ${query}`);

                const serperRes = await fetch('https://google.serper.dev/search', {
                  method: 'POST',
                  headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    q: query,
                    num: 10,
                    tbs: 'qdr:w'  // past week
                  })
                });

                if (!serperRes.ok) {
                  console.error(`[audience-scanner] Serper error: ${serperRes.status}`);
                  continue;
                }

                const serperData = await serperRes.json();
                const results = serperData.organic || [];
                console.log(`[audience-scanner] Serper returned ${results.length} results for "${keyword}" in r/${community}`);

                results.forEach((result: any) => {
                  const url = result.link || '';
                  if (!url.includes('reddit.com')) return;

                  // Extract subreddit from URL
                  const subMatch = url.match(/reddit\.com\/r\/([^/]+)/);
                  const subreddit = subMatch ? subMatch[1] : community;

                  rawPosts.push({
                    title: result.title?.replace(/\s*:\s*reddit$/i, '').trim() || '',
                    body: result.snippet || '',
                    url: url,
                    author: 'unknown',
                    subreddit: subreddit,
                    upvotes: 0,
                    comments: 0,
                    created_at: Date.now(),
                    platform: 'reddit'
                  });
                });

              } catch (e) {
                console.error(`[audience-scanner] Serper failed for r/${community}:`, e);
              }

              await new Promise(r => setTimeout(r, 200));
            }
          }
        }

        // HACKER NEWS via Algolia (free, no blocks)
        if (platforms.includes('hn')) {
          const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
          for (const keyword of keywords.slice(0, 4)) {
            try {
              const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${sevenDaysAgo},points>1&hitsPerPage=10`;
              const hnRes = await fetch(hnUrl);
              if (hnRes.ok) {
                const data = await hnRes.json();
                const hits = data.hits || [];
                console.log(`[audience-scanner] HN returned ${hits.length} posts for "${keyword}"`);
                hits.forEach((hit: any) => {
                  rawPosts.push({
                    title: hit.title,
                    body: hit.story_text || '',
                    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                    author: hit.author,
                    subreddit: 'HackerNews',
                    upvotes: hit.points || 0,
                    comments: hit.num_comments || 0,
                    created_at: hit.created_at_i * 1000,
                    platform: 'hacker_news'
                  });
                });
              }
            } catch (e) {
              console.error(`[audience-scanner] HN failed:`, e);
            }
          }
        }

        console.log(`[audience-scanner] Total raw posts: ${rawPosts.length}`);

        // Dedup
        const uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());

        // Filter already stored
        const { data: existingSignals } = await supabase
          .from('audience_signals')
          .select('post_url')
          .eq('user_id', currentUserId);

        const existingUrls = new Set((existingSignals || []).map((s: any) => s.post_url));
        const filteredPosts = uniquePosts.filter(p => !existingUrls.has(p.url));
        console.log(`[audience-scanner] New posts to score: ${filteredPosts.length}`);

        let insertedCount = 0;

        for (const post of filteredPosts) {
          if (insertedCount >= needed) break;

          try {
            console.log(`[audience-scanner] Scoring: "${post.title.substring(0, 60)}"`);

            const aiRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${NVIDIA_API_KEY}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "mistralai/mistral-small-4-119b-2603",
                messages: [
                  {
                    role: "system",
                    content: `You are a Reddit community member who also happens to have built a SaaS product. Your job is to score posts for buyer intent AND write a reply that sounds completely human — not promotional, not salesy, not like an AI wrote it.

SCORING:
Return a score 1-100 for how likely this person is a potential user of the product. Score high if they are frustrated with a problem the product solves, asking for tool recommendations, complaining about a competitor, or describing a workflow the product improves. Score low if it is off-topic, a meme, a general question unrelated to the product problem, or purely technical with no buying signal.

REPLY RULES — follow every single one:
- Answer the question or acknowledge the frustration FIRST before anything else
- Product mention is optional — only include it if the product directly solves the exact problem in the post
- If you mention the product, it gets ONE sentence maximum, no more
- Never use CTAs like "check it out", "try it", "sign up", "DM me", "link in bio"
- Never use hype words like "game changer", "revolutionary", "insane", "amazing", "best tool"
- Sound human — use casual lowercase, contractions, slight uncertainty ("imo", "kinda", "might", "depends", "ngl", "tbh")
- Keep reply to 2-4 sentences only, never longer
- No links anywhere in the reply
- If the subreddit feels strict or the post is not a strong match, skip the product mention entirely and just be helpful

OUTPUT FORMAT:
Respond ONLY with valid JSON, no markdown, no backticks, no explanation outside the JSON.
{"score": 1-100, "intent_type": "Seeking Solution" | "Frustrated User" | "Comparison Shopping" | "Pain Point", "suggested_reply": "your reply here", "isRelevant": true or false}

isRelevant must be true if score is 65 or above. isRelevant must be false if score is below 65. Never contradict the score.`
                  },
                  {
                    role: "user",
                    content: `Product: ${brain.app_name}
What it solves: ${brain.core_problem}
Who it is for: ${brain.target_customer}
What makes it different: ${brain.unique_differentiator}

Post subreddit: r/${post.subreddit}
Post title: ${post.title}
Post body: ${post.body.substring(0, 600)}`
                  }
                ],
                temperature: 0.2,
                max_tokens: 250
              })
            });

            if (!aiRes.ok) {
              console.error(`[audience-scanner] NVIDIA error ${aiRes.status}`);
              continue;
            }

            const aiData = await aiRes.json();
            const rawContent = aiData.choices?.[0]?.message?.content || "";

            const match = rawContent.match(/\{[\s\S]*\}/);
            if (!match) {
              console.warn(`[audience-scanner] No JSON in AI response`);
              continue;
            }

            const aiResult = JSON.parse(match[0]);
            console.log(`[audience-scanner] Score: ${aiResult.score}, Relevant: ${aiResult.isRelevant}`);

            if (aiResult.score >= 65) {
              const { error: insertError } = await supabase
                .from('audience_signals')
                .upsert({
                  user_id: currentUserId,
                  post_title: post.title,
                  post_body: post.body.substring(0, 600),
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
                }, { onConflict: 'post_url' });

              if (!insertError) {
                insertedCount++;
                totalInserted++;
                console.log(`[audience-scanner] INSERTED: "${post.title.substring(0, 60)}"`);
              } else {
                console.error(`[audience-scanner] Insert error:`, insertError);
              }
            }
          } catch (e) {
            console.error(`[audience-scanner] Scoring failed:`, e);
          }
        }

        await supabase
          .from('brand_brains')
          .update({ last_scanned_at: new Date().toISOString() })
          .eq('user_id', currentUserId);

        console.log(`[audience-scanner] Done for ${currentUserId}. Inserted: ${insertedCount}`);
        processedCount++;

      } catch (userError) {
        console.error(`[audience-scanner] Error for user ${brain.user_id}:`, userError);
      }
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount, inserted: totalInserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error: any) {
    console.error("[audience-scanner] Global error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})