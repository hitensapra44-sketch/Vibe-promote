"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutTemplate, 
  PenLine, 
  Copy, 
  RefreshCw, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  ChevronLeft,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage, incrementUsage } from '../../lib/useUsage';
import { markTaskComplete } from '../../components/TaskWidget';

const selectedPlatform = "Reddit";

const platformTemplates = {
  Reddit: [
    { name: "The Vulnerable Founder", why: "Reddit rewards honesty over marketing. Specific painful moments get upvoted hard.", structure: "Open with one painful specific moment → full context of what you built → what went wrong → what you learned → genuine question to community, no pitch" },
    { name: "The Transparent Numbers Update", why: "Real data = instant credibility on Reddit. Founders love specifics.", structure: "Headline milestone plus time taken → what you built who it's for → exact steps that led to milestone → what didn't work required for credibility → current metrics table → what you're doing next and why → advice for someone 2 steps behind" },
    { name: "The Contrarian Insight", why: "Goes against common advice, people stop scrolling when they disagree or get curious.", structure: "Unpopular opinion stated plainly → why most people believe the opposite → your specific experience proving otherwise → 2-3 concrete examples → what you'd tell someone starting today" },
    { name: "The Deep Useful Breakdown", why: "Saves people time. Step-by-step actionable posts get saved and shared.", structure: "Title frames exact outcome → short context on who you are → numbered steps, each specific → what didn't work alongside what did → honest note on what you'd do differently today" },
    { name: "The Ask That Teaches", why: "Asking for help while giving value makes community want to engage.", structure: "Specific situation you're in right now → what you've already tried → one sharp specific question → what you think the answer might be → invite disagreement" }
  ]
};

