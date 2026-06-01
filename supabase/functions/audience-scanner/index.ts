import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fallback key in case env var is missing
const FALLBACK_NVIDIA_KEY = "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";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY') || FALLBACK_NVIDIA_KEY;
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const REDDIT_WORKER_URL = Deno.env.get('REDDIT_WORKER_URL') || '';

    console.log(`[audience-scanner] NVIDIA key present: ${!!NVIDIA_API_KEY}`);
    console.log(`[audience-scanner] Supabase URL present: ${!!SUPABASE_URL}`);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let user_id: string | null = null;
    let incomingPosts: any[] = [];
    try {
      const body = await req.json();
      user_id = body?.user_id || null;
      incomingPosts = body?.raw_posts || [];
    } catch (_) {}

    console.log(`[audience-scanner] user_id from request: ${user_id}`);

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

    console.log(`[audience-scanner] Found ${brains.length} brand brains to process`);

    let processedCount = 0;
    let totalInserted = 0;

    for (const brain of brains) {
      try {
        const currentUserId = brain.user_id;
        console.log(`[audience-scanner] Processing user: ${currentUserId}`);
        console.log(`[audience-scanner] app_name: ${brain.app_name}, core_problem: ${brain.core_problem}`);

        const { count, error: countError } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('status', 'new');

        if (countError) throw countError;
        console.log(`[audience-scanner] Current new signals count: ${count}`);

        if (count !== null && count >= 15) {
          console.log(`[audience-scanner] Already has 15+ signals. Skipping.`);
          continue;
        }

        const needed = Math.min(5, 15 - (count || 0));
        console.log(`[audience-scanner] Need to find: ${needed} more signals`);

        const keywords: string[] = JSON.parse(brain.audience_keywords || '[]');
        const communities: string[] = JSON.parse(brain.audience_communities || '[]');
        const platforms: string[] = JSON.parse(brain.audience_platforms || '[]');

        console.log(`[audience-scanner] keywords: ${JSON.stringify(keywords)}`);
        console.log(`[audience-scanner] platforms: ${JSON.stringify(platforms)}`);
        console.log(`[audience-scanner] communities: ${JSON.stringify(communities)}`);

        if (keywords.length === 0) {
          console.log(`[audience-scanner] No keywords. Skipping.`);
          continue;
        }

        // Use 7 days instead of 48 hours to get more posts
        const now = Math.floor(Date.now() / 1000);
        const sevenDaysAgo = now - (7 * 24 * 60 * 60);

        const rawPosts: any[] = [];

        // Reddit posts come pre-fetched from browser — add them to rawPosts
        if (platforms.includes('reddit') && incomingPosts.length > 0) {
          const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
          incomingPosts.forEach((p: any) => {
            if (p.created_at > sevenDaysAgo * 1000) {
              rawPosts.push(p);
            }
          });
        }

        for (const keyword of keywords.slice(0, 4)) {
          console.log(`[audience-scanner] Searching keyword: "${keyword}"`);

          // HACKER NEWS
          if (platforms.includes('hn')) {
            try {
              const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${sevenDaysAgo},points>1&hitsPerPage=15`;
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

        console.log(`[audience-scanner] Total raw posts collected: ${rawPosts.length}`);

        const uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());
        console.log(`[audience-scanner] After dedup: ${uniquePosts.length}`);

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
            console.log(`[audience-scanner] Scoring post: "${post.title.substring(0, 60)}"`);

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
- Never paste the same reply structure twice — vary the opening every time
- No links anywhere in the reply
- If the subreddit feels strict or the post is not a strong match, skip the product mention entirely and just be helpful

REPLY STYLES — pick whichever fits the post naturally, do not label it:
Style A — Helpful Side Mention: Acknowledge frustration → give one useful insight → casual product mention only if relevant → stop
Style B — Personal Experience: Relate to problem → tiny personal story → lesson → optional soft mention
Style C — Honest Caveat: Agree with frustration → practical fix first → product mention with a caveat → realistic expectation
Style D — Low-Key Recommendation: Direct answer → one useful insight → subtle mention → stop
Style E — Mini Story: Short relatable story → what changed → lesson → optional soft mention
Style F — Contrarian Take: Challenge common advice calmly → explain why → useful alternative → optional relevant mention

CONTEXT YOU HAVE:
- Product name, what it solves, who it is for, and what makes it different will be in the user message
- Post title and body will be in the user message
- Write the reply as if you are the founder casually helping someone, not pitching

OUTPUT FORMAT:
Respond ONLY with valid JSON, no markdown, no backticks, no explanation outside the JSON.
{"score": 1-100, "intent_type": "Seeking Solution" | "Frustrated User" | "Comparison Shopping" | "Pain Point", "suggested_reply": "your reply here", "isRelevant": true or false}

isRelevant should be true only if score is 70 or above AND the post is genuinely about a problem the product solves.`
                  },
                  {
                    role: "user",
                    content: `Product: ${brain.app_name}
What it solves: ${brain.core_problem}
Who it is for: ${brain.target_customer}
What makes it different: ${brain.unique_differentiator}
Founder tone: casual, builder, been through the same problems

Monitored communities: ${communities.join(', ')}
Post subreddit: r/${post.subreddit}
Post title: ${post.title}
Post body: ${post.body.substring(0, 800)}

Write a reply following all the rules above. Pick the style that fits this specific post naturally.`
                  }
                ],
                temperature: 0.2,
                max_tokens: 250
              })
            });

            if (!aiRes.ok) {
              const errText = await aiRes.text();
              console.error(`[audience-scanner] NVIDIA error ${aiRes.status}: ${errText}`);
              continue;
            }

            const aiData = await aiRes.json();
            const rawContent = aiData.choices?.[0]?.message?.content || "";
            console.log(`[audience-scanner] AI raw response: ${rawContent.substring(0, 150)}`);

            const match = rawContent.match(/\{[\s\S]*\}/);
            if (!match) {
              console.warn(`[audience-scanner] No JSON in AI response`);
              continue;
            }

            const aiResult = JSON.parse(match[0]);
            console.log(`[audience-scanner] Score: ${aiResult.score}, Relevant: ${aiResult.isRelevant}`);

            if (aiResult.isRelevant === true && aiResult.score >= 70) {
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
            console.error(`[audience-scanner] AI scoring failed:`, e);
          }
        }

        await supabase
          .from('brand_brains')
          .update({ last_scanned_at: new Date().toISOString() })
          .eq('user_id', currentUserId);

        console.log(`[audience-scanner] Done for user ${currentUserId}. Inserted: ${insertedCount}`);
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