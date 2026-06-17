"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Twitter, Globe, Zap, Layout, Lock, ArrowRight, XCircle, CheckCircle2, Sparkles, Calendar, ArrowLeft, Loader2, PenLine, AtSign } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../supabaseClient';
import Sidebar from '../../components/Sidebar';
import { cn } from "@/lib/utils";
import { usePlan } from '../../lib/usePlan';
import { useUsage } from '../../lib/useUsage';
import { toast } from 'sonner';

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Short, viral, high-energy.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: AtSign, color: '#FFFFFF', available: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
];

const ELIGIBLE_PLATFORMS = ['reddit', 'twitter', 'threads', 'ih'];

function getPlatformsFromBrain(brainData) {
  if (!brainData) return ELIGIBLE_PLATFORMS;
  let rawPlatforms = [];
  if (brainData.primary_platform) {
    try {
      rawPlatforms = JSON.parse(brainData.primary_platform);
    } catch (e) {
      if (typeof brainData.primary_platform === 'string') {
        rawPlatforms = brainData.primary_platform.split(',').map(p => p.trim()).filter(Boolean);
      }
    }
  }
  if (!Array.isArray(rawPlatforms)) {
    rawPlatforms = [];
  }
  const normalized = rawPlatforms.map(p => p.toLowerCase().trim());
  const mapped = normalized.map(p => p === 'x' ? 'twitter' : p);
  const filtered = mapped.filter(p => ELIGIBLE_PLATFORMS.includes(p));
  return filtered.length > 0 ? filtered : ELIGIBLE_PLATFORMS;
}

function getCommunitiesFromBrain(brainData) {
  let communities = [];
  if (brainData?.audience_communities) {
    try {
      communities = JSON.parse(brainData.audience_communities);
    } catch (e) {
      if (typeof brainData.audience_communities === 'string') {
        communities = brainData.audience_communities.split(',').map(c => c.trim()).filter(Boolean);
      }
    }
  }
  if (!Array.isArray(communities)) {
    communities = [];
  }
  return communities;
}

