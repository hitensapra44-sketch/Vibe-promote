import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash for cache key
async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Per-user daily scan limits by plan
function getDailyLimit(plan: string): number {
  if (plan === 'pro') return 999;
  if (plan === 'starter') return 10;
  return 3; // free
}

async function searchXPosts(keywords: string[], userId: string): Promise<any[]> {
  try {
    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      console.log("[audience-scanner] X: RAPIDAPI_KEY not set, skipping");
      return [];
    }
    console.log(`[audience-scanner] X: searching keywords ${JSON.stringify(keywords.slice(0,3))}`);

    const results: any[] = [];
    // Loop through first 3 keywords only
    for (const keyword of keywords.slice(0, 3)) {
      try {
        const url = `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(keyword)}&search_type=Latest`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "twitter-api45.p.rapidapi.com"
          }
        });

        console.log(`[audience-scanner] X: response status ${res.status} for "${keyword}"`);
        if (res.ok) {
          const data = await res.json();
          const timeline = data?.timeline || [];
          console.log(`[audience-scanner] X: got ${timeline.length} tweets for "${keyword}"`);
          for (const tweet of timeline) {
            results.push({
              user_id: userId,
              source: "x",
              post_url: `https://twitter.com/i/web/status/${tweet.tweet_id}`,
              post_title: (tweet.text || "").slice(0, 100),
              post_content: tweet.text || "",
              community: "Twitter/X",
              intent_score: null,
              found_at: tweet.created_at || new Date().toISOString(),
              // Standard fields for the scoring loop:
              title: (tweet.text || "").slice(0, 100),
              body: tweet.text || "",
              url: `https://twitter.com/i/web/status/${tweet.tweet_id}`,
              author: 'unknown',
              subreddit: "Twitter/X",
              platform: "x",
              upvotes: 0,
              comments: 0,
              created_at: tweet.created_at || new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error(`[audience-scanner] X search failed for keyword "${keyword}":`, e);
      }
      await new Promise(r => setTimeout(r, 1200));
    }
    return results;
  } catch (e) {
    console.error("[audience-scanner] searchXPosts global failure:", e);
    return [];
  }
}

