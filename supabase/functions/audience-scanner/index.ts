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
    const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    let user_id: string | null = null;
    try {
      const body = await req.json();
      user_id = body?.user_id || null;
    } catch (_) {
      // No body or invalid JSON, proceed with user_id = null (cron scan)
    }

    // Fetch users to process
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

        // Check count of new signals
        const { count, error: countError } = await supabase
          .from('audience_signals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUserId)
          .eq('status', 'new');

        if (countError) throw countError;

        if (count !== null && count >= 15) {
          console.log(`[audience-scanner] User ${currentUserId} already has 15+ new signals. Skipping.`);
          continue;
        }

        const needed = 15 - (count || 0);

        // Parse config
        const keywords = JSON.parse(brain.audience_keywords || '[]');
        const communities = JSON.parse(brain.audience_communities || '[]');
        const platforms = JSON.parse(brain.audience_platforms || '[]');

        if (keywords.length === 0) continue;

        const now = Math.floor(Date.now() / 1000);
        const fortyEightHoursAgo = now - (48 * 60 * 60);

        const rawPosts: any[] = [];

        // Fetch posts for each keyword (max 4 keywords)
        for (const keyword of keywords.slice(0, 4)) {
          // Reddit
          if (platforms.includes('reddit')) {
            // Global search
            try {
              const globalRes = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&sort=new&t=day&limit=25&type=link`, {
                headers: { 'User-Agent': 'VibehypeApp/1.0 (contact: support@vibehype.com)' }
              });

              if (globalRes.status === 429) {
                console.warn(`[audience-scanner] Reddit 429. Waiting 3 seconds...`);
                await new Promise(r => setTimeout(r, 3000));
              } else if (globalRes.ok) {
                const data = await globalRes.json();
                const children = data.data?.children || [];
                children.forEach((child: any) => {
                  const p = child.data;
                  if (p.created_utc > fortyEightHoursAgo) {
                    rawPosts.push({
                      title: p.title,
                      body: p.selftext || '',
                      url: `https://reddit.com${p.permalink}`,
                      author: p.author,
                      subreddit: p.subreddit,
                      upvotes: p.score || 0,
                      comments: p.num_comments || 0,
                      created_at: p.created_utc * 1000,
                      platform: 'reddit'
                    });
                  }
                });
              }
            } catch (e) {
              console.error(`[audience-scanner] Reddit global search failed for keyword "${keyword}":`, e);
            }

            // Subreddit-specific search
            if (communities.length > 0) {
              for (const community of communities.slice(0, 3)) {
                try {
                  const subRes = await fetch(`https://www.reddit.com/r/${community}/search.json?q=${encodeURIComponent(keyword)}&sort=new&t=day&limit=10&restrict_sr=true`, {
                    headers: { 'User-Agent': 'VibehypeApp/1.0 (contact: support@vibehype.com)' }
                  });

                  if (subRes.status === 429) {
                    console.warn(`[audience-scanner] Reddit 429 on r/${community}. Waiting 3 seconds...`);
                    await new Promise(r => setTimeout(r, 3000));
                  } else if (subRes.ok) {
                    const data = await subRes.json();
                    const children = data.data?.children || [];
                    children.forEach((child: any) => {
                      const p = child.data;
                      if (p.created_utc > fortyEightHoursAgo) {
                        rawPosts.push({
                          title: p.title,
                          body: p.selftext || '',
                          url: `https://reddit.com${p.permalink}`,
                          author: p.author,
                          subreddit: p.subreddit,
                          upvotes: p.score || 0,
                          comments: p.num_comments || 0,
                          created_at: p.created_utc * 1000,
                          platform: 'reddit'
                        });
                      }
                    });
                  }
                } catch (e) {
                  console.error(`[audience-scanner] Reddit sub search failed for r/${community} and keyword "${keyword}":`, e);
                }
              }
            }
          }

          // Hacker News
          if (platforms.includes('hn')) {
            try {
              const hnRes = await fetch(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(keyword)}&tags=story&numericFilters=created_at_i>${fortyEightHoursAgo},points>2&hitsPerPage=15`);
              if (hnRes.ok) {
                const data = await hnRes.json();
                const hits = data.hits || [];
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
              console.error(`[audience-scanner] HN search failed for keyword "${keyword}":`, e);
            }
          }
        }

        // Deduplicate by URL
        const uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());

        // Filter out URLs already in audience_signals for this user
        const { data: existingSignals } = await supabase
          .from('audience_signals')
          .select('post_url')
          .eq('user_id', currentUserId);

        const existingUrls = new Set((existingSignals || []).map(s => s.post_url));
        const filteredPosts = uniquePosts.filter(p => !existingUrls.has(p.url));

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
                    content: "You are a SaaS buyer intent classifier. Respond ONLY with valid JSON, no markdown, no explanation. Format: {\"score\": 1-100, \"intent_type\": \"Seeking Solution\" | \"Frustrated User\" | \"Comparison Shopping\" | \"Pain Point\", \"suggested_reply\": \"2 sentences max, casual founder tone, mention product naturally only if directly relevant\", \"isRelevant\": boolean}"
                  },
                  {
                    role: "user",
                    content: `Product: ${brain.app_name}. Solves: ${brain.core_problem}. For: ${brain.target_customer}. Differentiator: ${brain.unique_differentiator}. Post title: ${post.title}. Post body (first 350 chars): ${post.body.substring(0, 350)}`
                  }
                ],
                temperature: 0.2,
                max_tokens: 250
              })
            });

            if (!aiRes.ok) continue;

            const aiData = await aiRes.json();
            const rawContent = aiData.choices?.[0]?.message?.content || "";
            
            // Safe JSON extraction
            const match = rawContent.match(/\{[\s\S]*\}/);
            if (!match) continue;

            const aiResult = JSON.parse(match[0]);

            if (aiResult.isRelevant === true && aiResult.score >= 65) {
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
              } else {
                console.error(`[audience-scanner] Insert error for post ${post.url}:`, insertError);
              }
            }
          } catch (e) {
            console.error(`[audience-scanner] AI scoring failed for post ${post.url}:`, e);
          }
        }

        // Update last_scanned_at
        await supabase
          .from('brand_brains')
          .update({ last_scanned_at: new Date().toISOString() })
          .eq('user_id', currentUserId);

        processedCount++;
      } catch (userError) {
        console.error(`[audience-scanner] Error processing user ${brain.user_id}:`, userError);
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