export default function PostMaker() {
  const { user, plan } = useAuth();
  const { limits } = usePlan();
  const { used: postsUsed } = useUsage('post_maker');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const navigate = useNavigate();

  // Weekly Plan States
  const [step, setStep] = useState('platform'); // 'platform', 'weeklyPlanQuestions', 'weeklyPlanFull'
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [wizardStep, setWizardStep] = useState(0);
  const [planAnswers, setPlanAnswers] = useState({ goal: null, comfort_level: null, posting_frequency: null, platforms: [], selected_subreddits: [] });
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [brain, setBrain] = useState(null);

  const isLocked = limits.postMaker !== "unlimited" && postsUsed >= limits.postMaker;

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const { data: paymentData } = await supabase
        .from('user_payments')
        .select('payment_status')
        .eq('email', user.email)
        .maybeSingle();
      
      if (paymentData?.payment_status) {
        setIsPaid(true);
      }

      const { data: brainData } = await supabase
        .from('brand_brains')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (brainData) setBrain(brainData);

      try {
        const { data: planData, error: planError } = await supabase.functions.invoke('generate-content-plan', {
          method: 'GET'
        });
        if (planData?.plan_json) {
          setWeeklyPlan(planData.plan_json);
        }
      } catch (err) {
        console.error("Error fetching weekly plan:", err);
      } finally {
        setPlanLoading(false);
      }

      setLoading(false);
    }
    fetchData();
  }, [user]);

  async function generateWeeklyPlan() {
    setGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        method: 'POST',
        body: planAnswers
      });
      if (error) throw error;
      setWeeklyPlan(data.plan_json);
      setStep('platform');
      toast.success("Your weekly plan is ready!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate your plan.");
    } finally {
      setGeneratingPlan(false);
    }
  }

  const handlePlatformClick = (p) => {
    if (p.id === 'reddit') {
      navigate('/post-maker/reddit');
    } else if (p.id === 'twitter') {
      navigate('/post-maker/x');
    } else if (p.id === 'threads') {
      navigate('/post-maker/threads');
    } else if (p.id === 'ih') {
      navigate('/post-maker/indiehackers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8">
        <div className="max-w-[720px] mx-auto w-full">
          
          {/* Tier Usage Limits UI */}
          <div className="mb-8 flex items-center justify-between bg-foreground/5 border border-foreground/5 rounded-xl px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                {plan === 'free' ? 'Free Tier' : plan === 'starter' ? 'Starter Tier' : 'Pro Tier'} Usage:
              </span>
              <span className="text-sm font-bold text-orange-500">
                {limits.postMaker === 'unlimited' ? 'Unlimited' : `${postsUsed}/${limits.postMaker} posts`}
              </span>
            </div>
            {limits.postMaker !== 'unlimited' && (
              <div className="w-32 bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 transition-all duration-300" 
                  style={{ width: `${Math.min(100, (postsUsed / limits.postMaker) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {isLocked ? (
            /* TASK 4 — Post Maker Locked State */
            <div className="animate-in fade-in duration-500 text-center py-12 space-y-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-3xl font-bold text-foreground max-w-xl mx-auto leading-tight">
                  Vibe Promote makes posts using viral formats and your brand voice to help you get results, not bans.
                </h2>
                <p className="text-foreground/60 text-sm max-w-md mx-auto">Upgrade to access this feature again and unlock unlimited high-converting posts.</p>
                <div className="pt-4">
                  <Link 
                    to="/pricing" 
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-all shadow-lg shadow-orange-500/20"
                  >
                    Upgrade Now <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-6">
                {/* Box 1: Making posts manually */}
                <div className="bg-foreground/5 border border-foreground/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <h3 className="font-bold text-foreground text-base">Making posts manually</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/60">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Don’t know where to start</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Takes forever to make a post</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Often gets little engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>AI tools sound generic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>No viral templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500/60 mt-0.5">•</span>
                      <span>Doesn’t deeply understand your brand</span>
                    </li>
                  </ul>
                </div>

                {/* Box 2: Making posts with Vibe Promote */}
                <div className="bg-foreground/5 border border-orange-500/30 rounded-2xl p-6 space-y-4 bg-orange-500/[0.02]">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-foreground text-base">Making posts with Vibe Promote</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/80">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>4 clicks away from a strong post</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Viral post formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Higher chance of engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Sounds like your brand, not generic AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>Understands your brand voice</span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-foreground/60 text-sm font-medium">
                ⚡ 100+ app founders made posts today in seconds, not hours
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* STEP: Platform Selection */}
              {step === 'platform' && (
                <>
                  {/* Weekly Plan Section */}
                  {!planLoading && (
                    <div className="mb-8">
                      {weeklyPlan === null ? (
                        <button
                          onClick={() => setStep('weeklyPlanQuestions')}
                          className="w-full p-6 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 text-left transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-foreground group-hover:text-orange-500 transition-colors">Get Your Weekly Content Plan</h3>
                              <p className="text-foreground/60 text-xs mt-1">Tell us your goals, get 7 days of content ideas — done.</p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-foreground/60 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                        </button>
                      ) : (
                        <div className="p-6 rounded-xl border border-foreground/10 bg-foreground/5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Today's Post Plan</span>
                            </div>
                            <button
                              onClick={() => setStep('weeklyPlanFull')}
                              className="text-xs font-bold text-orange-500 hover:underline bg-transparent"
                            >
                              View Full Week →
                            </button>
                          </div>
                          {(() => {
                            const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                            const todayEntry = weeklyPlan.days?.find(d => d.day === todayName);
                            if (todayEntry && todayEntry.active) {
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 uppercase">
                                      {todayEntry.platform}
                                    </span>
                                    {todayEntry.subreddit && (
                                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-foreground/5 text-foreground/60">
                                        {todayEntry.subreddit}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-base font-bold text-foreground">{todayEntry.format_name}</h4>
                                  <p className="text-sm text-foreground/60 leading-relaxed">{todayEntry.angle}</p>
                                  {todayEntry.hook && (
                                    <p className="text-xs text-foreground/60 italic bg-foreground/5 p-3 rounded-lg border border-foreground/10">
                                      Hook idea: "{todayEntry.hook}"
                                    </p>
                                  )}
                                  <button
                                    onClick={() => {
                                      if (todayEntry.platform === 'reddit') {
                                        navigate('/post-maker/reddit', { state: { planEntry: todayEntry } });
                                      } else if (todayEntry.platform === 'twitter') {
                                        navigate('/post-maker/x');
                                      } else if (todayEntry.platform === 'ih') {
                                        navigate('/post-maker/indiehackers');
                                      } else if (todayEntry.platform === 'threads') {
                                        navigate('/post-maker/threads');
                                      }
                                    }}
                                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                  >
                                    <Sparkles className="w-4 h-4" /> Generate This Post
                                  </button>
                                </div>
                              );
                            } else {
                              return (
                                <p className="text-sm text-foreground/60">No post scheduled today — check your full week plan</p>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-12">
                    <h1 className="text-2xl font-semibold text-foreground">Post Maker</h1>
                    <p className="text-foreground/60 text-sm">Where are you posting today?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-12">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        disabled={!p.available}
                        onClick={() => handlePlatformClick(p)}
                        className={cn(
                          "relative p-8 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-4 bg-transparent",
                          !p.available ? "opacity-40 cursor-not-allowed bg-foreground/5 border-foreground/10" : 
                          selectedPlatform?.id === p.id ? "bg-[#F97316]/5 border-[#F97316]" : "bg-foreground/5 border-foreground/10 hover:border-[#F97316]/30"
                        )}
                      >
                        <p.icon className={cn("w-12 h-12", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-foreground")} />
                        <div>
                          <p className={cn("text-base font-bold", selectedPlatform?.id === p.id ? "text-[#F97316]" : "text-foreground")}>{p.name}</p>
                          <p className="text-foreground/60 text-xs mt-1">{p.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* STEP: Weekly Plan Questions */}
              {step === 'weeklyPlanQuestions' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                  {wizardStep === 0 && (
                    <div className="space-y-6">
                      <button
                        onClick={() => setStep('platform')}
                        className="text-foreground/60 text-sm flex items-center gap-2 hover:text-foreground bg-transparent mb-4"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Post Maker
                      </button>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs font-bold text-foreground/60 uppercase tracking-wider">
                          <span>Question {wizardStep + 1} of 3</span>
                        </div>
                        <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300" 
                            style={{ width: `${((wizardStep + 1) / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-foreground">What's your main goal right now?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Get first users",
                          "Get more signups",
                          "Get product feedback",
                          "Validate my idea",
                          "Build authority",
                          "Grow an audience"
                        ].map((goal) => (
                          <button
                            key={goal}
                            onClick={() => {
                              setPlanAnswers({ ...planAnswers, goal });
                              setWizardStep(1);
                            }}
                            className="p-5 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 text-left text-sm font-bold text-foreground transition-all"
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-6">
                      <button
                        onClick={() => setWizardStep(0)}
                        className="text-foreground/60 text-sm flex items-center gap-2 hover:text-foreground bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs font-bold text-foreground/60 uppercase tracking-wider">
                          <span>Question {wizardStep + 1} of 3</span>
                        </div>
                        <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300" 
                            style={{ width: `${((wizardStep + 1) / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-foreground">How comfortable are you sharing your journey publicly?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Very comfortable",
                          "Somewhat comfortable",
                          "Prefer educational content",
                          "Prefer product-focused content"
                        ].map((comfort) => (
                          <button
                            key={comfort}
                            onClick={() => {
                              setPlanAnswers({ ...planAnswers, comfort_level: comfort });
                              setWizardStep(2);
                            }}
                            className="p-5 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 text-left text-sm font-bold text-foreground transition-all"
                          >
                            {comfort}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-6">
                      <button
                        onClick={() => setWizardStep(1)}
                        className="text-foreground/60 text-sm flex items-center gap-2 hover:text-foreground bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs font-bold text-foreground/60 uppercase tracking-wider">
                          <span>Question {wizardStep + 1} of 3</span>
                        </div>
                        <div className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 transition-all duration-300" 
                            style={{ width: `${((wizardStep + 1) / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-foreground">How much can you realistically post?</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          "Daily",
                          "3-5 times per week",
                          "1-2 times per week"
                        ].map((freq) => (
                          <button
                            key={freq}
                            onClick={() => {
                              const platforms = getPlatformsFromBrain(brain);
                              const selected_subreddits = platforms.includes('reddit') ? getCommunitiesFromBrain(brain) : [];
                              setPlanAnswers({ 
                                ...planAnswers, 
                                posting_frequency: freq,
                                platforms,
                                selected_subreddits
                              });
                              setWizardStep(3);
                            }}
                            className="p-5 rounded-xl border border-foreground/10 bg-foreground/5 hover:border-orange-500/50 text-left text-sm font-bold text-foreground transition-all"
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-6">
                      <button
                        onClick={() => setWizardStep(2)}
                        className="text-foreground/60 text-sm flex items-center gap-2 hover:text-foreground bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <h2 className="text-xl font-bold text-white">Review & Confirm</h2>
                      
                      <div className="space-y-4">
                        <div className="border border-foreground/10 bg-foreground/5 rounded-xl p-4 flex flex-col gap-1">
                          <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Goal</span>
                          <span className="text-sm font-medium text-white">{planAnswers.goal}</span>
                        </div>
                        <div className="border border-foreground/10 bg-foreground/5 rounded-xl p-4 flex flex-col gap-1">
                          <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Comfort Level</span>
                          <span className="text-sm font-medium text-white">{planAnswers.comfort_level}</span>
                        </div>
                        <div className="border border-foreground/10 bg-foreground/5 rounded-xl p-4 flex flex-col gap-1">
                          <span className="text-xs text-foreground/50 uppercase font-bold tracking-wider">Posting Frequency</span>
                          <span className="text-sm font-medium text-white">{planAnswers.posting_frequency}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platforms</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'reddit', name: 'Reddit', icon: MessageSquare },
                            { id: 'twitter', name: 'X (Twitter)', icon: Twitter },
                            { id: 'threads', name: 'Threads', icon: AtSign },
                            { id: 'ih', name: 'Indie Hackers', icon: Globe }
                          ].map((p) => {
                            const isSelected = planAnswers.platforms.includes(p.id);
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  const nextPlatforms = isSelected
                                    ? planAnswers.platforms.filter(id => id !== p.id)
                                    : [...planAnswers.platforms, p.id];
                                  setPlanAnswers({ ...planAnswers, platforms: nextPlatforms });
                                }}
                                className={cn(
                                  "p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 bg-transparent",
                                  isSelected ? "bg-[#F97316]/5 border-[#F97316]" : "bg-[#111111] border-[#1F1F1F] hover:border-[#F97316]/30"
                                )}
                              >
                                <p.icon className={cn("w-6 h-6", isSelected ? "text-[#F97316]" : "text-white")} />
                                <p className={cn("text-xs font-bold", isSelected ? "text-[#F97316]" : "text-white")}>{p.name}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {planAnswers.platforms.includes('reddit') && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Communities</h3>
                          {planAnswers.selected_subreddits && planAnswers.selected_subreddits.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {planAnswers.selected_subreddits.map((sub) => (
                                <span
                                  key={sub}
                                  className="px-4 py-2 rounded-full border border-foreground/10 text-foreground/60 text-xs font-bold bg-foreground/5"
                                >
                                  r/{sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-foreground/40 italic">
                              No communities saved in Brand Brain yet — we'll use general Reddit best practices.
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={generateWeeklyPlan}
                        disabled={generatingPlan || planAnswers.platforms.length === 0}
                        className="w-full h-11 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {generatingPlan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating Plan...
                          </>
                        ) : (
                          "Confirm & Generate My Plan"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP: Weekly Plan Full View */}
              {step === 'weeklyPlanFull' && weeklyPlan && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                  <button
                    onClick={() => setStep('platform')}
                    className="text-foreground/60 text-sm flex items-center gap-2 hover:text-foreground bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Your Weekly Plan</h2>
                    <p className="text-foreground/60 text-sm mt-1">{weeklyPlan.week_overview}</p>
                  </div>

                  <div className="space-y-4">
                    {weeklyPlan.days?.map((dayEntry, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-6 rounded-xl border border-foreground/10 bg-foreground/5 space-y-4",
                          !dayEntry.active && "opacity-50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-foreground">{dayEntry.day}</h3>
                          {dayEntry.active ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 uppercase">
                                {dayEntry.platform}
                              </span>
                              {dayEntry.subreddit && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-foreground/5 text-foreground/60">
                                  {dayEntry.subreddit}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-foreground/60">No post scheduled</span>
                          )}
                        </div>

                        {dayEntry.active && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-foreground">{dayEntry.format_name}</h4>
                            <p className="text-xs text-foreground/60 leading-relaxed">{dayEntry.angle}</p>
                            {dayEntry.hook && (
                              <p className="text-xs text-foreground/60 italic bg-foreground/5 p-3 rounded-lg border border-foreground/10">
                                Hook idea: "{dayEntry.hook}"
                              </p>
                            )}
                            <button
                              onClick={() => {
                                if (dayEntry.platform === 'reddit') {
                                  navigate('/post-maker/reddit', { state: { planEntry: dayEntry } });
                                } else if (dayEntry.platform === 'twitter') {
                                  navigate('/post-maker/x');
                                } else if (dayEntry.platform === 'ih') {
                                  navigate('/post-maker/indiehackers');
                                } else if (dayEntry.platform === 'threads') {
                                  navigate('/post-maker/threads');
                                }
                              }}
                              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Generate This Post
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}