async function searchThreadsPosts(keywords: string[], userId: string): Promise<any[]> {
  try {
    const THREADS_TOKEN = Deno.env.get("THREADS_ACCESS_TOKEN");
    if (!THREADS_TOKEN) {
      console.log("[audience-scanner] Threads: THREADS_ACCESS_TOKEN not set, skipping");
      return [];
    }
    console.log(`[audience-scanner] Threads: searching keywords ${JSON.stringify(keywords.slice(0,2))}`);

    const results: any[] = [];
    // Loop through first 2 keywords only
    for (const keyword of keywords.slice(0, 2)) {
      try {
        const url = `https://graph.threads.net/v1.0/keyword_search?q=${encodeURIComponent(keyword)}&search_type=RECENT&fields=id,text,timestamp,permalink,username&limit=10&access_token=${THREADS_TOKEN}`;
        const res = await fetch(url);

        console.log(`[audience-scanner] Threads: response status ${res.status} for "${keyword}"`);
        if (res.ok) {
          const data = await res.json();
          const posts = data?.data || [];
          console.log(`[audience-scanner] Threads: got ${posts.length} posts for "${keyword}"`);
          for (const post of posts) {
            results.push({
              user_id: userId,
              source: "threads",
              post_url: post.permalink || "",
              post_title: (post.text || "").slice(0, 100),
              post_content: post.text || "",
              community: "Threads",
              intent_score: null,
              found_at: post.timestamp || new Date().toISOString(),
              // Standard fields for the scoring loop:
              title: (post.text || "").slice(0, 100),
              body: post.text || "",
              url: post.permalink || "",
              author: post.username || 'unknown',
              subreddit: "Threads",
              platform: "threads",
              upvotes: 0,
              comments: 0,
              created_at: post.timestamp || new Date().toISOString()
            });
          }
        }
      } catch (e) {
        console.error(`[audience-scanner] Threads search failed for keyword "${keyword}":`, e);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    return results;
  } catch (e) {
    console.error("[audience-scanner] searchThreadsPosts global failure:", e);
    return [];
  }
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

        // ── PER-USER DAILY RATE LIMIT ──────────────────────────────────
        // Get user plan from user_payments
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('plan')
          .eq('user_id', currentUserId)
          .maybeSingle();

        const userPlan = paymentData?.plan || 'free';
        const dailyLimit = getDailyLimit(userPlan);

        // Count scans today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: scansToday } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .gte('created_at', todayStart.toISOString());

        // Each scan inserts up to 5 signals — treat 5 inserts as 1 scan
        const scanCount = Math.floor((scansToday || 0) / 5);
        if (scanCount >= dailyLimit) {
          console.log(`[audience-scanner] User ${currentUserId} hit daily limit (${dailyLimit} scans). Skipping.`);
          continue;
        }
        // ──────────────────────────────────────────────────────────────

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

        console.log(`[audience-scanner] Platforms enabled: ${JSON.stringify(platforms)}`);
        console.log(`[audience-scanner] RAPIDAPI_KEY set: ${!!Deno.env.get("RAPIDAPI_KEY")}`);
        console.log(`[audience-scanner] THREADS_ACCESS_TOKEN set: ${!!Deno.env.get("THREADS_ACCESS_TOKEN")}`);

        if (keywords.length === 0) {
          console.log(`[audience-scanner] No keywords. Skipping.`);
          continue;
        }

        const rawPosts: any[] = [];
        const twoDaysAgoLimit = Date.now() - (7 * 24 * 60 * 60 * 1000);

        // REDDIT via Serper — Updated to combined query structure
        if (platforms.includes('reddit')) {
          const keywordsToScan = keywords.slice(0, 2);
          const communitiesToScan = communities.slice(0, 3);

          for (const keyword of keywordsToScan) {
            try {
              const communityFilter = communitiesToScan.map(c => `r/${c}`).join(' OR ');
              const query = `site:reddit.com (${communityFilter}) ${keyword}`;
              const queryHash = await hashQuery(query);

              // ── CACHE CHECK ──────────────────────────────────────────
              const CACHE_TTL_HOURS = 72;
              const EMPTY_CACHE_TTL_HOURS = 1;
              const cacheExpiry = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
              const emptyCacheExpiry = new Date(Date.now() - EMPTY_CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

              const { data: cached } = await supabase
                .from('serper_cache')
                .select('results, created_at')
                .eq('query_hash', queryHash)
                .gte('created_at', cacheExpiry)
                .maybeSingle();

              let results: any[] = [];
              let useCache = false;

              if (cached) {
                const cachedResults = cached.results as any[];
                if (cachedResults.length === 0 && cached.created_at < emptyCacheExpiry) {
                  // empty result is older than 1 hour, treat as expired, refetch
                  useCache = false;
                } else {
                  useCache = true;
                  results = cachedResults;
                }
              }

              if (useCache) {
                console.log(`[audience-scanner] CACHE HIT: "${query}"`);
              } else {
                console.log(`[audience-scanner] CACHE MISS — calling Serper: "${query}"`);

                const serperRes = await fetch('https://google.serper.dev/search', {
                  method: 'POST',
                  headers: {
                    'X-API-KEY': SERPER_API_KEY,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ q: query, num: 20, tbs: "qdr:7d" })
                });

                if (!serperRes.ok) {
                  console.error(`[audience-scanner] Serper error: ${serperRes.status}`);
                  continue;
                }

                const serperData = await serperRes.json();
                results = serperData.organic || [];
                console.log(`[audience-scanner] Serper returned ${results.length} results`);

                // Store in cache
                await supabase
                  .from('serper_cache')
                  .upsert({
                    query_hash: queryHash,
                    query_text: query,
                    results: results,
                    created_at: new Date().toISOString()
                  }, { onConflict: 'query_hash' });
              }
              // ─────────────────────────────────────────────────────────

              console.log(`[audience-scanner] Raw links for "${query}": ${results.map((r: any) => r.link).join(' | ')}`);
              results.forEach((result: any) => {
                const url = result.link || '';
                if (!url.includes('reddit.com')) return;

                // Skip subreddit homepage/listing pages, but allow /comments/ posts
                // and old.reddit.com / share-link formats
                const pathAfterDomain = url.split('reddit.com')[1] || '';
                const segments = pathAfterDomain.split('/').filter(Boolean);
                // segments like ['r','indiehackers'] = homepage, skip
                // segments like ['r','indiehackers','comments','abc','title'] = real post, keep
                if (segments.length <= 2) return;

                const subMatch = url.match(/reddit\.com\/r\/([^/]+)/);
                const subreddit = subMatch ? subMatch[1] : 'reddit';

                let postDate = Date.now();
                if (result.date) {
                  const parsed = Date.parse(result.date);
                  if (!isNaN(parsed)) {
                    postDate = parsed;
                  }
                }

                // JS-level safety net filter
                if (postDate >= twoDaysAgoLimit) {
                  rawPosts.push({
                    title: result.title?.replace(/\s*:\s*reddit$/i, '').trim() || '',
                    body: result.snippet || '',
                    url: url,
                    author: 'unknown',
                    subreddit: subreddit,
                    upvotes: 0,
                    comments: 0,
                    created_at: postDate,
                    platform: 'reddit'
                  });
                }
              });

            } catch (e) {
              console.error(`[audience-scanner] Serper failed for query "${keyword}":`, e);
            }

            await new Promise(r => setTimeout(r, 200));
          }
        }

        // HACKER NEWS via Algolia — filtered to last 7 days
        // Skip overly generic keywords that pull unrelated "Show HN" / "Ask HN" noise
        const HN_SKIP_TERMS = ['how to get user', 'get user', 'how to get users'];
        if (platforms.includes('hn')) {
          const twoDaysAgoUnix = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
          const hnKeywords = keywords.slice(0, 4).filter(k => !HN_SKIP_TERMS.includes(k.toLowerCase().trim()));
          for (const keyword of hnKeywords) {
            try {
              const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${twoDaysAgoUnix}&hitsPerPage=20`;
              const hnRes = await fetch(hnUrl);
              if (hnRes.ok) {
                const data = await hnRes.json();
                const hits = data.hits || [];
                console.log(`[audience-scanner] HN returned ${hits.length} posts for "${keyword}"`);
                hits.forEach((hit: any) => {
                  const postDate = hit.created_at_i * 1000;
                  // JS-level safety net filter
                  if (postDate >= twoDaysAgoLimit) {
                    rawPosts.push({
                      title: hit.title,
                      body: hit.story_text || '',
                      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                      author: hit.author,
                      subreddit: 'HackerNews',
                      upvotes: hit.points || 0,
                      comments: hit.num_comments || 0,
                      created_at: postDate,
                      platform: 'hacker_news'
                    });
                  }
                });
              }
            } catch (e) {
              console.error(`[audience-scanner] HN failed:`, e);
            }
          }
        }

        // --- INTEGRATION OF X AND THREADS ---
        const [xResult, threadsResult] = await Promise.allSettled([
          platforms.includes('twitter') ? searchXPosts(keywords, currentUserId) : Promise.resolve([]),
          platforms.includes('threads') ? searchThreadsPosts(keywords, currentUserId) : Promise.resolve([])
        ])
        const xPosts = xResult.status === "fulfilled" ? xResult.value : []
        const threadsPosts = threadsResult.status === "fulfilled" ? threadsResult.value : []

        const allResults = [...rawPosts, ...xPosts, ...threadsPosts]

        console.log(`[audience-scanner] Total raw posts: ${allResults.length}`);

        // Dedup by URL
        const uniquePosts = Array.from(new Map(allResults.map(p => [p.url, p])).values());

        // Filter already stored
        const { data: existingSignals } = await supabase
          .from('audience_signals')
          .select('post_url')
          .eq('user_id', currentUserId);

        const existingUrls = new Set((existingSignals || []).map((s: any) => s.post_url));
        const allFilteredPosts = uniquePosts.filter(p => !existingUrls.has(p.url));
        const filteredPosts = allFilteredPosts.slice(0, 15);
        console.log(`[audience-scanner] New posts to score: ${filteredPosts.length} (of ${allFilteredPosts.length} found)`);

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