const SUBREDDIT_INTEL = {
  "SaaS": {
    formats: [
      { name: "Personal Milestone/Validation Story", why: "Emotional \"doesn't feel real\" hook + proof of a metric/win drives high engagement.", structure: "Emotional hook with proof → timeline of what you built → metrics/screenshot proof → 3 key lessons → invite similar stories", exampleUrl: "https://www.reddit.com/r/SaaS/comments/1u1tbml/i_just_crossed_0000_mrr_after_one_month_heres_how/" },
      { name: "Reality Check / Anti-Hype", why: "Bold contrarian claims about common SaaS myths cut through hype fatigue.", structure: "Bold claim against a popular belief → personal/example evidence → blunt practical advice → ask community to agree or push back", exampleUrl: "https://www.reddit.com/r/SaaS/comments/1tnnyd4/reality_check_no_one_is_going_to_pay_for_your/" },
      { name: "Channel/Growth Discovery Story", why: "Surprise discovery of an unexpected growth channel feels authentic and shareable.", structure: "Surprising discovery hook → how you noticed it → why it happened → what changed → question to community", exampleUrl: "https://www.reddit.com/r/SaaS/comments/1tsam1y/i_accidentally_discovered_that_chatgpt_was/" }
    ],
    tone: "Founder to founder, transparent, numbers-driven",
    avgLength: "300-700 words",
    downvoted: "Hard selling, vague hype without metrics, generic launch announcements"
  },
  "startups": {
    formats: [
      { name: "Cautionary Tale / External Setback", why: "Shared risk and dramatic stakes drive empathy and high comment counts.", structure: "Dramatic setback hook with specifics → what happened → business impact → reflection → \"I will not promote\" + open question", exampleUrl: "https://www.reddit.com/r/startups/comments/1twro01/google_just_killed_my_1m_arr_startup_because_a/" },
      { name: "Contrarian Myth-Busting", why: "Challenging a widely-held startup belief sparks identity-level debate.", structure: "State the common myth → analogy or comparison → examples that contradict it → distinguish exceptions → invite disagreement", exampleUrl: "https://www.reddit.com/r/startups/comments/1tm33jr/founding_a_tech_startup_to_get_rich_is_like/" },
      { name: "Industry Slop Critique", why: "Calling out a visible trend or quality drop resonates with shared frustration.", structure: "Name what changed → why it's frustrating → concrete examples → ask for alternatives or pushback", exampleUrl: "https://www.reddit.com/r/startups/comments/1th2mr2/what_is_up_with_the_absolute_slop_from_yc_these/" }
    ],
    tone: "Direct, risk-aware, occasionally combative",
    avgLength: "200-500 words",
    downvoted: "Generic motivational posts, vague venting without specifics, self-promotion"
  },
  "SideProject": {
    formats: [
      { name: "Fun/Playful Build + Demo", why: "Visual, shareable, low-stakes builds get high upvotes through novelty.", structure: "Quirky/fun hook with media → why you built it → quick build story → invite feedback or roast", exampleUrl: "https://www.reddit.com/r/SideProject/comments/1tdf6hr/i_built_a_free_fulllength_nsfw_movie_streaming/" },
      { name: "Prototype-to-Product Update", why: "Before/after continuity arcs perform well because the community already invested attention earlier.", structure: "\"X weeks ago I posted [prototype]\" → what changed since → what's now live → ask for feedback", exampleUrl: "https://www.reddit.com/r/SideProject/comments/1t3uytg/update_1_month_ago_i_posted_my_prototype_here_and/" },
      { name: "Revenue/Validation Contrast", why: "Unexpected earnings comparisons between projects are surprising and relatable.", structure: "Set up two projects or expectations → reveal the surprising outcome → lesson learned → ask what they'd guess", exampleUrl: null }
    ],
    tone: "Casual, playful, low-ego",
    avgLength: "150-400 words",
    downvoted: "Overly serious self-promotion, no visuals, generic \"check out my app\" posts"
  },
  "WebDev": {
    formats: [
      { name: "Security/Risk Warning", why: "Devs react fast to operational risk and threat intel relevant to their stack.", structure: "Name the threat → attack mechanism/path → blast radius → immediate mitigation steps", exampleUrl: "https://www.reddit.com/r/webdev/comments/1u1zoi3/89_npm_packages_got_compromised_again_deleting/" },
      { name: "Industry/AI Disruption Opinion", why: "Strong stances on tech trends create ideological tension and high comment volume.", structure: "Bold stance on a trend → anecdote or quote → concrete example → implication for the field", exampleUrl: "https://www.reddit.com/r/webdev/comments/1tvsfgj/im_calling_it_now_the_adoption_of_ai_agents_into/" },
      { name: "Personal Build/Frustration Showcase", why: "Relatable technical struggles and learning journeys build trust without selling.", structure: "Specific technical frustration or build moment → what you tried → what worked → what you'd tell others", exampleUrl: null }
    ],
    tone: "Technical, skeptical of hype, blunt",
    avgLength: "200-500 words",
    downvoted: "Marketing-flavored self-promotion, vague AI good/bad takes with no mechanism"
  },
  "Marketing": {
    formats: [
      { name: "Platform Pain / Workflow Breakdown", why: "Operator-level pain on a specific tool/platform is highly relatable to practitioners.", structure: "Specific task you tried → exact failure chain step by step → why the system is broken → what it should do instead", exampleUrl: "https://www.reddit.com/r/marketing/comments/1tj7ea3/navigating_the_hell_that_is_meta_business_suite/" },
      { name: "Contrarian Trend Take", why: "Sharp claims about a market shift compress complex change into something arguable.", structure: "Assertion that an old tactic is dying → contrast with the new approach → reasoning → invite debate", exampleUrl: "https://www.reddit.com/r/marketing/comments/1u6azdi/5_years_in_seo_outdated_3_months_in_aeo_visionary/" },
      { name: "Agency/Service Frustration", why: "Shared pain with agencies or vendors creates easy agreement and low-friction engagement.", structure: "What was promised → what actually happened → impact → ask for advice on a better process", exampleUrl: "https://www.reddit.com/r/marketing/comments/1tfx9d9/dishonest_agencies_one_after_another/" }
    ],
    tone: "Operator-focused, frustrated but constructive",
    avgLength: "150-400 words",
    downvoted: "Abstract \"marketing is changing\" posts with no specific platform or consequence"
  },
  "GrowthHacking": {
    formats: [
      { name: "No-Budget Acquisition Case Study", why: "Tactical, reusable sequences with no resources required are immediately actionable.", structure: "State the constraint → tactic/channel tried → result achieved → exact step-by-step sequence", exampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1txl1w4/im_an_engineer_with_zero_marketing_skills_heres/" },
      { name: "Contrarian Obituary of Old Playbook", why: "Declaring an old growth tactic dead with a clear replacement model drives strong reactions.", structure: "Declare the old tactic dead → explain the market shift → introduce the replacement motion → ask what others are seeing", exampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1tny72q/unpopular_opinion_growth_hacking_died_around_2020/" },
      { name: "Milestone + Launch Combo", why: "Pairing a revenue milestone with a live launch action creates urgency and credibility.", structure: "Revenue/traction context → launch action taken today → why now → ask for support or feedback", exampleUrl: "https://www.reddit.com/r/GrowthHacking/comments/1thnbbz/after_making_200k_arr_we_launched_on_product_hunt/" }
    ],
    tone: "Tactical, scrappy, numbers-first",
    avgLength: "150-400 words",
    downvoted: "Tool spam, low-trust promotional posts, vague growth-hack buzzwords"
  },
  "SEO": {
    formats: [
      { name: "Official Update/News + Implication", why: "Practitioners want to know about platform changes and what to do about them immediately.", structure: "Name the platform change → what it breaks or affects → tactical response steps", exampleUrl: "https://www.reddit.com/r/SEO/comments/1t7di79/google_faq_rich_results_are_no_longer_appearing/" },
      { name: "Personal Proof/Ranking Win", why: "Visible proof of outranking competitors builds credibility and curiosity about method.", structure: "Proof of the win → context on the niche/keyword → approach used → offer to share more", exampleUrl: "https://www.reddit.com/r/SEO/comments/1t207d3/im_beating_almost_every_web_design_agency_and/" },
      { name: "Tool/Workflow Discussion", why: "Low-friction questions about tools invite quick, high-volume practitioner replies.", structure: "Context on the task → direct question about a tool or process → what outcome you're curious about", exampleUrl: null }
    ],
    tone: "Data-driven, practitioner-to-practitioner",
    avgLength: "150-400 words",
    downvoted: "Generic \"learn SEO\" questions, stale tactics, claims without proof"
  },
  "Sales": {
    formats: [
      { name: "Veteran Wisdom Dump", why: "Long-tenure authority plus sharp, opinionated rules earns trust and saves.", structure: "Career length/summary hook → key lessons listed → tactical rules → closing mindset point", exampleUrl: "https://www.reddit.com/r/sales/comments/1tw6tts/ill_give_you_everything_i_learned_over_30_years/" },
      { name: "Commission/Quota Milestone", why: "Concrete dollar milestones are a strong status signal and social proof in this community.", structure: "Milestone number hook → context/starting point → trajectory to get there → why it matters emotionally", exampleUrl: "https://www.reddit.com/r/sales/comments/1t8x2v8/just_closed_my_biggest_deal_of_my_life_60k_gross/" },
      { name: "Exit/Career-Change Narrative", why: "Career-identity stories about leaving a role after a long run are emotionally resonant.", structure: "Announce the exit → reason for leaving → tradeoffs considered → what comes next", exampleUrl: "https://www.reddit.com/r/sales/comments/1tk1n6h/i_did_it_im_out/" }
    ],
    tone: "Confident, numbers-anchored, candid",
    avgLength: "200-500 words",
    downvoted: "Abstract motivation posts with no numbers or lived experience"
  }
};

function getSubredditKey(brain) {
  if (!brain?.audience_communities) return null;
  let communities = [];
  try {
    communities = JSON.parse(brain.audience_communities);
  } catch (e) {
    if (typeof brain.audience_communities === 'string') {
      communities = brain.audience_communities.split(',').map(c => c.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(communities) || communities.length === 0) return null;
  const first = communities[0].replace(/^r\//i, '').trim();
  return SUBREDDIT_INTEL[first] ? first : null;
}

const postingTips = {
  Reddit: "Post between 9am-12pm EST on weekdays. Add a genuine comment yourself right after posting to start the conversation. Never reply to your own post with a link immediately."
};

export default function RedditPost() {
  const { user } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [step, setStep] = useState(2);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSubreddit, setSelectedSubreddit] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customContext, setCustomContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("Authentic Founder");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brain, setBrain] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Copy Post");
  const [currentDay, setCurrentDay] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const planEntry = location.state?.planEntry || null;

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      if (paymentData?.payment_status) setIsPaid(true);

      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setBrain(data);
        if (planEntry) {
          setSelectedMode("template");
          setSelectedTemplate({
            name: planEntry.format_name,
            why: planEntry.expected_outcome || "Matched to your weekly content plan.",
            structure: planEntry.angle
          });
          setCustomContext(planEntry.hook || "");
          setStep(4);
        }
      }

      // Fetch current day
      const { data: tasksData } = await supabase
        .from('user_tasks')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);
      if (tasksData && tasksData[0]) {
        const firstDate = new Date(tasksData[0].created_at);
        firstDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(today.getTime() - firstDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setCurrentDay(Math.min(4, diffDays + 1));
      }
    }
    fetchBrain();
  }, [user]);

  const handleBack = () => {
    if (step === 2) {
      navigate('/post-maker');
    } else if (step === 3) {
      if (selectedSubreddit) {
        setSelectedSubreddit(null);
      } else {
        setSelectedMode(null);
        setStep(2);
      }
    } else if (step === 4) {
      setSelectedTemplate(null);
      setStep(3);
    }
  };

  const generatePost = async () => {
    if (limits.postMaker !== "unlimited" && postsUsed >= limits.postMaker) {
      toast.error(`You've used all ${limits.postMaker} posts this month. Upgrade to get more.`);
      return;
    }
    setIsLoading(true);
    setStep(5);

    const prompt = `
You are a ghostwriter for indie founders. Write honest, value-first Reddit posts that feel like real experiences, not marketing.

BRAND:
${JSON.stringify(brain)}
${selectedSubreddit ? `SUBREDDIT CONTEXT: Posting to r/${selectedSubreddit}. Typical tone: ${SUBREDDIT_INTEL[selectedSubreddit].tone}. Average length: ${SUBREDDIT_INTEL[selectedSubreddit].avgLength}. Avoid: ${SUBREDDIT_INTEL[selectedSubreddit].downvoted}.` : ''}

TASK: Write one complete Reddit post using the "${selectedTemplate?.name || 'custom'}" template.

HARD RULES — break any of these and the post fails:
- Zero emojis. Zero hashtags.
- No corporate words (leverage, streamline, optimize, game-changer, revolutionize).
- No exclamation marks unless the story genuinely needs one.
- No em-dashes.
- Write like a frustrated or honest founder sharing a real experience.
- Simple everyday words only. If a word sounds like a LinkedIn post, replace it.
- 90% of the post = pure value, story, or insight. 10% max = product mention.
- The post must never feel like an ad.

HOOK (first paragraph):
Start with ONE of these — no exceptions:
- A specific painful moment with a detail ("I spent 3 hours on a Thursday...")
- A strong contrarian statement that makes people stop scrolling
Never open with: "I've been working on...", "I wanted to share...", "Has anyone else..."

STRUCTURE — follow this order:
1. Hook — pain point or contrarian opener
2. Context — what you built and who it's for (2-3 sentences max)
3. Struggle or insight — be specific, use real numbers or actions
4. Outcome or lesson — what changed or what you learned
5. CTA — a genuine question to the community OR a soft one-liner like "built X to fix this if anyone's curious"

PRODUCT MENTION RULES:
- Optional. If included: appears naturally inside the story, reads like a side note, max 1-2 lines.
- Never a pitch. Never a link unless CTA asks for it.

TEMPLATE: ${selectedTemplate?.structure || 'write a value-first Reddit post that fits the brand'}
TONE: ${selectedTone}
EXTRA CONTEXT: ${customContext || 'None'}

SCORING:
Score out of 100 on: hook strength, value ratio (90/10 rule), platform authenticity, CTA quality, no rule violations (emoji/hashtag = -30, feels like ad = -25), completeness.
scoreLabel: 75-100 = "Great Post", 50-74 = "Decent Post", 0-49 = "Needs Work"
scoreColor: "green" / "yellow" / "red"

Return ONLY valid JSON, no markdown, no backticks:
{
  "title": "post title",
  "body": "full complete post body following the 5-part structure",
  "cta": "one natural CTA line",
  "score": 82,
  "scoreLabel": "Great Post",
  "scoreColor": "green"
}
`;

    const attemptGeneration = async () => {
      try {
        const result = await generateAICall(prompt, "Generate the post now.", null, 'post');
        return JSON.parse(result);
      } catch (e) {
        return null;
      }
    };

    let parsed = await attemptGeneration();
    if (!parsed) parsed = await attemptGeneration();

    if (parsed) {
      setGeneratedPost(parsed);
      setIsLoading(false);
      setStep(6);
      await incrementUsage(supabase, user.id, 'post_maker');
      markTaskComplete(user.id, `reddit_post_d${currentDay}`, supabase);
    } else {
      toast.error("Couldn't generate post. Try again.");
      setIsLoading(false);
      setStep(4);
    }
  };

  const handleCopy = () => {
    const text = `${generatedPost.title}\n\n${generatedPost.body}\n\n${generatedPost.cta}`;
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus("Copy Post"), 2000);
  };

  const resetAll = () => {
    setStep(2);
    setSelectedMode(null);
    setSelectedSubreddit(null);
    setSelectedTemplate(null);
    setCustomContext("");
    setSelectedTone("Authentic Founder");
    setGeneratedPost(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Progress Bar & Back Navigation */}
          {step >= 2 && step <= 4 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8">
                  <button 
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-foreground/60 hover:text-foreground transition-all bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <span className="text-foreground/50 text-xs font-medium">Step {step} of 4</span>
                <div className="w-8 h-8" />
              </div>
              <div className="w-full bg-foreground/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Mode Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-semibold text-foreground mb-8">How do you want to create your Reddit post?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedMode("template"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 relative group"
                >
                  <div className="absolute top-4 right-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                  <LayoutTemplate className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-foreground text-lg font-bold">Use a Proven Template</h3>
                  <p className="text-foreground/60 text-sm mt-2">Pick from templates that are working right now on Reddit</p>
                </div>
                <div
                  onClick={() => { setSelectedMode("write"); setStep(3); }}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 group"
                >
                  <PenLine className="w-8 h-8 text-foreground/50 group-hover:text-orange-500 mb-4 transition-colors" />
                  <h3 className="text-foreground text-lg font-bold">Write It Yourself + AI Enhance</h3>
                  <p className="text-foreground/60 text-sm mt-2">Write your own draft and let AI improve it for Reddit</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Template or Write */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {selectedMode === "template" ? (
                <>
                  {!selectedSubreddit ? (
                    /* Subreddit Selection List */
                    <div className="space-y-6">
                      <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-foreground">Select a Subreddit</h1>
                        <p className="text-foreground/60 text-sm">Choose a community to see proven formats tailored for it</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.keys(SUBREDDIT_INTEL).map((sub) => (
                          <div
                            key={sub}
                            onClick={() => setSelectedSubreddit(sub)}
                            className="p-6 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 cursor-pointer transition-all flex items-center gap-4"
                          >
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-foreground text-sm font-bold">r/{sub}</h3>
                              <p className="text-foreground/60 text-xs mt-1">View {SUBREDDIT_INTEL[sub].formats.length} proven formats</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Formats for Selected Subreddit */
                    <>
                      <div className="mb-8">
                        <button
                          onClick={() => setSelectedSubreddit(null)}
                          className="text-foreground/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4 bg-transparent"
                        >
                          ← Back to subreddits
                        </button>
                        <h1 className="text-2xl font-semibold text-foreground">
                          Best formats for r/{selectedSubreddit}
                        </h1>
                        <p className="text-foreground/60 text-sm">
                          AI generated for your niche. Pick one to use.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {SUBREDDIT_INTEL[selectedSubreddit].formats.map((t, i) => (
                          <div key={i} className="bg-foreground/5 border border-foreground/10 rounded-xl p-5 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-foreground text-sm font-semibold">{t.name}</h3>
                              <button
                                onClick={() => { setSelectedTemplate(t); setStep(4); }}
                                className="bg-orange-500 text-white text-xs font-bold rounded-lg px-4 py-2 hover:bg-orange-600 transition-all"
                              >
                                Use This Template
                              </button>
                            </div>
                            <p className="text-foreground/60 text-sm">{t.why}</p>
                            {t.exampleUrl && (
                              <div className="mt-1">
                                <a href={t.exampleUrl} target="_blank" rel="noopener noreferrer" className="text-[#F97316] text-xs hover:underline">
                                  See real example →
                                </a>
                              </div>
                            )}
                            <div className="border-t border-foreground/10 pt-3">
                              <button 
                                onClick={() => setExpandedTemplate(expandedTemplate === i ? null : i)}
                                className="flex items-center gap-2 text-foreground/50 text-[10px] font-bold uppercase tracking-widest hover:text-foreground/80 transition-colors"
                              >
                                {expandedTemplate === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                Structure Preview
                              </button>
                              {expandedTemplate === i && (
                                <div className="mt-3 space-y-1">
                                  {t.structure.split(' → ').map((step, idx) => (
                                    <div key={idx} className="flex gap-2 text-foreground/50 text-xs">
                                      <span className="text-orange-500/50">•</span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold text-foreground">Write your draft</h1>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder="Write your rough draft here — AI will improve it for Reddit"
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-6 text-sm text-foreground min-h-[250px] focus:outline-none focus:border-orange-500 transition-all placeholder-zinc-600"
                  />
                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Customization */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl">
              <div className="mb-10">
                <h1 className="text-2xl font-semibold text-foreground">Make it yours</h1>
                <p className="text-foreground/60 text-sm">Both fields are optional — skip if you're happy</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-foreground text-sm font-medium block">Anything specific to add?</label>
                  <p className="text-foreground/50 text-xs">e.g. just hit 100 users, launching next week, got featured somewhere</p>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-4 text-sm text-foreground min-h-[100px] focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="Add extra context here..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-foreground text-sm font-medium block">Writing tone</label>
                  <div className="flex flex-wrap gap-3">
                    {["Authentic Founder", "Bold & Punchy", "Educational", "Conversational"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold border transition-all",
                          selectedTone === t 
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-foreground/5 border-foreground/10 text-foreground/60 hover:border-zinc-600"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    onClick={generatePost}
                    className="flex-1 py-4 border border-foreground/10 text-foreground/60 font-bold rounded-xl hover:bg-white/5 transition-all bg-transparent"
                  >
                    Skip, just generate
                  </button>
                  <button
                    onClick={generatePost}
                    className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Generate My Post →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Loading Screen */}
          {step === 5 && (
            <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-foreground">Crafting your post...</h2>
                <p className="text-foreground/60 text-sm">Using your brand info and the {selectedTemplate?.name || 'custom'} template</p>
              </div>
              <div className="w-64 bg-foreground/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  animate={{ width: ["20%", "80%", "20%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          )}

          {/* STEP 6: Result Screen */}
          {step === 6 && generatedPost && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border",
                  generatedPost.scoreColor === "green" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  generatedPost.scoreColor === "yellow" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                )}>
                  {generatedPost.scoreLabel}
                </div>
                <span className="text-foreground/60 text-sm">Score: <span className="text-foreground">{generatedPost.score}/100</span></span>
              </div>

              <div className="bg-foreground/5 border border-foreground/10 rounded-xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6">
                <div className="flex">
                  <span className="bg-foreground/5 text-foreground/60 text-xs font-medium rounded-full px-3 py-1">
                    Reddit
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">{generatedPost.title}</h2>
                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">{generatedPost.body}</p>
                <div className="pt-4 border-t border-foreground/10">
                  <span className="text-foreground/50 text-xs uppercase tracking-wide block mb-1">Call to Action</span>
                  <p className="text-orange-400 text-sm font-medium">{generatedPost.cta}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  {copyStatus === "Copied!" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copyStatus}
                </button>
                <a 
                  href="https://www.reddit.com/submit/?type=TEXT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-orange-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Reddit
                </a>
                <button 
                  onClick={generatePost}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <button 
                  onClick={() => { setSelectedTemplate(null); setStep(3); }}
                  className="flex items-center justify-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground/60 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Try Different Template
                </button>
                <button 
                  onClick={resetAll}
                  className="text-foreground/50 text-xs font-medium hover:text-foreground/80 transition-colors bg-transparent"
                >
                  Start Over
                </button>
              </div>

              <div className="mt-10 bg-foreground/5 border-l-4 border-orange-500 border border-foreground/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-500 text-xs font-medium">💡 Posting tip</span>
                </div>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  {postingTips.Reddit}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}