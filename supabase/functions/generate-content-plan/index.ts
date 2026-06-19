import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUBREDDIT_INTEL: Record<string, string> = {
  "r/SaaS": `1. Personal Milestone/Validation Story — Hook: emotional "doesn't feel real" + proof of a metric/win. Example: https://www.reddit.com/r/SaaS/comments/1u1tbml/i_just_crossed_0000_mrr_after_one_month_heres_how/
2. Reality Check / Anti-Hype — Bold contrarian claim about a common SaaS myth + evidence. Example: https://www.reddit.com/r/SaaS/comments/1tnnyd4/reality_check_no_one_is_going_to_pay_for_your/
3. Channel/Growth Discovery Story — "I accidentally discovered X channel was working." Example: https://www.reddit.com/r/SaaS/comments/1tsam1y/i_accidentally_discovered_that_chatgpt_was/`,

  "r/startups": `1. Cautionary Tale / External Setback — dramatic loss + reflection, "I will not promote." Example: https://www.reddit.com/r/startups/comments/1twro01/google_just_killed_my_1m_arr_startup_because_a/
2. Contrarian Myth-Busting — "[common belief] is like [analogy]" + debate. Example: https://www.reddit.com/r/startups/comments/1tm33jr/founding_a_tech_startup_to_get_rich_is_like/
3. Industry Slop Critique — diagnosis of a trend + examples + ask for alternatives. Example: https://www.reddit.com/r/startups/comments/1th2mr2/what_is_up_with_the_absolute_slop_from_yc_these/`,

  "r/SideProject": `1. Fun/Playful Build + Demo — "I built [quirky/fun thing]" + invite feedback/roast. Example structure only: https://www.reddit.com/r/SideProject/comments/1tdf6hr/i_built_a_free_fulllength_nsfw_movie_streaming/
2. Prototype-to-Product Update — "X weeks ago I posted [prototype], here's the finished version." Example: https://www.reddit.com/r/SideProject/comments/1t3uytg/update_1_month_ago_i_posted_my_prototype_here_and/
3. Revenue/Validation Contrast — unexpected earnings comparison + lesson learned.`,

  "r/WebDev": `1. Security/Risk Warning — threat + mechanism + impact + mitigation steps. Example: https://www.reddit.com/r/webdev/comments/1u1zoi3/89_npm_packages_got_compromised_again_deleting/
2. Industry/AI Disruption Opinion — strong stance on a tech trend + implication. Example: https://www.geog.com.cn/CN/10.11821/dlxb201610010
3. WebDev is a technical community. Keep it focused on code, architecture, and real-world problems.`,

  "r/Marketing": `1. Platform Pain / Workflow Breakdown — exact failure chain on a tool/platform + missing fix. Example: https://www.reddit.com/r/marketing/comments/1tj7ea3/navigating_the_hell_that_is_meta_business_suite/
2. Contrarian Trend Take — "[old tactic] is dead, [new tactic] is where leverage is." Example: https://www.reddit.com/r/marketing/comments/1u6azdi/5_years_in_seo_outdated_3_months_in_aeo_visionary/
3. Agency/Service Frustration — bad experience + promised vs delivered + ask for advice. Example: https://www.reddit.com/r/marketing/comments/1tfx9d9/dishonest_agencies_are_killing_startups/`,

  "GrowthHacking": {
    tone: "Tactical, scrappy, numbers-first",
    avgLength: "150-400 words",
    downvoted: "Tool spam, low-trust promotional posts, vague growth-hack buzzwords"
  },
  "SEO": {
    tone: "Data-driven, practitioner-to-practitioner",
    avgLength: "150-400 words",
    downvoted: "Generic \"learn SEO\" questions, stale tactics, claims without proof"
  },
  "Sales": {
    tone: "Confident, numbers-anchored, candid",
    avgLength: "200-500 words",
    downvoted: "Abstract motivation posts with no numbers or lived experience"
  }
};

// Fallback formats for any selected subreddit NOT in SUBREDDIT_INTEL above
const GENERIC_REDDIT_FALLBACK = `1. Builder Story — what you're building, why you started, the biggest challenge so far, then a genuine question. Works in almost any subreddit.
2. Feedback Request — share one real decision or feature, then ask directly for honest feedback on it.
3. Lessons Learned — one concrete mistake or insight from building, and what changed because of it.
4. Validation Post — share an early result or signal, and ask if others have seen something similar.
5. Question Post — ask the community a genuine, specific question tied to your product's problem space.
6. Weekly Reflection — what changed this week, what worked, what didn't, what's next.`;

