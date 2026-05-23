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
  ArrowRight,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage, incrementUsage } from '../../lib/useUsage';
import PlanGate from '../../components/PlanGate';

const platformTemplates = {
  Reddit: [
    { name: "The Vulnerable Founder", why: "Reddit rewards honesty over marketing. Specific painful moments get upvoted hard.", structure: "Open with one painful specific moment → full context of what you built → what went wrong → what you learned → genuine question to community, no pitch" },
    { name: "The Transparent Numbers Update", why: "Real data = instant credibility on Reddit. Founders love specifics.", structure: "Headline with exact numbers → break down what drove each metric → one thing that surprised you → one thing changing next month → what you're watching next" },
    { name: "The Contrarian Insight", why: "Goes against common advice, people stop scrolling when they disagree or get curious.", structure: "Unpopular opinion stated plainly → why most people believe the opposite → your specific experience proving otherwise → 2-3 concrete examples → what you'd tell someone starting today" },
    { name: "The Deep Useful Breakdown", why: "Saves people time. Step-by-step actionable posts get saved and shared.", structure: "Title frames exact outcome → short context on who you are → numbered steps, each specific → what didn't work alongside what did → honest note on what you'd do differently today" },
    { name: "The Ask That Teaches", why: "Asking for help while giving value makes community want to engage.", structure: "Specific situation you're in right now → what you've already tried → one sharp specific question → what you think the answer might be → invite disagreement" }
  ],
  Twitter: [
    { name: "The Scroll-Stopping Hot Take", why: "First line creates tension. People reply to disagree which feeds the algorithm.", structure: "Line 1 bold controversial statement under 12 words → setup why people think opposite → your proof with specific numbers → real insight in one sentence → question that invites replies" },
    { name: "The Story Thread", why: "Narrative pulls people through. Each tweet ends with reason to read next.", structure: "Tweet 1 hook most dramatic moment → Tweet 2 context who you are → Tweets 3-5 specific journey events → Tweet 6 turning point → Tweet 7 result with numbers → Tweet 8 lesson for reader → Final tweet CTA" },
    { name: "The Numbered Insight List", why: "Easy to read, save, share. Respects people's time.", structure: "Hook tweet with specific milestone → each numbered tweet one insight one proof one takeaway → keep each under 220 chars → last tweet most surprising insight → final CTA" },
    { name: "The Before/After", why: "Contrast creates curiosity. People want to know what caused the change.", structure: "Tweet 1 before state specific and painful → Tweet 2 one thing that changed without revealing → Tweets 3-4 what you actually did → Tweet 5 after state with numbers → Tweet 6 underlying principle → Final CTA" },
    { name: "The Unpopular Opinion With Receipts", why: "Disagreement drives replies. Proof stops it being dismissed.", structure: "State opinion plainly no hedging → acknowledge mainstream view → your specific contradicting experience → data or result backing you up → nuance when mainstream view is right → question to reader" }
  ],
  "Indie Hackers": [
    { name: "The Milestone Full Breakdown", why: "Indie Hackers community runs on transparency. Full breakdowns with real numbers get referenced for months.", structure: "Headline milestone plus time taken → what you built who it's for → exact steps that led to milestone → what didn't work required for credibility → current metrics table → what you're doing next and why → advice for someone 2 steps behind" },
    { name: "The Failure Autopsy", why: "Indie Hackers loves honest failure more than polished success. These posts get the most comments.", structure: "What failed and how badly with numbers → what you were trying and why you thought it'd work → exact moment you knew it wasn't working → root cause real reason not surface reason → what you salvaged → what you'd do differently → question has anyone been through this" },
    { name: "The Technical Process Post", why: "Indie Hackers audience are builders. Showing HOW you did something plus business result is gold.", structure: "Headline outcome plus method → problem it solved → exact tools and approach used → step by step what you built → time taken plus result produced → what broke and how fixed → honest recommendation" },
    { name: "The Audience Research Post", why: "Shows strategic thinking. Other founders learn from your process and engage heavily.", structure: "Why you did research and when → how you found people to talk to exact method → questions you asked list them → 3 most surprising things you heard → how it changed what you were building → what you wish you'd asked → invite others to share their process" },
    { name: "What's Actually Working Right Now", why: "Cuts through theory. Real tactical wins with attribution get bookmarked constantly.", structure: "Open what's actually working for goal right now not 2 years ago → tactic 1 specific with numbers → tactic 2 specific with numbers → tactic 3 specific with numbers → what stopped working → why these work now underlying reason → CTA" }
  ]
};

