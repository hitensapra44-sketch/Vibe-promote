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

// Truncate long keywords to improve search relevance
function simplifyKeyword(kw: string): string {
  const words = kw.trim().split(/\s+/);
  if (words.length > 8) {
    console.log(`[audience-scanner] Truncating long keyword: "${kw}"`);
    return words.slice(0, 7).join(' ');
  }
  return kw;
}

// Per-user daily scan limits by plan
function getDailyLimit(plan: string): number {
  if (plan === 'pro') return 999;
  if (plan === 'starter') return 10;
  return 3; // free
}

function parseSerperDate(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const now = Date.now();
  const lower = dateStr.toLowerCase().trim();

  if (lower.includes('hour')) {
    const n = parseInt(lower) || 1;
    return now - n * 60 * 60 * 1000;
  }
  if (lower.includes('minute')) {
    const n = parseInt(lower) || 1;
    return now - n * 60 * 1000;
  }
  if (lower.includes('day')) {
    const n = parseInt(lower) || 1;
    return now - n * 24 * 60 * 60 * 1000;
  }
  if (lower.includes('week')) {
    const n = parseInt(lower) || 1;
    return now - n * 7 * 24 * 60 * 60 * 1000;
  }
  if (lower.includes('month') || lower.includes('year')) {
    return null; // too old, treat as unparseable/reject
  }

  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : parsed;
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
        const simplified = simplifyKeyword(keyword);
        const url = `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(simplified)}&search_type=Latest`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "twitter-api45.p.rapidapi.com"
          }
        });

        if (res.ok) {
          const data = await res.json();
          const timeline = data?.timeline || [];
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
        const simplified = simplifyKeyword(keyword);
        const url = `https://graph.threads.net/v1.0/keyword_search?q=${encodeURIComponent(simplified)}&search_type=RECENT&fields=id,text,timestamp,permalink,username&limit=10&access_token=${THREADS_TOKEN}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          const posts = data?.data || [];
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

async function fetchSerperWithFallback(simplified: string, communitiesToScan: string[], SERPER_API_KEY: string): Promise<{ results: any[], queryUsed: string }> {
  const patterns: string[] = [];
  patterns.push(`site:reddit.com ${simplified}`);
  patterns.push(`${simplified} reddit`);
  patterns.push(simplified);

  for (const query of patterns) {
    try {
      console.log(`[audience-scanner] Trying Serper pattern: "${query}"`);
      const serperRes = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: 20, tbs: "qdr:w" })
      });
      if (serperRes.ok) {
        const data = await serperRes.json();
        console.log(`[audience-scanner] SUCCESS with pattern: "${query}" - ${(data.organic || []).length} results`);
        return { results: data.organic || [], queryUsed: query };
      } else {
        const errBody = await serperRes.text();
        console.error(`[audience-scanner] Pattern FAILED "${query}" - status ${serperRes.status}: ${errBody}`);
      }
    } catch (e) {
      console.error(`[audience-scanner] Pattern threw error "${query}":`, e);
    }
  }
  console.error(`[audience-scanner] ALL Serper patterns failed for keyword base: "${simplified}"`);
  return { results: [], queryUsed: '' };
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

    console.log(`[audience-scanner] Running scan (user_id: ${user_id || 'ALL'})`);

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

    let processedCount = 0;
    let totalInserted = 0;

    for (const brain of brains) {
      try {
        const currentUserId = brain.user_id;
        const { data: paymentData } = await supabase.from('user_payments').select('plan').eq('user_id', currentUserId).maybeSingle();
        const userPlan = paymentData?.plan || 'free';
        const dailyLimit = getDailyLimit(userPlan);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: scansToday } = await supabase.from('audience_signals').select('*', { count: 'exact', head: true }).eq('user_id', currentUserId).gte('created_at', todayStart.toISOString());
        const scanCount = Math.floor((scansToday || 0) / 5);
        if (scanCount >= dailyLimit) continue;

        const { count, error: countError } = await supabase.from('audience_signals').select('*', { count: 'exact', head: true }).eq('user_id', currentUserId).eq('status', 'new');
        if (countError) throw countError;
        if (count !== null && count >= 15) continue;

        const needed = Math.min(5, 15 - (count || 0));
        const keywords: string[] = JSON.parse(brain.audience_keywords || '[]');
        const communities: string[] = JSON.parse(brain.audience_communities || '[]');
        const platforms: string[] = JSON.parse(brain.audience_platforms || '[]');

        if (keywords.length === 0) continue;

        const rawPosts: any[] = [];
        const threeDaysAgoLimit = Date.now() - (3 * 24 * 60 * 60 * 1000);

        if (platforms.includes('reddit')) {
          const keywordsToScan = keywords.slice(0, 2);
          const communitiesToScan = communities.slice(0, 3);

          for (const keyword of keywordsToScan) {
            try {
              const simplified = simplifyKeyword(keyword);
              const cacheKeyBase = `${simplified}|${communitiesToScan.join(',')}`;
              const queryHash = await hashQuery(cacheKeyBase);

              const CACHE_TTL_HOURS = 72;
              const { data: cached } = await supabase.from('serper_cache').select('results, created_at').eq('query_hash', queryHash).gte('created_at', new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString()).maybeSingle();

              let results: any[] = [];
              if (cached) {
                results = cached.results as any[];
              } else {
                const fallbackResult = await fetchSerperWithFallback(simplified, communitiesToScan, SERPER_API_KEY);
                results = fallbackResult.results;
                if (results.length > 0) {
                  await supabase.from('serper_cache').upsert({ query_hash: queryHash, query_text: fallbackResult.queryUsed, results: results, created_at: new Date().toISOString() }, { onConflict: 'query_hash' });
                }
              }

              results.forEach((result: any) => {
                const url = result.link || '';
                if (!url.includes('reddit.com') || !url.includes('/comments/')) return;
                const subMatch = url.match(/reddit\.com\/r\/([^/]+)/);
                const subreddit = subMatch ? subMatch[1] : 'reddit';

                if (communitiesToScan.length > 0) {
                  const matchesCommunity = communitiesToScan.some(c => c.toLowerCase() === subreddit.toLowerCase());
                  if (!matchesCommunity) return;
                }

                const postDate = parseSerperDate(result.date);
                if (postDate !== null && postDate >= threeDaysAgoLimit) {
                  rawPosts.push({ title: result.title?.replace(/\s*:\s*reddit$/i, '').trim() || '', body: result.snippet || '', url: url, author: 'unknown', subreddit: subreddit, upvotes: 0, comments: 0, created_at: postDate, platform: 'reddit' });
                }
              });
            } catch (e) { console.error(`[audience-scanner] Reddit search failed for "${keyword}":`, e); }
          }
        }

        // Call HN / X / Threads if selected (functions already defined above, just not invoked yet)
        if (platforms.includes('hn')) {
          try {
            const hnKeyword = keywords[0];
            const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(simplifyKeyword(hnKeyword))}&tags=story&numericFilters=created_at_i>${Math.floor(threeDaysAgoLimit/1000)}`);
            if (hnRes.ok) {
              const hnData = await hnRes.json();
              (hnData.hits || []).forEach((hit: any) => {
                if (!hit.title) return;
                rawPosts.push({
                  title: hit.title,
                  body: hit.story_text || hit.title,
                  url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                  author: hit.author || 'unknown',
                  subreddit: 'Hacker News',
                  upvotes: hit.points || 0,
                  comments: hit.num_comments || 0,
                  created_at: hit.created_at_i * 1000,
                  platform: 'hn'
                });
              });
            }
          } catch (e) { console.error(`[audience-scanner] HN search failed:`, e); }
        }

        if (platforms.includes('twitter')) {
          const xPosts = await searchXPosts(keywords, currentUserId);
          xPosts.forEach(p => {
            const ts = new Date(p.created_at).getTime();
            if (!isNaN(ts) && ts >= threeDaysAgoLimit) rawPosts.push(p);
          });
        }

        if (platforms.includes('threads')) {
          const threadsPosts = await searchThreadsPosts(keywords, currentUserId);
          threadsPosts.forEach(p => {
            const ts = new Date(p.created_at).getTime();
            if (!isNaN(ts) && ts >= threeDaysAgoLimit) rawPosts.push(p);
          });
        }

        if (rawPosts.length === 0) {
          processedCount++;
          continue;
        }

        // Dedup against existing signals for this user
        const { data: existingSignals } = await supabase
          .from('audience_signals')
          .select('post_url')
          .eq('user_id', currentUserId);
        const existingUrls = new Set((existingSignals || []).map((s: any) => s.post_url));
        const freshPosts = rawPosts.filter(p => !existingUrls.has(p.url)).slice(0, needed);

        if (freshPosts.length === 0) {
          processedCount++;
          continue;
        }

        // Score each post with AI for intent (buying signal strength 0-100)
        const appName = brain.app_name || 'a SaaS product';
        const appDescription = brain.app_description || '';
        const targetCustomer = brain.target_customer || '';

        for (const post of freshPosts) {
          try {
            const scoringPrompt = `You are scoring Reddit/HN/X posts for buying intent relevance to a product.

Product: ${appName}
Description: ${appDescription}
Target customer: ${targetCustomer}

Post title: ${post.title}
Post body: ${post.body?.slice(0, 500) || ''}

Score this post 0-100 for how likely this person is a potential customer actively looking for a solution like this product (not just tangentially related). Also classify intent_type as one of: "pain_point", "buying_intent", "competitor_mention", "question", "discussion".

Respond ONLY with valid JSON, no markdown, no explanation: {"score": <number>, "intent_type": "<type>"}`;

            const aiRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: scoringPrompt }],
                max_tokens: 100,
                temperature: 0.3
              })
            });

            let score = 50;
            let intentType = 'discussion';
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const raw = aiData?.choices?.[0]?.message?.content || '';
              const cleaned = raw.replace(/```json|```/g, '').trim();
              try {
                const parsed = JSON.parse(cleaned);
                if (typeof parsed.score === 'number') score = Math.max(0, Math.min(100, Math.round(parsed.score)));
                if (parsed.intent_type) intentType = parsed.intent_type;
              } catch (_) {}
            }

            const { error: insertError } = await supabase.from('audience_signals').insert({
              user_id: currentUserId,
              post_title: post.title,
              post_body: post.body,
              post_url: post.url,
              subreddit: post.subreddit,
              author: post.author,
              posted_at: new Date(post.created_at).toISOString(),
              intent_score: score,
              intent_type: intentType,
              status: 'new',
              platform: post.platform,
              upvotes: post.upvotes || 0,
              comment_count: post.comments || 0,
              source: post.platform
            });

            if (!insertError) totalInserted++;
            else console.error(`[audience-scanner] Insert failed:`, insertError);
          } catch (e) {
            console.error(`[audience-scanner] Scoring/insert failed for post "${post.title}":`, e);
          }
        }
        processedCount++;
      } catch (e) { console.error(`[audience-scanner] User processing loop failed:`, e); }
    }
    return new Response(JSON.stringify({ success: true, processed: processedCount, inserted: totalInserted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})