// X currently has no structural guidance at all — always pick from these
const GENERIC_X_TEMPLATES = `1. Founder Insight — an observation, the insight behind it, then a one-line takeaway.
2. Build Update — what happened, the progress made, the lesson learned.
3. Mistake Learned — the mistake, what happened as a result, the lesson.
4. Customer Insight — something a user or prospect said or did, what it reveals, the implication for the product.
5. Contrarian Take — a common belief in the space, why you disagree, what you'd say instead.`;

const GENERIC_THREADS_TEMPLATES = `1. Relatable Moment — a short, conversational post about a specific frustrating moment your audience has had, ending with how your app solves it.
2. Honest Take — a hot take or opinion in your niche, asking the audience to share their thoughts.
3. Mini Story — a short personal story with a clear arc and lesson.
4. Before/After — contrasting the painful status quo with the new reality using your app.`;

const GENERIC_IH_TEMPLATES = `1. Milestone Breakdown — sharing a specific milestone, what worked, what failed, and key lessons.
2. Failure Autopsy — transparently sharing a failure, why it happened, and what you learned.
3. Technical Process — showing how you built a specific feature or solved a technical problem.
4. Build In Public Update — monthly or weekly progress update with metrics and challenges.`;

const PROMPT_TEMPLATE = `You are the content strategist inside Vibe Promote.

Generate a 7-day content plan for this founder. Output ONLY valid JSON, no preamble, no markdown.

# FOUNDER CONTEXT
Brand Brain: {{brand_brain}}

Goal: {{goal}}
Comfort Level: {{comfort_level}}
Posting Frequency: {{posting_frequency}}
Selected Platforms: {{selected_platforms}}
Selected Subreddits (if Reddit selected): {{selected_subreddits}}

# SUBREDDIT INTELLIGENCE (use only if Reddit is selected — specific formats per subreddit, or generic fallback if a subreddit has no specific intel)

{{subreddit_intel_block}}

# GENERIC REDDIT FORMATS (fallback — use ONLY for a selected subreddit with no specific intel above)

{{generic_reddit_block}}

# GENERIC X FORMATS (always use these for X — pick the one matching Goal and Comfort Level)

{{generic_x_block}}

# GENERIC THREADS FORMATS (always use these for Threads — pick the one matching Goal and Comfort Level)

{{generic_threads_block}}

# GENERIC INDIE HACKERS FORMATS (always use these for Indie Hackers)

{{ih-milestone-breakdown}}

# RULES

1. Only generate entries for platforms in Selected Platforms. Selected Platforms can contain "reddit", "twitter", "threads", and/or "ih". Do not invent platforms.
2. Respect Posting Frequency exactly — do not deviate:
   - "Daily" -> exactly 7 active entries, one per day, every day active.
   - "3-5 times per week" -> exactly 4 active entries total, spread with an alternating active/skip pattern across the week (e.g. Mon active, Tue skip, Wed active, Thu skip, Fri active, Sat skip, Sun active).
   - "1-2 times per week" -> exactly 2 active entries total, spread apart across the week (e.g. one early, one late), all remaining days inactive.
   Never produce a different number of active days than this mapping specifies.
3. If Reddit is selected: for a subreddit covered under SUBREDDIT INTELLIGENCE with specific formats, use one of its 3 specific formats. For a selected subreddit with no specific intel (marked "no specific intel on file"), use one of the 6 GENERIC REDDIT FORMATS instead. Never invent a format outside these two lists. Treat any "example" field as structural inspiration only — never copy wording.
4. If X (twitter) is selected: always pick one of the 5 GENERIC X FORMATS, matched to Goal and Comfort Level.
5. If Threads is selected: always pick one of the 4 GENERIC THREADS FORMATS, matched to Goal and Comfort Level.
6. If Indie Hackers (ih) is selected: always pick one of the 4 GENERIC INDIE HACKERS FORMATS, matched to Goal and Comfort Level.
7. Distribute content across the week — do not repeat the same format/subreddit on consecutive active days unless frequency is very low (1-2/week).
8. Comfort Level rules:
   - "Very comfortable" -> personal/journey formats allowed freely
   - "Somewhat comfortable" -> mix personal and product-focused
   - "Prefer educational content" -> lean toward teaching/insight formats
   - "Prefer product-focused content" -> lean toward product updates, features, results, avoid personal vulnerability formats
9. Every entry must tie back to Goal (e.g. if Goal = "Get product feedback", angle should invite feedback/questions).
10. Days with no scheduled post should have "active": false and no other fields except "day" and "active".

# OUTPUT FORMAT - return exactly this structure:

{
  "week_overview": "1-2 sentence summary of the week's strategy",
  "days": [
    {
      "day": "Monday",
      "active": true,
      "platform": "reddit",
      "subreddit": "r/SaaS",
      "format_name": "Personal Milestone/Validation Story",
      "angle": "specific angle tied to this founder's product and goal",
      "hook": "1-line hook idea",
      "expected_outcome": "comments / signups / feedback / etc",
      "example_reference_url": "https://..."
    },
    {
      "day": "Tuesday",
      "active": false
    }
  ]
}

For X, Threads, and Indie Hackers entries, omit "subreddit" and "example_reference_url" fields.

Do not output anything except this JSON object.`;

function getThisWeeksMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function buildSubredditIntelBlock(selectedSubreddits: string[] | undefined): string {
  if (!selectedSubreddits || !Array.isArray(selectedSubreddits)) return '';
  return selectedSubreddits
    .map(sub => {
      const intel = SUBREDDIT_INTEL[sub];
      if (intel) {
        return `### ${sub}\n${intel}`;
      }
      return `### ${sub} (no specific intel on file)\nUse the GENERIC REDDIT FORMATS section instead for this subreddit.`;
    })
    .join('\n\n');
}

const ALLOWED_PLATFORMS = ['reddit', 'twitter', 'threads', 'ih'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace('Bearer ', '');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
    }
    const user_id = user.id;

    const weekStartDate = getThisWeeksMonday();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('content_plans')
        .select('plan_json')
        .eq('user_id', user_id)
        .eq('week_start_date', weekStartDate)
        .maybeSingle();

      if (error) throw error;

      return new Response(JSON.stringify({ plan_json: data?.plan_json || null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    if (req.method === 'POST') {
      const { goal, comfort_level, posting_frequency, platforms, selected_subreddits } = await req.json();

      const safePlatforms = Array.isArray(platforms)
        ? platforms.filter((p: string) => ALLOWED_PLATFORMS.includes(p))
        : [];
      const finalPlatforms = safePlatforms.length > 0 ? safePlatforms : ALLOWED_PLATFORMS;
      const finalSubreddits = finalPlatforms.includes('reddit') && Array.isArray(selected_subreddits)
        ? selected_subreddits
        : [];

      const { data: brain, error: brainError } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (brainError) throw brainError;

      const subreddit_intel_block = buildSubredditIntelBlock(finalSubreddits);

      const finalPrompt = PROMPT_TEMPLATE
        .replace('{{brand_brain}}', JSON.stringify(brain || {}))
        .replace('{{goal}}', goal || '')
        .replace('{{comfort_level}}', comfort_level || '')
        .replace('{{posting_frequency}}', posting_frequency || '')
        .replace('{{selected_platforms}}', JSON.stringify(finalPlatforms))
        .replace('{{selected_subreddits}}', JSON.stringify(finalSubreddits))
        .replace('{{subreddit_intel_block}}', subreddit_intel_block)
        .replace('{{generic_reddit_block}}', GENERIC_REDDIT_FALLBACK)
        .replace('{{generic_x_block}}', GENERIC_X_TEMPLATES)
        .replace('{{generic_threads_block}}', GENERIC_THREADS_TEMPLATES)
        .replace('{{generic_ih_block}}', GENERIC_IH_TEMPLATES);

      const aiServiceUrl = `${supabaseUrl}/functions/v1/ai-service`;
      const aiRes = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feature: 'content_plan',
          messages: [
            { role: 'system', content: finalPrompt },
            { role: 'user', content: 'Generate the content plan now.' }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        throw new Error(`AI service returned error: ${errText}`);
      }

      const aiData = await aiRes.json();
      const rawText = aiData.choices?.[0]?.message?.content || '';

      let cleanText = rawText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      let parsedPlan;
      try {
        parsedPlan = JSON.parse(cleanText);
      } catch (e) {
        return new Response(JSON.stringify({ error: "AI returned invalid JSON", raw: rawText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error: upsertError } = await supabase
        .from('content_plans')
        .upsert({
          user_id,
          week_start_date: weekStartDate,
          goal,
          comfort_level,
          posting_frequency,
          platforms: finalPlatforms,
          selected_subreddits: finalSubreddits,
          plan_json: parsedPlan,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,week_start_date' });

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ plan_json: parsedPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    });

  } catch (error: any) {
    console.error("[generate-content-plan] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})