const postingTips = {
  Reddit: "Post between 9am-12pm EST on weekdays. Add a genuine comment yourself right after posting to start the conversation. Never reply to your own post with a link immediately.",
  Twitter: "Post between 8am-10am or 6pm-9pm in your audience's timezone. Reply to the first few comments fast — early engagement signals matter most.",
  "Indie Hackers": "Post on weekday mornings. Give the community something genuinely useful and the upvotes follow. Don't cross-post the same day you post elsewhere."
};

export default function PostMaker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed, isLoading: usageLoading } = useUsage('post_maker');
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customContext, setCustomContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("Authentic Founder");
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brain, setBrain] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [copyStatus, setCopyStatus] = useState("Copy Post");

  useEffect(() => {
    async function fetchBrain() {
      if (!user) return;
      const { data, error } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setBrain(data);
    }
    fetchBrain();
  }, [user]);

  const handleBack = () => {
    if (step === 2) {
      setSelectedPlatform(null);
      setStep(1);
    } else if (step === 3) {
      setSelectedMode(null);
      setStep(2);
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
You are a world-class ghostwriter for indie founders and bootstrapped SaaS builders. You write like a real human, not a marketer.

BRAND INFORMATION:
${JSON.stringify(brain)}

TASK:
Write a complete, high-performing ${selectedPlatform} post using the "${selectedTemplate?.name || 'custom'}" format.

CRITICAL WRITING RULES — VIOLATING ANY OF THESE MEANS THE POST FAILS:
- ZERO emojis. None. Not a single one.
- Dont use app name on the headline make it look like a founder build something around that problem
- DONT USE ANY LARGE OR HARD WORDS
- ZERO hashtags. Not at the end, not in the middle. Never.
- ZERO corporate buzzwords. No "streamline", "leverage", "optimize", "synergy", "game-changer", "revolutionize".
- ZERO incomplete posts. The post MUST be fully written from first word to last word. Never cut off mid-sentence or mid-point.
FOR TWITTER/X ONLY: The entire post must be under 80 words. This overrides the completeness rule. Cut to fit.
- Write like a real person talking to another real person. Short sentences. Direct language.
- Never start a sentence with "I" twice in a row.
- No em-dashes. No bullet points unless the template structure explicitly calls for them.
- No hype. No exclamation marks unless the template genuinely needs one.

PLATFORM-SPECIFIC VOICE:

REDDIT VOICE

Tone:
- Write like a frustrated but honest founder sharing a real experience
- No hype, no marketing tone, no buzzwords
- Use simple, everyday language (no complex or “fancy” words)
- No emojis

Core Writing Rules:
- 90% of the post = pure value, story, or insight
- 10% or less = product mention (if included)
- The post must NEVER feel like an ad

Hook:
- First paragraph must start with:
  - A specific painful moment OR
  - A strong contrarian statement
- No generic intros (e.g. "I’ve been working on..." is banned)

Body:
- Tell a real story, struggle, mistake, or lesson
- Be specific (numbers, actions, failures)
- Avoid vague advice

Product Mention:
- Optional
- If included, it must:
  - Appear naturally in the story
  - NOT sound like a pitch
  - Be 1–2 lines max

CTA:
- Must NOT sell anything
- Must be one of:
  - A genuine question to the community
  - OR a soft mention like: "I ended up building X to fix this"
- Never include links or aggressive promotion

Structure (MANDATORY):
1. Hook (pain / contrarian)
2. Context (what happened)
3. Struggle / insight
4. Outcome or lesson
5. Soft CTA

Post must feel complete. No missing sections.

${`TWITTER/X POST RULES — THESE OVERRIDE EVERYTHING ELSE IN THIS PROMPT:

LENGTH: Hard limit. The entire post including hook, body, and CTA must be under 80 words total. Count them. If over 80 words, cut until it is under. No exceptions.

FORMAT: 1 to 4 short paragraphs separated by a blank line. No lists. No numbered points. No threads unless the template explicitly says "thread".

VOICE: Casual. Fast. Sounds like a real person typing on a phone. Lowercase is fine. Short sentences only.

NEVER USE: emojis, hashtags, "game-changer", "revolutionize", "unlock", "supercharge", "leverage", "seamless", "in today's world", "here's the thing", exclamation marks unless absolutely necessary.

HOOK: First line must be under 12 words. Creates curiosity, tension, or a strong opinion. No generic openers.

CTA: One line max. Soft. Natural. Never "DM me", never "link in bio", never hard sell.

PRODUCT NAME: Only appears in the CTA line. Nowhere else in the post body.

THE POST MUST FEEL COMPLETE. Do not cut off mid-thought. If you cannot fit everything under 80 words, cut the middle — never cut the ending.`}

TEMPLATE STRUCTURE TO FOLLOW COMPLETELY:
${selectedTemplate?.structure || 'Rewrite the following draft for ' + selectedPlatform + ', fixing tone, structure, and platform fit'}

TONE: ${selectedTone}

ADDITIONAL CONTEXT FROM USER: ${customContext || 'None'}

CTA RULES:
- The CTA must match the brand's actual marketing goal from the brand information above
- For Reddit: CTA is a question or soft mention — "Built X to fix this if anyone's curious: [link]"
- For Twitter: CTA is one short punchy line max
- For Indie Hackers: CTA invites discussion or links to the product naturally
- Never write a CTA that sounds like an ad. It must feel like a natural next line.

SCORING RULES:
Score the post out of 100 based on: hook strength, platform fit, CTA quality, no rule violations (emojis/hashtags = automatic -30), completeness of post, and tone match.
Then assign a scoreLabel:
- 75 to 100: "Great Post"
- 50 to 74: "Decent Post"
- 0 to 49: "Needs Work"
And a scoreColor:
- Great Post: "green"
- Decent Post: "yellow"
- Needs Work: "red"

Return ONLY a valid JSON object. No markdown. No backticks. No preamble. No explanation outside the JSON:
{
  "title": "hook line or post title",
  "body": "full complete post body — every section of the template filled out",
  "cta": "the call to action — one line, natural, no hype",
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
    setStep(1);
    setSelectedPlatform(null);
    setSelectedMode(null);
    setSelectedTemplate(null);
    setCustomContext("");
    setSelectedTone("Authentic Founder");
    setGeneratedPost(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={true} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Progress Bar & Back Navigation */}
          {step >= 1 && step <= 4 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8">
                  {step > 1 && (
                    <button 
                      onClick={handleBack}
                      className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <span className="text-zinc-500 text-xs font-medium">Step {step} of 4</span>
                <div className="w-8 h-8" />
              </div>
              <div className="w-full bg-[#1F1F1F] h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* STEP 1: Platform Selection */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-white">Where are you posting?</h1>
                <p className="text-zinc-400 text-sm">Pick your platform — templates and tone are tailored to it</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(platformTemplates).map((p) => (
                  <div
                    key={p}
                    onClick={() => { setSelectedPlatform(p); setStep(2); }}
                    className={cn(
                      "bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 cursor-pointer transition-all hover:border-orange-500/50",
                      selectedPlatform === p && "border-orange-500 bg-orange-500/5"
                    )}
                  >
                    <h3 className="text-white text-sm font-medium">{p}</h3>
                    <p className="text-zinc-400 text-xs mt-1">Tailored templates for {p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Mode Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-semibold text-white mb-8">How do you want to create your post?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedMode("template"); setStep(3); }}
                  className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 relative group"
                >
                  <div className="absolute top-4 right-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                  <LayoutTemplate className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-white text-lg font-bold">Use a Proven Template</h3>
                  <p className="text-zinc-400 text-sm mt-2">Pick from 5 templates that are working right now on {selectedPlatform}</p>
                </div>
                <div
                  onClick={() => { setSelectedMode("write"); setStep(3); }}
                  className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 group"
                >
                  <PenLine className="w-8 h-8 text-zinc-500 group-hover:text-orange-500 mb-4 transition-colors" />
                  <h3 className="text-white text-lg font-bold">Write It Yourself + AI Enhance</h3>
                  <p className="text-zinc-400 text-sm mt-2">Write your own draft and let AI improve it for {selectedPlatform}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Template or Write */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {selectedMode === "template" ? (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white">Pick a template that's working right now</h1>
                    <p className="text-zinc-400 text-sm">These formats are getting real traction on {selectedPlatform}</p>
                  </div>
                  <div className="space-y-4">
                    {platformTemplates[selectedPlatform].map((t, i) => (
                      <div key={i} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white text-sm font-semibold">{t.name}</h3>
                          <button
                            onClick={() => { setSelectedTemplate(t); setStep(4); }}
                            className="bg-orange-500 text-white text-xs font-bold rounded-lg px-4 py-2 hover:bg-orange-600 transition-all"
                          >
                            Use This Template
                          </button>
                        </div>
                        <p className="text-zinc-400 text-sm">{t.why}</p>
                        <div className="border-t border-[#1F1F1F] pt-3">
                          <button 
                            onClick={() => setExpandedTemplate(expandedTemplate === i ? null : i)}
                            className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-zinc-300 transition-colors"
                          >
                            {expandedTemplate === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            Structure Preview
                          </button>
                          {expandedTemplate === i && (
                            <div className="mt-3 space-y-1">
                              {t.structure.split(' → ').map((step, idx) => (
                                <div key={idx} className="flex gap-2 text-zinc-500 text-xs">
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
              ) : (
                <div className="space-y-6">
                  <h1 className="text-2xl font-semibold text-white">Write your draft</h1>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    placeholder={`Write your rough draft here — AI will improve it for ${selectedPlatform}`}
                    className="w-full bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 text-sm text-white min-h-[250px] focus:outline-none focus:border-orange-500 transition-all placeholder-zinc-600"
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
                <h1 className="text-2xl font-semibold text-white">Make it yours</h1>
                <p className="text-zinc-400 text-sm">Both fields are optional — skip if you're happy</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-white text-sm font-medium block">Anything specific to add?</label>
                  <p className="text-zinc-500 text-xs">e.g. just hit 100 users, launching next week, got featured somewhere</p>
                  <textarea
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="w-full bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 text-sm text-white min-h-[100px] focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="Add extra context here..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-white text-sm font-medium block">Writing tone</label>
                  <div className="flex flex-wrap gap-3">
                    {["Authentic Founder", "Bold & Punchy", "Educational", "Conversational"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={cn(
                          "px-5 py-2.5 rounded-full text-xs font-bold border transition-all",
                          selectedTone === t 
                            ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-[#111111] border-[#1F1F1F] text-zinc-400 hover:border-zinc-600"
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
                    className="flex-1 py-4 border border-[#1F1F1F] text-zinc-400 font-bold rounded-xl hover:bg-white/5 transition-all bg-transparent"
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
                <h2 className="text-xl font-bold text-white">Crafting your post...</h2>
                <p className="text-zinc-400 text-sm">Using your brand info and the {selectedTemplate?.name || 'custom'} template</p>
              </div>
              <div className="w-64 bg-[#1F1F1F] h-1 rounded-full overflow-hidden">
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
                <span className="text-zinc-400 text-sm">Score: <span className="text-white">{generatedPost.score}/100</span></span>
              </div>

              <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6">
                <div className="flex">
                  <span className="bg-[#111111] text-zinc-400 text-xs font-medium rounded-full px-3 py-1">
                    {selectedPlatform}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-white">{generatedPost.title}</h2>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{generatedPost.body}</p>
                <div className="pt-4 border-t border-[#1F1F1F]">
                  <span className="text-zinc-500 text-xs uppercase tracking-wide block mb-1">Call to Action</span>
                  <p className="text-orange-400 text-sm font-medium">{generatedPost.cta}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-[#111111] border border-[#1F1F1F] text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  {copyStatus === "Copied!" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copyStatus}
                </button>
                <button 
                  onClick={generatePost}
                  className="flex items-center justify-center gap-2 bg-[#111111] border border-[#1F1F1F] text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <button 
                  onClick={() => { setSelectedTemplate(null); setStep(3); }}
                  className="flex items-center justify-center gap-2 bg-[#111111] border border-[#1F1F1F] text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-zinc-600 transition-all"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  Try Different Template
                </button>
                <button 
                  onClick={resetAll}
                  className="text-zinc-500 text-xs font-medium hover:text-zinc-300 transition-colors bg-transparent"
                >
                  Start Over
                </button>
              </div>

              <div className="mt-10 bg-[#111111] border-l-4 border-orange-500 border border-[#1F1F1F] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-500 text-xs font-medium">💡 Posting tip</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {postingTips[selectedPlatform]}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}