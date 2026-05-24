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
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { generateAICall } from '../../lib/ai';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage, incrementUsage } from '../../lib/useUsage';
import { markTaskComplete } from '../../components/TaskWidget';

const selectedPlatform = "X";

const platformTemplates = {
  Twitter: [
    { name: "The Scroll-Stopping Hot Take", why: "First line creates tension. People reply to disagree which feeds the algorithm.", structure: "Line 1 bold controversial statement under 12 words → setup why people think opposite → your proof with specific numbers → real insight in one sentence → question that invites replies" },
    { name: "The Story Thread", why: "Narrative pulls people through. Each tweet ends with reason to read next.", structure: "Tweet 1 hook most dramatic moment → Tweet 2 context who you are → Tweets 3-5 specific journey events → Tweet 6 turning point → Tweet 7 result with numbers → Tweet 8 lesson for reader → Final tweet CTA" },
    { name: "The Numbered Insight List", why: "Easy to read, save, share. Respects people's time.", structure: "Hook tweet with specific milestone → each numbered tweet one insight one proof one takeaway → keep each under 220 chars → last tweet most surprising insight → final CTA" },
    { name: "The Before/After", why: "Contrast creates curiosity. People want to know what caused the change.", structure: "Tweet 1 before state specific and painful → Tweet 2 one thing that changed without revealing → Tweets 3-4 what you actually did → Tweet 5 after state with numbers → Tweet 6 underlying principle → Final CTA" },
    { name: "The Unpopular Opinion With Receipts", why: "Disagreement drives replies. Proof stops it being dismissed.", structure: "State opinion plainly no hedging → acknowledge mainstream view → your specific contradicting experience → data or result backing you up → nuance when mainstream view is right → question to reader" }
  ]
};

const postingTips = {
  Twitter: "Post between 8am-10am or 6pm-9pm in your audience's timezone. Reply to the first few comments fast — early engagement signals matter most."
};

export default function XPost() {
  const { user } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [step, setStep] = useState(2);
  const [selectedMode, setSelectedMode] = useState(null);
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
      if (data) setBrain(data);

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
You are a ghostwriter for indie founders. Write short, punchy X posts. Sound like a real person, not a marketer.

BRAND:
${JSON.stringify(brain)}

TASK: Write one complete X post using the "${selectedTemplate?.name || 'custom'}" template.

HARD RULES — break any of these and the post fails:
- Under 60 words total. Count every word. Cut the middle if needed, never cut the ending.
- Zero emojis. Zero hashtags. Zero corporate words (leverage, streamline, optimize, game-changer).
- No exclamation marks.
- No em-dashes.
- Hook = first line, under 10 words. Creates tension or a strong opinion.
- Product name only in the CTA line, nowhere else.
- CTA = one soft line. Never "DM me" or "link in bio".
- Write lowercase where it feels natural. Short sentences only.

TEMPLATE: ${selectedTemplate?.structure || 'write a short punchy X post that fits the brand'}
TONE: ${selectedTone}
EXTRA CONTEXT: ${customContext || 'None'}

SCORING:
Score out of 100 on: hook strength, word count compliance (over 60 = -20), no rule violations (emoji/hashtag = -30), CTA quality, tone match.
scoreLabel: 75-100 = "Great Post", 50-74 = "Decent Post", 0-49 = "Needs Work"
scoreColor: "green" / "yellow" / "red"

Return ONLY valid JSON, no markdown, no backticks:
{
  "title": "hook line",
  "body": "full post body",
  "cta": "one soft CTA line",
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
      markTaskComplete(user.id, `x_post_d${currentDay}`, supabase);
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
    setSelectedTemplate(null);
    setCustomContext("");
    setSelectedTone("Authentic Founder");
    setGeneratedPost(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-poppins flex relative overflow-hidden">
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
                    className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all bg-transparent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
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

          {/* STEP 2: Mode Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-semibold text-white mb-8">How do you want to create your X post?</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedMode("template"); setStep(3); }}
                  className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 relative group"
                >
                  <div className="absolute top-4 right-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest">Recommended</div>
                  <LayoutTemplate className="w-8 h-8 text-orange-500 mb-4" />
                  <h3 className="text-white text-lg font-bold">Use a Proven Template</h3>
                  <p className="text-zinc-400 text-sm mt-2">Pick from 5 templates that are working right now on X</p>
                </div>
                <div
                  onClick={() => { setSelectedMode("write"); setStep(3); }}
                  className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-8 cursor-pointer transition-all hover:border-orange-500/50 group"
                >
                  <PenLine className="w-8 h-8 text-zinc-500 group-hover:text-orange-500 mb-4 transition-colors" />
                  <h3 className="text-white text-lg font-bold">Write It Yourself + AI Enhance</h3>
                  <p className="text-zinc-400 text-sm mt-2">Write your own draft and let AI improve it for X</p>
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
                    <p className="text-zinc-400 text-sm">These formats are getting real traction on X</p>
                  </div>
                  <div className="space-y-4">
                    {platformTemplates.Twitter.map((t, i) => (
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
                    placeholder="Write your rough draft here — AI will improve it for X"
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
                    X (Twitter)
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
                <a 
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-orange-600 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open X
                </a>
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
                  {postingTips.Twitter}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}