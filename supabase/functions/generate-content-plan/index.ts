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
2. Industry/AI Disruption Opinion — strong stance on a tech trend + implication. Example: https://www.reddit.com/r/webdev/comments/1tvsfgj/im_calling_it_now_the_adoption_of_ai_agents_into/
3. Personal Build/Frustration Showcase — technical build story or learning journey + reaction.`,

  "r/Marketing": `1. Platform Pain / Workflow Breakdown — exact failure chain on a tool/platform + missing fix. Example: https://www.reddit.com/r/marketing/comments/1tj7ea3/navigating_the_hell_that_is_meta_business_suite/
2. Contrarian Trend Take — "[old tactic] is dead, [new tactic] is where leverage is." Example: https://www.reddit.com/r/marketing/comments/1u6azdi/5_years_in_seo_outdated_3_months_in_aeo_visionary/
3. Agency/Service Frustration — bad experience + promised vs delivered + ask for advice. Example: https://www.reddit.com/r/marketing/comments/1tfx9d9/dishonest_agencies_one_after_another/`,

  "r/GrowthHacking": `1. No-Budget Acquisition Case Study — constraint → tactic → result → exact sequence. Example: https://www.reddit.com/r/GrowthHacking/comments/1txl1w4/im_an_engineer_with_zero_marketing_skills_heres/
2. Contrarian Obituary of Old Playbook — "[old tactic] is dead because [market shift]." Example: https://www.reddit.com/r/GrowthHacking/comments/1tny72q/unpopular_opinion_growth_hacking_died_around_2020/
3. Milestone + Launch Combo — revenue context + launch action + ask. Example: https://www.reddit.com/r/GrowthHacking/comments/1thnbbz/after_making_200k_arr_we_launched_on_product_hunt/`,

  "r/SEO": `1. Official Update/News + Implication — platform change → what breaks → tactical response. Example: https://www.reddit.com/r/SEO/comments/1t7di79/google_faq_rich_results_are_no_longer_appearing/
2. Personal Proof/Ranking Win — proof of ranking/result + approach used. Example: https://www.reddit.com/r/SEO/comments/1t207d3/im_beating_almost_every_web_design_agency_and/
3. Tool/Workflow Discussion — "Anyone using [tool] for [task]?" + curiosity ask.`,

  "r/Sales": `1. Veteran Wisdom Dump — career summary → lessons → tactical rules. Example: https://www.reddit.com/r/sales/comments/1tw6tts/ill_give_you_everything_i_learned_over_30_years/
2. Commission/Quota Milestone — context → trajectory → why it matters. Example: https://www.reddit.com/r/sales/comments/1t8x2v8/just_closed_my_biggest_deal_of_my_life_60k_gross/
3. Exit/Career-Change Narrative — why I left → tradeoffs → next step. Example: https://www.reddit.com/r/sales/comments/1tk1n6h/i_did_it_im_out/`
};

const PROMPT_TEMPLATE = `You are the content strategist inside Vibe Promote.

Generate a 7-day content plan for this founder. Output ONLY valid JSON, no preamble, no markdown.

# FOUNDER CONTEXT
Brand Brain: {{brand_brain}}

Goal: {{goal}}
Comfort Level: {{comfort_level}}
Posting Frequency: {{posting_frequency}}
Selected Platforms: {{selected_platforms}}
Selected Subreddits (if Reddit selected): {{selected_subreddits}}

# SUBREDDIT INTELLIGENCE (use only if Reddit is selected, pick formats only from this list for the relevant subreddit)

{{subreddit_intel_block}}

# RULES

1. Only generate entries for platforms in Selected Platforms. Do not invent platforms.
2. Respect Posting Frequency:
   - "Daily" -> 7 entries total across the week (spread across selected platforms)
   - "3-5 times per week" -> 3-5 entries total
   - "1-2 times per week" -> 1-2 entries total
   Do not create more posts than the frequency allows, even if multiple platforms are selected.
3. If Reddit is selected, every Reddit entry must use one of the 3 formats provided for that subreddit in SUBREDDIT INTELLIGENCE. Pick the format that best matches Goal and Comfort Level. Reference the "example" field as structural inspiration only — never copy wording.
4. For X, Threads, Indie Hackers: choose format freely based on platform norms (X = hooks/contrarian/build-in-public; Threads = conversational/personal; IH = founder story/progress), matched to Goal and Comfort Level.
5. Distribute content types across the week — do not repeat the same format/subreddit on consecutive active days unless frequency is very low (1-2/week).
6. Comfort Level rules:
   - "Very comfortable" -> personal/journey formats allowed freely
   - "Somewhat comfortable" -> mix personal and product-focused
   - "Prefer educational content" -> lean toward teaching/insight formats
   - "Prefer product-focused content" -> lean toward product updates, features, results, avoid personal vulnerability formats
7. Every entry must tie back to Goal (e.g. if Goal = "Get product feedback", angle should invite feedback/questions).
8. Days with no scheduled post should have "active": false and no other fields except "day" and "active".

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

For non-Reddit platforms, omit "subreddit" and "example_reference_url" fields.

Do not output anything except this JSON object.`;

function getThisWeeksMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

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

      const { data: brain, error: brainError } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user_id)
        .maybeSingle();

      if (brainError) throw brainError;

      let subreddit_intel_block = '';
      if (selected_subreddits && Array.isArray(selected_subreddits)) {
        subreddit_intel_block = selected_subreddits
          .map(sub => {
            const intel = SUBREDDIT_INTEL[sub];
            return intel ? `### ${sub}\n${intel}` : '';
          })
          .filter(Boolean)
          .join('\n\n');
      }

      const finalPrompt = PROMPT_TEMPLATE
        .replace('{{brand_brain}}', JSON.stringify(brain || {}))
        .replace('{{goal}}', goal || '')
        .replace('{{comfort_level}}', comfort_level || '')
        .replace('{{posting_frequency}}', posting_frequency || '')
        .replace('{{selected_platforms}}', JSON.stringify(platforms || []))
        .replace('{{selected_subreddits}}', JSON.stringify(selected_subreddits || []))
        .replace('{{subreddit_intel_block}}', subreddit_intel_block);

      const aiServiceUrl = `${supabaseUrl}/functions/v1/ai-service`;
      const aiRes = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feature: 'post',
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
          platforms,
          selected_subreddits,
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